import { Box, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GANTT_SCHEDULE_ROW_HEIGHT_PX } from "../helpers/constants";

interface PlannerParentRowProps {
  label: string;
  count: number;
  countTooltip: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function PlannerParentRow({
  label,
  count,
  countTooltip,
  isExpanded,
  onToggle,
}: PlannerParentRowProps) {
  return (
    <Box
      sx={{
        height: GANTT_SCHEDULE_ROW_HEIGHT_PX,
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        px: 1,
        borderBottom: isExpanded ? "none" : "1px solid",
        borderColor: "divider",
        cursor: "pointer",
        "&:hover": { bgcolor: "action.hover" },
        userSelect: "none",
      }}
      role="row"
      tabIndex={0}
      aria-expanded={isExpanded}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onToggle();
      }}
    >
      <IconButton size="small" sx={{ p: 0, mr: 0.25 }} tabIndex={-1} aria-hidden>
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </IconButton>
      <Tooltip title={label} placement="right" disableInteractive>
        <Typography
          variant="body2"
          sx={{
            color: "text.primary",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontWeight: 500,
            flex: 1,
          }}
        >
          {label}
        </Typography>
      </Tooltip>
      <Tooltip title={countTooltip} placement="top" disableInteractive>
        <Chip
          size="small"
          label={count}
          sx={{
            bgcolor: "grey.100",
            fontWeight: 500,
            flexShrink: 0,
            height: 18,
            "& .MuiChip-label": { px: 0.75 },
          }}
        />
      </Tooltip>
    </Box>
  );
}

export function PlannerTotalsLabelRow() {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        height: GANTT_SCHEDULE_ROW_HEIGHT_PX,
        display: "flex",
        alignItems: "center",
        px: 1,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
      role="row"
    >
      <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500 }}>
        {t("schedule.plannerTotalsRow")}
      </Typography>
    </Box>
  );
}

interface PlannerChildRowProps {
  label: string;
  color?: string;
  isLast: boolean;
}

export function PlannerChildRow({ label, color, isLast }: PlannerChildRowProps) {
  return (
    <Box
      sx={{
        height: GANTT_SCHEDULE_ROW_HEIGHT_PX,
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        pl: 4.5,
        pr: 1,
        borderBottom: isLast ? "1px solid" : "none",
        borderColor: "divider",
      }}
      role="row"
    >
      <Box
        aria-hidden
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: color || "grey.400",
          flexShrink: 0,
        }}
      />
      <Tooltip title={label} placement="right" disableInteractive>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Typography>
      </Tooltip>
    </Box>
  );
}
