import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

const STORAGE_CUSTOM_CONFIG_KEY = 'campusaccord_firebase_custom_config';

// 1. Resolve Firebase Configuration
export const getEffectiveFirebaseConfig = (): FirebaseCustomConfig => {
  if (typeof window !== 'undefined') {
    try {
      const customStr = localStorage.getItem(STORAGE_CUSTOM_CONFIG_KEY);
      if (customStr) {
        const parsed = JSON.parse(customStr);
        if (parsed && parsed.apiKey && parsed.projectId) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
  };
};

export const saveCustomFirebaseConfig = (cfg: FirebaseCustomConfig): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_CUSTOM_CONFIG_KEY, JSON.stringify(cfg));
  }
};

export const clearCustomFirebaseConfig = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_CUSTOM_CONFIG_KEY);
  }
};

const activeConfig = getEffectiveFirebaseConfig();

export const isDemoMode =
  import.meta.env.VITE_APP_MODE === 'demo' ||
  !activeConfig.apiKey ||
  !activeConfig.projectId ||
  activeConfig.apiKey.includes('Placeholder');

// 2. Safe initialization with fail-soft resilience
let appInstance: any;
let authInstance: any;
let dbInstance: any;
let storageInstance: any;
let isInitializedSuccessfully = false;

try {
  appInstance = getApps().length > 0 ? getApp() : initializeApp(activeConfig);
  authInstance = getAuth(appInstance);
  dbInstance = getFirestore(appInstance);
  storageInstance = getStorage(appInstance);
  isInitializedSuccessfully = true;
} catch (err) {
  console.warn('Firebase initialization notice (running in local-resilient offline mode):', err);
  // Fallback stub to prevent runtime errors if SDK encounters restricted environment
  appInstance = (getApps().length > 0 ? getApp() : null) as any;
  authInstance = null as any;
  dbInstance = null as any;
  storageInstance = null as any;
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;

export const isFirebaseLive = (): boolean => {
  return isInitializedSuccessfully && !isDemoMode && Boolean(db);
};

export const getFirebaseConnectionInfo = () => {
  return {
    isConfigured: Boolean(activeConfig.apiKey && activeConfig.projectId),
    isLive: isFirebaseLive(),
    projectId: activeConfig.projectId || 'campusaccord',
    authDomain: activeConfig.authDomain || 'campusaccord.firebaseapp.com',
    storageBucket: activeConfig.storageBucket || 'campusaccord.firebasestorage.app',
    status: isFirebaseLive() ? 'connected' : 'local_fallback',
  };
};

// Analytics support check
export let analytics: any = null;
if (typeof window !== 'undefined' && appInstance) {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(appInstance);
      }
    })
    .catch(() => {});
}
