import { getApps, initializeApp } from 'firebase/app';
import { type Persistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Firebase v12 does not export getReactNativePersistence.
// Implement the internal persistence interface using AsyncStorage.
const asyncStoragePersistence = {
  type: 'LOCAL' as Persistence['type'],
  async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    return AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    return AsyncStorage.removeItem(key);
  },
} as unknown as Persistence;

export const auth = initializeAuth(app, {
  persistence: asyncStoragePersistence,
});

export const db = getFirestore(app);
