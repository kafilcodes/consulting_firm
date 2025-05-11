import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User as FirebaseUser,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  GoogleAuthProvider,
  type UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './config';
import { actionCodeSettings } from './config';
import type { User, UserRole } from '@/types';
import { setCookie, destroyCookie } from 'nookies';
import { FirebaseError } from 'firebase/app';

// Error handling utility with specific error messages
const handleAuthError = (error: any): never => {
  console.error('Authentication error:', error);
  
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
    'auth/weak-password': 'Password is too weak. Please use a stronger password.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'Invalid email or password.',
    'auth/wrong-password': 'Invalid email or password.',
    'auth/popup-closed-by-user': 'Sign in was cancelled. Please try again.',
    'auth/cancelled-popup-request': 'Only one popup request is allowed at a time.',
    'auth/popup-blocked': 'Popup was blocked by the browser. Please allow popups for this site.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/too-many-requests': 'Too many unsuccessful attempts. Please try again later.',
    'auth/requires-recent-login': 'Please sign in again to complete this action.',
  };

  throw new Error(errorMessages[error.code] || 'An error occurred during authentication. Please try again.');
};

export const handleAuthToken = async (firebaseUser: FirebaseUser | null) => {
  try {
    if (!firebaseUser) {
      console.log('handleAuthToken: No user, clearing cookies');
      destroyCookie(null, 'auth-token', { path: '/' });
      destroyCookie(null, 'user-role', { path: '/' });
      return null;
    }

    // Get the token
    const token = await firebaseUser.getIdToken(true);
    
    // Get user role from Firestore
    let role = 'client'; // Default role
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role) {
          role = String(userData.role).toLowerCase().trim();
        }
        
        // Validate role is one of our accepted values
        if (!['client', 'admin', 'employee', 'consultant'].includes(role)) {
          console.warn(`Invalid role "${role}" detected for user ${firebaseUser.uid}, defaulting to "client"`);
          role = 'client';
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      // Continue with default role if there's an error
    }
    
    console.log(`Setting auth token for user ${firebaseUser.uid} with role: ${role}`);

    // Set cookies client-side first to prevent initial redirect issues
    setCookie(null, 'auth-token', token, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    setCookie(null, 'user-role', role, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Then try to set them on the server for SSR
    try {
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, role }),
      });

      if (!response.ok) {
        console.warn('Server token endpoint returned non-OK response:', response.status);
        // We still continue since we've set the cookies client-side
      }
    } catch (error) {
      console.error('Error calling token endpoint:', error);
      // Continue since we've set the cookies client-side already
    }

    return { token, role };
  } catch (error) {
    console.error('Error handling auth token:', error);
    // Don't throw error here, just return null to prevent blocking auth flow
    return null;
  }
};

// Create or update user document in Firestore
async function createOrUpdateUserDocument(
  firebaseUser: FirebaseUser,
  additionalData: Partial<User> = {}
): Promise<User> {
  try {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);
    const timestamp = serverTimestamp();

    if (!userDoc.exists()) {
      // Create new user document
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: additionalData.displayName || firebaseUser.displayName || 'User',
        photoURL: firebaseUser.photoURL,
        role: additionalData.role || 'client',
        createdAt: timestamp,
        lastSignInTime: timestamp,
      };

      await setDoc(userRef, userData);
      return userData;
    } else {
      // Update existing user document
      const userData = userDoc.data() as User;
      const updatedData = {
        ...userData,
        lastSignInTime: timestamp,
        ...additionalData,
      };

      await updateDoc(userRef, updatedData);
      return updatedData;
    }
  } catch (error) {
    console.error('Error creating/updating user document:', error);
    throw new Error('Failed to save user data. Please try again.');
  }
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  role: UserRole = 'client'
): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user: firebaseUser } = userCredential;

    // Update user profile
    await updateProfile(firebaseUser, { displayName: name });

    // Set auth token
    await handleAuthToken(firebaseUser);

    // Create user document
    const user = await createOrUpdateUserDocument(firebaseUser, {
      name,
      role,
      loginProvider: 'email',
    });

    return user;
  } catch (error) {
    throw handleAuthError(error);
  }
}

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    const result = await signInWithPopup(auth, provider);
    const { user: firebaseUser } = result;

    if (!firebaseUser) {
      throw new Error('No user data returned from Google sign in');
    }

    // Set auth token first
    await handleAuthToken(firebaseUser);

    // Create or update user document
    const user = await createOrUpdateUserDocument(firebaseUser, {
      role: 'client', // Default role for new Google users
      displayName: firebaseUser.displayName || 'User',
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL,
    });

    if (!user) {
      throw new Error('Failed to create or update user data');
    }

    return user;
  } catch (error) {
    console.error('Google sign in error:', error);
    if (error instanceof FirebaseError) {
      throw handleAuthError(error);
    }
    throw error;
  }
};

export async function sendSignInLink(email: string): Promise<void> {
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  localStorage.setItem('emailForSignIn', email);
}

export async function completePasswordlessSignIn(email: string): Promise<User> {
  const result = await signInWithEmailLink(auth, email, window.location.href);
  const { user: firebaseUser } = result;

  // Check if user exists
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  
  if (!userDoc.exists()) {
    // Create new user
    const userData: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: firebaseUser.displayName || 'User',
      role: 'client',
      createdAt: Timestamp.now() as unknown as Date,
      updatedAt: Timestamp.now() as unknown as Date,
    };
    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    return userData;
  }

  return userDoc.data() as User;
}

export async function signIn(email: string, password: string): Promise<User> {
  try {
    const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
    
    // Set auth token
    await handleAuthToken(firebaseUser);

    // Update user document with login time
    const user = await createOrUpdateUserDocument(firebaseUser, {
      lastLoginAt: serverTimestamp(),
      loginProvider: 'email',
    });

    return user;
  } catch (error) {
    throw handleAuthError(error);
  }
}

export async function signOut(): Promise<void> {
  try {
    const userId = auth.currentUser?.uid;
    if (userId) {
      // Update last activity timestamp
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        lastActivityAt: serverTimestamp(),
      });
    }

    // Clear all auth cookies
    destroyCookie(null, 'auth-token', { path: '/' });
    destroyCookie(null, 'user-role', { path: '/' });
    
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out. Please try again.');
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw handleAuthError(error);
  }
}

export function onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!userDoc.exists()) return null;

    // Refresh token if needed
    await handleAuthToken(firebaseUser);

    return { uid: userDoc.id, ...userDoc.data() } as User;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, data: Partial<User>): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    // Update Firebase Auth profile if name or photo changed
    if (auth.currentUser && (data.name || data.photoURL)) {
      await updateProfile(auth.currentUser, {
        displayName: data.name,
        photoURL: data.photoURL,
      });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    throw new Error('Failed to update profile. Please try again.');
  }
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No user is currently signed in.');
    }

    // Re-authenticate user before password change
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await firebaseUpdatePassword(user, newPassword);
  } catch (error) {
    throw handleAuthError(error);
  }
}

/**
 * Formats various timestamp formats to ISO string
 */
export const formatDate = (timestamp: any): string => {
  if (!timestamp) return '';
  
  try {
    // Handle different timestamp formats from Firebase
    if (typeof timestamp === 'string') {
      return timestamp;
    }
    
    if (timestamp.toDate) {
      return timestamp.toDate().toISOString();
    }
    
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toISOString();
    }
    
    return new Date(timestamp).toISOString();
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return '';
  }
};

/**
 * Serializes a Firebase user object into our application's User type
 * and ensures all values are serializable for Redux
 */
export const serializeUser = async (firebaseUser: any): Promise<any> => {
  if (!firebaseUser) {
    return null;
  }
  
  try {
    console.log('Serializing user:', firebaseUser.uid);
    
    // Extract user data from Firebase user object
    const { uid, displayName, email, photoURL, metadata } = firebaseUser;
    
    // Get token for cookie authentication
    let token: string | null = null;
    try {
      token = await firebaseUser.getIdToken(true); // Force refresh token
    } catch (tokenError) {
      console.error('Error getting token:', tokenError);
      // Continue without token, as we'll try to get it later
    }
    
    // Fetch user role from Firestore
    let role = 'client'; // Default role
    let firestoreData = null;
    
    try {
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Ensure we convert Firebase timestamps to serializable values
        firestoreData = serializeFirestoreData(userData);
        
        if (userData.role) {
          role = String(userData.role).toLowerCase().trim();
        }
        
        // Validate role is one of our accepted values
        if (!['client', 'admin', 'employee', 'consultant'].includes(role)) {
          console.warn(`Invalid role "${role}" detected for user ${uid}, defaulting to "client"`);
          role = 'client';
        }
      } else {
        // If this is a new user, create their document in Firestore
        // Using simple email check for initial role assignment
        if (email) {
          if (email.endsWith('@admin.sks-consulting.com')) {
            role = 'admin';
          } else if (email.endsWith('@consultant.sks-consulting.com')) {
            role = 'consultant';
          } else if (email.endsWith('@employee.sks-consulting.com')) {
            role = 'employee';
          } else if (email === 'admin@example.com' || email === 'admin@test.com') {
            role = 'admin';
          } else if (email === 'consultant@example.com' || email === 'consultant@test.com') {
            role = 'consultant';
          } else if (email === 'employee@example.com' || email === 'employee@test.com') {
            role = 'employee';
          }
        }
        
        // Create user document with assigned role
        const newUserData = {
          uid,
          email,
          displayName: displayName || email?.split('@')[0] || 'User',
          photoURL,
          role,
          createdAt: serverTimestamp(),
          lastSignInTime: serverTimestamp(),
          lastActivityAt: serverTimestamp(),
        };
        
        await setDoc(doc(db, 'users', uid), newUserData);
        firestoreData = { ...newUserData };
        // Remove non-serializable timestamps
        delete firestoreData.createdAt;
        delete firestoreData.lastSignInTime;
        delete firestoreData.lastActivityAt;
      }
    } catch (firestoreError) {
      console.error('Error accessing Firestore:', firestoreError);
      // Continue with default role
    }
    
    console.log('Assigned role from database:', role);
    
    // Format timestamps for metadata
    const createdAt = metadata?.creationTime ? new Date(metadata.creationTime).toISOString() : new Date().toISOString();
    const lastSignInTime = metadata?.lastSignInTime ? new Date(metadata.lastSignInTime).toISOString() : new Date().toISOString();
    
    // Update auth cookies in the backend - but don't let this block authentication
    try {
      if (token) {
        await updateAuthCookies(token, role);
      }
    } catch (cookieError) {
      console.error('Error updating auth cookies:', cookieError);
      // Continue despite cookie errors
    }
    
    // Create serialized user object with only serializable values
    const user = {
      uid,
      id: uid,
      displayName,
      name: displayName,
      email,
      photoURL,
      role,
      createdAt,
      lastSignInTime,
      // Include serialized Firestore data but ensure it's all serializable
      ...(firestoreData || {}),
    };
    
    console.log('User serialized successfully');
    return user;
  } catch (error) {
    console.error('Error in serializeUser:', error);
    // Return basic user info even if there are errors
    if (firebaseUser && firebaseUser.uid) {
      return {
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        displayName: firebaseUser.displayName || 'User',
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        role: 'client', // Default role on error
      };
    }
    return null;
  }
};

/**
 * Helper function to convert Firestore data with Timestamps to serializable values
 */
function serializeFirestoreData(data: any): any {
  if (!data) return null;
  
  const result: any = {};
  
  // Process each field
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (value === null || value === undefined) {
      result[key] = value;
    } 
    // Handle Firestore Timestamp objects
    else if (typeof value === 'object' && value.toDate && typeof value.toDate === 'function') {
      try {
        // Convert to ISO string
        result[key] = value.toDate().toISOString();
      } catch (err) {
        console.warn(`Failed to serialize Timestamp at ${key}:`, err);
        result[key] = null;
      }
    }
    // Handle Timestamp-like objects with seconds/nanoseconds
    else if (typeof value === 'object' && value !== null && value.seconds !== undefined) {
      try {
        result[key] = new Date(value.seconds * 1000).toISOString();
      } catch (err) {
        console.warn(`Failed to serialize seconds-based timestamp at ${key}:`, err);
        result[key] = null;
      }
    }
    // Handle nested objects recursively
    else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = serializeFirestoreData(value);
    }
    // Handle arrays - check each element for timestamps
    else if (Array.isArray(value)) {
      result[key] = value.map(item => {
        if (typeof item === 'object' && item !== null) {
          if (item.toDate && typeof item.toDate === 'function') {
            try {
              return item.toDate().toISOString();
            } catch (err) {
              return null;
            }
          } else if (item.seconds !== undefined) {
            try {
              return new Date(item.seconds * 1000).toISOString();
            } catch (err) {
              return null;
            }
          } else {
            return serializeFirestoreData(item);
          }
        }
        return item;
      });
    }
    // Keep primitive values as is
    else {
      result[key] = value;
    }
  });
  
  return result;
}

/**
 * Updates authentication cookies on the server-side
 */
export const updateAuthCookies = async (token: string | null, role: string | null): Promise<void> => {
  try {
    console.log('Updating auth cookies:', { hasToken: !!token, role });
    const response = await fetch('/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, role }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Server returned error:', response.status, errorData);
      throw new Error(`Failed to update auth cookies: ${response.status} ${errorData.message || ''}`);
    }
    
    console.log('Auth cookies updated successfully');
  } catch (error) {
    console.error('Error updating auth cookies:', error);
    // We'll let this error pass through without throwing
    // This prevents authentication failures from blocking the app from loading
    // The user might need to log in again, but the app will still function
  }
};

// Rename to avoid naming conflict with imported getIdToken
export async function getCurrentUserIdToken(): Promise<string | null> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return null;
    }
    return await currentUser.getIdToken(true);
  } catch (error) {
    console.error('Error getting user ID token:', error);
    return null;
  }
}

/**
 * Get all users (admin only)
 * Note: Firebase doesn't provide direct access to all users from client side
 * This is a simulated function for demo purposes
 */
export async function getAllUsers() {
  try {
    // In a real implementation, this would call an admin API endpoint
    // or a Firebase Function that has admin privileges
    // For demo purposes, we'll return mock data
    const mockUsers = [
      {
        uid: 'user1',
        email: 'admin@example.com',
        displayName: 'Admin User',
        role: 'admin',
        createdAt: new Date('2023-01-01').toISOString(),
        isActive: true
      },
      {
        uid: 'user2',
        email: 'employee1@example.com',
        displayName: 'John Employee',
        role: 'employee',
        createdAt: new Date('2023-02-15').toISOString(),
        isActive: true
      },
      {
        uid: 'user3',
        email: 'employee2@example.com',
        displayName: 'Jane Employee',
        role: 'employee',
        createdAt: new Date('2023-03-10').toISOString(),
        isActive: true
      },
      {
        uid: 'user4',
        email: 'client1@example.com',
        displayName: 'Alice Client',
        role: 'client',
        createdAt: new Date('2023-04-05').toISOString(),
        isActive: true
      },
      {
        uid: 'user5',
        email: 'client2@example.com',
        displayName: 'Bob Client',
        role: 'client',
        createdAt: new Date('2023-05-20').toISOString(),
        isActive: true
      },
      {
        uid: 'user6',
        email: 'consultant1@example.com',
        displayName: 'Eva Consultant',
        role: 'consultant',
        createdAt: new Date('2023-06-15').toISOString(),
        isActive: true
      }
    ];
    
    return mockUsers;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw new Error('Failed to get all users');
  }
} 