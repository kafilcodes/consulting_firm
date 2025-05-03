'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signInWithGoogle } from '@/store/slices/authSlice';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { user, isInitialized, error } = useAppSelector((state) => state.auth);
  
  // Get the callback URL from the query string or use the default
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  // Handle errors from the auth slice
  useEffect(() => {
    if (error) {
      toast.error(error);
      console.error('Authentication error:', error);
    }
  }, [error]);
  
  // If user is already signed in, redirect to callback URL
  useEffect(() => {
    if (isInitialized && user) {
      console.log('User already authenticated, redirecting to:', callbackUrl);
      
      // Determine redirect based on user role
      let redirectPath = callbackUrl;
      if (callbackUrl === '/' || callbackUrl === '/dashboard') {
        // For homepage redirect to role-specific dashboard
        const role = user.role?.toLowerCase();
        if (role === 'admin') {
          redirectPath = '/admin/dashboard';
        } else if (role === 'client') {
          redirectPath = '/client/dashboard';
        } else if (role === 'consultant' || role === 'employee') {
          redirectPath = '/consultant/dashboard';
        } else {
          // Default to client dashboard
          redirectPath = '/client/dashboard';
        }
      }
      
      // Decode URL if it was encoded
      try {
        if (redirectPath !== '/' && redirectPath.startsWith('%2F')) {
          redirectPath = decodeURIComponent(redirectPath);
        }
      } catch (e) {
        console.error('Error decoding URL:', e);
      }
      
      router.push(redirectPath);
    }
  }, [user, isInitialized, router, callbackUrl]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      console.log('Starting Google sign-in process');
      
      // Dispatch the sign-in action
      const result = await dispatch(signInWithGoogle()).unwrap();
      
      if (!result) {
        throw new Error('Sign in failed');
      }
      
      console.log('Sign-in successful, user role:', result.role);
      // Add welcome notification
      toast.success(`Welcome back${result.displayName ? ', ' + result.displayName.split(' ')[0] : ''}!`, {
        id: 'welcome-toast',
        duration: 3000,
      });
      
      // Redirect based on user role
      if (result.role?.toLowerCase() === 'admin') {
        router.push('/admin/dashboard');
      } else if (result.role?.toLowerCase() === 'client') {
        router.push('/client/dashboard');
      } else if (result.role?.toLowerCase() === 'consultant' || result.role?.toLowerCase() === 'employee') {
        router.push('/consultant/dashboard');
      } else {
        // Default to client dashboard
        router.push('/client/dashboard');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If user is already signed in, show loading animation
  if (user) {
    return (
      <div className="flex justify-center py-8">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-t-2 border-r-0 border-b-0 border-l-2 border-blue-600 animate-spin"></div>
          <div className="absolute inset-0 rounded-full border border-gray-200 opacity-25"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="flex flex-col space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className={`w-full py-6 relative overflow-hidden group ${
          isLoading 
            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
            : "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow transition-all duration-300"
        } rounded-md`}
      >
        <div className="absolute inset-0 w-3 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-full opacity-0 group-hover:opacity-10 transition-all duration-500 ease-out"></div>
        <span className="flex items-center justify-center text-base font-medium">
          {isLoading ? (
            <Icons.spinner className="mr-3 h-5 w-5 animate-spin text-gray-500" />
          ) : (
            <Icons.google className="mr-3 h-5 w-5" />
          )}
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </span>
      </Button>
      
      <div className="flex items-center justify-center space-x-2">
        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="text-sm text-gray-600">
          Your data is protected with enterprise-grade security
        </p>
      </div>
      
      <div className="text-center">
        <p className="text-xs text-gray-500">
          By signing in, you agree to our{' '}
          <a href="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </motion.div>
  );
} 