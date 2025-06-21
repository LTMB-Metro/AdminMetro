import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
} from "@mui/material";
import { COLORS } from "../../colors/colors";

const drawerWidth = 220;

interface SidebarProps {
  selectedItem: string;
  onItemSelect: (item: string) => void;
}

const menuItems = ["Dashboard", "Users", "Ticket Types", "Metro Routes"];

export const Sidebar: React.FC<SidebarProps> = ({
  selectedItem,
  onItemSelect,
}) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          background: COLORS.pr9,
          color: COLORS.white,
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        <List>
          {menuItems.map((text) => (
            <ListItemButton
              key={text}
              selected={text === selectedItem}
              onClick={() => onItemSelect(text)}
            >
              <ListItemText
                primary={text}
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};
