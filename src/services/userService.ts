import { db } from "../config/firebase";
import { User } from "../models/User";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export const fetchUsers = async (): Promise<User[]> => {
  const usersSnapshot = await getDocs(collection(db, "users"));
  return usersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as User[];
};

export const addUser = async (user: Omit<User, "id">) => {
  const newDoc = doc(collection(db, "users"));
  await setDoc(newDoc, user);
  return { id: newDoc.id, ...user };
};

export const updateUser = async (id: string, user: Partial<User>) => {
  const userRef = doc(db, "users", id);
  await updateDoc(userRef, user);
};

export const deleteUser = async (id: string) => {
  const userRef = doc(db, "users", id);
  await deleteDoc(userRef);
};
