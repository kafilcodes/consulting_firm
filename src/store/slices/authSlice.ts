import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase/config';
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

// Helper function to serialize user data
const serializeUser = async (firebaseUser: any): Promise<User> => {
  if (!firebaseUser) {
    throw new Error('No user data provided');
  }
  
  // Extract user data from Firebase user object
  const { uid, displayName, email, photoURL, metadata } = firebaseUser;
  
  // Default to client role if not specified
  const role = firebaseUser.role || 'client';
  
  // Format timestamps
  const createdAt = formatDate(metadata?.creationTime || new Date());
  const lastSignInTime = formatDate(metadata?.lastSignInTime || new Date());
  
  // Create serialized user object
  const user: User = {
    uid,
    displayName,
    email,
    photoURL,
    role,
    createdAt,
    lastSignInTime,
  };
  
  // Update auth cookies in the backend
  await updateAuthCookies(await firebaseUser.getIdToken(), role);
  
  return user;
};

// Function to update auth cookies
const updateAuthCookies = async (token: string | null, role: string | null): Promise<void> => {
  try {
    const response = await fetch('/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, role }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update auth cookies');
    }
  } catch (error) {
    console.error('Error updating auth cookies:', error);
  }
};

// Sign in with Google using a popup (more reliable than redirect)
export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      // Ensure we're using persistent auth
      await setPersistence(auth, browserLocalPersistence);
      
      // Configure Google provider
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account', // Force account selection even if already logged in
      });
      
      // Sign in with popup
      const result = await signInWithPopup(auth, provider);
      
      // Get user details
      const user = await serializeUser(result.user);
      
      // Show success toast
      toast.success(`Welcome, ${user.displayName || 'User'}!`);
      
      return user;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // Show error toast
      let errorMessage = 'Failed to sign in with Google';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Sign-in popup was blocked. Please enable popups for this site.';
      }
      
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Initialize auth state by checking the current user
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue }) => {
    try {
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        return null;
      }
      
      // Get user details
      const user = await serializeUser(firebaseUser);
      
      // Refresh token
      const token = await firebaseUser.getIdToken(true);
      await updateAuthCookies(token, user.role);
      
      return user;
    } catch (error: any) {
      console.error('Auth initialization error:', error);
      return rejectWithValue(error.message || 'Failed to initialize authentication');
    }
  }
);

// Sign out
export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await firebaseSignOut(auth);
      await updateAuthCookies(null, null);
      toast.success('Signed out successfully');
      return null;
    } catch (error: any) {
      console.error('Sign-out error:', error);
      toast.error(error.message || 'Failed to sign out');
      return rejectWithValue(error.message || 'Failed to sign out');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setInitialized: (state, action: PayloadAction<boolean> = { payload: true }) => {
      state.isInitialized = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Initialize auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isInitialized = true;
      })
    
    // Google sign-in
    builder
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
    
    // Sign out
    builder
      .addCase(signOut.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, setInitialized, clearError } = authSlice.actions;
export default authSlice.reducer; 