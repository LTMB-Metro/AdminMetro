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
  _documentPath: string;
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
        _documentPath: doc.ref.path,
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
        // Store the full document path for updates/deletes
        _documentPath: doc.ref.path,
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
        // Store the full document path for updates/deletes
        _documentPath: doc.ref.path,
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
  ticket: UserTicket,
  updateData: Partial<UserTicket>
): Promise<void> => {
  try {
    let userTicketRef;

    // Use the stored document path if available
    if (ticket._documentPath) {
      userTicketRef = doc(db, ticket._documentPath);
    } else {
      // Fallback: try to construct path from user_id and ticket id
      userTicketRef = doc(
        db,
        `users/${ticket.user_id}/user_tickets/${ticket.id}`
      );
    }

    await updateDoc(userTicketRef, updateData);
  } catch (error) {
    console.error("Error updating user ticket:", error);
    throw error;
  }
};

// Delete user ticket
export const deleteUserTicket = async (ticket: UserTicket): Promise<void> => {
  try {
    let userTicketRef;

    // Use the stored document path if available
    if (ticket._documentPath) {
      userTicketRef = doc(db, ticket._documentPath);
    } else {
      // Fallback: try to construct path from user_id and ticket id
      userTicketRef = doc(
        db,
        `users/${ticket.user_id}/user_tickets/${ticket.id}`
      );
    }

    await deleteDoc(userTicketRef);
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

// Get revenue statistics by week
export const getRevenueStatsByWeek = async () => {
  try {
    const snapshot = await getDocs(collectionGroup(db, "user_tickets"));
    const tickets = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as UserTicket[];

    console.log("Total tickets found:", tickets.length);

    // Get start of current week (Monday) in local timezone
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = now.getDay();
    // Calculate days since Monday (0 = Sunday, 1 = Monday)
    const daysFromMonday = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(now.getDate() - daysFromMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    console.log(
      "Week range:",
      startOfWeek.toLocaleDateString("vi-VN"),
      "to",
      now.toLocaleDateString("vi-VN")
    );

    const result = await getRevenueStatsByDateRange(startOfWeek, now);
    console.log("Week revenue result:", result);
    return result;
  } catch (error) {
    console.error("Error fetching revenue stats by week:", error);
    throw error;
  }
};

// Get revenue statistics by month
export const getRevenueStatsByMonth = async () => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    console.log(
      "Month range:",
      startOfMonth.toLocaleDateString("vi-VN"),
      "to",
      now.toLocaleDateString("vi-VN")
    );
    console.log(
      "Current month:",
      now.getMonth() + 1,
      "year:",
      now.getFullYear()
    );

    const result = await getRevenueStatsByDateRange(startOfMonth, now);
    console.log("Month revenue result:", result);
    return result;
  } catch (error) {
    console.error("Error fetching revenue stats by month:", error);
    throw error;
  }
};

// Get revenue statistics by custom date range
export const getRevenueStatsByDateRange = async (
  startDate: Date,
  endDate: Date
) => {
  try {
    const snapshot = await getDocs(collectionGroup(db, "user_tickets"));
    const tickets = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as UserTicket[];

    console.log("Date range tickets processing:", tickets.length, "tickets");
    console.log(
      "Date range:",
      startDate.toLocaleDateString("vi-VN"),
      "to",
      endDate.toLocaleDateString("vi-VN")
    );

    // Calculate number of days
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    console.log("Total days in range:", totalDays);

    // Group tickets by date
    const revenueByDate: Record<string, number> = {};
    const ticketsByDate: Record<string, number> = {};

    // Get all dates in range using local date
    const dates: string[] = [];
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    const endDateLocal = new Date(endDate);
    endDateLocal.setHours(23, 59, 59, 999);

    while (currentDate <= endDateLocal) {
      // Use local date format YYYY-MM-DD
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      dates.push(dateStr);
      revenueByDate[dateStr] = 0;
      ticketsByDate[dateStr] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log("Date range covers:", dates.length, "days");

    // Process tickets
    let processedTickets = 0;
    let validTickets = 0;
    tickets.forEach((ticket) => {
      processedTickets++;
      if (!ticket.booking_time || !ticket.price) {
        return;
      }

      let ticketDate: Date;
      if (ticket.booking_time instanceof Timestamp) {
        ticketDate = ticket.booking_time.toDate();
      } else {
        ticketDate = new Date(ticket.booking_time);
      }

      // Use local date format for comparison
      const year = ticketDate.getFullYear();
      const month = String(ticketDate.getMonth() + 1).padStart(2, "0");
      const day = String(ticketDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      // Only count tickets in the date range
      if (revenueByDate.hasOwnProperty(dateStr)) {
        revenueByDate[dateStr] += ticket.price;
        ticketsByDate[dateStr] += 1;
        validTickets++;
      }
    });

    console.log(
      "Processed tickets:",
      processedTickets,
      "Valid tickets in range:",
      validTickets
    );

    // Smart grouping based on date range length
    let chartData;

    if (totalDays <= 31) {
      // Daily view for <= 31 days
      chartData = dates.map((dateStr) => {
        const [year, month, day] = dateStr.split("-");
        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );
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
    } else if (totalDays <= 93) {
      // Weekly view for 32-93 days (about 3 months)
      const weeklyData: Record<
        string,
        { revenue: number; tickets: number; label: string }
      > = {};

      dates.forEach((dateStr) => {
        const [year, month, day] = dateStr.split("-");
        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );

        // Get Monday of the week for consistent grouping
        const monday = new Date(date);
        const dayOfWeek = date.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        monday.setDate(date.getDate() - daysToMonday);

        const weekKey = monday.toISOString().split("T")[0];

        // Better week label - show week range
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const weekLabel = `${monday.getDate()}/${
          monday.getMonth() + 1
        } - ${sunday.getDate()}/${sunday.getMonth() + 1}`;

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { revenue: 0, tickets: 0, label: weekLabel };
        }

        weeklyData[weekKey].revenue += revenueByDate[dateStr];
        weeklyData[weekKey].tickets += ticketsByDate[dateStr];
      });

      chartData = Object.entries(weeklyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({
          date,
          label: data.label,
          revenue: data.revenue,
          tickets: data.tickets,
        }));
    } else {
      // Monthly view for > 93 days
      const monthlyData: Record<
        string,
        { revenue: number; tickets: number; label: string }
      > = {};

      dates.forEach((dateStr) => {
        const [year, month] = dateStr.split("-");
        const monthKey = `${year}-${month}`;
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        const monthLabel = date.toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "short",
        });

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, tickets: 0, label: monthLabel };
        }

        monthlyData[monthKey].revenue += revenueByDate[dateStr];
        monthlyData[monthKey].tickets += ticketsByDate[dateStr];
      });

      chartData = Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({
          date,
          label: data.label,
          revenue: data.revenue,
          tickets: data.tickets,
        }));
    }

    const result = {
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

    console.log("Final result with", chartData.length, "data points:", result);
    return result;
  } catch (error) {
    console.error("Error fetching revenue stats by date range:", error);
    throw error;
  }
};
