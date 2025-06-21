import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Tooltip,
  Skeleton,
  Snackbar,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  QrCode as QrCodeIcon,
  Train as TrainIcon,
  Schedule as ScheduleIcon,
  AccountCircle as AccountIcon,
  FilterList as FilterIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { Timestamp } from "firebase/firestore";
import {
  fetchUserTickets,
  fetchUserTicketsByStatus,
  updateUserTicket,
  deleteUserTicket,
  UserTicket,
} from "../services/userTicketService";

const getStatusColor = (status: UserTicket["status"]) => {
  switch (status) {
    case "unused":
      return { bg: "#e8f5e9", text: "#2e7d32", label: "Chưa sử dụng" };
    case "active":
      return { bg: "#e3f2fd", text: "#1976d2", label: "Đang sử dụng" };
    case "expired":
      return { bg: "#ffebee", text: "#c62828", label: "Hết hạn" };
    case "refunded":
      return { bg: "#fff3e0", text: "#ef6c00", label: "Đã hoàn tiền" };
    default:
      return { bg: "#f5f5f5", text: "#616161", label: "Không xác định" };
  }
};

const formatDate = (timestamp: Timestamp | string) => {
  if (!timestamp) return "N/A";

  try {
    if (typeof timestamp === "string") {
      return new Date(timestamp).toLocaleString("vi-VN");
    }
    // Firebase Timestamp
    return timestamp.toDate().toLocaleString("vi-VN");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "N/A";
  }
};

const UserTickets: React.FC = () => {
  const [userTickets, setUserTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTicket, setEditingTicket] = useState<UserTicket | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<UserTicket | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Load user tickets on component mount
  useEffect(() => {
    loadUserTickets();
    // eslint-disable-next-line
  }, [statusFilter]);

  // Debounce search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(0);
    }, 300);
    // eslint-disable-next-line
  }, [searchQuery]);

  const loadUserTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      let ticketsData: UserTicket[];

      if (statusFilter === "all") {
        ticketsData = await fetchUserTickets();
      } else {
        ticketsData = await fetchUserTicketsByStatus(
          statusFilter as UserTicket["status"]
        );
      }

      setUserTickets(ticketsData);
    } catch (err) {
      console.error("Error loading user tickets:", err);

      // More specific error messages
      let errorMessage = "Không thể tải dữ liệu vé. ";

      if (err instanceof Error) {
        if (err.message.includes("index")) {
          errorMessage +=
            "Lỗi database index. Vui lòng liên hệ admin để cấu hình index cho Firestore.";
        } else if (err.message.includes("permission")) {
          errorMessage += "Không có quyền truy cập dữ liệu.";
        } else if (err.message.includes("network")) {
          errorMessage += "Lỗi kết nối mạng. Vui lòng kiểm tra internet.";
        } else {
          errorMessage += `Chi tiết lỗi: ${err.message}`;
        }
      } else {
        errorMessage += "Vui lòng thử lại hoặc liên hệ admin.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (ticket: UserTicket) => {
    setEditingTicket(ticket);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTicket(null);
  };

  const handleUpdateTicketStatus = async (
    id: string,
    newStatus: UserTicket["status"]
  ) => {
    try {
      await updateUserTicket(id, { status: newStatus });
      await loadUserTickets();

      if (editingTicket && editingTicket.id === id) {
        setEditingTicket({
          ...editingTicket,
          status: newStatus,
        });
      }
    } catch (err) {
      setError("Không thể cập nhật trạng thái vé. Vui lòng thử lại.");
      console.error("Error updating ticket status:", err);
    }
  };

  const handleDeleteTicket = (id: string) => {
    const ticket = userTickets.find((t) => t.id === id) || null;
    setTicketToDelete(ticket);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTicket = async () => {
    if (!ticketToDelete) return;
    try {
      await deleteUserTicket(ticketToDelete.id);
      setSuccessMessage("Xóa vé thành công!");
      await loadUserTickets();
    } catch (err) {
      setError("Không thể xóa vé. Vui lòng thử lại.");
      console.error("Error deleting ticket:", err);
    } finally {
      setDeleteDialogOpen(false);
      setTicketToDelete(null);
    }
  };

  const cancelDeleteTicket = () => {
    setDeleteDialogOpen(false);
    setTicketToDelete(null);
  };

  const filteredTickets = userTickets.filter(
    (ticket) =>
      (ticket.ticket_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (ticket.user_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (ticket.user_email || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (ticket.qr_code_content || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (ticket.start_station_code || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (ticket.end_station_code || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Thông Tin Vé</TableCell>
              <TableCell>Người Dùng</TableCell>
              <TableCell>Hành Trình</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Thời Gian Đặt</TableCell>
              <TableCell>Thời Hạn</TableCell>
              <TableCell>Trạng Thái</TableCell>
              <TableCell align="right">Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Skeleton variant="text" width={120} />
                    <Skeleton variant="text" width={80} />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Skeleton variant="text" width={100} />
                    <Skeleton variant="text" width={150} />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Skeleton variant="text" width={80} />
                    <Skeleton variant="text" width={80} />
                  </Box>
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={60} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={100} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={60} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="rectangular" width={80} height={24} />
                </TableCell>
                <TableCell align="right">
                  <Box
                    sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                  >
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setError(null);
                loadUserTickets();
              }}
            >
              Thử Lại
            </Button>
          }
        >
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
        <Typography variant="h4">Quản Lý Vé Người Dùng</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Lọc theo trạng thái</InputLabel>
            <Select
              value={statusFilter}
              label="Lọc theo trạng thái"
              onChange={(e) => setStatusFilter(e.target.value)}
              startAdornment={<FilterIcon sx={{ mr: 1, fontSize: 20 }} />}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="unused">Chưa sử dụng</MenuItem>
              <MenuItem value="active">Đang sử dụng</MenuItem>
              <MenuItem value="expired">Hết hạn</MenuItem>
              <MenuItem value="refunded">Đã hoàn tiền</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm theo tên vé, tên người dùng, email, QR code, trạm đi/đến..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Thông Tin Vé</TableCell>
              <TableCell>Người Dùng</TableCell>
              <TableCell>Hành Trình</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Thời Gian Đặt</TableCell>
              <TableCell>Thời Hạn</TableCell>
              <TableCell>Trạng Thái</TableCell>
              <TableCell align="right">Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTickets
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((ticket) => {
                const statusColors = getStatusColor(ticket.status);
                return (
                  <TableRow key={ticket.id} hover>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <TrainIcon
                            sx={{ mr: 1, color: "primary.main", fontSize: 20 }}
                          />
                          <Typography variant="body2" fontWeight={600}>
                            {ticket.ticket_name || "N/A"}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Loại: {ticket.ticket_type || "N/A"}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mt: 0.5,
                          }}
                        >
                          <QrCodeIcon
                            sx={{
                              mr: 0.5,
                              fontSize: 16,
                              color: "text.secondary",
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {ticket.qr_code_content || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <AccountIcon
                            sx={{
                              mr: 1,
                              color: "text.secondary",
                              fontSize: 20,
                            }}
                          />
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color={
                              !ticket.user_name ||
                              ticket.user_name.includes("không")
                                ? "error.main"
                                : "text.primary"
                            }
                          >
                            {ticket.user_name || "Không có tên"}
                          </Typography>
                        </Box>
                        {ticket.user_email && (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <EmailIcon
                              sx={{
                                mr: 1,
                                color: "text.secondary",
                                fontSize: 16,
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {ticket.user_email}
                            </Typography>
                          </Box>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          ID: {ticket.user_id?.slice(0, 8)}...
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        <Typography variant="body2">
                          <strong>Từ:</strong>{" "}
                          {ticket.start_station_code || "N/A"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Đến:</strong>{" "}
                          {ticket.end_station_code || "N/A"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="primary.main"
                      >
                        {ticket.price?.toLocaleString("vi-VN")}đ
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <ScheduleIcon
                          sx={{
                            mr: 0.5,
                            fontSize: 16,
                            color: "text.secondary",
                          }}
                        />
                        <Typography variant="body2">
                          {formatDate(ticket.booking_time)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {ticket.duration
                          ? `${ticket.duration} ngày`
                          : "Không giới hạn"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusColors.label}
                        size="small"
                        sx={{
                          backgroundColor: statusColors.bg,
                          color: statusColors.text,
                          fontWeight: "medium",
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Xem chi tiết vé">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(ticket)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {ticket.qr_code_content && (
                        <Tooltip title="Xem QR Code">
                          <IconButton size="small" sx={{ mr: 1 }}>
                            <QrCodeIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Xóa vé">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTicket(ticket.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredTickets.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} trong tổng số ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </TableContainer>

      {/* Ticket Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi Tiết Vé</DialogTitle>
        <DialogContent>
          {editingTicket && (
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Thông Tin Vé
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography>
                      <strong>Tên vé:</strong> {editingTicket.ticket_name}
                    </Typography>
                    <Typography>
                      <strong>Loại vé:</strong> {editingTicket.ticket_type}
                    </Typography>
                    <Typography>
                      <strong>Giá:</strong>{" "}
                      {editingTicket.price?.toLocaleString("vi-VN")}đ
                    </Typography>
                    <Typography>
                      <strong>Thời hạn:</strong> {editingTicket.duration} ngày
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Thông Tin Hành Trình
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography>
                      <strong>Trạm đi:</strong>{" "}
                      {editingTicket.start_station_code}
                    </Typography>
                    <Typography>
                      <strong>Trạm đến:</strong>{" "}
                      {editingTicket.end_station_code}
                    </Typography>
                    <Typography>
                      <strong>Thời gian đặt:</strong>{" "}
                      {formatDate(editingTicket.booking_time)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Thông Tin Người Dùng
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography>
                    <strong>Tên người dùng:</strong>{" "}
                    {editingTicket.user_name || "N/A"}
                  </Typography>
                  {editingTicket.user_email && (
                    <Typography>
                      <strong>Email:</strong> {editingTicket.user_email}
                    </Typography>
                  )}
                  <Typography>
                    <strong>ID người dùng:</strong> {editingTicket.user_id}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Thông Tin Khác
                </Typography>
                <Typography>
                  <strong>QR Code:</strong> {editingTicket.qr_code_content}
                </Typography>
                {editingTicket.note && (
                  <Typography sx={{ mt: 1 }}>
                    <strong>Ghi chú:</strong> {editingTicket.note}
                  </Typography>
                )}
                {editingTicket.description && (
                  <Typography sx={{ mt: 1 }}>
                    <strong>Mô tả:</strong> {editingTicket.description}
                  </Typography>
                )}
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Cập Nhật Trạng Thái
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {["unused", "used", "expired", "refunded"].map((status) => (
                    <Button
                      key={status}
                      variant={
                        editingTicket.status === status
                          ? "contained"
                          : "outlined"
                      }
                      size="small"
                      onClick={() =>
                        handleUpdateTicketStatus(
                          editingTicket.id,
                          status as UserTicket["status"]
                        )
                      }
                    >
                      {getStatusColor(status as UserTicket["status"]).label}
                    </Button>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa vé */}
      <Dialog open={deleteDialogOpen} onClose={cancelDeleteTicket}>
        <DialogTitle>Xác nhận xóa vé</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa vé <b>{ticketToDelete?.ticket_name}</b>{" "}
            không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteTicket}>Hủy</Button>
          <Button
            onClick={confirmDeleteTicket}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo thành công */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />
    </Box>
  );
};

export default UserTickets;
