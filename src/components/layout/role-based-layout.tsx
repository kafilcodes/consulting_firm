'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import AdminSidebar from './admin-sidebar';
import { ClientSidebar } from './client-sidebar';
import { Navbar } from './navbar';
import { toast } from 'sonner';

interface RoleBasedLayoutProps {
  children: React.ReactNode;
}

export function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const router = useRouter();
  const { user, isLoading } = useAppSelector(state => state.auth);
  
  useEffect(() => {
    // Redirect to sign in if not authenticated and not loading
    if (!isLoading && !user) {
      toast.error('Please sign in to access this page');
      router.push('/sign-in');
      return;
    }
  }, [user, isLoading, router]);
  
  // Return loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If no user after loading, don't render content
  if (!user) {
    return null;
  }
  
  // Render appropriate layout based on user role - using string literals instead of enum
  switch (user.role) {
    case 'admin':
    case 'employee':
    case 'manager':
      return (
        <div className="flex min-h-screen">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <Navbar />
            <main className="flex-1 bg-gray-50 p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      );
      
    case 'client':
      return (
        <div className="flex min-h-screen">
          <ClientSidebar />
          <div className="flex-1 flex flex-col">
            <Navbar />
            <main className="flex-1 bg-gray-50 p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      );
      
    default:
      // Default layout for unknown roles
      return (
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      );
  }
} 