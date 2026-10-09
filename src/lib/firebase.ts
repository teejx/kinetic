import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { UserProfile, WorkoutLog } from '../types';

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

export function isFirebaseConfigured(): boolean {
  return !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  );
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) {
    return null;
  }

  if (cachedApp) {
    return cachedApp;
  }

  try {
    const app = getApps().length === 0
      ? initializeApp({
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: import.meta.env.VITE_FIREBASE_APP_ID,
        })
      : getApp();

    cachedApp = app;
    cachedAuth = getAuth(app);
    cachedDb = getFirestore(app);
    return cachedApp;
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return null;
  }
}

export function getFirebaseAuth(): Auth | null {
  getFirebaseApp();
  return cachedAuth;
}

export function getFirebaseDb(): Firestore | null {
  getFirebaseApp();
  return cachedDb;
}

export async function registerFirebaseUser(
  email: string,
  pass: string,
  name: string
): Promise<{ user: FirebaseUser | null; error?: string }> {
  const auth = getFirebaseAuth();
  if (!auth) {
    return { user: null, error: 'Firebase is not configured.' };
  }
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    return { user: cred.user };
  } catch (err: any) {
    let msg = err.message || 'Registration failed.';
    const code = err.code || '';
    if (code === 'auth/configuration-not-found' || msg.includes('configuration-not-found')) {
      msg = 'Authentication provider is not enabled in Firebase Console. Enable "Email/Password" in Firebase Authentication.';
    } else if (code === 'auth/operation-not-allowed') {
      msg = 'Email/Password sign-in is disabled in Firebase Authentication.';
    } else if (code === 'auth/email-already-in-use') {
      msg = 'This email is already registered. Try signing in instead.';
    } else if (code === 'auth/weak-password') {
      msg = 'Password should be at least 8 characters long.';
    } else if (code === 'auth/invalid-email') {
      msg = 'Please enter a valid email address.';
    }
    return { user: null, error: msg };
  }
}

export async function loginFirebaseUser(
  email: string,
  pass: string
): Promise<{ user: FirebaseUser | null; error?: string }> {
  const auth = getFirebaseAuth();
  if (!auth) {
    return { user: null, error: 'Firebase is not configured.' };
  }
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return { user: cred.user };
  } catch (err: any) {
    let msg = err.message || 'Login failed.';
    const code = err.code || '';
    if (code === 'auth/configuration-not-found' || msg.includes('configuration-not-found')) {
      msg = 'Authentication provider is not enabled in Firebase Console.';
    } else if (code === 'auth/operation-not-allowed') {
      msg = 'Email/Password sign-in is disabled in Firebase Authentication.';
    } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      msg = 'Invalid email or password.';
    } else if (code === 'auth/invalid-email') {
      msg = 'Please enter a valid email address.';
    }
    return { user: null, error: msg };
  }
}

export async function logoutFirebaseUser(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await signOut(auth);
}

export function onFirebaseAuthStateChanged(callback: (user: FirebaseUser | null) => void): (() => void) {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// Headless background sync helpers (only active if .env credentials are provided)
export async function syncWorkoutToFirestore(workout: WorkoutLog): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const docRef = doc(db, 'workouts', workout.id);
  await setDoc(docRef, workout, { merge: true });
}

export async function deleteWorkoutFromFirestore(workoutId: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const docRef = doc(db, 'workouts', workoutId);
  await deleteDoc(docRef);
}

export async function syncProfileToFirestore(profile: UserProfile): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const docRef = doc(db, 'profiles', profile.id);
  await setDoc(docRef, profile, { merge: true });
}
