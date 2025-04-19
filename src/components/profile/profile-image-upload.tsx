'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Trash2, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateUserProfile } from '@/store/slices/authSlice';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

export function ProfileImageUpload() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [image, setImage] = useState<string | null>(user?.photoURL || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storage = getStorage();
  
  // Update image when user profile changes
  useEffect(() => {
    if (user?.photoURL) {
      setImage(user.photoURL);
    }
  }, [user?.photoURL]);

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
      await handleImageUpload(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      await handleImageUpload(e.target.files[0]);
      
      // Clear the input value so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!user?.uid) {
      toast.error('You must be logged in to upload a profile image');
      return;
    }
    
    // Validate file type
    if (!file.type.includes('image')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Validate file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size exceeds 2MB limit');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create a unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `profile-${Date.now()}.${fileExtension}`;
      const filePath = `users/${user.uid}/profile/${fileName}`;
      const storageRef = ref(storage, filePath);
      
      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Error uploading image:', error);
          toast.error('Failed to upload image');
          setIsUploading(false);
        },
        async () => {
          try {
            // Get download URL once upload completes
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Update user profile in Firebase and Redux store
            await dispatch(updateUserProfile({
              uid: user.uid,
              photoURL: downloadURL
            })).unwrap();
            
            // Update local state
            setImage(downloadURL);
            toast.success('Profile image updated successfully');
          } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile image');
          } finally {
            setIsUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Error handling image upload:', error);
      toast.error('Failed to process image');
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!user?.uid || !user.photoURL) return;
    
    try {
      setIsUploading(true);
      
      // If the photoURL contains the storage path, delete the file from Storage
      if (user.photoURL.includes('firebase') && user.photoURL.includes('/o/users')) {
        // Extract file path from URL
        const filePathMatch = user.photoURL.match(/o\/(.+?)(\?|$)/);
        if (filePathMatch && filePathMatch[1]) {
          const filePath = decodeURIComponent(filePathMatch[1]);
          const storageRef = ref(storage, filePath);
          
          try {
            await deleteObject(storageRef);
          } catch (error) {
            // If the file doesn't exist, continue anyway
            console.warn('File not found in storage:', error);
          }
        }
      }
      
      // Update user profile in Firebase and Redux store
      await dispatch(updateUserProfile({
        uid: user.uid,
        photoURL: null
      })).unwrap();
      
      // Update local state
      setImage(null);
      toast.success('Profile image removed');
    } catch (error) {
      console.error('Error removing profile image:', error);
      toast.error('Failed to remove profile image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Profile Image Display or Upload Area */}
      {image ? (
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden relative">
              <Image 
                src={image} 
                alt="Profile" 
                fill 
                style={{ objectFit: 'cover' }}
                className="rounded-full"
              />
            </div>
            <Button
              size="icon"
              variant="destructive"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
              onClick={handleRemoveImage}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Camera className="h-4 w-4 mr-2" />
              Change Photo
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {isDragging ? 'Drop image here' : 'Upload a profile picture'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop or click to select
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Select Image'
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              PNG, JPG or GIF • Max 2MB
            </p>
          </div>
        </div>
      )}
      
      {/* File Input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Upload Progress */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-center mt-1 text-gray-500">
            Uploading... {uploadProgress}%
          </p>
        </motion.div>
      )}
    </div>
  );
} 