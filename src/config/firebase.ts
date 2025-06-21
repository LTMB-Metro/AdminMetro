import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAa-E7BqMn0BiDFkfVCaB8Mtp8o_XxgQwM",
  authDomain: "metropass-1aaa7.firebaseapp.com",
  projectId: "metropass-1aaa7",
  storageBucket: "metropass-1aaa7.firebasestorage.app",
  messagingSenderId: "842355690044",
  appId: "1:842355690044:web:a7e4952db0e1e5e48ad139",
  measurementId: "G-E79GLQXMS6",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
