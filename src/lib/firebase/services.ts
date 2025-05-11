import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db, storage } from './config';
import type { Service, Order, OrderStatus, User, ServiceCategory } from '@/types';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Service functions
export async function getServices(): Promise<Service[]> {
  const servicesRef = collection(db, 'services');
  const snapshot = await getDocs(servicesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
}

export async function getServicesByCategory(category: string): Promise<Service[]> {
  const servicesRef = collection(db, 'services');
  const q = query(servicesRef, where('category', '==', category));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
}

export async function getService(id: string): Promise<Service | null> {
  const serviceRef = doc(db, 'services', id);
  const serviceDoc = await getDoc(serviceRef);
  return serviceDoc.exists() ? { id: serviceDoc.id, ...serviceDoc.data() } as Service : null;
}

// Alias for getService to maintain consistent naming with other functions
export async function getServiceById(id: string): Promise<Service | null> {
  return getService(id);
}

// Add new service
export async function createService(serviceData: Omit<Service, 'id'>): Promise<string> {
  try {
    const servicesRef = collection(db, 'services');
    const docRef = await addDoc(servicesRef, {
      ...serviceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating service:', error);
    throw new Error('Failed to create service');
  }
}

// Update existing service
export async function updateService(id: string, serviceData: Partial<Service>): Promise<void> {
  try {
    const serviceRef = doc(db, 'services', id);
    await updateDoc(serviceRef, {
      ...serviceData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating service ${id}:`, error);
    throw new Error('Failed to update service');
  }
}

// Delete service
export async function deleteService(id: string): Promise<void> {
  try {
    // Check if service has associated orders
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('serviceId', '==', id), limit(1));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      throw new Error('Cannot delete service with associated orders');
    }
    
    // Delete any service images if they exist
    const serviceDoc = await getDoc(doc(db, 'services', id));
    if (serviceDoc.exists() && serviceDoc.data().image) {
      try {
        const imageRef = ref(storage, serviceDoc.data().image);
        await deleteObject(imageRef);
      } catch (imageError) {
        console.error('Error deleting service image:', imageError);
        // Continue with service deletion even if image deletion fails
      }
    }
    
    // Delete the service document
    await deleteDoc(doc(db, 'services', id));
  } catch (error) {
    console.error(`Error deleting service ${id}:`, error);
    throw error;
  }
}

// Upload service image
export async function uploadServiceImage(file: File, serviceId: string): Promise<string> {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${serviceId}_${Date.now()}.${fileExtension}`;
    const storagePath = `services/${fileName}`;
    
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading service image:', error);
    throw new Error('Failed to upload service image');
  }
}

// Function to populate initial services data (for first-time setup)
export async function seedServiceData(services: Omit<Service, 'id'>[]): Promise<void> {
  try {
    const servicesCollection = collection(db, 'services');
    const batch = [];
    
    for (const service of services) {
      batch.push(
        addDoc(servicesCollection, {
          ...service,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      );
    }
    
    await Promise.all(batch);
    console.log(`Successfully seeded ${batch.length} services`);
  } catch (error) {
    console.error('Error seeding service data:', error);
    throw new Error('Failed to seed service data');
  }
}

// Order functions
export interface OrderTimelineEvent {
  status: string;
  message: string;
  timestamp: string | Date;
  updatedBy?: string;
}

export interface Order {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  serviceId: string;
  serviceName: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentVerified?: boolean;
  billingCycle?: string | null;
  serviceType: string;
  documents?: { name: string, url: string, uploadedAt: string }[];
  timeline: OrderTimelineEvent[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ orderId: string }> {
  try {
    const ordersRef = collection(db, 'orders');
    
    // Ensure we have a timeline with at least one event
    if (!orderData.timeline || orderData.timeline.length === 0) {
      orderData.timeline = [{
        status: 'created',
        message: 'Order created',
        timestamp: new Date().toISOString()
      }];
    }
    
    // Add the document to Firestore
    const orderDoc = await addDoc(ordersRef, {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log(`Order created with ID: ${orderDoc.id}`);
    return { orderId: orderDoc.id };
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order');
  }
}

export async function getOrder(id: string): Promise<Order | null> {
  try {
    const orderRef = doc(db, 'orders', id);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      return null;
    }
    
    const orderData = orderDoc.data();
    
    // Convert Firestore timestamps to ISO strings for easier handling in the frontend
    const createdAt = orderData.createdAt ? orderData.createdAt.toDate().toISOString() : null;
    const updatedAt = orderData.updatedAt ? orderData.updatedAt.toDate().toISOString() : null;
    
    // Format timeline timestamps
    const timeline = orderData.timeline ? orderData.timeline.map((event: any) => ({
      ...event,
      timestamp: event.timestamp instanceof Timestamp 
        ? event.timestamp.toDate().toISOString()
        : event.timestamp
    })) : [];
    
    return { 
      id: orderDoc.id,
      ...orderData,
      createdAt,
      updatedAt,
      timeline
    } as Order;
  } catch (error) {
    console.error(`Error getting order ${id}:`, error);
    throw new Error('Failed to get order');
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const ordersRef = collection(db, 'orders');
    
    // First query only by userId without orderBy to avoid index requirements
    const q = query(
      ordersRef,
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    
    // Convert the documents to Order objects
    const orders = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to ISO strings
      const createdAt = data.createdAt ? data.createdAt.toDate().toISOString() : null;
      const updatedAt = data.updatedAt ? data.updatedAt.toDate().toISOString() : null;
      
      // Format timeline timestamps
      const timeline = data.timeline ? data.timeline.map((event: any) => ({
        ...event,
        timestamp: event.timestamp instanceof Timestamp 
          ? event.timestamp.toDate().toISOString()
          : event.timestamp
      })) : [];
      
      return { 
        id: doc.id,
        ...data,
        createdAt,
        updatedAt,
        timeline
      } as Order;
    });
    
    // Sort the results client-side by createdAt in descending order
    return orders.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Descending order (newest first)
    });
  } catch (error) {
    console.error(`Error getting orders for user ${userId}:`, error);
    throw new Error('Failed to get user orders');
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  message: string,
  updatedBy: string = 'system'
): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    
    const timelineEvent = {
      status,
      message,
      timestamp: new Date().toISOString(),
      updatedBy
    };
    
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
      timeline: arrayUnion(timelineEvent)
    });
    
    console.log(`Order ${orderId} status updated to ${status}`);
  } catch (error) {
    console.error(`Error updating order status for ${orderId}:`, error);
    throw new Error('Failed to update order status');
  }
}

export async function updateOrder(
  orderId: string,
  data: Partial<Order>
): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    
    // Handle timeline events specially
    const updateData = { ...data };
    
    if (data.timeline && Array.isArray(data.timeline)) {
      // If we're adding new timeline events, use arrayUnion
      updateData.timeline = arrayUnion(...data.timeline);
    }
    
    await updateDoc(orderRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    
    console.log(`Order ${orderId} updated successfully`);
  } catch (error) {
    console.error(`Error updating order ${orderId}:`, error);
    throw new Error('Failed to update order');
  }
}

export async function addOrderDocument(
  orderId: string,
  file: File,
  documentName: string
): Promise<string> {
  try {
    // 1. Upload the file to Firebase Storage
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const storagePath = `orders/${orderId}/documents/${timestamp}-${file.name}`;
    
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // 2. Add the document reference to the order
    const orderRef = doc(db, 'orders', orderId);
    
    const documentData = {
      name: documentName || file.name,
      url: downloadURL,
      originalName: file.name,
      contentType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString()
    };
    
    await updateDoc(orderRef, {
      documents: arrayUnion(documentData),
      updatedAt: serverTimestamp(),
      timeline: arrayUnion({
        status: 'document_added',
        message: `Document "${documentName || file.name}" uploaded`,
        timestamp: new Date().toISOString()
      })
    });
    
    return downloadURL;
  } catch (error) {
    console.error(`Error adding document to order ${orderId}:`, error);
    throw new Error('Failed to upload document');
  }
}

export async function getRecentOrders(limitCount: number = 5): Promise<Order[]> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to ISO strings
      const createdAt = data.createdAt ? data.createdAt.toDate().toISOString() : null;
      const updatedAt = data.updatedAt ? data.updatedAt.toDate().toISOString() : null;
      
      // Format timeline timestamps
      const timeline = data.timeline ? data.timeline.map((event: any) => ({
        ...event,
        timestamp: event.timestamp instanceof Timestamp 
          ? event.timestamp.toDate().toISOString()
          : event.timestamp
      })) : [];
      
      return { 
        id: doc.id,
        ...data,
        createdAt,
        updatedAt,
        timeline
      } as Order;
    });
  } catch (error) {
    console.error('Error getting recent orders:', error);
    throw new Error('Failed to get recent orders');
  }
}

// Add the getAllOrders function after getRecentOrders
export async function getAllOrders(): Promise<Order[]> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to ISO strings
      const createdAt = data.createdAt ? data.createdAt.toDate().toISOString() : null;
      const updatedAt = data.updatedAt ? data.updatedAt.toDate().toISOString() : null;
      
      // Format timeline timestamps
      const timeline = data.timeline ? data.timeline.map((event: any) => ({
        ...event,
        timestamp: event.timestamp instanceof Timestamp 
          ? event.timestamp.toDate().toISOString()
          : event.timestamp
      })) : [];
      
      return { 
        id: doc.id,
        ...data,
        createdAt,
        updatedAt,
        timeline
      } as Order;
    });
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw new Error('Failed to get all orders');
  }
}

// User functions
export async function getUser(id: string): Promise<User | null> {
  const userRef = doc(db, 'users', id);
  const userDoc = await getDoc(userRef);
  return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } as User : null;
}

export async function updateUser(id: string, data: Partial<User>): Promise<void> {
  const userRef = doc(db, 'users', id);
  await updateDoc(userRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// Service Categories
export async function getServiceCategories(): Promise<ServiceCategory[]> {
  try {
    const categoriesRef = collection(db, 'serviceCategories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    
    return categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      description: doc.data().description,
      slug: doc.data().slug,
      imageUrl: doc.data().imageUrl || null
    }));
  } catch (error) {
    console.error('Error fetching service categories:', error);
    throw error;
  }
}

export async function getServiceCategory(categoryId: string): Promise<ServiceCategory | null> {
  try {
    const docRef = doc(db, 'serviceCategories', categoryId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      name: docSnap.data().name,
      description: docSnap.data().description,
      slug: docSnap.data().slug,
      imageUrl: docSnap.data().imageUrl || null
    };
  } catch (error) {
    console.error('Error fetching service category:', error);
    throw error;
  }
}

// Helper functions for file uploads
export async function uploadFile(
  file: File,
  path: string,
  metadata?: { [key: string]: string }
): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file, { customMetadata: metadata });
    return getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function deleteFile(path: string): Promise<void> {
  try {
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
    console.log(`File deleted: ${path}`);
  } catch (error) {
    console.error(`Error deleting file ${path}:`, error);
    throw new Error('Failed to delete file');
  }
}

// Chat functions
export interface OrderMessage {
  id?: string;
  orderId: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'employee' | 'admin';
  message: string;
  timestamp: string | Date;
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  isRead: boolean;
}

/**
 * Send a message to an order chat
 */
export async function sendOrderMessage(messageData: Omit<OrderMessage, 'id' | 'timestamp'>): Promise<string> {
  try {
    // Get the reference to the messages subcollection for this order
    const messagesRef = collection(db, 'orders', messageData.orderId, 'messages');
    
    // Add timestamp
    const message = {
      ...messageData,
      timestamp: serverTimestamp(),
      isRead: false,
    };
    
    // Add the document to Firestore
    const messageDoc = await addDoc(messagesRef, message);
    
    // Also update the order's lastMessageAt field
    const orderRef = doc(db, 'orders', messageData.orderId);
    await updateDoc(orderRef, {
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log(`Message sent with ID: ${messageDoc.id}`);
    return messageDoc.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }
}

/**
 * Get all messages for an order
 */
export async function getOrderMessages(orderId: string): Promise<OrderMessage[]> {
  try {
    const messagesRef = collection(db, 'orders', orderId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);
    
    // Convert the documents to OrderMessage objects
    return snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamp to ISO string
      const timestamp = data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString();
      
      return { 
        id: doc.id,
        ...data,
        timestamp
      } as OrderMessage;
    });
  } catch (error) {
    console.error(`Error getting messages for order ${orderId}:`, error);
    throw new Error('Failed to get order messages');
  }
}

/**
 * Send a message with an attachment
 */
export async function sendOrderMessageWithAttachment(
  messageData: Omit<OrderMessage, 'id' | 'timestamp'>,
  file: File
): Promise<string> {
  try {
    // Upload the file first
    const filePath = `orders/${messageData.orderId}/attachments/${Date.now()}_${file.name}`;
    const downloadUrl = await uploadFile(file, filePath);
    
    // Create attachment object
    const attachment = {
      name: file.name,
      url: downloadUrl,
      type: file.type,
      size: file.size
    };
    
    // Add the attachment to the message data
    const messageWithAttachment = {
      ...messageData,
      attachments: messageData.attachments ? [...messageData.attachments, attachment] : [attachment]
    };
    
    // Send the message with the attachment
    return await sendOrderMessage(messageWithAttachment);
  } catch (error) {
    console.error('Error sending message with attachment:', error);
    throw new Error('Failed to send message with attachment');
  }
}

/**
 * Mark messages as read
 */
export async function markOrderMessagesAsRead(orderId: string, userId: string): Promise<void> {
  try {
    // First fetch all messages not sent by the current user
    const messagesRef = collection(db, 'orders', orderId, 'messages');
    const q = query(
      messagesRef,
      where('senderId', '!=', userId)
    );
    
    const snapshot = await getDocs(q);
    
    // Filter locally for those that are unread
    const unreadMessages = snapshot.docs.filter(doc => doc.data().isRead === false);
    
    // Update each unread message
    const updatePromises = unreadMessages.map(messageDoc => {
      return updateDoc(doc(db, 'orders', orderId, 'messages', messageDoc.id), {
        isRead: true
      });
    });
    
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      console.log(`Marked ${updatePromises.length} messages as read for order ${orderId}`);
    }
  } catch (error) {
    console.error(`Error marking messages as read for order ${orderId}:`, error);
    throw new Error('Failed to mark messages as read');
  }
}

/**
 * Submit a complaint for an order
 */
export interface OrderComplaint {
  id?: string;
  orderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  complaintType: 'wrong-work' | 'delayed' | 'poor-quality' | 'billing-issue' | 'other';
  description: string;
  status: 'submitted' | 'under-review' | 'resolved' | 'rejected';
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  resolution?: string;
}

export async function submitOrderComplaint(complaintData: Omit<OrderComplaint, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const complaintsRef = collection(db, 'complaints');
    
    // Set initial status and timestamps
    const complaint = {
      ...complaintData,
      status: 'submitted',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Add the document to Firestore
    const complaintDoc = await addDoc(complaintsRef, complaint);
    
    // Also update the order's timeline
    const orderRef = doc(db, 'orders', complaintData.orderId);
    await updateDoc(orderRef, {
      hasComplaint: true,
      updatedAt: serverTimestamp(),
      timeline: arrayUnion({
        status: 'complaint_submitted',
        message: 'Client submitted a complaint',
        timestamp: new Date().toISOString()
      })
    });

    console.log(`Complaint submitted with ID: ${complaintDoc.id}`);
    return complaintDoc.id;
  } catch (error) {
    console.error('Error submitting complaint:', error);
    throw new Error('Failed to submit complaint');
  }
}

export async function getOrderComplaints(orderId: string): Promise<OrderComplaint[]> {
  try {
    const complaintsRef = collection(db, 'complaints');
    const q = query(complaintsRef, where('orderId', '==', orderId));
    const snapshot = await getDocs(q);
    
    // Convert the documents to OrderComplaint objects
    return snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to ISO strings
      const createdAt = data.createdAt ? data.createdAt.toDate().toISOString() : null;
      const updatedAt = data.updatedAt ? data.updatedAt.toDate().toISOString() : null;
      
      return { 
        id: doc.id,
        ...data,
        createdAt,
        updatedAt
      } as OrderComplaint;
    });
  } catch (error) {
    console.error(`Error getting complaints for order ${orderId}:`, error);
    throw new Error('Failed to get order complaints');
  }
}

export async function submitOrderComplaintWithAttachment(
  complaintData: Omit<OrderComplaint, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
  file: File
): Promise<string> {
  try {
    // Upload the file first
    const filePath = `complaints/${complaintData.orderId}/${Date.now()}_${file.name}`;
    const downloadUrl = await uploadFile(file, filePath);
    
    // Create attachment object
    const attachment = {
      name: file.name,
      url: downloadUrl,
      type: file.type
    };
    
    // Add the attachment to the complaint data
    const complaintWithAttachment = {
      ...complaintData,
      attachments: complaintData.attachments ? [...complaintData.attachments, attachment] : [attachment]
    };
    
    // Submit the complaint with the attachment
    return await submitOrderComplaint(complaintWithAttachment);
  } catch (error) {
    console.error('Error submitting complaint with attachment:', error);
    throw new Error('Failed to submit complaint with attachment');
  }
}

/**
 * Get total revenue from completed orders
 */
export const getTotalRevenue = async (): Promise<number> => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('status', '==', 'completed')
    );
    
    const querySnapshot = await getDocs(q);
    let totalRevenue = 0;
    
    querySnapshot.forEach((doc) => {
      const orderData = doc.data();
      if (orderData.amount) {
        totalRevenue += orderData.amount;
      }
    });
    
    return totalRevenue;
  } catch (error) {
    console.error('Error getting total revenue:', error);
    return 0;
  }
};

/**
 * Get total number of clients
 */
export const getTotalClients = async (): Promise<number> => {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'client')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting total clients:', error);
    return 0;
  }
};

/**
 * Get total number of employees
 */
export const getTotalEmployees = async (): Promise<number> => {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'employee')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting total employees:', error);
    return 0;
  }
};

/**
 * Get revenue data by month for charting
 */
export const getRevenueByMonth = async (): Promise<{ month: string; revenue: number }[]> => {
  try {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Get completed orders from the last 12 months
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    const q = query(
      collection(db, 'orders'),
      where('status', '==', 'completed'),
      where('createdAt', '>=', oneYearAgo)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Initialize monthly data
    const monthlyData = months.map(month => ({ month, revenue: 0 }));
    
    // Populate revenue data
    querySnapshot.forEach((doc) => {
      const orderData = doc.data();
      if (orderData.createdAt && orderData.amount) {
        const orderDate = orderData.createdAt.toDate ? 
          orderData.createdAt.toDate() : 
          new Date(orderData.createdAt);
          
        const monthIndex = orderDate.getMonth();
        monthlyData[monthIndex].revenue += orderData.amount;
      }
    });
    
    // Return only the last 6 months for better visualization
    const currentMonth = today.getMonth();
    const relevantMonths = [];
    
    for (let i = 5; i >= 0; i--) {
      const index = (currentMonth - i + 12) % 12;
      relevantMonths.push(monthlyData[index]);
    }
    
    return relevantMonths;
  } catch (error) {
    console.error('Error getting revenue by month:', error);
    return [];
  }
};

/**
 * Get orders count by status
 */
export const getOrdersByStatus = async (): Promise<{ status: string; count: number }[]> => {
  try {
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      completed: 0,
      cancelled: 0
    };
    
    const querySnapshot = await getDocs(collection(db, 'orders'));
    
    querySnapshot.forEach((doc) => {
      const orderData = doc.data();
      if (orderData.status && statusCounts.hasOwnProperty(orderData.status)) {
        statusCounts[orderData.status]++;
      }
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
  } catch (error) {
    console.error('Error getting orders by status:', error);
    return [];
  }
};

/**
 * Get top services by revenue and order count
 */
export const getTopServices = async (limit = 5): Promise<{ id: string; name: string; revenue: number; orders: number }[]> => {
  try {
    const serviceStats = {};
    
    // Get all orders
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    
    // Calculate stats for each service
    ordersSnapshot.forEach((doc) => {
      const orderData = doc.data();
      if (orderData.serviceId && orderData.amount) {
        if (!serviceStats[orderData.serviceId]) {
          serviceStats[orderData.serviceId] = {
            id: orderData.serviceId,
            name: orderData.serviceName || 'Unknown Service',
            revenue: 0,
            orders: 0
          };
        }
        
        serviceStats[orderData.serviceId].revenue += orderData.amount;
        serviceStats[orderData.serviceId].orders += 1;
      }
    });
    
    // Convert to array and sort by revenue
    const servicesArray = Object.values(serviceStats);
    servicesArray.sort((a, b) => b.revenue - a.revenue);
    
    return servicesArray.slice(0, limit);
  } catch (error) {
    console.error('Error getting top services:', error);
    return [];
  }
};

/**
 * Get all users
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users: User[] = [];
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data() as User;
      users.push({
        ...userData,
        uid: doc.id
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', role)
    );
    
    const usersSnapshot = await getDocs(q);
    const users: User[] = [];
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data() as User;
      users.push({
        ...userData,
        uid: doc.id
      });
    });
    
    return users;
  } catch (error) {
    console.error(`Error getting ${role} users:`, error);
    throw error;
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (uid: string, role: UserRole): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      role,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Update user data
 */
export const updateUserData = async (uid: string, userData: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};

/**
 * Delete user
 */
export const deleteUser = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Feedback functions
export interface Feedback {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  message: string;
  category: string;
  createdAt?: Date | string;
}

export async function submitFeedback(feedbackData: Omit<Feedback, 'id' | 'createdAt'>): Promise<string> {
  try {
    const feedbackRef = collection(db, 'feedback');
    const docRef = await addDoc(feedbackRef, {
      ...feedbackData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw new Error('Failed to submit feedback');
  }
}

export async function getAllFeedback(): Promise<Feedback[]> {
  try {
    const feedbackRef = collection(db, 'feedback');
    const snapshot = await getDocs(feedbackRef);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamp to ISO string
      const createdAt = data.createdAt ? data.createdAt.toDate().toISOString() : null;
      
      return { 
        id: doc.id,
        ...data,
        createdAt
      } as Feedback;
    });
  } catch (error) {
    console.error('Error getting all feedback:', error);
    throw new Error('Failed to get feedback');
  }
}

export async function deleteFeedback(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'feedback', id));
  } catch (error) {
    console.error(`Error deleting feedback ${id}:`, error);
    throw new Error('Failed to delete feedback');
  }
}

// Admin dashboard functions
export const getAdminDashboardStats = async () => {
  try {
    const [
      totalRevenue,
      totalClients,
      totalEmployees,
      revenueByMonth,
      ordersByStatus,
      topServices
    ] = await Promise.all([
      getTotalRevenue(),
      getTotalClients(),
      getTotalEmployees(),
      getRevenueByMonth(),
      getOrdersByStatus(),
      getTopServices(5)
    ]);
    
    return {
      totalRevenue,
      totalClients,
      totalEmployees,
      revenueByMonth,
      ordersByStatus,
      topServices
    };
  } catch (error) {
    console.error('Error getting admin dashboard stats:', error);
    throw error;
  }
};

// Employee management functions
export const getEmployeeDetails = async (employeeId: string): Promise<User | null> => {
  try {
    return await getUser(employeeId);
  } catch (error) {
    console.error(`Error getting employee details for ${employeeId}:`, error);
    throw error;
  }
};

export const updateEmployeeDetails = async (employeeId: string, data: Partial<User>): Promise<void> => {
  try {
    await updateUserData(employeeId, data);
  } catch (error) {
    console.error(`Error updating employee details for ${employeeId}:`, error);
    throw error;
  }
};

export const getEmployeeAssignedOrders = async (employeeId: string): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('assignedEmployeeId', '==', employeeId));
    const snapshot = await getDocs(q);
    
    const orders = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to ISO strings
      const createdAt = data.createdAt ? data.createdAt.toDate().toISOString() : null;
      const updatedAt = data.updatedAt ? data.updatedAt.toDate().toISOString() : null;
      
      // Format timeline timestamps
      const timeline = data.timeline ? data.timeline.map((event: any) => ({
        ...event,
        timestamp: event.timestamp instanceof Timestamp 
          ? event.timestamp.toDate().toISOString()
          : event.timestamp
      })) : [];
      
      return { 
        id: doc.id,
        ...data,
        createdAt,
        updatedAt,
        timeline
      } as Order;
    });
    
    // Sort by creation date (newest first)
    return orders.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error(`Error getting assigned orders for employee ${employeeId}:`, error);
    throw error;
  }
};

// Order assignment function
export const assignOrderToEmployee = async (orderId: string, employeeId: string): Promise<void> => {
  try {
    // Get employee details
    const employee = await getUser(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    // Update the order
    const orderRef = doc(db, 'orders', orderId);
    
    const timelineEvent = {
      status: 'assigned',
      message: `Order assigned to ${employee.displayName || 'an employee'}`,
      timestamp: new Date().toISOString(),
      updatedBy: 'admin'
    };
    
    await updateDoc(orderRef, {
      assignedEmployeeId: employeeId,
      employeeName: employee.displayName || 'Unnamed Employee',
      updatedAt: serverTimestamp(),
      timeline: arrayUnion(timelineEvent)
    });
    
    console.log(`Order ${orderId} assigned to employee ${employeeId}`);
  } catch (error) {
    console.error(`Error assigning order ${orderId} to employee ${employeeId}:`, error);
    throw new Error('Failed to assign order to employee');
  }
};

// Revenue and report functions
export const getMonthlyRevenueReport = async (year: number): Promise<{ month: string; revenue: number }[]> => {
  try {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const startDate = new Date(year, 0, 1); // January 1st of the given year
    const endDate = new Date(year, 11, 31, 23, 59, 59); // December 31st of the given year
    
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('status', '==', 'completed'),
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Initialize monthly data
    const monthlyData = months.map(month => ({ month, revenue: 0 }));
    
    // Populate revenue data
    querySnapshot.forEach((doc) => {
      const orderData = doc.data();
      if (orderData.createdAt && orderData.amount) {
        const orderDate = orderData.createdAt.toDate ? 
          orderData.createdAt.toDate() : 
          new Date(orderData.createdAt);
          
        const monthIndex = orderDate.getMonth();
        monthlyData[monthIndex].revenue += orderData.amount;
      }
    });
    
    return monthlyData;
  } catch (error) {
    console.error('Error getting monthly revenue report:', error);
    throw error;
  }
};

export const getServicePerformanceReport = async (): Promise<{ id: string; name: string; revenue: number; orders: number; averageRating: number }[]> => {
  try {
    // Get all completed orders
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('status', '==', 'completed'));
    const ordersSnapshot = await getDocs(q);
    
    // Track service performance
    const serviceStats: Record<string, { id: string; name: string; revenue: number; orders: number; ratings: number[]; }> = {};
    
    // Process orders
    ordersSnapshot.forEach((doc) => {
      const orderData = doc.data();
      if (orderData.serviceId && orderData.amount) {
        if (!serviceStats[orderData.serviceId]) {
          serviceStats[orderData.serviceId] = {
            id: orderData.serviceId,
            name: orderData.serviceName || 'Unknown Service',
            revenue: 0,
            orders: 0,
            ratings: []
          };
        }
        
        serviceStats[orderData.serviceId].revenue += orderData.amount;
        serviceStats[orderData.serviceId].orders += 1;
        
        // Add rating if exists
        if (orderData.rating) {
          serviceStats[orderData.serviceId].ratings.push(orderData.rating);
        }
      }
    });
    
    // Calculate average ratings and format final data
    return Object.values(serviceStats).map(service => ({
      id: service.id,
      name: service.name,
      revenue: service.revenue,
      orders: service.orders,
      averageRating: service.ratings.length > 0 
        ? service.ratings.reduce((a, b) => a + b, 0) / service.ratings.length 
        : 0
    }));
  } catch (error) {
    console.error('Error getting service performance report:', error);
    throw error;
  }
};

// Add the deleteOrder function after the updateOrderStatus function
export async function deleteOrder(orderId: string): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    
    // First check if the order exists
    const orderDoc = await getDoc(orderRef);
    if (!orderDoc.exists()) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    
    // Delete any associated messages
    const messagesRef = collection(db, 'orderMessages');
    const messagesQuery = query(messagesRef, where('orderId', '==', orderId));
    const messagesSnapshot = await getDocs(messagesQuery);
    
    // Delete messages in a batch
    const messageDeletionPromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(messageDeletionPromises);
    
    // Delete any associated documents from storage
    const orderData = orderDoc.data();
    if (orderData.documents && orderData.documents.length > 0) {
      const documentDeletionPromises = orderData.documents.map(async (doc: any) => {
        if (doc.url) {
          try {
            const fileRef = ref(storage, doc.url);
            await deleteObject(fileRef);
          } catch (error) {
            console.error(`Error deleting document file for order ${orderId}:`, error);
            // Continue with order deletion even if file deletion fails
          }
        }
      });
      await Promise.all(documentDeletionPromises);
    }
    
    // Finally delete the order document itself
    await deleteDoc(orderRef);
    console.log(`Order ${orderId} successfully deleted`);
  } catch (error) {
    console.error(`Error deleting order ${orderId}:`, error);
    throw new Error(`Failed to delete order: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 