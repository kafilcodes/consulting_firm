import * as admin from 'firebase-admin';
import serviceAccount from './service-account.json';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // First try to use environment variables
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
      console.log('Firebase Admin SDK initialized with environment variables');
    } 
    // If environment variables are not available, use the service account file
    else {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      });
      console.log('Firebase Admin SDK initialized with service account file');
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

// Only export if admin was properly initialized
export const auth = admin.apps.length ? admin.auth() : null;
export const db = admin.apps.length ? admin.firestore() : null;
export const storage = admin.apps.length ? admin.storage() : null;

export default admin; 