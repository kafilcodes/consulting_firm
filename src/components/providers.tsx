'use client';

import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { ReactNode, useState } from 'react';
import { store } from '@/store';
import { Toaster } from 'sonner';
import { AuthInitializer } from '@/components/auth/auth-initializer';
import { AuthProvider } from '@/contexts/auth-context';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));
  
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AuthInitializer>
              {children}
            </AuthInitializer>
          </AuthProvider>
          <Toaster 
            position="top-right"
            expand={false}
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
              className: "shadow-lg",
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
} 