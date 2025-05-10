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