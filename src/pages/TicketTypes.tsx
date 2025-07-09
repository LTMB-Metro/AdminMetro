import React, { useState, useEffect } from "react";
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
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ConfirmationNumber as TicketIcon,
} from "@mui/icons-material";
import {
  fetchTicketTypes,
  addTicketType,
  updateTicketType,
  deleteTicketType,
  TicketType,
} from "../services/ticketTypeService";

const getCategoryColor = (categories: string) => {
  switch (categories) {
    case "student":
      return { bg: "#e3f2fd", text: "#1565c0", label: "Học Sinh - Sinh Viên" };
    case "normal":
      return { bg: "#e8f5e9", text: "#2e7d32", label: "Thường" };
    default:
      return { bg: "#f5f5f5", text: "#616161", label: "Khác" };
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "single":
      return { bg: "#e3f2fd", text: "#1565c0", label: "Vé Lượt" };
    case "daily1":
      return { bg: "#e8f5e9", text: "#2e7d32", label: "Vé 1 Ngày" };
    case "daily3":
      return { bg: "#fff3e0", text: "#ef6c00", label: "Vé 3 Ngày" };
    case "monthly":
      return { bg: "#f3e5f5", text: "#7b1fa2", label: "Vé Tháng" };
    case "HSSV":
      return { bg: "#fce4ec", text: "#ad1457", label: "Vé HSSV" };
    default:
      return { bg: "#f5f5f5", text: "#616161", label: type || "Khác" };
  }
};

const TicketTypes: React.FC = () => {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTicketType, setEditingTicketType] = useState<TicketType | null>(
    null
  );
  const [formData, setFormData] = useState({
    ticket_name: "",
    type: "",
    price: 0,
    categories: "normal",
    duration: 0,
    note: "",
    description: "",
    status: "active" as "active" | "inactive",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ticketTypeToDelete, setTicketTypeToDelete] = useState<string | null>(
    null
  );

  // Load ticket types on component mount
  useEffect(() => {
    loadTicketTypes();
  }, []);

  const loadTicketTypes = async () => {
    try {
      setLoading(true);
      const ticketTypesData = await fetchTicketTypes();
      setTicketTypes(ticketTypesData);
      setError(null);
    } catch (err) {
      setError("Không thể tải dữ liệu loại vé. Vui lòng thử lại.");
      console.error("Error loading ticket types:", err);
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

  const handleOpenDialog = (ticketType?: TicketType) => {
    if (ticketType) {
      setEditingTicketType(ticketType);
      setFormData({
        ticket_name: ticketType.ticket_name || "",
        type: ticketType.type || "",
        price: ticketType.price || 0,
        categories: ticketType.categories || "normal",
        duration: ticketType.duration || 0,
        note: ticketType.note || "",
        description: ticketType.description || "",
        status: ticketType.status || "active",
      });
    } else {
      setEditingTicketType(null);
      setFormData({
        ticket_name: "",
        type: "",
        price: 0,
        categories: "normal",
        duration: 0,
        note: "",
        description: "",
        status: "active",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTicketType(null);
  };

  const handleSaveTicketType = async () => {
    try {
      if (editingTicketType) {
        // Update existing ticket type
        await updateTicketType(editingTicketType.id, formData);
      } else {
        // Add new ticket type
        await addTicketType(formData);
      }
      await loadTicketTypes();
      handleCloseDialog();
    } catch (err) {
      setError("Không thể lưu loại vé. Vui lòng thử lại.");
      console.error("Error saving ticket type:", err);
    }
  };

  const handleDeleteClick = (id: string) => {
    setTicketTypeToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (ticketTypeToDelete) {
      try {
        await deleteTicketType(ticketTypeToDelete);
        await loadTicketTypes();
        setDeleteConfirmOpen(false);
        setTicketTypeToDelete(null);
      } catch (err) {
        setError("Không thể xóa loại vé. Vui lòng thử lại.");
        console.error("Error deleting ticket type:", err);
      }
    }
  };

  const filteredTicketTypes = ticketTypes.filter(
    (ticket) =>
      (ticket.ticket_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (ticket.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (ticket.type || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
        </Box>
        <Paper sx={{ mb: 3, p: 2 }}>
          <Skeleton variant="rectangular" height={56} />
        </Paper>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {[...Array(8)].map((_, index) => (
                  <TableCell key={index}>
                    <Skeleton variant="text" />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(5)].map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {[...Array(8)].map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

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
        <Typography variant="h4">Quản Lý Loại Vé</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm Loại Vé
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm loại vé..."
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
              <TableCell>Tên Vé</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Phân Loại</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Thời Hạn</TableCell>
              <TableCell>Trạng Thái</TableCell>
              <TableCell>Mô Tả</TableCell>
              <TableCell align="right">Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTicketTypes
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((ticket) => {
                const typeColors = getTypeColor(ticket.type);
                const categoryColors = getCategoryColor(ticket.categories);
                return (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <TicketIcon sx={{ mr: 1, color: "primary.main" }} />
                        {ticket.ticket_name || "N/A"}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={typeColors.label}
                        size="small"
                        sx={{
                          backgroundColor: typeColors.bg,
                          color: typeColors.text,
                          fontWeight: "medium",
                          cursor: "default",
                          pointerEvents: "none",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={categoryColors.label}
                        size="small"
                        sx={{
                          backgroundColor: categoryColors.bg,
                          color: categoryColors.text,
                          fontWeight: "medium",
                          cursor: "default",
                          pointerEvents: "none",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {ticket.price?.toLocaleString("vi-VN")}đ
                    </TableCell>
                    <TableCell>
                      {ticket.duration
                        ? `${ticket.duration} ngày`
                        : "Không giới hạn"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          ticket.status === "active" ? "Hoạt động" : "Ngưng"
                        }
                        size="small"
                        sx={{
                          backgroundColor:
                            ticket.status === "active" ? "#e8f5e9" : "#ffebee",
                          color:
                            ticket.status === "active" ? "#2e7d32" : "#c62828",
                          fontWeight: "medium",
                          cursor: "default",
                          pointerEvents: "none",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {ticket.description || ticket.note || "N/A"}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(ticket)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(ticket.id)}
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
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTicketTypes.length}
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

      {/* Add/Edit Ticket Type Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTicketType ? "Chỉnh Sửa Loại Vé" : "Thêm Loại Vé Mới"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label="Tên Vé"
                value={formData.ticket_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, ticket_name: e.target.value })
                }
                required
              />
              <TextField
                fullWidth
                label="Loại"
                value={formData.type || ""}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                required
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label="Giá (VNĐ)"
                type="number"
                value={formData.price || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: Math.max(0, parseInt(e.target.value) || 0),
                  })
                }
                inputProps={{ min: 0 }}
                required
              />
              <TextField
                fullWidth
                label="Thời Hạn (ngày)"
                type="number"
                value={formData.duration || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: Math.max(0, parseInt(e.target.value) || 0),
                  })
                }
                inputProps={{ min: 0 }}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Phân Loại</InputLabel>
                <Select
                  value={formData.categories}
                  label="Phân Loại"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categories: e.target.value,
                    })
                  }
                >
                  <MenuItem value="normal">Thường</MenuItem>
                  <MenuItem value="student">Học Sinh - Sinh Viên</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Trạng Thái</InputLabel>
                <Select
                  value={formData.status}
                  label="Trạng Thái"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "active" | "inactive",
                    })
                  }
                >
                  <MenuItem value="active">Hoạt động</MenuItem>
                  <MenuItem value="inactive">Ngưng hoạt động</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField
              fullWidth
              label="Ghi Chú"
              multiline
              rows={2}
              value={formData.note || ""}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Mô Tả"
              multiline
              rows={3}
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSaveTicketType} variant="contained">
            {editingTicketType ? "Cập Nhật" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa loại vé này? Hành động này không thể hoàn
            tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Hủy</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketTypes;
