import * as firebaseApp from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification,
  User 
} from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Application } from '../types';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqVdcqAxWzjYFMTjSPyNoAHULropjwVUw",
  authDomain: "ayiness-209d2.firebaseapp.com",
  projectId: "ayiness-209d2",
  storageBucket: "ayiness-209d2.firebasestorage.app",
  messagingSenderId: "312010682322",
  appId: "1:312010682322:web:10e8047788d6211205620b",
  measurementId: "G-ZLW50BWG63"
};

// Initialize Firebase (Singleton pattern)
const app = firebaseApp.initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// --- Auth Helpers ---

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, pass: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
};

export const loginWithEmail = async (email: string, pass: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
};

export const sendVerification = async (user: User) => {
  await sendEmailVerification(user);
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};

// --- Firestore Helpers ---

export const getUserApplications = async (uid: string): Promise<Application[]> => {
  if (!uid) return [];
  const q = query(collection(db, `users/${uid}/applications`));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
};

export const updateApplicationStatus = async (uid: string, appId: string, newStatus: string) => {
  if (!uid || !appId) return;
  const appRef = doc(db, `users/${uid}/applications`, appId);
  await updateDoc(appRef, { status: newStatus });
};

export const addApplication = async (uid: string, appData: Omit<Application, 'id'>) => {
  if (!uid) return;
  const docRef = await addDoc(collection(db, `users/${uid}/applications`), appData);
  return { id: docRef.id, ...appData };
};