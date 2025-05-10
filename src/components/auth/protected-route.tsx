'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { AccessDenied } from './access-denied';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  authRequired?: boolean;
  redirectTo?: string;
  showUnauthorizedPage?: boolean;
}

/**
 * Component that protects routes based on user authentication status and role
 * @param children - The components to render if access is granted
 * @param allowedRoles - Array of roles allowed to access this route (if empty, any authenticated user is allowed)
 * @param authRequired - If true, only authenticated users can access the route
 * @param redirectTo - Path to redirect unauthorized users to (defaults to /auth/signin)
 * @param showUnauthorizedPage - If true, shows an access denied page instead of redirecting (defaults to false)
 */
export function ProtectedRoute({
  children,
  allowedRoles = [],
  authRequired = true,
  redirectTo = '/auth/signin',
  showUnauthorizedPage = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isInitialized } = useAppSelector(state => state.auth);
  
  const isAuthenticated = !!user;
  const userRole = user?.role?.toLowerCase() || '';
  
  // Check if the user has the required role
  const hasRequiredRole = allowedRoles.length === 0 || allowedRoles.includes(userRole);
  
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

    // Check if user has required role (if roles are specified) and we're not showing an in-page message
    if (
      isAuthenticated && 
      allowedRoles.length > 0 && 
      !allowedRoles.includes(userRole) &&
      !showUnauthorizedPage
    ) {
      console.log(`Access denied: User with role "${userRole}" attempted to access route restricted to ${allowedRoles.join(', ')}`);
      toast.error(`You don't have permission to access this page. Redirecting...`);
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
    isInitialized,
    showUnauthorizedPage
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

  // If roles are required and user doesn't have one of them
  if (isAuthenticated && !hasRequiredRole) {
    if (showUnauthorizedPage) {
      return <AccessDenied message={`This page is only accessible to ${allowedRoles.join(' or ')} users.`} />;
    }
    return null;
  }

  // User is authenticated and authorized, render the children
  return <>{children}</>;
} 