'use client'

import { ReactNode } from 'react'
import { StoreProvider } from './store-provider'
import { ThemeProvider } from './theme-provider'
import { PageTransitionProvider } from './page-transition-provider'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <PageTransitionProvider>
          {children}
          <Toaster />
          <SonnerToaster 
            position="top-right" 
            toastOptions={{
              classNames: {
                toast: 'group',
                title: 'font-medium text-gray-900',
                description: 'text-gray-500',
              }
            }}
          />
        </PageTransitionProvider>
      </ThemeProvider>
    </StoreProvider>
  )
} 