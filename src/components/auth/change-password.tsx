'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Lock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { updatePassword as firebaseUpdatePassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export function ChangePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    if (!auth.currentUser) {
      setError('You must be logged in to change your password');
      toast.error('Authentication error');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      // For email/password users (not OAuth users)
      if (auth.currentUser.providerData.some(provider => provider.providerId === 'password')) {
        await firebaseUpdatePassword(auth.currentUser, data.newPassword);
        setSuccess(true);
        toast.success('Password updated successfully');
        reset();

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        // For OAuth users who don't have a password
        setError('Cannot change password for accounts that signed in with Google or other providers');
        toast.error('Password change not available for this account type');
      }
    } catch (error: any) {
      console.error('Failed to update password:', error);
      
      let errorMessage = 'Failed to update password. Please try again.';
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'For security reasons, please sign out and sign in again before changing your password.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Please choose a stronger password.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user signed in with OAuth rather than email/password
  const isOAuthUser = auth.currentUser?.providerData.every(provider => provider.providerId !== 'password');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isOAuthUser && (
          <Alert className="mb-6 bg-amber-50 text-amber-800 border-amber-200">
            <AlertTitle>Not Available</AlertTitle>
            <AlertDescription>
              Password change is not available for accounts that signed in with Google or other providers.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Your password has been updated successfully.
            </AlertDescription>
          </Alert>
        )}

        <form id="password-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </span>
              <Input
                id="currentPassword"
                type="password"
                {...register('currentPassword')}
                className={`pl-10 ${errors.currentPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                disabled={isLoading || isOAuthUser}
              />
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </span>
              <Input
                id="newPassword"
                type="password"
                {...register('newPassword')}
                className={`pl-10 ${errors.newPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                disabled={isLoading || isOAuthUser}
              />
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </span>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className={`pl-10 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                disabled={isLoading || isOAuthUser}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end border-t bg-gray-50 px-6 py-4">
        <Button
          type="submit"
          form="password-form"
          disabled={isLoading || isOAuthUser}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Password'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 