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
  where,
  Timestamp,
  collectionGroup,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface UserTicket {
  id: string;
  booking_time: Timestamp | string;
  description?: string;
  duration: number;
  end_station_code: string;
  note?: string;
  price: number;
  qr_code_content: string;
  start_station_code: string;
  status: "unused" | "active" | "expired" | "refunded";
  ticket_name: string;
  ticket_type: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
}

interface User {
  id: string;
  username?: string;
  name?: string;
  email?: string;
  phonenumber?: string;
  role?: string;
}

// Fetch users data for joining
const fetchUsers = async (): Promise<Map<string, User>> => {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const usersMap = new Map<string, User>();

    usersSnapshot.docs.forEach((doc) => {
      const userData = doc.data() as User;
      usersMap.set(doc.id, {
        ...userData,
        id: doc.id,
      });
    });

    return usersMap;
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Map();
  }
};

// Helper function to get user display name
const getUserDisplayName = (userData: User | undefined): string => {
  if (!userData) {
    return "Người dùng không xác định";
  }

  // Try different possible field names
  return (
    userData.username ||
    userData.name ||
    userData.email?.split("@")[0] ||
    "Người dùng không tên"
  );
};

// Fetch all user tickets with user information
export const fetchUserTickets = async (): Promise<UserTicket[]> => {
  try {
    const userTicketsQuery = query(
      collectionGroup(db, "user_tickets"),
      orderBy("booking_time", "desc")
    );
    const [ticketsSnapshot, usersMap] = await Promise.all([
      getDocs(userTicketsQuery),
      fetchUsers(),
    ]);

    return ticketsSnapshot.docs.map((doc) => {
      const ticketData = { id: doc.id, ...doc.data() } as UserTicket;
      const userData = usersMap.get(ticketData.user_id);

      return {
        ...ticketData,
        user_name: getUserDisplayName(userData),
        user_email: userData?.email || "",
      };
    });
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    throw error;
  }
};

// Fetch user tickets by user ID with user information
export const fetchUserTicketsByUserId = async (
  userId: string
): Promise<UserTicket[]> => {
  try {
    // Remove orderBy to avoid index conflicts when using where
    const userTicketsQuery = query(
      collection(db, "user_tickets"),
      where("user_id", "==", userId)
    );
    const [ticketsSnapshot, usersMap] = await Promise.all([
      getDocs(userTicketsQuery),
      fetchUsers(),
    ]);

    // Sort in memory instead of using Firebase orderBy
    const tickets = ticketsSnapshot.docs.map((doc) => {
      const ticketData = { id: doc.id, ...doc.data() } as UserTicket;
      const userData = usersMap.get(ticketData.user_id);

      return {
        ...ticketData,
        user_name: getUserDisplayName(userData),
        user_email: userData?.email || "",
      };
    });

    // Sort by booking_time in descending order (newest first)
    return tickets.sort((a, b) => {
      const dateA =
        a.booking_time instanceof Timestamp
          ? a.booking_time.toDate()
          : new Date(a.booking_time);
      const dateB =
        b.booking_time instanceof Timestamp
          ? b.booking_time.toDate()
          : new Date(b.booking_time);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error("Error fetching user tickets by user ID:", error);
    throw error;
  }
};

// Fetch user tickets by status with user information
export const fetchUserTicketsByStatus = async (
  status: UserTicket["status"]
): Promise<UserTicket[]> => {
  try {
    // Remove orderBy to avoid index conflicts when using where
    const userTicketsQuery = query(
      collectionGroup(db, "user_tickets"),
      where("status", "==", status)
    );
    const [ticketsSnapshot, usersMap] = await Promise.all([
      getDocs(userTicketsQuery),
      fetchUsers(),
    ]);

    // Sort in memory instead of using Firebase orderBy
    const tickets = ticketsSnapshot.docs.map((doc) => {
      const ticketData = { id: doc.id, ...doc.data() } as UserTicket;
      const userData = usersMap.get(ticketData.user_id);

      return {
        ...ticketData,
        user_name: getUserDisplayName(userData),
        user_email: userData?.email || "",
      };
    });

    // Sort by booking_time in descending order (newest first)
    return tickets.sort((a, b) => {
      const dateA =
        a.booking_time instanceof Timestamp
          ? a.booking_time.toDate()
          : new Date(a.booking_time);
      const dateB =
        b.booking_time instanceof Timestamp
          ? b.booking_time.toDate()
          : new Date(b.booking_time);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error("Error fetching user tickets by status:", error);
    throw error;
  }
};

// Add new user ticket
export const addUserTicket = async (
  userTicket: Omit<UserTicket, "id">
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "user_tickets"), userTicket);
    return docRef.id;
  } catch (error) {
    console.error("Error adding user ticket:", error);
    throw error;
  }
};

// Update user ticket
export const updateUserTicket = async (
  id: string,
  userTicket: Partial<UserTicket>
): Promise<void> => {
  try {
    const userTicketRef = doc(db, "user_tickets", id);
    await updateDoc(userTicketRef, userTicket);
  } catch (error) {
    console.error("Error updating user ticket:", error);
    throw error;
  }
};

// Delete user ticket
export const deleteUserTicket = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "user_tickets", id));
  } catch (error) {
    console.error("Error deleting user ticket:", error);
    throw error;
  }
};

// Get revenue statistics
export const getRevenueStats = async () => {
  try {
    const snapshot = await getDocs(collectionGroup(db, "user_tickets"));
    const tickets = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as UserTicket[];

    const totalRevenue = tickets.reduce(
      (sum, ticket) => sum + (ticket.price || 0),
      0
    );
    const totalTicketsSold = tickets.length;
    const ticketsByStatus = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ticketsByType = tickets.reduce((acc, ticket) => {
      acc[ticket.ticket_type] = (acc[ticket.ticket_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRevenue,
      totalTicketsSold,
      ticketsByStatus,
      ticketsByType,
    };
  } catch (error) {
    console.error("Error fetching revenue stats:", error);
    throw error;
  }
};

// Get revenue statistics by date for charts
export const getRevenueStatsByDate = async (days: number = 7) => {
  try {
    const snapshot = await getDocs(collectionGroup(db, "user_tickets"));
    const tickets = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as UserTicket[];

    // Group tickets by date
    const revenueByDate: Record<string, number> = {};
    const ticketsByDate: Record<string, number> = {};

    // Initialize last N days
    const dates = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD format
      revenueByDate[dateStr] = 0;
      ticketsByDate[dateStr] = 0;
      return dateStr;
    });

    // Process tickets
    tickets.forEach((ticket) => {
      if (!ticket.booking_time || !ticket.price) return;

      let ticketDate: Date;
      if (ticket.booking_time instanceof Timestamp) {
        ticketDate = ticket.booking_time.toDate();
      } else {
        ticketDate = new Date(ticket.booking_time);
      }

      const dateStr = ticketDate.toISOString().split("T")[0];

      // Only count tickets from the last N days
      if (revenueByDate.hasOwnProperty(dateStr)) {
        revenueByDate[dateStr] += ticket.price;
        ticketsByDate[dateStr] += 1;
      }
    });

    // Format for chart
    const chartData = dates.map((dateStr) => {
      const date = new Date(dateStr);
      return {
        date: dateStr,
        label: date.toLocaleDateString("vi-VN", {
          month: "short",
          day: "numeric",
        }),
        revenue: revenueByDate[dateStr],
        tickets: ticketsByDate[dateStr],
      };
    });

    return {
      chartData,
      totalRevenue: Object.values(revenueByDate).reduce(
        (sum, val) => sum + val,
        0
      ),
      totalTickets: Object.values(ticketsByDate).reduce(
        (sum, val) => sum + val,
        0
      ),
    };
  } catch (error) {
    console.error("Error fetching revenue stats by date:", error);
    throw error;
  }
};
