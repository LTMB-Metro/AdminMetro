import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  useTheme,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Skeleton,
  Stack,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  ConfirmationNumber as TicketIcon,
  Assessment as ChartIcon,
  Refresh as RefreshIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
} from "@mui/icons-material";
import { getRevenueStats } from "../services/userTicketService";

interface RevenueStats {
  totalRevenue: number;
  totalTicketsSold: number;
  ticketsByStatus: Record<string, number>;
  ticketsByType: Record<string, number>;
}

const getStatsConfig = (revenueStats: RevenueStats | null) => [
  {
    label: "Tổng Doanh Thu",
    value: revenueStats?.totalRevenue
      ? `${revenueStats.totalRevenue.toLocaleString("vi-VN")}đ`
      : "0đ",
    icon: <MoneyIcon />,
    color: "#4caf50",
    bg: "linear-gradient(135deg,#4caf50 30%,#66bb6a 100%)",
  },
  {
    label: "Tổng Vé Đã Bán",
    value: revenueStats?.totalTicketsSold.toLocaleString("vi-VN") || "0",
    icon: <TicketIcon />,
    color: "#2196f3",
    bg: "linear-gradient(135deg,#2196f3 30%,#42a5f5 100%)",
  },
  {
    label: "Vé Đã Sử Dụng",
    value: revenueStats?.ticketsByStatus?.used?.toLocaleString("vi-VN") || "0",
    icon: <TrendingUpIcon />,
    color: "#ff9800",
    bg: "linear-gradient(135deg,#ff9800 30%,#ffb74d 100%)",
  },
  {
    label: "Vé Chưa Sử Dụng",
    value:
      revenueStats?.ticketsByStatus?.unused?.toLocaleString("vi-VN") || "0",
    icon: <ChartIcon />,
    color: "#9c27b0",
    bg: "linear-gradient(135deg,#9c27b0 30%,#ba68c8 100%)",
  },
];

const getStatusLabel = (status: string) => {
  switch (status) {
    case "unused":
      return "Chưa sử dụng";
    case "used":
      return "Đã sử dụng";
    case "expired":
      return "Hết hạn";
    case "refunded":
      return "Đã hoàn tiền";
    default:
      return status;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "daily1":
      return "Vé 1 ngày";
    case "daily3":
      return "Vé 3 ngày";
    case "single":
      return "Vé lượt";
    case "monthly":
      return "Vé tháng";
    case "HSSV":
      return "Vé HSSV";
    default:
      return type;
  }
};

const Revenue: React.FC = () => {
  const theme = useTheme();
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const stats = getStatsConfig(revenueStats);

  useEffect(() => {
    loadRevenueStats();
  }, []);

  const loadRevenueStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await getRevenueStats();
      setRevenueStats(stats);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Không thể tải dữ liệu doanh thu. Vui lòng thử lại.");
      console.error("Error loading revenue stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !revenueStats) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="text" width={200} height={24} sx={{ mt: 1 }} />
        </Box>

        {/* Stats Cards Skeleton */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(4, 1fr)",
            },
            gap: 3,
            mb: 4,
          }}
        >
          {[...Array(4)].map((_, index) => (
            <Card
              key={index}
              sx={{
                height: 180,
                borderRadius: 4,
                boxShadow: "0 4px 24px #1976d222",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Skeleton
                    variant="circular"
                    width={48}
                    height={48}
                    sx={{ mr: 2 }}
                  />
                  <Skeleton variant="text" width={120} height={24} />
                </Box>
                <Skeleton variant="text" width={160} height={40} />
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Charts Skeleton */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          {[...Array(2)].map((_, index) => (
            <Card
              key={index}
              sx={{
                borderRadius: 4,
                p: 3,
                minHeight: 400,
                boxShadow: "0 4px 24px #1976d222",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Skeleton
                  variant="circular"
                  width={24}
                  height={24}
                  sx={{ mr: 2 }}
                />
                <Skeleton variant="text" width={200} height={32} />
              </Box>
              <Stack spacing={2}>
                {[...Array(5)].map((_, idx) => (
                  <Box key={idx}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Skeleton variant="text" width={100} />
                      <Skeleton variant="text" width={80} />
                    </Box>
                    <Skeleton
                      variant="rectangular"
                      height={8}
                      sx={{ borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </Stack>
            </Card>
          ))}
        </Box>

        {/* Summary Section Skeleton */}
        <Card
          sx={{
            mt: 3,
            borderRadius: 4,
            p: 3,
            boxShadow: "0 4px 24px #1976d222",
          }}
        >
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 3,
            }}
          >
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} variant="text" width="100%" height={24} />
            ))}
          </Box>
        </Card>
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
            <Button color="inherit" size="small" onClick={loadRevenueStats}>
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
            Thống Kê Doanh Thu
          </Typography>
          {lastUpdated && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              Cập nhật lần cuối: {lastUpdated.toLocaleString("vi-VN")}
            </Typography>
          )}
        </Box>
        <Tooltip title="Làm mới dữ liệu">
          <IconButton
            onClick={loadRevenueStats}
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

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 4,
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
                    fontSize: { xs: 28, sm: 32, md: 36 },
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Charts Section */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        {/* Tickets by Status */}
        <Card
          sx={{
            borderRadius: 4,
            p: 3,
            minHeight: 400,
            boxShadow: "0 4px 24px #1976d222",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <PieChartIcon sx={{ mr: 2, color: "primary.main" }} />
            <Typography variant="h6" fontWeight={700}>
              Phân Bổ Theo Trạng Thái
            </Typography>
          </Box>

          {revenueStats?.ticketsByStatus &&
          Object.keys(revenueStats.ticketsByStatus).length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {Object.entries(revenueStats.ticketsByStatus).map(
                ([status, count]) => {
                  const percentage =
                    revenueStats.totalTicketsSold > 0
                      ? ((count / revenueStats.totalTicketsSold) * 100).toFixed(
                          1
                        )
                      : "0";

                  return (
                    <Box key={status}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          {getStatusLabel(status)}
                        </Typography>
                        <Tooltip
                          title={`${count.toLocaleString(
                            "vi-VN"
                          )} vé (${percentage}%)`}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {count.toLocaleString("vi-VN")} ({percentage}%)
                          </Typography>
                        </Tooltip>
                      </Box>
                      <Box
                        sx={{
                          height: 8,
                          backgroundColor: "#f0f0f0",
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            height: "100%",
                            backgroundColor:
                              status === "used"
                                ? "#4caf50"
                                : status === "unused"
                                ? "#2196f3"
                                : status === "expired"
                                ? "#f44336"
                                : "#ff9800",
                            width: `${percentage}%`,
                            transition: "width 0.3s ease",
                          }}
                        />
                      </Box>
                    </Box>
                  );
                }
              )}
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 300,
                color: "text.secondary",
              }}
            >
              <PieChartIcon sx={{ fontSize: 64, mb: 2 }} />
              <Typography>Chưa có dữ liệu thống kê</Typography>
            </Box>
          )}
        </Card>

        {/* Tickets by Type */}
        <Card
          sx={{
            borderRadius: 4,
            p: 3,
            minHeight: 400,
            boxShadow: "0 4px 24px #1976d222",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <BarChartIcon sx={{ mr: 2, color: "primary.main" }} />
            <Typography variant="h6" fontWeight={700}>
              Phân Bổ Theo Loại Vé
            </Typography>
          </Box>

          {revenueStats?.ticketsByType &&
          Object.keys(revenueStats.ticketsByType).length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {Object.entries(revenueStats.ticketsByType).map(
                ([type, count]) => {
                  const percentage =
                    revenueStats.totalTicketsSold > 0
                      ? ((count / revenueStats.totalTicketsSold) * 100).toFixed(
                          1
                        )
                      : "0";

                  return (
                    <Box key={type}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          {getTypeLabel(type)}
                        </Typography>
                        <Tooltip
                          title={`${count.toLocaleString(
                            "vi-VN"
                          )} vé (${percentage}%)`}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {count.toLocaleString("vi-VN")} ({percentage}%)
                          </Typography>
                        </Tooltip>
                      </Box>
                      <Box
                        sx={{
                          height: 8,
                          backgroundColor: "#f0f0f0",
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            height: "100%",
                            backgroundColor:
                              type === "daily1"
                                ? "#4caf50"
                                : type === "single"
                                ? "#2196f3"
                                : type === "monthly"
                                ? "#ff9800"
                                : type === "HSSV"
                                ? "#9c27b0"
                                : "#607d8b",
                            width: `${percentage}%`,
                            transition: "width 0.3s ease",
                          }}
                        />
                      </Box>
                    </Box>
                  );
                }
              )}
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 300,
                color: "text.secondary",
              }}
            >
              <BarChartIcon sx={{ fontSize: 64, mb: 2 }} />
              <Typography>Chưa có dữ liệu thống kê</Typography>
            </Box>
          )}
        </Card>
      </Box>

      {/* Summary Section */}
      {revenueStats && (
        <Card
          sx={{
            mt: 3,
            borderRadius: 4,
            p: 3,
            boxShadow: "0 4px 24px #1976d222",
          }}
        >
          <Typography variant="h6" fontWeight={700} mb={2}>
            Tóm Tắt Doanh Thu
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 3,
            }}
          >
            <Box>
              <Tooltip title="Tỷ lệ vé đã được sử dụng trên tổng số vé">
                <Typography variant="body1" gutterBottom>
                  <strong>Tỷ lệ sử dụng vé:</strong>{" "}
                  {revenueStats.totalTicketsSold > 0
                    ? (
                        ((revenueStats.ticketsByStatus.used || 0) /
                          revenueStats.totalTicketsSold) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %
                </Typography>
              </Tooltip>
              <Tooltip title="Doanh thu trung bình cho mỗi vé đã bán">
                <Typography variant="body1" gutterBottom>
                  <strong>Doanh thu trung bình/vé:</strong>{" "}
                  {revenueStats.totalTicketsSold > 0
                    ? Math.round(
                        revenueStats.totalRevenue /
                          revenueStats.totalTicketsSold
                      ).toLocaleString("vi-VN")
                    : "0"}
                  đ
                </Typography>
              </Tooltip>
            </Box>
            <Box>
              <Tooltip title="Loại vé có số lượng bán ra nhiều nhất">
                <Typography variant="body1" gutterBottom>
                  <strong>Loại vé phổ biến nhất:</strong>{" "}
                  {Object.entries(revenueStats.ticketsByType).length > 0
                    ? getTypeLabel(
                        Object.entries(revenueStats.ticketsByType).reduce(
                          (a, b) => (a[1] > b[1] ? a : b)
                        )[0]
                      )
                    : "N/A"}
                </Typography>
              </Tooltip>
              <Tooltip title="Số lượng vé chưa được sử dụng">
                <Typography variant="body1" gutterBottom>
                  <strong>Tổng vé chưa sử dụng:</strong>{" "}
                  {(revenueStats.ticketsByStatus.unused || 0).toLocaleString(
                    "vi-VN"
                  )}{" "}
                  vé
                </Typography>
              </Tooltip>
            </Box>
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default Revenue;
