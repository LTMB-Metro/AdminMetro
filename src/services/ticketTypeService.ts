import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface TicketType {
  id: string;
  ticket_name: string;
  type: string;
  price: number;
  categories: string;
  duration?: number;
  note?: string;
  description?: string;
  status?: "active" | "inactive";
}

// Fetch all ticket types
export const fetchTicketTypes = async (): Promise<TicketType[]> => {
  try {
    const ticketTypesQuery = query(
      collection(db, "ticket_type"),
      orderBy("price", "asc")
    );
    const snapshot = await getDocs(ticketTypesQuery);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TicketType[];
  } catch (error) {
    console.error("Error fetching ticket types:", error);
    throw error;
  }
};

// Add new ticket type
export const addTicketType = async (
  ticketType: Omit<TicketType, "id">
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "ticket_type"), ticketType);
    return docRef.id;
  } catch (error) {
    console.error("Error adding ticket type:", error);
    throw error;
  }
};

// Update ticket type
export const updateTicketType = async (
  id: string,
  ticketType: Partial<TicketType>
): Promise<void> => {
  try {
    const ticketTypeRef = doc(db, "ticket_type", id);
    await updateDoc(ticketTypeRef, ticketType);
  } catch (error) {
    console.error("Error updating ticket type:", error);
    throw error;
  }
};

// Delete ticket type
export const deleteTicketType = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "ticket_type", id));
  } catch (error) {
    console.error("Error deleting ticket type:", error);
    throw error;
  }
};
