import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { User } from "../models/User";
import { Activity } from "../types/activity";
import { getRevenueStats, getRevenueStatsByDate } from "./userTicketService";

export interface DashboardStats {
  totalUsers: number;
  totalTicketTypes: number;
  totalStations: number;
  totalRevenue: number;
  totalTicketsSold: number;
  ticketsByStatus: Record<string, number>;
  ticketsByType: Record<string, number>;
}

export interface ChartData {
  statusChart: {
    labels: string[];
    data: number[];
    colors: string[];
  };
  typeChart: {
    labels: string[];
    data: number[];
    colors: string[];
  };
  revenueChart: {
    labels: string[];
    data: number[];
  };
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const [usersSnapshot, ticketTypesSnapshot, stationsSnapshot, revenueStats] =
      await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "ticket_type")),
        getDocs(collection(db, "stations")),
        getRevenueStats(),
      ]);

    return {
      totalUsers: usersSnapshot.size,
      totalTicketTypes: ticketTypesSnapshot.size,
      totalStations: stationsSnapshot.size,
      totalRevenue: revenueStats.totalRevenue,
      totalTicketsSold: revenueStats.totalTicketsSold,
      ticketsByStatus: revenueStats.ticketsByStatus,
      ticketsByType: revenueStats.ticketsByType,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

export const getChartData = async (
  stats: DashboardStats
): Promise<ChartData> => {
  try {
    // Status chart data with Vietnamese labels
    const statusLabels: Record<string, string> = {
      unused: "Chưa sử dụng",
      used: "Đã sử dụng",
      expired: "Hết hạn",
      refunded: "Đã hoàn tiền",
    };

    const statusColors = ["#4caf50", "#2196f3", "#ff9800", "#f44336"];

    const statusChart = {
      labels: Object.keys(stats.ticketsByStatus).map(
        (key) => statusLabels[key] || key
      ),
      data: Object.values(stats.ticketsByStatus),
      colors: statusColors.slice(0, Object.keys(stats.ticketsByStatus).length),
    };

    // Type chart data with Vietnamese ticket names
    const typeLabels: Record<string, string> = {
      daily1: "Vé 1 Ngày",
      daily3: "Vé 3 Ngày",
      monthly: "Vé Tháng",
      student: "Vé HSSV",
      monthly_student: "Vé HSSV",
    };

    const typeColors = ["#9c27b0", "#00bcd4", "#cddc39", "#ff5722", "#607d8b"];

    const typeChart = {
      labels: Object.keys(stats.ticketsByType).map(
        (key) => typeLabels[key] || key
      ),
      data: Object.values(stats.ticketsByType),
      colors: typeColors.slice(0, Object.keys(stats.ticketsByType).length),
    };

    // Get real revenue data for the last 7 days
    const revenueData = await getRevenueStatsByDate(7);

    const revenueChart = {
      labels: revenueData.chartData.map((item) => item.label),
      data: revenueData.chartData.map((item) => item.revenue),
    };

    return {
      statusChart,
      typeChart,
      revenueChart,
    };
  } catch (error) {
    console.error("Error generating chart data:", error);
    // Fallback to empty charts if error
    return {
      statusChart: { labels: [], data: [], colors: [] },
      typeChart: { labels: [], data: [], colors: [] },
      revenueChart: { labels: [], data: [] },
    };
  }
};

export const fetchRecentActivities = async (): Promise<Activity[]> => {
  try {
    const activities: Activity[] = [];

    // Get recent user registrations (last 10)
    const usersQuery = query(
      collection(db, "users"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const usersSnapshot = await getDocs(usersQuery);

    usersSnapshot.docs.forEach((doc) => {
      const userData = doc.data();
      if (userData.createdAt) {
        let timestamp: Date;
        if (userData.createdAt.toDate) {
          timestamp = userData.createdAt.toDate();
        } else {
          timestamp = new Date(userData.createdAt);
        }

        activities.push({
          id: `user_${doc.id}`,
          type: "user",
          desc: `Người dùng ${
            userData.username || userData.email || "mới"
          } đăng ký`,
          timestamp: timestamp,
          time: timestamp.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      }
    });

    // Get recent ticket purchases (last 10)
    const ticketsQuery = query(
      collection(db, "user_tickets"),
      orderBy("booking_time", "desc"),
      limit(5)
    );
    const ticketsSnapshot = await getDocs(ticketsQuery);

    ticketsSnapshot.docs.forEach((doc) => {
      const ticketData = doc.data();
      if (ticketData.booking_time) {
        let timestamp: Date;
        if (ticketData.booking_time.toDate) {
          timestamp = ticketData.booking_time.toDate();
        } else {
          timestamp = new Date(ticketData.booking_time);
        }

        activities.push({
          id: `ticket_${doc.id}`,
          type: "ticket",
          desc: `Mua vé ${ticketData.ticket_name || ticketData.ticket_type}`,
          timestamp: timestamp,
          time: timestamp.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      }
    });

    // Sort all activities by timestamp (newest first) and take top 5
    const sortedActivities = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);

    return sortedActivities;
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    // Fallback to mock data if error
    return getRecentActivitiesMock();
  }
};

// Keep mock data as fallback
const getRecentActivitiesMock = (): Activity[] => {
  const now = new Date();
  return [
    {
      id: "mock_1",
      time: new Date(now.getTime() - 4 * 60 * 60 * 1000).toLocaleTimeString(
        "vi-VN",
        { hour: "2-digit", minute: "2-digit" }
      ),
      desc: "Người dùng mới đăng ký",
      type: "user",
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000),
    },
    {
      id: "mock_2",
      time: new Date(now.getTime() - 3 * 60 * 60 * 1000).toLocaleTimeString(
        "vi-VN",
        { hour: "2-digit", minute: "2-digit" }
      ),
      desc: "Thêm loại vé mới",
      type: "ticket",
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    },
    {
      id: "mock_3",
      time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toLocaleTimeString(
        "vi-VN",
        { hour: "2-digit", minute: "2-digit" }
      ),
      desc: "Cập nhật thông tin trạm",
      type: "station",
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      id: "mock_4",
      time: new Date(now.getTime() - 1 * 60 * 60 * 1000).toLocaleTimeString(
        "vi-VN",
        { hour: "2-digit", minute: "2-digit" }
      ),
      desc: "Hệ thống đồng bộ dữ liệu",
      type: "system",
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    },
  ];
};

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
