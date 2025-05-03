import { useState } from 'react';
import { DocumentCategory } from '@/types';
import { toast } from 'sonner';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirestore, collection, addDoc, doc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

interface UploadDocumentOptions {
  /** Custom collection path where document metadata will be stored */
  collectionPath?: string;
  /** Custom folder path where the file will be stored in Firebase Storage */
  storagePath?: string;
  /** Additional metadata to store with the document */
  additionalMetadata?: Record<string, any>;
}

export interface UserDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  category: DocumentCategory;
  url: string;
  uploadedAt: Date;
  [key: string]: any; // For additional fields
}

/**
 * Hook for handling document upload functionality
 */
export function useDocumentUpload(userId: string | null | undefined) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  
  // Initialize Firebase services
  const storage = getStorage();
  const db = getFirestore();
  
  /**
   * Upload a document to Firebase Storage and save metadata to Firestore
   */
  const uploadDocument = async (
    file: File, 
    category: DocumentCategory, 
    options?: UploadDocumentOptions
  ): Promise<UserDocument | null> => {
    // Check if user is authenticated
    if (!userId) {
      toast.error("Authentication required", {
        description: "Please sign in to upload documents"
      });
      return null;
    }

    // Validate file size (limit to 20MB)
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large", {
        description: `Maximum file size is 20MB. Your file is ${formatFileSize(file.size)}.`
      });
      return null;
    }

    // Start uploading
    setIsUploading(true);
    const loadingToastId = crypto.randomUUID();
    toast.loading("Uploading document", {
      id: loadingToastId,
      description: `Uploading ${file.name}...`
    });

    try {
      // Create a unique filename to prevent collisions
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
      const storageFolderPath = options?.storagePath || `documents/${userId}`;
      const filePath = `${storageFolderPath}/${uniqueFileName}`;
      const storageRef = ref(storage, filePath);
      
      // Track upload progress
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Monitor upload progress
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
        },
        (error) => {
          console.error('Upload error:', error);
          toast.error("Upload failed", {
            id: loadingToastId,
            description: "There was an error uploading your document. Please try again."
          });
          
          // Clean up progress tracking
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
          
          setIsUploading(false);
        }
      );
      
      // Wait for upload to complete
      await uploadTask;
      
      // Get download URL after successful upload
      const downloadURL = await getDownloadURL(storageRef);
      
      // Prepare document metadata
      const documentData = {
        userId,
        name: file.name,
        fileName: uniqueFileName,
        size: file.size,
        type: file.type,
        category,
        url: downloadURL,
        storagePath: filePath,
        uploadedAt: serverTimestamp(),
        ...options?.additionalMetadata
      };
      
      // Save to Firestore
      const collectionPath = options?.collectionPath || 'documents';
      const docRef = await addDoc(collection(db, collectionPath), documentData);
      
      // Clean up progress tracking
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[file.name];
        return newProgress;
      });
      
      // Show success notification
      toast.success("Document uploaded", {
        id: loadingToastId,
        description: `${file.name} has been uploaded successfully.`
      });
      
      // Return the newly created document
      const result: UserDocument = {
        id: docRef.id,
        name: file.name,
        size: file.size,
        type: file.type,
        category,
        url: downloadURL,
        uploadedAt: new Date(),
        ...options?.additionalMetadata
      };
      
      return result;
    } catch (error) {
      console.error('Document upload process failed:', error);
      
      toast.error("Upload failed", {
        id: loadingToastId,
        description: "There was an error uploading your document. Please try again."
      });
      
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  /**
   * Delete a document from Firebase Storage and Firestore
   */
  const deleteDocument = async (
    documentId: string, 
    collectionPath: string = 'documents'
  ): Promise<boolean> => {
    // Check if user is authenticated
    if (!userId) {
      toast.error("Authentication required", {
        description: "Please sign in to delete documents"
      });
      return false;
    }

    // Show loading toast
    const loadingToastId = crypto.randomUUID();
    toast.loading("Deleting document", {
      id: loadingToastId,
      description: "Please wait..."
    });
    
    try {
      // Get document reference
      const docRef = doc(db, collectionPath, documentId);
      
      // Get document data
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const documentData = docSnap.data();
        
        // Verify ownership
        if (documentData.userId !== userId) {
          throw new Error("Permission denied: You do not own this document");
        }
        
        // Delete file from storage if storagePath exists
        if (documentData.storagePath) {
          const storageRef = ref(storage, documentData.storagePath);
          await deleteObject(storageRef);
        }
      
        // Delete document from Firestore
        await deleteDoc(docRef);
        
        // Show success notification
        toast.success("Document deleted", {
          id: loadingToastId,
          description: "The document has been removed successfully."
        });
        
        return true;
      } else {
        throw new Error("Document not found");
      }
    } catch (error) {
      console.error('Document deletion failed:', error);
      
      toast.error("Deletion failed", {
        id: loadingToastId,
        description: "There was an error deleting the document. Please try again."
      });
      
      return false;
    }
  };

  /**
   * Format file size into human-readable format
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    uploadDocument,
    deleteDocument,
    isUploading,
    uploadProgress,
    formatFileSize
  };
} 