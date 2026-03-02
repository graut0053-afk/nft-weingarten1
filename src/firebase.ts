import { getStorage } from "firebase/storage";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDjVHqrLMLpUgUn9v7yVMy89wRnOCKK5TA",
  authDomain: "poll-app-cf828.firebaseapp.com",
  projectId: "poll-app-cf828",
  storageBucket: "poll-app-cf828.firebasestorage.app",
  messagingSenderId: "764908822123",
  appId: "1:764908822123:web:d5db2bf7f186c4b3e31b2e"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);