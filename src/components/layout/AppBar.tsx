import React from "react";
import { AppBar as MuiAppBar, Toolbar, Typography } from "@mui/material";
import { COLORS } from "../../colors/colors";

const drawerWidth = 220;

export const AppBar: React.FC = () => {
  return (
    <MuiAppBar
      position="fixed"
      sx={{ zIndex: 1201, background: COLORS.pr6, ml: `${drawerWidth}px` }}
    >
      <Toolbar>
        <Typography
          variant="h5"
          noWrap
          component="div"
          fontWeight={700}
          color={COLORS.white}
        >
          MetroPass Admin Dashboard
        </Typography>
      </Toolbar>
    </MuiAppBar>
  );
};
