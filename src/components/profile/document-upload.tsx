'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File, FileText, Trash2, FileArchive, Download, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DocumentCategory } from '@/types';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc, Timestamp, orderBy, serverTimestamp, getDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  category: DocumentCategory;
  url: string;
  uploadedAt: Date | Timestamp;
}

export function DocumentUpload() {
  const { user } = useAppSelector((state) => state.auth);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('identification');
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize Firebase services
  const storage = getStorage();
  const db = getFirestore();
  
  // Fetch user documents on component mount
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user?.uid) return;
      
      try {
        setIsLoading(true);
        // Using users collection directly
        const userDocsRef = collection(db, 'documents');
        
        // First attempt with orderBy - this requires a composite index
        try {
          const q = query(
            userDocsRef, 
            where('userId', '==', user.uid), 
            orderBy('uploadedAt', 'desc')
          );
          const userDocsSnapshot = await getDocs(q);
          
          const docs: UserDocument[] = [];
          userDocsSnapshot.forEach((doc) => {
            const data = doc.data() as Omit<UserDocument, 'id'>;
            docs.push({ id: doc.id, ...data });
          });
          
          setDocuments(docs);
        } catch (indexError: any) {
          // If we get a missing index error, fall back to simpler query without ordering
          if (indexError.code === 'failed-precondition') {
            console.warn('Index missing for ordered query. Using unordered query as fallback.');
            console.error('Missing index details:', indexError.message);
            
            // Log out the error message which contains the link to create the index
            if (indexError.message.includes('https://console.firebase.google.com')) {
              const indexUrl = indexError.message.match(/(https:\/\/console\.firebase\.google\.com\S+)/);
              if (indexUrl) {
                console.info('Create the required index at:', indexUrl[0]);
              }
            }
            
            // Fallback query without ordering
            const fallbackQuery = query(userDocsRef, where('userId', '==', user.uid));
            const fallbackSnapshot = await getDocs(fallbackQuery);
            
            const fallbackDocs: UserDocument[] = [];
            fallbackSnapshot.forEach((doc) => {
              const data = doc.data() as Omit<UserDocument, 'id'>;
              fallbackDocs.push({ id: doc.id, ...data });
            });
            
            // Sort client-side as a fallback
            fallbackDocs.sort((a, b) => {
              const dateA = a.uploadedAt instanceof Timestamp ? 
                a.uploadedAt.toMillis() : new Date(a.uploadedAt).getTime();
              const dateB = b.uploadedAt instanceof Timestamp ? 
                b.uploadedAt.toMillis() : new Date(b.uploadedAt).getTime();
              return dateB - dateA; // Descending order
            });
            
            setDocuments(fallbackDocs);
          } else {
            // For other errors, throw to be caught by outer catch block
            throw indexError;
          }
        }
      } catch (error) {
        logError('fetchDocuments from Firestore', error);
        toast.error("Loading failed", {
          description: "Could not load your documents. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, [user?.uid, db]);
  
  const uploadDocument = async (file: File, category: DocumentCategory): Promise<UserDocument> => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }
    
    // Create a unique filename to prevent collisions
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    const filePath = `documents/${user.uid}/${uniqueFileName}`;
    const storageRef = ref(storage, filePath);
    
    // Upload file with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
        },
        (error) => {
          // Handle upload errors
          logError('uploadBytes to Firebase Storage', error);
          reject(error);
        },
        async () => {
          try {
            // Get download URL once upload completes
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Store document metadata in Firestore
            const docRef = collection(db, 'documents');
            const newDoc = {
              name: file.name,
              size: file.size,
              type: file.type,
              category,
              url: downloadURL,
              path: filePath, // Store path for easy deletion
              uploadedAt: Timestamp.now(),
              userId: user.uid // Add user ID to the document
            };
            
            const docSnapshot = await addDoc(docRef, newDoc);
            
            // Clean up progress tracking
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[file.name];
              return newProgress;
            });
            
            // Return the newly created document
            const userDoc: UserDocument = {
              id: docSnapshot.id,
              ...newDoc,
              uploadedAt: new Date()
            };
            
            resolve(userDoc);
          } catch (error) {
            logError('saving document metadata to Firestore', error);
            reject(error);
          }
        }
      );
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0]; // Process one file at a time for category selection
      showCategoryDialog(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0]; // Process one file at a time for category selection
      showCategoryDialog(file);
      
      // Reset file input for future selections
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const showCategoryDialog = (file: File) => {
    setCurrentFile(file);
    setIsCategoryDialogOpen(true);
  };
  
  const handleCategoryConfirm = async () => {
    if (!currentFile) return;
    
    setIsCategoryDialogOpen(false);
    await handleFileUpload(currentFile, selectedCategory);
    setCurrentFile(null);
  };

  const handleFileUpload = async (file: File, category: DocumentCategory) => {
    // Check if user is logged in
    if (!user) {
      toast.error("Authentication required", {
        description: "Please sign in to upload documents"
      });
      return;
    }

    // Validate file size (limit to 20MB)
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large", {
        description: `Maximum file size is 20MB. Your file is ${formatFileSize(file.size)}.`
      });
      return;
    }

    // Generate unique file name to avoid overwrites
    const uniqueFileName = `${Date.now()}-${file.name}`;
    
    // Show loading toast
    const loadingToastId = crypto.randomUUID();
    toast.loading("Uploading document", {
      id: loadingToastId,
      description: `Uploading ${file.name}...`
    });

    try {
      // Create storage reference
      const storageRef = ref(storage, `documents/${user.uid}/${uniqueFileName}`);
      
      // Create upload task with state change monitoring
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Track upload progress
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          // Handle upload errors
          logError('Upload failed', error);
          toast.error("Upload failed", {
            id: loadingToastId,
            description: "There was an error uploading your document. Please try again.",
          });
          setUploadProgress(0);
          throw error; // Propagate error for Promise rejection
        }
      );
      
      // Wait for upload to complete
      await uploadTask;
      
      // Get download URL after successful upload
      const downloadURL = await getDownloadURL(storageRef);
      
      // Save document metadata to Firestore
      const docRef = await addDoc(collection(db, "documents"), {
        userId: user.uid,
        name: file.name,
        fileName: uniqueFileName,
        fileType: file.type,
        size: file.size,
        category: category,
        url: downloadURL,
        uploadedAt: serverTimestamp(),
      });
      
      // Show success notification and close loading toast
      toast.success("Document uploaded", {
        id: loadingToastId,
        description: `${file.name} has been uploaded successfully.`
      });
      
      // Reset upload progress
      setUploadProgress(0);
      
      // Refresh document list
      setDocuments(prev => [...prev, { id: docRef.id, name: file.name, size: file.size, type: file.type, category, url: downloadURL, uploadedAt: Timestamp.fromDate(new Date()) }]);
      
      return docRef.id;
    } catch (error) {
      // This will catch Firestore errors and any uncaught storage errors
      logError('Document upload process failed', error);
      
      // Ensure the loading toast is dismissed and error is shown
      toast.error("Upload process failed", {
        id: loadingToastId,
        description: "Unable to complete the document upload. Please try again."
      });
      
      // Reset upload progress
      setUploadProgress(0);
      
      return null;
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    // Check if user is logged in and document exists
    if (!user || !documentId) {
      toast.error("Error", {
        description: "Unable to delete document"
      });
      return;
    }

    // Show loading toast
    const loadingToastId = crypto.randomUUID();
    toast.loading("Deleting document", {
      id: loadingToastId,
      description: "Please wait..."
    });

    try {
      // Get document reference
      const docRef = doc(db, "documents", documentId);
      
      // Get document data
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const documentData = docSnap.data();
        
        // Check if document belongs to user
        if (documentData.userId !== user.uid) {
          throw new Error("Permission denied: You do not own this document");
        }
        
        // Delete file from storage if URL exists
        if (documentData.fileName) {
          const storageRef = ref(storage, `documents/${user.uid}/${documentData.fileName}`);
          await deleteObject(storageRef);
        }
        
        // Delete document from Firestore
        await deleteDoc(docRef);
        
        // Show success notification
        toast.success("Document deleted", {
          id: loadingToastId,
          description: "The document has been removed successfully."
        });
        
        // Refresh document list
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      } else {
        throw new Error("Document not found");
      }
    } catch (error) {
      logError('Document deletion failed', error);
      
      toast.error("Deletion failed", {
        id: loadingToastId,
        description: "There was an error deleting the document. Please try again."
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-10 w-10 text-red-500" />;
    if (fileType.includes('image')) return <File className="h-10 w-10 text-blue-500" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <FileArchive className="h-10 w-10 text-yellow-500" />;
    return <File className="h-10 w-10 text-gray-500" />;
  };
  
  const formatDate = (date: Date | Timestamp) => {
    if (date instanceof Timestamp) {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  // Helper function to retry a failed upload
  const handleRetryUpload = (file: File, category: DocumentCategory) => {
    toast("Retrying upload", {
      description: `Attempting to upload ${file.name} again...`
    });
    handleFileUpload(file, category);
  };

  // Centralized error logging function
  const logError = (context: string, error: any) => {
    console.error(`Error context: ${context}`, error);
    
    // Log additional Firebase error details if available
    if (error.code) {
      console.error(`Firebase error code: ${error.code}`);
      
      // Provide more specific guidance based on error code
      if (error.code.includes('storage/')) {
        console.error('Storage error detected. Check storage rules at src/lib/firebase/storage-rules.txt');
      }
      
      if (error.code.includes('firestore/')) {
        console.error('Firestore error detected. Check Firestore rules at src/lib/firebase/firestore-rules.txt');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } transition-colors duration-200 ease-in-out`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {isDragging ? 'Drop files here' : 'Upload Documents'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop files or click to browse
          </p>
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Select Files'}
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Max file size: 20MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Document List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading your documents...</span>
        </div>
      ) : documents.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Your Documents</h3>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <ul className="divide-y divide-gray-200">
              <AnimatePresence initial={false}>
                {documents.map((doc) => (
                  <motion.li
                    key={doc.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-4"
                  >
                    <div className="flex items-start gap-4">
                      {getFileIcon(doc.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{formatFileSize(doc.size)}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {formatDate(doc.uploadedAt)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <Badge variant="outline">{doc.category}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
              
              {/* Show files being uploaded with progress */}
              {Object.entries(uploadProgress).length > 0 && (
                <>
                  <Separator />
                  {Object.entries(uploadProgress).map(([fileName, progress]) => (
                    <motion.li
                      key={fileName}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4"
                    >
                      <div className="flex items-center gap-4">
                        <File className="h-10 w-10 text-gray-400 animate-pulse" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {fileName}
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Uploading... {progress}%
                          </p>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </>
              )}
            </ul>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-medium text-gray-900 mb-1">No documents uploaded</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload important documents related to your services and account
          </p>
        </div>
      )}
      
      {/* Category Selection Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Document Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              Please select a category for <span className="font-medium">{currentFile?.name}</span>
            </p>
            <div className="space-y-2">
              <Label htmlFor="category">Document Category</Label>
              <select 
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory)}
              >
                <option value="identification">Identification</option>
                <option value="financial">Financial</option>
                <option value="contract">Contract</option>
                <option value="report">Report</option>
                <option value="invoice">Invoice</option>
                <option value="legal">Legal</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCategoryDialogOpen(false);
                setCurrentFile(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCategoryConfirm}>
              Upload Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 