import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token');
  const userRole = request.cookies.get('user-role');
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/reset-password',
  ];

  // Check if the route is public
  if (publicRoutes.includes(pathname)) {
    // If user is already authenticated, redirect to appropriate dashboard
    if (authToken) {
      if (userRole?.value === 'client') {
        return NextResponse.redirect(new URL('/client', request.url));
      }
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes handling
  if (!authToken) {
    // Redirect to sign in page if not authenticated
    const signInUrl = new URL('/auth/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Role-based access control
  if (pathname.startsWith('/admin')) {
    if (userRole?.value !== 'admin' && userRole?.value !== 'employee') {
      // Redirect non-admin users to client dashboard
      return NextResponse.redirect(new URL('/client', request.url));
    }
  }

  if (pathname.startsWith('/client')) {
    if (userRole?.value !== 'client') {
      // Redirect non-client users to admin dashboard
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 