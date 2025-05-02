import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('API: Setting auth cookies');
  
  // Get the token from the request body
  const { token, role } = await request.json();
  
  // Check if token exists
  if (!token) {
    return NextResponse.json(
      { error: 'Token is required' },
      { status: 400 }
    );
  }
  
  // Track if we have a token for debugging
  console.log(`API: Setting auth cookies: { hasToken: ${!!token}, role: '${role}' }`);
  
  // Get the cookie store
  const cookieStore = cookies();
  
  // Set auth-token cookie
  console.log('API: Setting auth-token cookie');
  
  try {
    // Set auth-token cookie with Promise handling
    await cookieStore.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
      // 7 days in seconds
      maxAge: 7 * 24 * 60 * 60,
    });
  } catch (error) {
    console.error('Error setting auth-token cookie:', error);
    return NextResponse.json(
      { error: 'Failed to set auth-token cookie' },
      { status: 500 }
    );
  }
  
  // Set user-role cookie if provided
  if (role) {
    // Normalize role to lowercase for consistency
    const normalizedRole = role.toLowerCase();
    console.log(`API: Setting user-role cookie: ${normalizedRole}`);
    
    try {
      // Set user-role cookie with Promise handling
      await cookieStore.set({
        name: 'user-role',
        value: normalizedRole,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'strict',
        // 7 days in seconds
        maxAge: 7 * 24 * 60 * 60,
      });
    } catch (error) {
      console.error('Error setting user-role cookie:', error);
      return NextResponse.json(
        { error: 'Failed to set user-role cookie' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { success: true },
    { status: 200 }
  );
}

export async function DELETE() {
  const cookieStore = cookies();
  
  try {
    // Remove the auth token cookie
    await cookieStore.set({
      name: 'auth-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
    });
    
    // Remove the user role cookie
    await cookieStore.set({
      name: 'user-role',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
    });
    
    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error clearing auth cookies:', error);
    return NextResponse.json(
      { error: 'Failed to clear auth cookies' },
      { status: 500 }
    );
  }
} 