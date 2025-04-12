'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';

// Route configuration for different user roles
const ROUTE_CONFIG = {
  // Public routes accessible to all users, signed in or not
  public: ['/', '/sign-in', '/sign-up', '/forgot-password', '/pricing', '/about', '/contact', '/services', '/blog'],
  
  // Routes for users based on their role
  roleRoutes: {
    client: {
      home: '/client',
      allowed: ['/client', '/client/projects', '/client/appointments', '/client/invoices', '/client/time-reports', 
                '/client/documents', '/client/messages', '/client/profile', '/client/support'],
      forbidden: ['/admin']
    },
    admin: {
      home: '/admin',
      allowed: ['/admin', '/admin/users', '/admin/projects', '/admin/reports', '/admin/settings', 
                '/admin/documents', '/admin/messages', '/admin/calendar'],
      forbidden: ['/client']
    },
    employee: {
      home: '/employee',
      allowed: ['/employee', '/employee/tasks', '/employee/clients', '/employee/timesheet', 
                '/employee/documents', '/employee/messages'],
      forbidden: ['/admin', '/client']
    }
  },
  
  // Default redirect for authenticated users with no assigned role
  defaultAuthenticated: '/dashboard',
  
  // Default redirect for unauthenticated users trying to access protected routes
  defaultUnauthenticated: '/sign-in',
};

interface RoleBasedRouterProps {
  children: React.ReactNode;
}

/**
 * Component that handles role-based routing and access control
 * Works automatically based on the current user's role and authentication status
 * 
 * Redirects users to appropriate pages based on their role
 * Prevents access to routes not allowed for the user's role
 */
export function RoleBasedRouter({ children }: RoleBasedRouterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAppSelector(state => state.auth);
  
  const isAuthenticated = !!user;
  const userRole = user?.role || null;
  
  useEffect(() => {
    // Skip routing logic while authentication state is loading
    if (isLoading) return;
    
    // Allow access to public routes regardless of authentication status
    if (ROUTE_CONFIG.public.some(route => 
      pathname === route || 
      (route !== '/' && pathname.startsWith(route + '/'))
    )) {
      return;
    }
    
    // Handle authenticated users
    if (isAuthenticated) {
      // Redirect from sign-in/sign-up pages if already authenticated
      if (pathname === '/sign-in' || pathname === '/sign-up') {
        const targetRoute = userRole ? ROUTE_CONFIG.roleRoutes[userRole].home : ROUTE_CONFIG.defaultAuthenticated;
        router.push(targetRoute);
        return;
      }
      
      // Handle users with a specific role
      if (userRole && ROUTE_CONFIG.roleRoutes[userRole]) {
        const { allowed, forbidden } = ROUTE_CONFIG.roleRoutes[userRole];
        
        // Redirect from explicitly forbidden routes
        const isForbidden = forbidden.some(route => 
          pathname === route || pathname.startsWith(route + '/')
        );
        
        if (isForbidden) {
          toast.error("You don't have permission to access this page.");
          router.push(ROUTE_CONFIG.roleRoutes[userRole].home);
          return;
        }
        
        // Redirect from other role-specific routes that aren't allowed
        const isAllowed = allowed.some(route => 
          pathname === route || pathname.startsWith(route + '/')
        );
        
        if (!isAllowed && !ROUTE_CONFIG.public.includes(pathname)) {
          // For root path, redirect to role-specific home
          if (pathname === '/') {
            router.push(ROUTE_CONFIG.roleRoutes[userRole].home);
            return;
          }
          
          // For other unauthorized paths
          toast.error("You don't have permission to access this page.");
          router.push(ROUTE_CONFIG.roleRoutes[userRole].home);
          return;
        }
      } else {
        // Handle authenticated users with no role
        // Allow access to the dashboard and redirect from other protected routes
        if (pathname !== '/dashboard' && !pathname.startsWith('/dashboard/')) {
          router.push(ROUTE_CONFIG.defaultAuthenticated);
          return;
        }
      }
    } else {
      // Handle unauthenticated users trying to access protected routes
      // Only allow access to public routes and authenticate routes
      const isProtectedRoute = !ROUTE_CONFIG.public.includes(pathname) && 
                              pathname !== '/sign-in' && 
                              pathname !== '/sign-up' &&
                              pathname !== '/forgot-password';
      
      if (isProtectedRoute) {
        toast.error("Please sign in to access this page.");
        router.push(`${ROUTE_CONFIG.defaultUnauthenticated}?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
    }
  }, [pathname, isAuthenticated, userRole, isLoading, router]);
  
  return <>{children}</>;
} 