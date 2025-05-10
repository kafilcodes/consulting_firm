'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';

interface AccessDeniedProps {
  message?: string;
}

export function AccessDenied({ message = "You don't have permission to access this page." }: AccessDeniedProps) {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  
  // Determine the appropriate dashboard based on user role
  const getDashboardPath = () => {
    if (!user) return '/auth/sign-in';
    
    const role = user.role?.toLowerCase() || '';
    
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'employee') return '/employee/dashboard';
    if (role === 'consultant') return '/consultant/dashboard';
    if (role === 'client') return '/client/dashboard';
    
    return '/';
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-gray-900">Access Denied</h1>
        
        <p className="mt-3 text-gray-600">
          {message} Please contact your administrator if you believe this is an error.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          
          <Button
            className="flex items-center gap-2"
            onClick={() => router.push(getDashboardPath())}
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
} 