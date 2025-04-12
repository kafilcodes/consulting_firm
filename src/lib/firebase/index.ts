// Re-export Firebase configuration and services
export * from './config';
export * from './auth';
export * from './services';
export * from './storage';

// Explicitly re-export actionCodeSettings to ensure it's always available
import { actionCodeSettings as emailActionCodeSettings } from './config';
export const actionCodeSettings = emailActionCodeSettings;

// This ensures all exports are available from a single import location
// e.g., import { auth, db, storage, actionCodeSettings } from '@/lib/firebase'; 