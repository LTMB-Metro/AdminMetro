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
  LocationOn as LocationIcon,
  Train as TrainIcon,
} from "@mui/icons-material";
import {
  fetchStations,
  addStation,
  updateStation,
  deleteStation,
  Station,
} from "../services/stationService";

const getStatusColor = (status: Station["status"]) => {
  switch (status) {
    case "active":
      return { bg: "#e8f5e9", text: "#2e7d32", label: "Hoạt động" };
    case "maintenance":
      return { bg: "#fff3e0", text: "#ef6c00", label: "Bảo trì" };
    case "inactive":
      return { bg: "#ffebee", text: "#c62828", label: "Ngưng hoạt động" };
    default:
      return { bg: "#f5f5f5", text: "#616161", label: "Không xác định" };
  }
};

const getTypeColor = (type: Station["type"]) => {
  switch (type) {
    case "elevated":
      return { bg: "#e3f2fd", text: "#1976d2", label: "Trên cao" };
    case "underground":
      return { bg: "#f3e5f5", text: "#7b1fa2", label: "Ngầm" };
    default:
      return { bg: "#f5f5f5", text: "#616161", label: "Không xác định" };
  }
};

const Stations: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    station_name: "",
    location: [0, 0] as [number, number] | null,
    order_index: 0,
    status: "active" as Station["status"],
    type: "elevated" as Station["type"],
    zone: "",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [stationToDelete, setStationToDelete] = useState<string | null>(null);

  // Load stations on component mount
  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      const stationsData = await fetchStations();
      setStations(stationsData);
      setError(null);
    } catch (err) {
      setError("Không thể tải dữ liệu trạm. Vui lòng thử lại.");
      console.error("Error loading stations:", err);
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

  const handleOpenDialog = (station?: Station) => {
    if (station) {
      setEditingStation(station);
      setFormData({
        code: station.code || "",
        station_name: station.station_name || "",
        location: station.location || [0, 0],
        order_index: station.order_index || 0,
        status: station.status || "active",
        type: station.type || "elevated",
        zone: station.zone || "",
      });
    } else {
      setEditingStation(null);
      const maxOrderIndex =
        stations.length > 0
          ? Math.max(...stations.map((s) => s.order_index || 0))
          : 0;
      setFormData({
        code: "",
        station_name: "",
        location: [0, 0],
        order_index: maxOrderIndex + 1,
        status: "active",
        type: "elevated",
        zone: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStation(null);
  };

  const handleSaveStation = async () => {
    try {
      if (editingStation) {
        // Update existing station
        await updateStation(editingStation.id, formData);
      } else {
        // Add new station
        await addStation(formData);
      }
      await loadStations();
      handleCloseDialog();
    } catch (err) {
      setError("Không thể lưu trạm. Vui lòng thử lại.");
      console.error("Error saving station:", err);
    }
  };

  const handleDeleteClick = (id: string) => {
    setStationToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (stationToDelete) {
      try {
        await deleteStation(stationToDelete);
        await loadStations();
        setDeleteConfirmOpen(false);
        setStationToDelete(null);
      } catch (err) {
        setError("Không thể xóa trạm. Vui lòng thử lại.");
        console.error("Error deleting station:", err);
      }
    }
  };

  const filteredStations = stations.filter(
    (station) =>
      (station.code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (station.station_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (station.zone || "").toLowerCase().includes(searchQuery.toLowerCase())
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
        <Typography variant="h4">Quản Lý Trạm</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm Trạm
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm trạm theo tên, mã hoặc tuyến..."
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
              <TableCell>Mã Trạm</TableCell>
              <TableCell>Tên Trạm</TableCell>
              <TableCell>Vị Trí</TableCell>
              <TableCell>Thứ Tự</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Tuyến</TableCell>
              <TableCell>Trạng Thái</TableCell>
              <TableCell align="right">Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStations
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((station) => {
                const statusColors = getStatusColor(station.status);
                const typeColors = getTypeColor(station.type);
                return (
                  <TableRow key={station.id}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <TrainIcon sx={{ mr: 1, color: "primary.main" }} />
                        {station.code || "N/A"}
                      </Box>
                    </TableCell>
                    <TableCell>{station.station_name || "N/A"}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <LocationIcon
                          sx={{ mr: 1, fontSize: 16, color: "text.secondary" }}
                        />
                        {station.location &&
                        Array.isArray(station.location) &&
                        station.location.length >= 2
                          ? `${station.location[0].toFixed(
                              4
                            )}, ${station.location[1].toFixed(4)}`
                          : "Chưa có vị trí"}
                      </Box>
                    </TableCell>
                    <TableCell>{station.order_index || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={typeColors.label}
                        size="small"
                        sx={{
                          backgroundColor: typeColors.bg,
                          color: typeColors.text,
                          fontWeight: "medium",
                        }}
                      />
                    </TableCell>
                    <TableCell>{station.zone || "N/A"}</TableCell>
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
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(station)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(station.id)}
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
          count={filteredStations.length}
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

      {/* Add/Edit Station Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingStation ? "Chỉnh Sửa Trạm" : "Thêm Trạm Mới"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label="Mã Trạm"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required
              />
              <TextField
                fullWidth
                label="Thứ Tự"
                type="number"
                value={formData.order_index}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order_index: parseInt(e.target.value),
                  })
                }
                required
              />
            </Box>
            <TextField
              fullWidth
              label="Tên Trạm"
              value={formData.station_name}
              onChange={(e) =>
                setFormData({ ...formData, station_name: e.target.value })
              }
              required
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label="Vĩ Độ"
                type="number"
                value={(formData.location && formData.location[0]) || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: [
                      parseFloat(e.target.value) || 0,
                      (formData.location && formData.location[1]) || 0,
                    ],
                  })
                }
                inputProps={{ step: "0.000001" }}
                required
              />
              <TextField
                fullWidth
                label="Kinh Độ"
                type="number"
                value={(formData.location && formData.location[1]) || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: [
                      (formData.location && formData.location[0]) || 0,
                      parseFloat(e.target.value) || 0,
                    ],
                  })
                }
                inputProps={{ step: "0.000001" }}
                required
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Loại Trạm</InputLabel>
                <Select
                  value={formData.type}
                  label="Loại Trạm"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as Station["type"],
                    })
                  }
                >
                  <MenuItem value="elevated">Trên cao</MenuItem>
                  <MenuItem value="underground">Ngầm</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Tuyến"
                value={formData.zone}
                onChange={(e) =>
                  setFormData({ ...formData, zone: e.target.value })
                }
                required
              />
              <FormControl fullWidth>
                <InputLabel>Trạng Thái</InputLabel>
                <Select
                  value={formData.status}
                  label="Trạng Thái"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as Station["status"],
                    })
                  }
                >
                  <MenuItem value="active">Hoạt động</MenuItem>
                  <MenuItem value="maintenance">Bảo trì</MenuItem>
                  <MenuItem value="inactive">Ngưng hoạt động</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSaveStation} variant="contained">
            {editingStation ? "Cập Nhật" : "Thêm"}
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
            Bạn có chắc chắn muốn xóa trạm này? Hành động này không thể hoàn
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

export default Stations;
