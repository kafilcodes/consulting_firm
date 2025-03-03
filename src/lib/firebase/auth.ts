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
import { auth, db, googleProvider, actionCodeSettings } from './config';
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

export const handleAuthToken = async (user: User | null) => {
  try {
    if (!user) {
      destroyCookie(null, 'auth-token');
      destroyCookie(null, 'user-role');
      return;
    }

    const token = await user.getIdToken();
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const role = userDoc.exists() ? userDoc.data().role : 'user';

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
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: additionalData.name || firebaseUser.displayName || 'User',
        role: additionalData.role || 'client',
        photoURL: firebaseUser.photoURL,
        createdAt: timestamp,
        updatedAt: timestamp,
        lastLoginAt: timestamp,
        ...additionalData,
      };

      await setDoc(userRef, userData);
      return userData;
    } else {
      // Update existing user document
      const userData = userDoc.data() as User;
      const updatedData = {
        ...userData,
        lastLoginAt: timestamp,
        updatedAt: timestamp,
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

    // Set auth token
    await handleAuthToken(firebaseUser);

    // Create or update user document
    const user = await createOrUpdateUserDocument(firebaseUser, {
      loginProvider: 'google',
      role: 'client', // Default role for new Google users
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

    return { id: userDoc.id, ...userDoc.data() } as User;
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