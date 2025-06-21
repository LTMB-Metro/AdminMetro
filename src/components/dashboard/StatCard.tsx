import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { COLORS } from "../../colors/colors";

interface StatCardProps {
  label: string;
  value: number;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => {
  return (
    <Card
      sx={{
        background: color,
        color: COLORS.white,
        boxShadow: 3,
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          {value.toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
};
