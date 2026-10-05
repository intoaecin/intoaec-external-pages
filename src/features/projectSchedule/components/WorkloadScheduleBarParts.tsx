import { memo } from "react";
import { Box, Typography, styled } from "@mui/material";
import { TruncatedText } from "@/components_v2/TruncatedText";
import type { Schedule } from "../types/schedule";
import { GANTT_SCHEDULE_BAR_HEIGHT_PX } from "../helpers/constants";

export const TaskBarContainer = styled(Box)(() => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  height: `${GANTT_SCHEDULE_BAR_HEIGHT_PX}px`,
  display: "flex",
  alignItems: "center",
  willChange: "transform",
}));

export function parseCompletionPercent(
  value: string | number | undefined | null,
): number {
  if (value === null || value === undefined) return 0;
  const percentage = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(percentage)) return 0;
  return Math.min(100, Math.max(0, percentage));
}

export const CompletionBox = memo(function CompletionBox({
  percentage,
}: {
  percentage: number;
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        height: "100%",
        width: `${percentage}%`,
        bgcolor: "rgba(0, 0, 0, 0.4)",
      }}
    />
  );
});

export const ScheduleName = memo(function ScheduleName({
  name,
  compact = false,
  schedule,
}: {
  name: string;
  compact?: boolean;
  schedule: Schedule;
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        overflow: "hidden",
        px: compact ? 0.25 : 1.25,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: "white",
          fontSize: compact ? "10px" : "12px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          pointerEvents: "auto",
          fontWeight: schedule.childrenIds?.length ? 500 : 400,
        }}
      >
        <TruncatedText text={name} useEllipsis maxWidth="100%" />
      </Typography>
    </Box>
  );
});
