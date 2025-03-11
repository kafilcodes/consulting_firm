'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signInWithGoogle } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      const callbackUrl = searchParams.get('callbackUrl');
      // Redirect based on user role with a slight delay to ensure state is updated
      setTimeout(() => {
        const redirectTo = callbackUrl || (user.role === 'admin' ? '/admin' : '/client');
        router.push(redirectTo);
        toast.success(`Welcome back${user.displayName ? `, ${user.displayName}` : ''}!`);
      }, 100);
    }
  }, [user, router, searchParams]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      setIsLoading(false);
    }
  }, [error]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await dispatch(signInWithGoogle()).unwrap();
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account using your Google account
        </p>
      </div>

      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={handleGoogleSignIn}
        className="w-full max-w-sm"
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Continue with Google
      </Button>
    </div>
  );
} 