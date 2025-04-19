import { NextRequest, NextResponse } from 'next/server';

// Define paths that don't require authentication
const publicPaths = [
  '/',
  '/about',
  '/services',
  '/contact',
  '/auth/signin',
  '/auth/sign-in',
  '/auth/reset-password',
  '/unauthorized',
  '/terms',
  '/privacy',
  '/faq'
];

// Static files and API routes patterns
const staticFilesPattern = /\.(ico|png|jpg|jpeg|svg|css|js|json|webp|woff|woff2|ttf|otf)$/;
const apiRoutesPattern = /^\/api\//;
const nextInternalsPattern = /^\/_next\//;

// Role-specific path patterns
const clientPathPattern = /^\/client(\/|$)/;
const adminPathPattern = /^\/admin(\/|$)/;
const consultantPathPattern = /^\/consultant(\/|$)/;

/**
 * Normalize role to ensure consistent comparison
 * @param role User role from cookie or null
 * @returns Normalized role string (lowercase) or empty string if null/undefined
 */
function normalizeRole(role: string | undefined | null): string {
  if (!role) return '';
  return role.toLowerCase().trim();
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow all requests to public paths
  if (publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  // Skip auth check for static files, API routes, and Next.js internals
  if (
    staticFilesPattern.test(pathname) ||
    apiRoutesPattern.test(pathname) ||
    nextInternalsPattern.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Get auth token and user role from cookies
  const token = request.cookies.get('auth-token')?.value;
  const rawUserRole = request.cookies.get('user-role')?.value;
  const userRole = normalizeRole(rawUserRole);

  // Authentication check - redirect to sign-in if not authenticated
  if (!token) {
    console.log(`Middleware: No auth token found, redirecting to sign-in from ${pathname}`);
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', encodeURIComponent(pathname));
    return NextResponse.redirect(signInUrl);
  }

  // Role-based access control with normalized roles
  
  // Client section - accessible by client and admin roles
  if (clientPathPattern.test(pathname)) {
    if (userRole !== 'client' && userRole !== 'admin') {
      console.log(`Middleware: User with role "${userRole}" attempted to access client area: ${pathname}`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Admin section - accessible only by admin role
  if (adminPathPattern.test(pathname)) {
    if (userRole !== 'admin') {
      console.log(`Middleware: User with role "${userRole}" attempted to access admin area: ${pathname}`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Consultant section - accessible by consultant and admin roles
  if (consultantPathPattern.test(pathname)) {
    if (userRole !== 'consultant' && userRole !== 'employee' && userRole !== 'admin') {
      console.log(`Middleware: User with role "${userRole}" attempted to access consultant area: ${pathname}`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Dashboard redirect for authenticated users without specific section
  if (pathname === '/dashboard') {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else if (userRole === 'client') {
      return NextResponse.redirect(new URL('/client', request.url));
    } else if (userRole === 'consultant' || userRole === 'employee') {
      return NextResponse.redirect(new URL('/consultant/dashboard', request.url));
    }
  }

  // If we get here, the user is authenticated and has the correct role
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all paths except static resources and public assets
    '/((?!_next/static|_next/image|favicon.ico|assets/).*)',
  ],
}; 