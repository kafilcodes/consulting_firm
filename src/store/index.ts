import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';

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
          'auth/signInWithGoogle/fulfilled',
          'auth/signInWithEmailPassword/fulfilled',
          'auth/signUp/fulfilled'
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
          'auth.user.lastLoginAt'
        ],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export the hooks directly from the store index
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 