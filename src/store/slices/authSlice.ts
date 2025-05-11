import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  auth, 
  db, 
  googleProvider, 
  serializeUser, 
  updateAuthCookies 
} from '@/lib/firebase';
import type { User } from '@/types';
import { toast } from 'sonner';

// Define the authentication state type
interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Initial state with default values
const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
  isInitialized: false,
};

/**
 * Utility function to ensure any Firebase Timestamp objects are
 * converted to strings for Redux storage (prevents non-serializable value errors)
 */
const ensureSerializableData = (data: any): any => {
  if (!data) return null;
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => ensureSerializableData(item));
  }
  
  // If not an object or is null, return as is
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  // Handle Date objects
  if (data instanceof Date) {
    return data.toISOString();
  }
  
  // Handle Firestore Timestamp with toDate method
  if (data.toDate && typeof data.toDate === 'function') {
    try {
      return data.toDate().toISOString();
    } catch (e) {
      return null;
    }
  }
  
  // Handle Firestore Timestamp-like object with seconds
  if (data.seconds !== undefined) {
    try {
      return new Date(data.seconds * 1000).toISOString();
    } catch (e) {
      return null;
    }
  }
  
  // Recursively process object properties
  const result: { [key: string]: any } = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      result[key] = ensureSerializableData(data[key]);
    }
  }
  
  return result;
};

// Helper function to format Firebase timestamps
const formatDate = (timestamp: any): string => {
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

// Async thunk to handle Google sign-in
export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      // Set persistence to LOCAL
      await setPersistence(auth, browserLocalPersistence);
      
      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = await serializeUser(result.user);
      
      // Set auth cookies for server-side auth
      try {
        await updateAuthCookies(result.user.uid, user.role || 'client');
      } catch (error) {
        console.error('Failed to update auth cookies:', error);
        // Continue anyway as the client-side auth still works
      }
      
      console.log('Google sign-in successful, user:', user.uid);
      return ensureSerializableData(user);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      // Provide specific error messages for different sign-in failures
      let errorMessage = 'Failed to sign in with Google';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Sign-in popup was blocked. Please allow popups for this site.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to handle signing out
export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await firebaseSignOut(auth);
      await updateAuthCookies(null, null);
      
      // Redirect to auth/sign-in page after successful logout
      if (typeof window !== 'undefined') {
        // Use direct location.href assignment to prevent path issues
        window.location.href = '/auth/sign-in';
      }
      
      return null;
    } catch (error: any) {
      console.error('Sign-out error:', error);
      return rejectWithValue(error.message || 'Failed to sign out');
    }
  }
);

// Async thunk to update user profile
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (userData: Partial<User> & { uid: string }, { getState, rejectWithValue }) => {
    try {
      const { uid, ...updateData } = userData;
      
      // Reference to user document in Firestore
      const userDocRef = doc(db, 'users', uid);
      
      // Update Firestore user document
      await updateDoc(userDocRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      // If photoURL is being updated, update Auth profile as well
      if (auth.currentUser && ('photoURL' in updateData || 'displayName' in updateData)) {
        const profileUpdateData: { photoURL?: string | null, displayName?: string | null } = {};
        
        if ('photoURL' in updateData) {
          profileUpdateData.photoURL = updateData.photoURL || null;
        }
        
        if ('displayName' in updateData) {
          profileUpdateData.displayName = updateData.displayName || null;
        }
        
        await updateFirebaseProfile(auth.currentUser, profileUpdateData);
      }
      
      // Get updated user data from Firestore
      const updatedUserDoc = await getDoc(userDocRef);
      const updatedUserData = updatedUserDoc.data();
      
      if (!updatedUserData) {
        throw new Error('Failed to retrieve updated user data');
      }
      
      // Build complete user object
      const updatedUser: User = {
        uid,
        email: updatedUserData.email || null,
        displayName: updatedUserData.displayName || null,
        photoURL: updatedUserData.photoURL || null,
        role: updatedUserData.role || 'client',
        createdAt: formatDate(updatedUserData.createdAt),
        lastSignInTime: formatDate(updatedUserData.lastSignInTime),
        updatedAt: formatDate(updatedUserData.updatedAt),
        phoneNumber: updatedUserData.phoneNumber || null,
        company: updatedUserData.company || null,
        address: updatedUserData.address || null,
      };
      
      return updatedUser;
    } catch (error: any) {
      console.error('Profile update error:', error);
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set user
    setUser: (state, action: PayloadAction<User | null>) => {
      // Ensure any Firestore Timestamp objects are serialized before storing in Redux
      state.user = action.payload ? ensureSerializableData(action.payload) : null;
      state.isLoading = false;
      state.error = null;
    },
    // Set initialized state
    initializeAuth: (state, action: PayloadAction<boolean> = { payload: true }) => {
      state.isInitialized = action.payload;
      if (action.payload === true) {
        state.isLoading = false;
      }
    },
    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    // Clear any errors
    clearError: (state) => {
      state.error = null;
    },
    // Update current user data (for use when profile is updated externally)
    updateCurrentUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        // Ensure any Firestore Timestamp objects are serialized before storing in Redux
        state.user = ensureSerializableData({ ...state.user, ...action.payload });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Google Sign In
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        // Action payload is already serialized in the thunk
        state.user = action.payload;
        state.isLoading = false;
        state.error = null;
        // Toast notification is handled in the auth-form component
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || 'Authentication failed');
      })
      
      // Sign Out
      .addCase(signOut.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.isLoading = false;
        state.error = null;
        toast.success('Signed out successfully');
      })
      .addCase(signOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || 'Sign out failed');
      })
      
      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        // Ensure any Firestore Timestamp objects are serialized before storing in Redux
        state.user = ensureSerializableData(action.payload);
        state.isLoading = false;
        state.error = null;
        toast.success('Profile updated successfully');
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || 'Profile update failed');
      });
  },
});

export const { setUser, initializeAuth, setError, clearError, updateCurrentUser } = authSlice.actions;
export default authSlice.reducer; 