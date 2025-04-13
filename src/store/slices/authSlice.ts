import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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
      return user;
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
      return null;
    } catch (error: any) {
      console.error('Sign-out error:', error);
      return rejectWithValue(error.message || 'Failed to sign out');
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
      state.user = action.payload;
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
  },
  extraReducers: (builder) => {
    builder
      // Google Sign In
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.error = null;
        toast.success(`Welcome, ${action.payload.displayName || 'User'}!`);
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
      });
  },
});

export const { setUser, initializeAuth, setError, clearError } = authSlice.actions;
export default authSlice.reducer; 