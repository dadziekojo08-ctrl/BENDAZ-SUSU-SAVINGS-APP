import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  doc,
  getDocFromServer,
  setLogLevel,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence verbose backend connection retry warnings in sandboxed preview iframe
try {
  setLogLevel('error');
} catch {
  // ignore
}

let firestoreDb: Firestore | null = null;
let isConfigured = false;

try {
  if (firebaseConfig && firebaseConfig.projectId && firebaseConfig.apiKey) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    isConfigured = true;
  }
} catch (err) {
  console.warn('Firebase initialization notice:', err);
}

export const isFirebaseConfigured = isConfigured && firestoreDb !== null;
export const db = firestoreDb as Firestore;
export { firebaseConfig };

// Optional connectivity health-check
export async function testFirestoreConnection(): Promise<boolean> {
  if (!isFirebaseConfigured || !firestoreDb) return false;
  try {
    await getDocFromServer(doc(firestoreDb, '_health', 'ping'));
    return true;
  } catch (err: any) {
    // Offline or connection pending - SDK will continue in offline-first mode
    if (err?.code === 'unavailable' || err?.message?.includes('offline')) {
      console.info('Firestore operating in offline-cached mode.');
    }
    return false;
  }
}

