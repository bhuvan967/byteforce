// Firebase initialization
// Ensure you have installed: npm install firebase

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  // Helpful runtime log to diagnose env issues
  // eslint-disable-next-line no-console
  console.error('Firebase apiKey is missing. Check your .env/.env.local and restart the dev server.');
}

// Debug (masked) to verify values are loaded at runtime
// eslint-disable-next-line no-console
console.log('Firebase config loaded', {
  apiKey: firebaseConfig.apiKey ? firebaseConfig.apiKey.slice(0, 6) + '...' : undefined,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Force long polling to avoid 400/stream issues behind some proxies/networks
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

export default app;
