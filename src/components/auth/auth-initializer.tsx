'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { auth, serializeUser } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { setUser, initializeAuth, setError } from '@/store/slices/authSlice';
import { toast } from 'sonner';

/**
 * Component that initializes authentication state and sets up
 * a listener for auth state changes. This should be included high
 * in the component tree, preferably in a layout component.
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const [authInitialized, setAuthInitialized] = useState(false);
  
  useEffect(() => {
    console.log('AuthInitializer: Setting up auth state listener');
    
    // Initialize auth state at component mount
    dispatch(initializeAuth(false));
    
    let authStateUnsubscribe: (() => void) | null = null;
    
    // Function to set up the auth state listener
    const setupAuthStateListener = async () => {
      try {
        // Connect to authentication with retry mechanism
        authStateUnsubscribe = onAuthStateChanged(
          auth, 
          async (firebaseUser) => {
            try {
              if (firebaseUser) {
                // User is signed in
                console.log('AuthInitializer: User is signed in', firebaseUser.uid);
                
                try {
                  // Handle user data serialization
                  const user = await serializeUser(firebaseUser);
                  dispatch(setUser(user));
                  
                  // Let the UI know authentication is complete
                  console.log('AuthInitializer: User data loaded successfully');
                } catch (error) {
                  console.error('AuthInitializer: Error serializing user', error);
                  const errorMessage = error instanceof Error ? error.message : 'Unknown error serializing user';
                  dispatch(setError(errorMessage));
                  dispatch(setUser(null));
                  
                  // Provide feedback about the auth error
                  toast.error('Authentication error. Please try signing in again.');
                }
              } else {
                // User is signed out
                console.log('AuthInitializer: No user is signed in');
                dispatch(setUser(null));
              }
            } catch (error) {
              console.error('AuthInitializer: Error handling auth state change', error);
              const errorMessage = error instanceof Error ? error.message : 'Error handling authentication state';
              dispatch(setError(errorMessage));
              dispatch(setUser(null));
            } finally {
              // Mark auth as initialized regardless of outcome
              // Small delay to ensure state updates properly
              setTimeout(() => {
                dispatch(initializeAuth(true));
                setAuthInitialized(true);
              }, 150);
            }
          }, 
          (error) => {
            // Error handler for onAuthStateChanged
            console.error('AuthInitializer: Auth state observer error', error);
            const errorMessage = error instanceof Error ? error.message : 'Authentication service unavailable';
            dispatch(setError(errorMessage));
            dispatch(setUser(null));
            dispatch(initializeAuth(true));
            setAuthInitialized(true);
            
            // Provide feedback about the auth service error
            toast.error('Authentication service error. Please try again later.');
          }
        );
      } catch (error) {
        console.error('AuthInitializer: Failed to set up auth state listener', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize authentication';
        dispatch(setError(errorMessage));
        dispatch(initializeAuth(true));
        setAuthInitialized(true);
      }
    };
    
    // Initialize auth state listener
    setupAuthStateListener();
    
    // Clean up subscription on unmount
    return () => {
      console.log('AuthInitializer: Cleaning up auth state listener');
      if (authStateUnsubscribe) {
        authStateUnsubscribe();
      }
    };
  }, [dispatch]);
  
  // Render children once the component is mounted
  return <>{children}</>;
} 