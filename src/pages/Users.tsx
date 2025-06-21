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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Tooltip,
  Snackbar,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import {
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
} from "../services/userService";
import { User } from "../models/User";
import { useSnackbar } from "notistack";

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<"add" | "edit" | null>(null);
  const [formUser, setFormUser] = useState<Partial<User>>({});
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchUsers().then((data) => {
      console.log("Fetched users:", data);
      setUsers(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(0);
    }, 300);
    // eslint-disable-next-line
  }, [searchQuery]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleEdit = () => {
    enqueueSnackbar("Chức năng chỉnh sửa sẽ sớm có!", { variant: "info" });
    handleCloseDialog();
  };

  const handleDelete = () => {
    enqueueSnackbar("Chức năng xóa sẽ sớm có!", { variant: "warning" });
    handleCloseDialog();
  };

  const openAddDialog = () => {
    setEditMode("add");
    setFormUser({
      username: "",
      email: "",
      phonenumber: "",
      role: "user",
      createdAt: new Date().toISOString(),
      photoURL: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setEditMode("edit");
    setFormUser(user);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditMode(null);
    setFormUser({});
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormUser({ ...formUser, [e.target.name]: e.target.value });
  };

  const handleSaveUser = async () => {
    try {
      if (editMode === "add") {
        await addUser(formUser as Omit<User, "id">);
        enqueueSnackbar("Thêm người dùng thành công!", { variant: "success" });
      } else if (editMode === "edit" && formUser.id) {
        await updateUser(formUser.id, formUser);
        enqueueSnackbar("Cập nhật người dùng thành công!", {
          variant: "success",
        });
      }
      fetchUsers().then((data) => setUsers(data));
      handleDialogClose();
    } catch (err) {
      enqueueSnackbar("Có lỗi xảy ra, vui lòng thử lại!", { variant: "error" });
    }
  };

  const handleDeleteUser = async () => {
    if (!confirmDelete) return;
    try {
      await deleteUser(confirmDelete.id);
      setSuccessMessage("Xóa người dùng thành công!");
      fetchUsers().then((data) => setUsers(data));
      setConfirmDelete(null);
    } catch (err) {
      enqueueSnackbar("Có lỗi khi xóa, vui lòng thử lại!", {
        variant: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên Người Dùng</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Số Điện Thoại</TableCell>
              <TableCell>Vai Trò</TableCell>
              <TableCell>Ngày Tạo</TableCell>
              <TableCell align="right">Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="text" width={120} />
                  </Box>
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={180} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={100} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="rectangular" width={80} height={24} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={120} />
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Quản Lý Người Dùng</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAddDialog}
        >
          Thêm người dùng
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm người dùng..."
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
              <TableCell>Tên Người Dùng</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Số Điện Thoại</TableCell>
              <TableCell>Vai Trò</TableCell>
              <TableCell>Ngày Tạo</TableCell>
              <TableCell align="right">Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Không tìm thấy người dùng nào
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PersonIcon color="primary" />
                        {user.username}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <EmailIcon color="action" />
                        {user.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PhoneIcon color="action" />
                        {user.phonenumber}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor:
                            user.role === "admin" ? "#e8f5e9" : "#e3f2fd",
                          color: user.role === "admin" ? "#2e7d32" : "#1565c0",
                        }}
                      >
                        <AdminIcon fontSize="small" />
                        {user.role}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {user.createdAt &&
                        new Date(
                          typeof user.createdAt === "object" &&
                          user.createdAt.seconds
                            ? user.createdAt.seconds * 1000
                            : user.createdAt
                        ).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Chỉnh sửa thông tin">
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(user)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa người dùng">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setConfirmDelete(user);
                            setDeleteDialogOpen(true);
                          }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredUsers.length}
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

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Xác nhận xóa người dùng</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa người dùng{" "}
            <b>{confirmDelete?.username}</b> không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editMode === "add" ? "Thêm người dùng" : "Chỉnh sửa người dùng"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="normal"
            label="Tên người dùng"
            name="username"
            value={formUser.username || ""}
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            margin="normal"
            label="Email"
            name="email"
            value={formUser.email || ""}
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            margin="normal"
            label="Số điện thoại"
            name="phonenumber"
            value={formUser.phonenumber || ""}
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            margin="normal"
            label="Vai trò"
            name="role"
            value={formUser.role || ""}
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            margin="normal"
            label="Ảnh đại diện (URL)"
            name="photoURL"
            value={formUser.photoURL || ""}
            onChange={handleFormChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveUser} variant="contained">
            Lưu
          </Button>
          <Button onClick={handleDialogClose}>Hủy</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
