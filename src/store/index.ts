import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';

// Create a store instance
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'auth/setUser',
          'auth/processRedirectResult/fulfilled',
          'auth/signInWithGoogle/fulfilled',
          'auth/signOut/fulfilled'
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'payload.timestamp',
          'payload.createdAt',
          'payload.lastSignInTime',
          'payload.updatedAt',
          'payload.lastLoginAt',
          'meta.arg',
          'meta.baseQueryMeta'
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'auth.user.createdAt',
          'auth.user.lastSignInTime',
          'auth.user.updatedAt',
          'auth.user.lastLoginAt',
          'auth.user.uid',
          'auth.user.email',
          'auth.user.displayName',
          'auth.user.photoURL',
          'auth.user.role'
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export the hooks directly from the store index with safety checks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 