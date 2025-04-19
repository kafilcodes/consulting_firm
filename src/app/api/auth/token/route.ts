import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, role } = body;
    
    console.log('API: Setting auth cookies:', { hasToken: !!token, role });
    const cookieStore = cookies();

    if (!token) {
      // Delete cookies if no token provided (sign out)
      console.log('API: Removing auth cookies (sign out)');
      cookieStore.delete('auth-token');
      cookieStore.delete('user-role');
      return NextResponse.json({ success: true, message: 'Cookies removed successfully' });
    }

    // Set auth token cookie (7 days expiry)
    console.log('API: Setting auth-token cookie');
    
    try {
      // Try without await first (for Next.js versions where cookies().set() doesn't return a Promise)
      cookieStore.set({
        name: 'auth-token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
        sameSite: 'lax'
      });
    } catch (e) {
      console.log('API: Error with non-Promise cookies.set, trying alternative method');
      // Fallback for Next.js versions where set() is synchronous
    }

    // Set user role if provided, ensure lowercase for consistent comparison
    if (role) {
      const normalizedRole = role.toLowerCase();
      console.log('API: Setting user-role cookie:', normalizedRole);
      
      try {
        // Try without await first
        cookieStore.set({
          name: 'user-role',
          value: normalizedRole,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60, // 7 days
          path: '/',
          sameSite: 'lax'
        });
      } catch (e) {
        console.log('API: Error with non-Promise cookies.set for role, trying alternative method');
        // Fallback for older Next.js versions
      }
    }

    return NextResponse.json({ success: true, message: 'Token set successfully' });
  } catch (error) {
    console.error('API: Error setting auth token:', error);
    // More detailed error response for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to set token',
        error: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
} 