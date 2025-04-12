import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, role } = body;
    const cookieStore = cookies();

    if (!token) {
      // Delete cookies if no token provided (sign out)
      cookieStore.delete('auth-token');
      cookieStore.delete('user-role');
      return NextResponse.json({ success: true, message: 'Cookies removed successfully' });
    }

    // Set auth token cookie (7 days expiry)
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Set user role if provided
    if (role) {
      cookieStore.set('user-role', role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
    }

    return NextResponse.json({ success: true, message: 'Token set successfully' });
  } catch (error) {
    console.error('Error setting auth token:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to set token' },
      { status: 500 }
    );
  }
} 