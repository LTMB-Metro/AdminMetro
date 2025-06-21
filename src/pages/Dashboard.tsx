import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  useTheme,
  Tooltip,
  Divider,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Skeleton,
  Stack,
} from "@mui/material";
import {
  People as PeopleIcon,
  DirectionsBus as BusIcon,
  ConfirmationNumber as TicketIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  PersonAdd as PersonAddIcon,
  ShoppingCart as ShoppingCartIcon,
  LocationOn as LocationOnIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  fetchDashboardStats,
  DashboardStats,
  getChartData,
  ChartData,
  fetchRecentActivities,
} from "../services/dashboard";
import { Activity } from "../types/activity";

// Simple Chart Components
const PieChart: React.FC<{
  data: ChartData["statusChart"] | ChartData["typeChart"];
  title: string;
}> = ({ data, title }) => {
  const total = data.data.reduce((sum, value) => sum + value, 0);

  if (total === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Chưa có dữ liệu
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} mb={2} textAlign="center">
        {title}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {data.labels.map((label, index) => {
          const value = data.data[index];
          const percentage = Math.round((value / total) * 100);
          const color = data.colors[index];

          return (
            <Box
              key={label}
              sx={{ display: "flex", alignItems: "center", gap: 2 }}
            >
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  backgroundColor: color,
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="body2" fontWeight={500}>
                    {label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {value} ({percentage}%)
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    height: 8,
                    backgroundColor: "grey.200",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${percentage}%`,
                      height: "100%",
                      backgroundColor: color,
                      transition: "width 0.3s ease",
                    }}
                  />
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

const BarChart: React.FC<{
  data: ChartData["revenueChart"];
  title: string;
}> = ({ data, title }) => {
  const theme = useTheme();
  const maxValue = Math.max(...data.data);

  if (maxValue === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Chưa có dữ liệu doanh thu trong 7 ngày qua
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} mb={2} textAlign="center">
        {title}
      </Typography>
      <Box
        sx={{ display: "flex", alignItems: "end", gap: 1, height: 200, px: 2 }}
      >
        {data.labels.map((label, index) => {
          const value = data.data[index];
          const height = maxValue > 0 ? (value / maxValue) * 150 : 0;

          return (
            <Box
              key={label}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Tooltip
                title={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {label}
                    </Typography>
                    <Typography variant="body2">
                      Doanh thu: {value.toLocaleString("vi-VN")}đ
                    </Typography>
                    {value === 0 && (
                      <Typography variant="caption" color="text.disabled">
                        Không có giao dịch
                      </Typography>
                    )}
                  </Box>
                }
              >
                <Box
                  sx={{
                    width: "100%",
                    height: `${Math.max(height, 2)}px`, // Minimum height for visibility
                    backgroundColor:
                      value > 0
                        ? "primary.main"
                        : theme.palette.mode === "dark"
                        ? "grey.600"
                        : "grey.300",
                    borderRadius: "4px 4px 0 0",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor:
                        value > 0
                          ? "primary.dark"
                          : theme.palette.mode === "dark"
                          ? "grey.500"
                          : "grey.400",
                      transform: "translateY(-2px)",
                    },
                  }}
                />
              </Tooltip>
              <Typography
                variant="caption"
                sx={{ mt: 1, fontSize: "0.7rem", textAlign: "center" }}
              >
                {label}
              </Typography>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Tổng doanh thu 7 ngày:{" "}
          {data.data.reduce((sum, val) => sum + val, 0).toLocaleString("vi-VN")}
          đ
        </Typography>
      </Box>
    </Box>
  );
};

const getStatsConfig = (dashboardStats: DashboardStats | null) => [
  {
    label: "Tổng Người Dùng",
    value: dashboardStats?.totalUsers.toLocaleString("vi-VN") || "0",
    icon: <PeopleIcon />,
    color: "#1976d2",
    bg: "linear-gradient(135deg,#1976d2 30%,#42a5f5 100%)",
  },
  {
    label: "Tổng Trạm",
    value: dashboardStats?.totalStations.toLocaleString("vi-VN") || "0",
    icon: <BusIcon />,
    color: "#43a047",
    bg: "linear-gradient(135deg,#43a047 30%,#66bb6a 100%)",
  },
  {
    label: "Loại Vé",
    value: dashboardStats?.totalTicketTypes.toLocaleString("vi-VN") || "0",
    icon: <TicketIcon />,
    color: "#fbc02d",
    bg: "linear-gradient(135deg,#fbc02d 30%,#ffb300 100%)",
  },
  {
    label: "Vé Đã Bán",
    value: dashboardStats?.totalTicketsSold.toLocaleString("vi-VN") || "0",
    icon: <ReceiptIcon />,
    color: "#9c27b0",
    bg: "linear-gradient(135deg,#9c27b0 30%,#ba68c8 100%)",
  },
  {
    label: "Doanh Thu",
    value: dashboardStats?.totalRevenue
      ? `${dashboardStats.totalRevenue.toLocaleString("vi-VN")}đ`
      : "0đ",
    icon: <TrendingUpIcon />,
    color: "#e53935",
    bg: "linear-gradient(135deg,#e53935 30%,#ff7043 100%)",
  },
];

const Dashboard = () => {
  const theme = useTheme();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  const stats = getStatsConfig(dashboardStats);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await fetchDashboardStats();
      setDashboardStats(stats);
      const charts = await getChartData(stats);
      setChartData(charts);
      setLastUpdated(new Date());
      const activities = await fetchRecentActivities();
      setRecentActivities(activities);
    } catch (err) {
      setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại.");
      console.error("Error loading dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Box>
            <Skeleton variant="text" width={300} height={40} />
            <Skeleton variant="text" width={200} height={24} />
          </Box>
          <Skeleton variant="circular" width={40} height={40} />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(5, 1fr)",
            },
            gap: 3,
            mb: 3,
          }}
        >
          {[...Array(5)].map((_, idx) => (
            <Card key={idx} sx={{ height: 180, borderRadius: 4 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Skeleton variant="circular" width={48} height={48} />
                  <Skeleton
                    variant="text"
                    width={120}
                    height={24}
                    sx={{ ml: 2 }}
                  />
                </Box>
                <Skeleton variant="text" width={100} height={40} />
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
            gap: 3,
          }}
        >
          <Card sx={{ borderRadius: 4, p: 2, minHeight: 500 }}>
            <CardContent>
              <Stack spacing={3}>
                <Skeleton variant="text" width={200} height={32} />
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 3,
                  }}
                >
                  {[...Array(2)].map((_, idx) => (
                    <Box key={idx}>
                      <Stack spacing={2}>
                        <Skeleton variant="text" width={150} height={24} />
                        {[...Array(4)].map((_, i) => (
                          <Box key={i}>
                            <Skeleton variant="text" width="100%" height={20} />
                            <Box sx={{ mt: 1 }}>
                              <Skeleton
                                variant="rectangular"
                                width="100%"
                                height={8}
                              />
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Box>
                <Divider />
                <Skeleton variant="text" width={200} height={24} />
                <Skeleton variant="rectangular" width="100%" height={200} />
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 4, p: 2, minHeight: 500 }}>
            <CardContent>
              <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
              {[...Array(5)].map((_, idx) => (
                <Box key={idx} sx={{ mb: 2 }}>
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={60}
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError(null)}
          action={
            <Button color="inherit" size="small" onClick={loadDashboardStats}>
              Thử Lại
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} letterSpacing={1}>
            Bảng Thống Kê Chi Tiết
          </Typography>
          {lastUpdated && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              Cập nhật lần cuối:{" "}
              {lastUpdated.toLocaleString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          )}
        </Box>
        <Tooltip title="Làm mới dữ liệu">
          <IconButton
            onClick={loadDashboardStats}
            disabled={loading}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: "white",
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(5, 1fr)",
          },
          gap: 3,
          mb: 3,
        }}
      >
        {stats.map((stat, idx) => (
          <Box key={stat.label}>
            <Card
              sx={{
                height: 180,
                borderRadius: 4,
                boxShadow: "0 4px 24px #1976d222",
                background: stat.bg,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "100px",
                  height: "100px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "50%",
                  transform: "translate(30px, -30px)",
                },
              }}
            >
              {loading && dashboardStats === null ? (
                <CircularProgress sx={{ color: "white" }} />
              ) : (
                <CardContent
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 2,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: "#fff",
                        color: stat.color,
                        width: 48,
                        height: 48,
                        mr: 2,
                        boxShadow: "0 2px 8px #0002",
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      letterSpacing={1}
                      sx={{ textAlign: "left", lineHeight: 1.2 }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                  <Typography
                    variant="h3"
                    fontWeight={900}
                    letterSpacing={2}
                    sx={{
                      fontSize: { xs: 20, sm: 24, md: 28 },
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    {stat.value}
                  </Typography>
                </CardContent>
              )}
            </Card>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: 3,
        }}
      >
        <Box>
          <Card
            sx={{
              borderRadius: 4,
              p: 2,
              minHeight: 500,
              boxShadow: "0 4px 24px #1976d222",
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={3}>
                Thống Kê Chi Tiết
              </Typography>

              {chartData ? (
                <Box>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 3,
                      mb: 3,
                    }}
                  >
                    <PieChart
                      data={chartData.statusChart}
                      title="Trạng Thái Vé"
                    />
                    <PieChart data={chartData.typeChart} title="Loại Vé" />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <BarChart
                    data={chartData.revenueChart}
                    title="Doanh Thu 7 Ngày Qua"
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 400,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    background:
                      theme.palette.mode === "dark" ? "grey.800" : "#f8f9fa",
                    borderRadius: 3,
                    border: `2px dashed ${theme.palette.divider}`,
                    gap: 2,
                  }}
                >
                  <CircularProgress />
                  <Typography color="text.secondary" variant="h6">
                    Đang tải biểu đồ...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card
            sx={{
              borderRadius: 4,
              p: 2,
              minHeight: 500,
              boxShadow: "0 4px 24px #1976d222",
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Hoạt Động Gần Đây
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  mt: 2,
                }}
              >
                {recentActivities.map((activity: Activity, idx: number) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1,
                      backgroundColor:
                        theme.palette.mode === "dark" ? "grey.800" : "#fafafa",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor:
                        theme.palette.mode === "dark" ? "grey.700" : "grey.200",
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "grey.700"
                            : "grey.100",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        backgroundColor:
                          activity.type === "user"
                            ? "primary.main"
                            : activity.type === "ticket"
                            ? "secondary.main"
                            : activity.type === "station"
                            ? "success.main"
                            : "info.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {activity.type === "user" && (
                        <PersonAddIcon sx={{ fontSize: 16, color: "white" }} />
                      )}
                      {activity.type === "ticket" && (
                        <ShoppingCartIcon
                          sx={{ fontSize: 16, color: "white" }}
                        />
                      )}
                      {activity.type === "station" && (
                        <LocationOnIcon sx={{ fontSize: 16, color: "white" }} />
                      )}
                      {activity.type === "system" && (
                        <SettingsIcon sx={{ fontSize: 16, color: "white" }} />
                      )}
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" fontWeight={500}>
                        {activity.desc}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 2 }}
                      >
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Hệ thống hoạt động bình thường
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mt: 1,
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "success.main",
                      animation: "pulse 2s infinite",
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="success.main"
                    fontWeight={600}
                  >
                    ONLINE
                  </Typography>
                </Box>
              </Box>

              {dashboardStats && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor:
                      theme.palette.mode === "dark" ? "grey.800" : "grey.50",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor:
                      theme.palette.mode === "dark" ? "grey.700" : "grey.200",
                  }}
                >
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    Tóm Tắt Hệ Thống
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    • {dashboardStats.totalUsers} người dùng đã đăng ký
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    • {dashboardStats.totalTicketsSold} vé đã được bán
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    • Tổng doanh thu:{" "}
                    {dashboardStats.totalRevenue.toLocaleString("vi-VN")}đ
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
