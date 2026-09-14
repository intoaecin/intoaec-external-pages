import React from "react";
import { Box, Button, Checkbox, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { SELECTION_BANNER_HEIGHT } from "./tableStyles";

interface SelectionBannerProps {
  count: number;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: () => void;
  onClearAll: () => void;
  extra?: React.ReactNode;
}

const whiteCheckboxSx = {
  width: "8px",
  height: "8px",
  color: "white",
  "&.Mui-checked": {
    color: "white",
    "& .MuiSvgIcon-root": { color: "white" },
  },
  "&.MuiCheckbox-indeterminate": {
    color: "white",
    "& .MuiSvgIcon-root": { color: "white" },
  },
  "& .MuiSvgIcon-root": { color: "white" },
};

export const SelectionBanner = React.memo(function SelectionBanner({
  count,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  onClearAll,
  extra,
}: SelectionBannerProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  if (count === 0) return null;

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.primary.main,
        borderRadius: "4px 4px 0 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "common.white",
        height: SELECTION_BANNER_HEIGHT,
        width: "100%",
        boxSizing: "border-box",
        position: "sticky",
        top: 0,
        left: 0,
        zIndex: 12,
        px: 2,
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Checkbox
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onChange={onSelectAll}
          sx={{ ...whiteCheckboxSx, ml: 1 }}
        />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {count} {t("common.rowsSelected")}
        </Typography>
        <Button
          onClick={onClearAll}
          sx={{
            color: "common.white",
            textDecoration: "underline",
            textTransform: "none",
            fontSize: "14px",
            fontWeight: 400,
            padding: 0,
            minWidth: "auto",
            ml: 1,
            "&:hover": {
              backgroundColor: "transparent",
              textDecoration: "underline",
            },
          }}
        >
          {t("common.clearAll")}
        </Button>
      </Box>
      {extra && <Box sx={{ mr: 1 }}>{extra}</Box>}
    </Box>
  );
});
