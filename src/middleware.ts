import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Define paths that don't require authentication
const publicPaths = [
  '/',
  '/about',
  '/services',
  '/contact',
  '/auth/signin',
  '/auth/sign-in',
  '/auth/reset-password',
  '/unauthorized'
];

// Static files and API routes patterns
const staticFilesPattern = /\.(ico|png|jpg|jpeg|svg|css|js|json)$/;
const apiRoutesPattern = /^\/api\//;
const nextInternalsPattern = /^\/_next\//;

// Role-specific path patterns
const clientPathPattern = /^\/client(\/|$)/;
const adminPathPattern = /^\/admin(\/|$)/;
const consultantPathPattern = /^\/consultant(\/|$)/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is public - allow access
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // For static files, API routes, and Next.js internals - skip auth check
  if (
    staticFilesPattern.test(pathname) ||
    apiRoutesPattern.test(pathname) ||
    nextInternalsPattern.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Get auth token from cookies
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;
  const userRole = cookieStore.get('user-role')?.value;

  // No token means user is not authenticated
  if (!token) {
    // Redirect to sign-in page with callback URL
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Role-based access control
  if (clientPathPattern.test(pathname) && userRole !== 'client' && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (adminPathPattern.test(pathname) && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (consultantPathPattern.test(pathname) && userRole !== 'consultant' && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // If we get here, the user is authenticated and has the correct role
  return NextResponse.next();
}

// Configure the middleware to run on specific paths (exclude static resources)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 