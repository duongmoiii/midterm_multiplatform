import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import type { Auth, Persistence } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim() ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ?? '',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim() ?? '',
};

const databaseId = process.env.EXPO_PUBLIC_FIREBASE_DATABASE_ID?.trim() ?? '';

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

  if (Platform.OS === 'web') {
    auth = FirebaseAuth.getAuth(app);
  } else {
    const getRNPersistence = (
      FirebaseAuth as unknown as {
        getReactNativePersistence?: (storage: typeof AsyncStorage) => Persistence;
      }
    ).getReactNativePersistence;

    if (getRNPersistence) {
      try {
        auth = FirebaseAuth.initializeAuth(app, {
          persistence: getRNPersistence(AsyncStorage),
        });
      } catch {
        // Trường hợp auth đã được khởi tạo trước đó (Fast Refresh)
        auth = FirebaseAuth.getAuth(app);
      }
    } else {
      auth = FirebaseAuth.getAuth(app);
    }
  }

  db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
}

export const ACTIVE_DATABASE_NAME = databaseId || '(default)';
export const COLLECTION_GIANG_VIEN = 'GiangVien';

export { app, auth, db };
