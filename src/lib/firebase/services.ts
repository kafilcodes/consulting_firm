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

// Order functions
export interface Order {
  id: string;
  clientId: string;
  serviceId: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  documents: string[];
  timeline: {
    id: string;
    status: string;
    message: string;
    timestamp: Date;
    updatedBy: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const ordersRef = collection(db, 'orders');
    const orderDoc = await addDoc(ordersRef, {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return orderDoc.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order');
  }
}

export async function getOrder(id: string): Promise<Order | null> {
  const orderRef = doc(db, 'orders', id);
  const orderDoc = await getDoc(orderRef);
  return orderDoc.exists() ? { id: orderDoc.id, ...orderDoc.data() } as Order : null;
}

export async function getClientOrders(clientId: string): Promise<Order[]> {
  const ordersRef = collection(db, 'orders');
  const q = query(
    ordersRef,
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  message: string,
  updatedBy: string
): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);
  const now = Timestamp.now();
  
  await updateDoc(orderRef, {
    status,
    updatedAt: now,
    timeline: [
      {
        id: crypto.randomUUID(),
        status,
        message,
        timestamp: now,
        updatedBy,
      },
    ],
  });
}

export async function getRecentOrders(limit: number = 5): Promise<Order[]> {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(limit));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}

export async function updateOrderPayment(
  orderId: string,
  paymentDetails: {
    paymentId: string;
    paymentStatus: 'paid' | 'failed';
    paymentResponse?: any;
  }
): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);
  const now = Timestamp.now();

  await updateDoc(orderRef, {
    paymentId: paymentDetails.paymentId,
    paymentStatus: paymentDetails.paymentStatus,
    paymentResponse: paymentDetails.paymentResponse,
    updatedAt: now,
    status: paymentDetails.paymentStatus === 'paid' ? 'processing' : 'cancelled',
    timeline: arrayUnion({
      id: crypto.randomUUID(),
      status: paymentDetails.paymentStatus === 'paid' ? 'processing' : 'cancelled',
      message: paymentDetails.paymentStatus === 'paid' 
        ? 'Payment successful. Order is being processed.'
        : 'Payment failed. Order cancelled.',
      timestamp: now,
      updatedBy: 'system',
    }),
  });
}

export async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  try {
    const order = await getOrder(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Create signature verification string
    const text = orderId + '|' + paymentId;
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    
    // Verify signature using crypto
    const crypto = require('crypto');
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    return generatedSignature === signature;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
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
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
} 