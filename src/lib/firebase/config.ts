import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  connectAuthEmulator 
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase config object from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if it hasn't been initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Setup Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Email sign in link settings
const actionCodeSettings = {
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  handleCodeInApp: true,
};

// Connect to Firebase emulators if enabled
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  // Connect to Auth emulator
  connectAuthEmulator(auth, 'http://localhost:9099');
  
  // Connect to Firestore emulator
  connectFirestoreEmulator(db, 'localhost', 8080);
  
  // Connect to Storage emulator
  connectStorageEmulator(storage, 'localhost', 9199);
  
  console.log('Connected to Firebase emulators');
}

export { 
  app, 
  auth, 
  db, 
  storage, 
  googleProvider,
  actionCodeSettings
}; 