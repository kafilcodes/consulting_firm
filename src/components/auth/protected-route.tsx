'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  authRequired?: boolean;
  redirectTo?: string;
}

/**
 * Component that protects routes based on user authentication status and role
 * @param children - The components to render if access is granted
 * @param allowedRoles - Array of roles allowed to access this route (if empty, any authenticated user is allowed)
 * @param authRequired - If true, only authenticated users can access the route
 * @param redirectTo - Path to redirect unauthorized users to (defaults to /auth/signin)
 */
export function ProtectedRoute({
  children,
  allowedRoles = [],
  authRequired = true,
  redirectTo = '/auth/signin',
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isInitialized } = useAppSelector(state => state.auth);
  
  const isAuthenticated = !!user;
  const userRole = user?.role?.toLowerCase() || '';
  
  useEffect(() => {
    // Wait until auth is initialized before performing any redirects
    if (!isInitialized) {
      return;
    }
    
    // Check if authentication is required but user is not authenticated
    if (authRequired && !isAuthenticated && !isLoading) {
      const encodedCurrentPath = encodeURIComponent(pathname);
      router.push(`${redirectTo}?callbackUrl=${encodedCurrentPath}`);
      return;
    }

    // Check if user has required role (if roles are specified)
    if (
      isAuthenticated && 
      allowedRoles.length > 0 && 
      !allowedRoles.includes(userRole)
    ) {
      router.push('/unauthorized');
      return;
    }
  }, [
    isAuthenticated, 
    userRole, 
    authRequired, 
    allowedRoles, 
    redirectTo, 
    router, 
    pathname, 
    isLoading, 
    isInitialized
  ]);

  // Show nothing while loading or redirecting
  if (isLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If auth is required and user is not authenticated, don't render children
  if (authRequired && !isAuthenticated) {
    return null;
  }

  // If roles are required and user doesn't have one of them, don't render children
  if (isAuthenticated && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return null;
  }

  // User is authenticated and authorized, render the children
  return <>{children}</>;
} 