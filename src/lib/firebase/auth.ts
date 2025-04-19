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
  getIdToken,
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

export const handleAuthToken = async (firebaseUser: FirebaseUser) => {
  try {
    if (!firebaseUser) {
      destroyCookie(null, 'auth-token');
      destroyCookie(null, 'user-role');
      return;
    }

    const token = await firebaseUser.getIdToken();
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    const role = userDoc.exists() ? userDoc.data().role : 'client';

    const response = await fetch('/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, role }),
    });

    if (!response.ok) {
      throw new Error('Failed to set authentication token');
    }

    return { token, role };
  } catch (error) {
    console.error('Error handling auth token:', error);
    throw error;
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
 */
export const serializeUser = async (firebaseUser: any): Promise<any> => {
  if (!firebaseUser) {
    throw new Error('No user data provided');
  }
  
  try {
    console.log('Serializing user:', firebaseUser.uid);
    
    // Extract user data from Firebase user object
    const { uid, displayName, email, photoURL, metadata } = firebaseUser;
    
    // Get token for cookie authentication
    const token = await firebaseUser.getIdToken(true); // Force refresh token
    
    // Determine user role - in a real app, you would fetch this from a database
    // For now, using a simple mapping by email domain or set a default
    let role = 'client'; // Default role
    
    // Example logic for role determination:
    if (email) {
      if (email.endsWith('@admin.sks-consulting.com')) {
        role = 'admin';
      } else if (email.endsWith('@consultant.sks-consulting.com')) {
        role = 'consultant';
      } else if (email === 'admin@example.com' || email === 'admin@test.com') {
        // For testing purposes
        role = 'admin';
      } else if (email === 'consultant@example.com' || email === 'consultant@test.com') {
        // For testing purposes
        role = 'consultant';
      }
    }
    
    console.log('Assigned role:', role);
    
    // Format timestamps
    const createdAt = formatDate(metadata?.creationTime || new Date());
    const lastSignInTime = formatDate(metadata?.lastSignInTime || new Date());
    
    // Update auth cookies in the backend
    await updateAuthCookies(token, role);
    
    // Create serialized user object
    const user = {
      uid,
      displayName,
      email,
      photoURL,
      role,
      createdAt,
      lastSignInTime,
    };
    
    console.log('User serialized successfully');
    return user;
  } catch (error) {
    console.error('Error in serializeUser:', error);
    throw error;
  }
};

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