'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signInWithGoogle } from '@/store/slices/authSlice';

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  // Get the callback URL from the query string or use the default
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  // If user is already signed in, redirect to callback URL
  if (user) {
    router.push(callbackUrl);
    return null;
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Dispatch the sign-in action
      const result = await dispatch(signInWithGoogle()).unwrap();
      
      if (!result) {
        throw new Error('Sign in failed');
      }
      
      // Redirect based on user role
      if (result.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (result.role === 'client') {
        router.push('/client/dashboard');
      } else if (result.role === 'consultant') {
        router.push('/consultant/dashboard');
      } else {
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <Button
        type="button"
        variant="outline"
        className="w-full border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Continue with Google
      </Button>
      
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">
            Or contact support
          </span>
        </div>
      </div>
      
      <p className="px-8 text-center text-sm text-muted-foreground">
        Need help? Contact{' '}
        <a 
          href="mailto:support@sks-consulting.com"
          className="underline underline-offset-4 hover:text-primary"
        >
          support
        </a>
      </p>
    </div>
  );
} 