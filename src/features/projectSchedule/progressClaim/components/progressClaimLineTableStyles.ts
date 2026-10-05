import type { SxProps, Theme } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";
import { alpha } from "@mui/material/styles";

/** Column widths in render order: select, item, name, unit, then the QTY/Rate/Amount groups. */
export const LINE_TABLE_COLUMN_WIDTHS = [
  48, 56, 220, 70, 80, 110, 120, 80, 120, 130, 120, 80, 120,
];

export const LINE_TABLE_MIN_WIDTH = LINE_TABLE_COLUMN_WIDTHS.reduce((sum, width) => sum + width, 0);

/** Spreadsheet-style grid: every cell bordered, like the claim sheet it mirrors. */
export const LINE_TABLE_CELL_SX: SystemStyleObject<Theme> = {
  "& .MuiTableCell-root": {
    py: 1,
    borderBottom: "1px solid",
    borderColor: "divider",
    verticalAlign: "middle",
  },
  "& .MuiTableCell-root:not(:last-of-type)": {
    borderRight: "1px solid",
    borderRightColor: "divider",
  },
};

/** Top header row: solid brand blue, like the app's other tables, with soft dividers. */
export const LINE_TABLE_GROUP_HEADER_SX: SxProps<Theme> = (theme) => ({
  "& .MuiTableCell-root": {
    color: theme.palette.primary.contrastText,
    bgcolor: theme.palette.primary.main,
    fontWeight: 500,
    whiteSpace: "nowrap",
    py: 1.25,
    borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
    borderRight: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
  },
  "& .MuiTableCell-root:last-of-type": { borderRight: "none" },
});

/** Sub-header row (Qty / Rate / Amount): light blue so the two levels read apart. */
export const LINE_TABLE_SUB_HEADER_SX: SxProps<Theme> = {
  "& .MuiTableCell-root": {
    color: "text.primary",
    bgcolor: "primary.light",
    fontWeight: 500,
    whiteSpace: "nowrap",
    py: 0.75,
    borderBottom: "1px solid",
    borderColor: "divider",
  },
  "& .MuiTableCell-root:not(:last-of-type)": {
    borderRight: "1px solid",
    borderRightColor: "divider",
  },
};
