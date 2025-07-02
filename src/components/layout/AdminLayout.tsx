import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  DirectionsBus as BusIcon,
  ConfirmationNumber as TicketIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  Brightness4,
  Brightness7,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { logoutUser } from "../../services/authService";

const drawerWidth = 240;
const collapsedDrawerWidth = 56;

interface AdminLayoutProps {
  children: React.ReactNode;
  setMode?: (mode: "light" | "dark") => void;
  mode?: "light" | "dark";
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  setMode,
  mode,
}) => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { text: "Trang Chủ", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Người Dùng", icon: <PeopleIcon />, path: "/users" },
    { text: "Quản Lý Trạm", icon: <BusIcon />, path: "/stations" },
    { text: "Loại Vé", icon: <TicketIcon />, path: "/ticket-types" },
    { text: "Vé Người Dùng", icon: <ReceiptIcon />, path: "/user-tickets" },
    { text: "Doanh Thu", icon: <TrendingUpIcon />, path: "/revenue" },
    { text: "Cài Đặt Giá", icon: <SettingsIcon />, path: "/price-settings" },
  ];

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
      setAnchorEl(null);
    }
  };

  const logoUrl = "/images/logo.jpg";

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(90deg, #0d47a1 0%, #1976d2 100%)`
              : `linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)`,
          color: "#fff",
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          transition: theme.transitions.create(["margin-left", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ml: 0,
          width: "100%",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ marginRight: 3 }}
          >
            <MenuIcon fontSize="large" />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <img
              src={logoUrl}
              alt="Metro Pass"
              style={{
                width: 40,
                height: 40,
                marginRight: 12,
                borderRadius: 8,
                boxShadow: "0 2px 8px #0002",
              }}
            />
            <Typography
              variant="h5"
              noWrap
              component="div"
              fontWeight={700}
              letterSpacing={2}
            >
              Metro Pass
            </Typography>
          </Box>
          {setMode && mode && (
            <Tooltip title={mode === "dark" ? "Chuyển sáng" : "Chuyển tối"}>
              <IconButton
                color="inherit"
                onClick={() => setMode(mode === "light" ? "dark" : "light")}
                sx={{ mx: 1 }}
              >
                {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>
          )}

          <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                mr: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#fff" }}
              >
                {user?.username || "Admin"}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.8)" }}
              >
                {user?.role || "admin"}
              </Typography>
            </Box>
            <Tooltip title="Menu người dùng">
              <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
                <Avatar
                  sx={{
                    bgcolor: "#fff",
                    color: "#1976d2",
                    fontWeight: 700,
                    cursor: "pointer",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || "A"}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
            PaperProps={{
              elevation: 8,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={handleUserMenuClose}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user?.username || "Admin"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} disabled={loggingOut}>
              <ListItemIcon>
                {loggingOut ? (
                  <CircularProgress size={20} />
                ) : (
                  <LogoutIcon fontSize="small" />
                )}
              </ListItemIcon>
              <Typography>Đăng xuất</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : collapsedDrawerWidth,
          flexShrink: 0,
          whiteSpace: "nowrap",
          boxSizing: "border-box",
          "& .MuiDrawer-paper": {
            background:
              theme.palette.mode === "dark"
                ? `linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)`
                : `linear-gradient(180deg, #1976d2 0%, #42a5f5 100%)`,
            color: "#fff",
            borderTopRightRadius: 24,
            borderBottomRightRadius: 24,
            boxShadow:
              theme.palette.mode === "dark"
                ? "2px 0 12px rgba(0,0,0,0.5)"
                : "2px 0 12px #1976d233",
            width: open ? drawerWidth : collapsedDrawerWidth,
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: "hidden",
          },
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: open ? "flex-end" : "center",
            px: [1],
          }}
        >
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              color: theme.palette.mode === "dark" ? "#fff" : "#fff",
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider
          sx={{
            borderColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(255, 255, 255, 0.3)",
            mb: 1,
          }}
        />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
              <Tooltip title={!open ? item.text : ""} placement="right">
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                    borderRadius: 2,
                    my: 0.5,
                    mx: 1,
                    background:
                      location.pathname === item.path
                        ? theme.palette.mode === "dark"
                          ? "rgba(33, 150, 243, 0.3)"
                          : "rgba(255, 255, 255, 0.25)"
                        : "none",
                    border:
                      location.pathname === item.path
                        ? theme.palette.mode === "dark"
                          ? "1px solid rgba(33, 150, 243, 0.5)"
                          : "1px solid rgba(255, 255, 255, 0.3)"
                        : "1px solid transparent",
                    transform:
                      location.pathname === item.path
                        ? "scale(1.02)"
                        : "scale(1)",
                    boxShadow:
                      location.pathname === item.path
                        ? theme.palette.mode === "dark"
                          ? "0 4px 12px rgba(33, 150, 243, 0.3)"
                          : "0 4px 12px rgba(255, 255, 255, 0.2)"
                        : "none",
                    "&:hover": {
                      background:
                        location.pathname === item.path
                          ? theme.palette.mode === "dark"
                            ? "rgba(33, 150, 243, 0.4)"
                            : "rgba(255, 255, 255, 0.35)"
                          : theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(255, 255, 255, 0.2)",
                      transform: "scale(1.05)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                      color:
                        location.pathname === item.path
                          ? theme.palette.mode === "dark"
                            ? "#2196f3"
                            : "#fff"
                          : "#fff",
                      fontSize: 28,
                      opacity: location.pathname === item.path ? 1 : 0.8,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      opacity: open ? 1 : 0,
                      fontWeight: location.pathname === item.path ? 700 : 500,
                      fontSize: 18,
                      display: open ? "block" : "none",
                      color:
                        location.pathname === item.path
                          ? theme.palette.mode === "dark"
                            ? "#2196f3"
                            : "#fff"
                          : "#fff",
                      "& .MuiListItemText-primary": {
                        fontSize: "16px",
                        letterSpacing:
                          location.pathname === item.path ? "0.5px" : "0px",
                      },
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: open
            ? `calc(100% - ${drawerWidth}px)`
            : `calc(100% - ${collapsedDrawerWidth}px)`,
          mt: 8,
          ml: 0,
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #121212 0%, #1e1e1e 100%)"
              : "linear-gradient(135deg, #f4f8fb 0%, #e8f2ff 100%)",
          minHeight: "100vh",
          borderTopLeftRadius: 32,
          transition: theme.transitions.create(["width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
