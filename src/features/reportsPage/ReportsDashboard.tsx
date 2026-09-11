import React from "react";
import { Box, Typography, Paper } from "@mui/material";

interface ReportCardProps {
  title: string;
  titleIcon?: React.ReactNode;
  value: any;
  label: string;
  labelColor?: string;
}

const ReportCard: React.FC<ReportCardProps> = ({
  title,
  titleIcon,
  value,
  label,
  labelColor,
}) => {
  return (
    <Paper
      elevation={3}
      sx={{
        padding: 2,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 1,
        width: "100%", // Adjust width as needed
        backgroundColor: "#fff",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {titleIcon}
        <Typography variant="body2" sx={{ fontWeight: 500, color: "#333" }}>
          {title}
        </Typography>
      </Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color:
            label === "Deviation"
              ? value < 0
                ? "green"
                : "red"
              : "black", // Green for negative, red for positive
        }}
      >
        {label === "Deviation" ? `${Math.abs(value)} day(s) ${value < 0 ? "ahead" : "delay"}` : label === "Duration" ? `${Math.abs(value)} day(s)` : value}
      </Typography>

      <Box
        sx={{
          backgroundColor: "#e0f7fa",
          padding: "4px 8px",
          borderRadius: 1,
          fontSize: "12px",
          fontWeight: 500,
          color: "#00796b",
        }}
      >
        {label}
      </Box>
    </Paper>
  );
};

export default ReportCard;

