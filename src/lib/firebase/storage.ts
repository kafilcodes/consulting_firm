import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  getMetadata,
} from 'firebase/storage';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { storage, db } from './config';
import type { OrderDocument } from '@/types';

export async function uploadProfileImage(
  userId: string,
  file: File
): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const fileName = `profile-images/${userId}.${fileExtension}`;
  const storageRef = ref(storage, fileName);

  try {
    // Upload the file
    await uploadBytes(storageRef, file);
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
}

export async function deleteProfileImage(userId: string): Promise<void> {
  const storageRef = ref(storage, `profile-images/${userId}`);
  try {
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting profile image:', error);
    throw error;
  }
}

export async function uploadOrderDocument(
  orderId: string,
  file: File,
  category: DocumentCategory
): Promise<OrderDocument> {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const fileName = `orders/${orderId}/documents/${category}/${timestamp}-${file.name}`;
    const storageRef = ref(storage, fileName);

    // Upload file
    await uploadBytes(storageRef, file);
    
    // Get download URL and metadata
    const [downloadURL, metadata] = await Promise.all([
      getDownloadURL(storageRef),
      getMetadata(storageRef),
    ]);

    // Create document object
    const document: OrderDocument = {
      id: `${timestamp}`,
      name: file.name,
      url: downloadURL,
      type: metadata.contentType || 'application/octet-stream',
      size: metadata.size,
      category,
      uploadedAt: new Date().toISOString(),
    };

    // Update order document in Firestore
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      documents: arrayUnion(document),
    });

    return document;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

export async function deleteOrderDocument(
  orderId: string,
  documentId: string
): Promise<void> {
  try {
    // Get the order to find the document details
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      throw new Error('Order not found');
    }

    const order = orderDoc.data();
    const document = order.documents.find((doc: OrderDocument) => doc.id === documentId);

    if (!document) {
      throw new Error('Document not found');
    }

    // Delete from Storage
    const storageRef = ref(storage, document.url);
    await deleteObject(storageRef);

    // Remove from Firestore
    await updateDoc(orderRef, {
      documents: arrayRemove(document),
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
} 