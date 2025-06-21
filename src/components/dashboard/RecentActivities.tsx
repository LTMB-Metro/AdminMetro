import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { COLORS } from "../../colors/colors";
import { Activity } from "../../types/activity";

interface RecentActivitiesProps {
  activities: Activity[];
}

const getActivityTypeColor = (type: string) => {
  switch (type) {
    case "user":
      return "#1976d2";
    case "ticket":
      return "#9c27b0";
    case "station":
      return "#43a047";
    case "system":
      return "#ff9800";
    default:
      return "#757575";
  }
};

const getActivityTypeLabel = (type: string) => {
  switch (type) {
    case "user":
      return "Người dùng";
    case "ticket":
      return "Vé";
    case "station":
      return "Trạm";
    case "system":
      return "Hệ thống";
    default:
      return "Khác";
  }
};

export const RecentActivities: React.FC<RecentActivitiesProps> = ({
  activities,
}) => {
  return (
    <Box sx={{ background: COLORS.white, borderRadius: 2, p: 3, boxShadow: 2 }}>
      <Typography variant="h6" fontWeight={600} mb={2} color={COLORS.pr9}>
        Hoạt động gần đây
      </Typography>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: COLORS.pr2 }}>
          <tr>
            <th style={{ padding: 8, textAlign: "left" }}>Thời gian</th>
            <th style={{ padding: 8, textAlign: "left" }}>Loại</th>
            <th style={{ padding: 8, textAlign: "left" }}>Mô tả</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.id}>
              <td style={{ padding: 8 }}>
                {activity.timestamp.toLocaleString("vi-VN")}
              </td>
              <td style={{ padding: 8 }}>
                <Chip
                  label={getActivityTypeLabel(activity.type)}
                  size="small"
                  sx={{
                    backgroundColor: getActivityTypeColor(activity.type),
                    color: "white",
                    fontWeight: 500,
                  }}
                />
              </td>
              <td style={{ padding: 8 }}>{activity.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};
