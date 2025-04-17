// Import types from index.ts
import { User, UserData, UserRole } from './index';

// Define AuthUser interface for auth-specific user data
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: string;
  lastSignInTime: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

// Add additional auth-specific types
export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Re-export User related types
export { type User, type UserData, type UserRole } from './index';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends AuthCredentials {
  displayName: string;
  role?: UserRole;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthTokenPayload {
  uid: string;
  email: string | null;
  role: UserRole;
  iat: number;
  exp: number;
} 