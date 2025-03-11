import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth, googleProvider, db } from '@/lib/firebase/config';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

// Helper function to serialize user data
const serializeUser = (user: any): User => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  role: user.role || 'client',
  createdAt: user.createdAt || new Date().toISOString(),
  lastSignInTime: user.lastSignInTime || new Date().toISOString(),
  updatedAt: user.updatedAt || new Date().toISOString(),
  lastLoginAt: user.lastLoginAt || new Date().toISOString(),
});

export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { user: firebaseUser } = result;

      // Get or create user document
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // Update last login time
        await setDoc(userRef, {
          lastLoginAt: serverTimestamp(),
        }, { merge: true });

        const userData = {
          ...userSnap.data(),
          uid: userSnap.id,
          lastLoginAt: new Date().toISOString(),
        };
        return serializeUser(userData);
      } else {
        // Create new user document
        const newUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: 'client',
          createdAt: serverTimestamp(),
          lastSignInTime: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        };

        await setDoc(userRef, newUser);
        return serializeUser(newUser);
      }
    } catch (error: any) {
      console.error('Sign-in error:', error);
      return rejectWithValue(error.message || 'Failed to sign in with Google');
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await firebaseSignOut(auth);
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sign out');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.user = null;
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(signOut.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer; 