import Autocomplete from "@/components_v2/Autocomplete";
import TodayIcon from "@mui/icons-material/Today";
import { Box, Button } from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface WorkloadToolbarProps {
  viewMode: "day" | "week" | "month";
  onViewModeChange: (viewMode: "day" | "week" | "month") => void;
  onScrollToToday: () => void;
}

export function WorkloadToolbar({
  viewMode,
  onViewModeChange,
  onScrollToToday,
}: WorkloadToolbarProps) {
  const { t } = useTranslation();
  const viewModeOptions = useMemo(
    () => [
      { value: "day", label: t("schedule.workloadDay", "Day") },
      { value: "week", label: t("schedule.workloadWeek", "Week") },
      { value: "month", label: t("schedule.workloadMonth", "Month") },
    ],
    [t],
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        p: 1,
        borderBottom: 1,
        borderColor: "divider",
        gap: 2,
        flexShrink: 0,
        "& .MuiButton-root": { typography: "caption" },
        "& .MuiInputBase-root": { typography: "caption" },
      }}
    >
      <Button startIcon={<TodayIcon />} onClick={onScrollToToday} size="small">
        {t("common.today")}
      </Button>
      <Box sx={{ minWidth: 110 }}>
        <Autocomplete
          size="small"
          disableClearable
          disableSearch
          disablePortal
          options={viewModeOptions}
          value={viewMode}
          onChange={(value) => {
            if (value === "day" || value === "week" || value === "month") {
              onViewModeChange(value);
            }
          }}
        />
      </Box>
    </Box>
  );
}
