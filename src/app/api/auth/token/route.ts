import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('API: Setting auth cookies');
  
  // Get the token from the request body with error handling
  let token, role;
  try {
    // Check if request has a body first
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid content type. Expected application/json' },
        { status: 400 }
      );
    }

    // Get body text and verify it's not empty
    const bodyText = await request.text();
    if (!bodyText || bodyText.trim() === '') {
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 }
      );
    }

    // Parse JSON
    const body = JSON.parse(bodyText);
    token = body.token;
    role = body.role;
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }
  
  // Check if token exists
  if (!token) {
    return NextResponse.json(
      { error: 'Token is required' },
      { status: 400 }
    );
  }
  
  // Track if we have a token for debugging
  console.log(`API: Setting auth cookies: { hasToken: ${!!token}, role: '${role}' }`);
  
  try {
    // Get the cookie store - await it according to Next.js requirements
    const cookieStore = await cookies();
    
    // Set auth-token cookie
    console.log('API: Setting auth-token cookie');
    cookieStore.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
      // 7 days in seconds
      maxAge: 7 * 24 * 60 * 60,
    });
    
    // Set user-role cookie if provided
    if (role) {
      // Normalize role to lowercase for consistency
      const normalizedRole = role.toLowerCase();
      console.log(`API: Setting user-role cookie: ${normalizedRole}`);
      
      cookieStore.set({
        name: 'user-role',
        value: normalizedRole,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'strict',
        // 7 days in seconds
        maxAge: 7 * 24 * 60 * 60,
      });
    }
  } catch (error) {
    console.error('Error setting auth cookies:', error);
    return NextResponse.json(
      { error: 'Failed to set auth cookies' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true },
    { status: 200 }
  );
}

export async function DELETE() {
  try {
    // Get the cookie store - await it according to Next.js requirements
    const cookieStore = await cookies();
    
    // Remove the auth token cookie
    cookieStore.set({
      name: 'auth-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
    });
    
    // Remove the user role cookie
    cookieStore.set({
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