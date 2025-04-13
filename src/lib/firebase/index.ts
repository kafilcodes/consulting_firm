// Re-export Firebase configuration and services
export * from './config';
export * from './auth';
export * from './services';
export * from './storage';

// Explicitly re-export actionCodeSettings to ensure it's always available
import { actionCodeSettings as emailActionCodeSettings } from './config';
export const actionCodeSettings = emailActionCodeSettings;

// Explicitly re-export auth functions to ensure they're available
import { 
  serializeUser, 
  updateAuthCookies, 
  formatDate 
} from './auth';

export {
  serializeUser,
  updateAuthCookies,
  formatDate
};

// This ensures all exports are available from a single import location
// e.g., import { auth, db, storage, actionCodeSettings, serializeUser } from '@/lib/firebase'; 