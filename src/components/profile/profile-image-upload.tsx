'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadProfileImage } from '@/lib/firebase/storage';
import { useAuth } from '@/contexts/auth-context';

export function ProfileImageUpload() {
  const { user, updateProfile } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(user?.photoURL || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const file = e.dataTransfer.files[0];
    if (file) {
      await handleImageUpload(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsLoading(true);
      const downloadURL = await uploadProfileImage(user!.id, file);
      await updateProfile({ photoURL: downloadURL });
      setPreview(downloadURL);
      toast.success('Profile image updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setIsLoading(true);
      await updateProfile({ photoURL: null });
      setPreview(null);
      toast.success('Profile image removed');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <motion.div
        className={`relative w-32 h-32 rounded-full overflow-hidden border-2 ${
          isDragging ? 'border-blue-500' : 'border-gray-200'
        }`}
        animate={{ scale: isDragging ? 1.05 : 1 }}
        transition={{ duration: 0.2 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <User className="w-12 h-12 text-gray-400" />
          </div>
        )}

        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </button>

        {preview && (
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-sm text-gray-500 text-center">
        Drag and drop an image or click to upload
        <br />
        (Max size: 5MB)
      </p>
    </div>
  );
} 