// Firebase configuration and initialization
// Add the following to your .env file in the Manifest directory:
// VITE_FIREBASE_API_KEY=your-api-key
// VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
// VITE_FIREBASE_PROJECT_ID=your-project-id
// VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
// VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
// VITE_FIREBASE_APP_ID=your-app-id

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, getDocs, doc } from 'firebase/firestore';

// Firebase configuration object from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;

// Firestore helpers for user dreams
export async function getUserDreams(uid) {
  const dreamsCol = collection(db, 'users', uid, 'dreams');
  const snap = await getDocs(dreamsCol);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addUserDream(uid, dream) {
  const dreamsCol = collection(db, 'users', uid, 'dreams');
  const docRef = await addDoc(dreamsCol, dream);
  return docRef.id;
}

export async function updateUserDream(uid, dreamId, data) {
  const dreamRef = doc(db, 'users', uid, 'dreams', dreamId);
  await updateDoc(dreamRef, data);
}

export async function deleteUserDream(uid, dreamId) {
  const dreamRef = doc(db, 'users', uid, 'dreams', dreamId);
  await deleteDoc(dreamRef);
}

// Firestore helpers for user reflections
export async function getUserReflections(uid) {
  const reflectionsCol = collection(db, 'users', uid, 'reflections');
  const snap = await getDocs(reflectionsCol);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addUserReflection(uid, reflection) {
  const reflectionsCol = collection(db, 'users', uid, 'reflections');
  const docRef = await addDoc(reflectionsCol, reflection);
  return docRef.id;
}