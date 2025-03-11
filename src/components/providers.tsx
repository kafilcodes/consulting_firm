'use client';

import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { ReactNode, useState, useEffect } from 'react';
import { store } from '@/store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { setUser } from '@/store/slices/authSlice';
import { doc, getDoc } from 'firebase/firestore';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = {
              uid: userDoc.id,
              ...userDoc.data(),
              // Ensure these fields are properly formatted
              createdAt: userDoc.data().createdAt?.toDate?.() || null,
              lastSignInTime: userDoc.data().lastSignInTime?.toDate?.() || null,
              updatedAt: userDoc.data().updatedAt?.toDate?.() || null,
              lastLoginAt: userDoc.data().lastLoginAt?.toDate?.() || null,
            };
            store.dispatch(setUser(userData));
          } else {
            store.dispatch(setUser(null));
          }
        } else {
          store.dispatch(setUser(null));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        store.dispatch(setUser(null));
      } finally {
        setIsAuthInitialized(true);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!isAuthInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster 
            position="top-right"
            expand={false}
            richColors
          />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
} 