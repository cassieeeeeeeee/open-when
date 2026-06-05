import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import * as fbAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import { firebaseConfig, firebaseEnabled } from './firebaseConfig';

// Everything is null until a real config is pasted into firebaseConfig.ts — that
// keeps the current (offline, static-data) app working until we flip Firebase on.
export const app = firebaseEnabled
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

function createAuth() {
  if (!app) return null;
  try {
    return fbAuth.initializeAuth(app, {
      // getReactNativePersistence exists in Firebase's RN build but not its web type
      // defs — Metro resolves the RN build at runtime; we cast for TypeScript.
      persistence: (fbAuth as any).getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // initializeAuth throws if already initialized (e.g. on Fast Refresh).
    return fbAuth.getAuth(app);
  }
}

export const auth = createAuth();
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
