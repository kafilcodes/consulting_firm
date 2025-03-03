'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/auth-context';
import Image from 'next/image';

export function SignInForm() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      if (!user) throw new Error('No user data returned');
      
      toast.success('Welcome back!');
      
      // Redirect based on user role
      if (user.role === 'admin' || user.role === 'employee') {
        router.push('/admin');
      } else {
        router.push('/client');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [signInWithGoogle, router, isLoading]);

  return (
    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <div className="space-y-6">
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Image
            src="/google.svg"
            alt="Google"
            width={24}
            height={24}
            className="h-6 w-6"
          />
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </button>
      </div>

      <p className="mt-10 text-center text-sm text-gray-500">
        By continuing, you agree to our{' '}
        <a href="#" className="font-semibold leading-6 text-blue-600 hover:text-blue-500 transition-colors">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="font-semibold leading-6 text-blue-600 hover:text-blue-500 transition-colors">
          Privacy Policy
        </a>
      </p>
    </div>
  );
} 