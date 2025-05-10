'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { User } from '@/types';
import {
  signIn as firebaseSignIn,
  signUp as firebaseSignUp,
  signOut as firebaseSignOut,
  signInWithGoogle as firebaseSignInWithGoogle,
  getCurrentUser,
  onAuthStateChange,
  resetPassword as firebaseResetPassword,
  updateUserProfile,
  updatePassword as firebaseUpdatePassword,
  getCurrentUserIdToken,
} from '@/lib/firebase/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const clearError = useCallback(() => setError(null), []);

  // Handle auth state changes
  useEffect(() => {
    let unsubscribe: () => void;

    const initializeAuth = async () => {
      try {
        unsubscribe = onAuthStateChange(async (firebaseUser) => {
          setIsLoading(true);
          try {
            if (firebaseUser) {
              const userData = await getCurrentUser();
              setUser(userData);
            } else {
              setUser(null);
            }
          } catch (err) {
            console.error('Auth state change error:', err);
            setError(err instanceof Error ? err : new Error('Authentication error'));
          } finally {
            setIsLoading(false);
          }
        });
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize authentication'));
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await firebaseSignIn(email, password);
      setUser(userData);
      toast.success('Signed in successfully');
      
      // Redirect based on user role
      if (userData.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (userData.role === 'employee') {
        router.push('/employee/dashboard');
      } else if (userData.role === 'consultant') {
        router.push('/consultant/dashboard');
      } else {
        router.push('/client/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sign in failed'));
      toast.error(err instanceof Error ? err.message : 'Sign in failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await firebaseSignUp(email, password, name);
      setUser(userData);
      toast.success('Account created successfully');
      router.push('/client/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sign up failed'));
      toast.error(err instanceof Error ? err.message : 'Sign up failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await firebaseSignInWithGoogle();
      setUser(userData);
      toast.success('Signed in with Google successfully');
      
      // Redirect based on user role
      if (userData.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (userData.role === 'employee') {
        router.push('/employee/dashboard');
      } else if (userData.role === 'consultant') {
        router.push('/consultant/dashboard');
      } else {
        router.push('/client/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Google sign in failed'));
      toast.error(err instanceof Error ? err.message : 'Google sign in failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await firebaseSignOut();
      setUser(null);
      toast.success('Signed out successfully');
      router.push('/auth/sign-in');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sign out failed'));
      toast.error(err instanceof Error ? err.message : 'Sign out failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await firebaseResetPassword(email);
      toast.success('Password reset email sent');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Password reset failed'));
      toast.error(err instanceof Error ? err.message : 'Password reset failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (data: Partial<User>) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user) throw new Error('No user logged in');
      await updateUserProfile(user.uid, data);
      const updatedUser = await getCurrentUser();
      setUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Profile update failed'));
      toast.error(err instanceof Error ? err.message : 'Profile update failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await firebaseUpdatePassword(currentPassword, newPassword);
      toast.success('Password updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Password update failed'));
      toast.error(err instanceof Error ? err.message : 'Password update failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetIdToken = async () => {
    try {
      if (!user) return null;
      return await getCurrentUserIdToken();
    } catch (err) {
      console.error('Error getting ID token:', err);
      return null;
    }
  };

  const value = {
    user,
    isLoading,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    signInWithGoogle: handleSignInWithGoogle,
    resetPassword: handleResetPassword,
    updateProfile: handleUpdateProfile,
    updatePassword: handleUpdatePassword,
    getIdToken: handleGetIdToken,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 