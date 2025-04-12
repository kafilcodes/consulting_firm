'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { setUser, initializeAuth } from '@/store/slices/authSlice';
import { serializeUser } from '@/lib/firebase/auth';

/**
 * Component that initializes authentication state and sets up
 * a listener for auth state changes. This should be included high
 * in the component tree, preferably in a layout component.
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        // Set up listener for auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            // User is signed in
            try {
              const user = await serializeUser(firebaseUser);
              dispatch(setUser(user));
            } catch (error) {
              console.error('Error serializing user:', error);
              dispatch(setUser(null));
            }
          } else {
            // User is signed out
            dispatch(setUser(null));
          }
          
          // Mark auth as initialized regardless of outcome
          dispatch(initializeAuth());
        });
        
        // Clean up subscription on unmount
        return () => unsubscribe();
      } catch (error) {
        console.error('Error initializing auth:', error);
        dispatch(setUser(null));
        dispatch(initializeAuth());
      }
    };
    
    initAuth();
  }, [dispatch]);
  
  return <>{children}</>;
} 