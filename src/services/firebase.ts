import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDuqiLAn9vhkdxALmUUPsVdKr8N_EnCkIU',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'campusaccord.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'campusaccord',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'campusaccord.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '11813488329',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:11813488329:web:911a9492e5634b218baf18',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-WBFEM0ZPEG',
};

export const isDemoMode =
  import.meta.env.VITE_APP_MODE === 'demo' ||
  !firebaseConfig.apiKey ||
  firebaseConfig.apiKey.includes('Placeholder');

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics support check
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}
