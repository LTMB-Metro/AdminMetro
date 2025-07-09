import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  Stack,
  Card,
  CardContent,
  Snackbar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Settings as SettingsIcon,
  Train as TrainIcon,
  MonetizationOn as MoneyIcon,
  Calculate as CalculateIcon,
} from "@mui/icons-material";
import { priceSettingService } from "../services/priceSettingService";
import { PriceSetting } from "../models/PriceSetting";

const PriceSettings: React.FC = () => {
  const [priceSetting, setPriceSetting] = useState<PriceSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    original_grap: 3,
    price: 6000,
    extra_price_per_station: 1000,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    loadPriceSetting();
  }, []);

  const loadPriceSetting = async () => {
    try {
      setLoading(true);
      const data = await priceSettingService.getCurrentPriceSetting();
      setPriceSetting(data);
      setError(null);
    } catch (err) {
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      console.error("Error loading price setting:", err);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = () => {
    if (priceSetting) {
      setFormData({
        name: priceSetting.name,
        original_grap: priceSetting.original_grap,
        price: priceSetting.price,
        extra_price_per_station: priceSetting.extra_price_per_station,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    try {
      await priceSettingService.updatePriceSetting(formData);
      showSnackbar("Cập nhật cài đặt giá thành công", "success");
      handleCloseDialog();
      loadPriceSetting();
    } catch (err) {
      setError("Không thể lưu cài đặt giá. Vui lòng thử lại.");
      console.error("Error saving price setting:", err);
      showSnackbar("Lỗi khi lưu cài đặt giá", "error");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Cài Đặt Giá Vé</Typography>
        {priceSetting && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleOpenDialog}
          >
            Chỉnh Sửa Cài Đặt
          </Button>
        )}
      </Box>

      {/* Summary Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 3,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <TrainIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6">Trạm Cơ Bản</Typography>
            </Box>
            <Typography variant="h4" color="primary.main">
              {priceSetting ? priceSetting.original_grap : 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              trạm đầu tiên
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <MoneyIcon sx={{ mr: 1, color: "success.main" }} />
              <Typography variant="h6">Giá Cơ Bản</Typography>
            </Box>
            <Typography variant="h4" color="success.main">
              {priceSetting ? formatCurrency(priceSetting.price) : "0đ"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              cho {priceSetting ? priceSetting.original_grap : 0} trạm đầu
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <CalculateIcon sx={{ mr: 1, color: "warning.main" }} />
              <Typography variant="h6">Giá Thêm</Typography>
            </Box>
            <Typography variant="h4" color="warning.main">
              +
              {priceSetting
                ? formatCurrency(priceSetting.extra_price_per_station)
                : "0đ"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              mỗi trạm vượt quá
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Current Setting Display */}
      {priceSetting && (
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" fontWeight="600" color="primary.main">
              Cài Đặt Hiện Tại
            </Typography>
            <Tooltip title="Chỉnh sửa cài đặt">
              <IconButton
                onClick={handleOpenDialog}
                color="primary"
                sx={{
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                  width: 48,
                  height: 48,
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  backgroundColor: "primary.main",
                  borderRadius: "50%",
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 3,
                }}
              >
                <SettingsIcon sx={{ color: "white", fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="600" color="text.primary">
                  {priceSetting.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cấu hình tính giá vé metro
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 3,
              mb: 3,
            }}
          >
            <Box
              sx={{
                backgroundColor: "#f8f9ff",
                borderRadius: 2,
                p: 3,
                border: "1px solid #e3f2fd",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <TrainIcon
                  sx={{ color: "primary.main", mr: 1, fontSize: 20 }}
                />
                <Typography
                  variant="subtitle2"
                  fontWeight="600"
                  color="primary.main"
                >
                  Trạm Cơ Bản
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight="700" color="text.primary">
                {priceSetting.original_grap} trạm đầu tiên
              </Typography>
              <Typography
                variant="h5"
                fontWeight="700"
                color="success.main"
                sx={{ mt: 1 }}
              >
                {formatCurrency(priceSetting.price)}
              </Typography>
            </Box>

            <Box
              sx={{
                backgroundColor: "#fff8e1",
                borderRadius: 2,
                p: 3,
                border: "1px solid #ffecb3",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <CalculateIcon
                  sx={{ color: "warning.main", mr: 1, fontSize: 20 }}
                />
                <Typography
                  variant="subtitle2"
                  fontWeight="600"
                  color="warning.main"
                >
                  Giá Thêm
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight="700" color="text.primary">
                Mỗi trạm vượt quá
              </Typography>
              <Typography
                variant="h5"
                fontWeight="700"
                color="warning.main"
                sx={{ mt: 1 }}
              >
                +{formatCurrency(priceSetting.extra_price_per_station)}
              </Typography>
            </Box>
          </Box>

          {priceSetting.updated_at && (
            <Box
              sx={{
                borderTop: "1px solid #f0f0f0",
                pt: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.875rem" }}
              >
                <strong>Cập nhật lần cuối:</strong>{" "}
                {priceSetting.updated_at.toLocaleString("vi-VN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chỉnh Sửa Cài Đặt Giá</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Tên Cài Đặt"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label="Số Trạm Cơ Bản"
                type="number"
                value={formData.original_grap}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    original_grap: Math.max(0, parseInt(e.target.value) || 0),
                  })
                }
                inputProps={{ min: 0 }}
                required
              />
              <TextField
                fullWidth
                label="Giá Cơ Bản"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: Math.max(0, parseInt(e.target.value) || 0),
                  })
                }
                inputProps={{ min: 0 }}
                required
              />
            </Box>

            <TextField
              fullWidth
              label="Giá Mỗi Trạm Thêm"
              type="number"
              value={formData.extra_price_per_station}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  extra_price_per_station: Math.max(
                    0,
                    parseInt(e.target.value) || 0
                  ),
                })
              }
              inputProps={{ min: 0 }}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            Cập Nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PriceSettings;
