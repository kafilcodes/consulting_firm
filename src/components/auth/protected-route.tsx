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
    // Skip protection checks while still loading auth state
    if (isLoading || !isInitialized) return;
    
    // If authentication is required but user is not authenticated
    if (authRequired && !isAuthenticated) {
      toast.error('Please sign in to access this page');
      router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    
    // If specific roles are required and user's role doesn't match
    if (allowedRoles.length > 0 && !allowedRoles.map(role => role.toLowerCase()).includes(userRole)) {
      toast.error("You don't have permission to access this page");
      
      // Redirect to appropriate dashboard based on role or to sign-in if not authenticated
      const redirectPath = isAuthenticated 
        ? userRole === 'admin' 
          ? '/admin/dashboard' 
          : userRole === 'client' 
            ? '/client/dashboard' 
            : userRole === 'consultant'
              ? '/consultant/dashboard'
              : '/'
        : redirectTo;
        
      router.push(redirectPath);
      return;
    }
  }, [authRequired, allowedRoles, isAuthenticated, userRole, isLoading, isInitialized, router, pathname, redirectTo]);
  
  // Show a loading state while auth state is being determined
  if (isLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  
  // After loading, if we're still on this page, it means the user has access
  return <>{children}</>;
} 