import React from "react";
import {
  Checkbox,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  useTheme,
} from "@mui/material";
import type { Column } from "./types";
import {
  ACTION_COLUMN_WIDTH,
  SELECT_COLUMN_WIDTH,
  getHeaderCellSx,
} from "./tableStyles";

interface TableHeaderProps {
  columns: Column[];
  showSelectAll: boolean;
  selectionDisabled: boolean;
  selectionDisabledTooltip?: string;
  showRowActions: boolean;
  stickyHeader: boolean;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: () => void;
}

export const TableHeader = React.memo(function TableHeader({
  columns,
  showSelectAll,
  selectionDisabled,
  selectionDisabledTooltip,
  showRowActions,
  stickyHeader,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
}: TableHeaderProps) {
  const theme = useTheme();

  return (
    <TableHead
      sx={{
        "& .MuiTableCell-root": {
          color: "common.white",
          background: theme.palette.primary.main,
          padding: "12px",
          ...(stickyHeader
            ? {
                position: "sticky",
                top: 0,
                zIndex: 10,
              }
            : {}),
          "&:not(:last-of-type)": {
            position: stickyHeader ? "sticky" : "relative",
          },
          "&:not(:last-child)::after": {
            content: '""',
            position: "absolute",
            right: 0,
            top: 0,
            height: "100%",
            width: "2px",
            backgroundColor: "rgba(255, 255, 255, 0)",
          },
          "&:last-child": { borderRight: "none" },
          "& .MuiTableSortLabel-root": {
            color: "common.white",
            "&:hover": { color: "common.white" },
            "&.Mui-active": { color: "common.white" },
          },
          "& .MuiTableSortLabel-icon": {
            color: "common.white",
            opacity: 1,
          },
        },
        "& .MuiTableRow-root": { borderSpacing: 0 },
      }}
    >
      <TableRow>
        {showSelectAll && (
          <TableCell
            sx={{
              width: SELECT_COLUMN_WIDTH,
              minWidth: SELECT_COLUMN_WIDTH,
              maxWidth: SELECT_COLUMN_WIDTH,
              padding: "8px",
              textAlign: "left",
            }}
          >            <Tooltip
              title={selectionDisabled ? selectionDisabledTooltip ?? "" : ""}
              arrow
              disableHoverListener={!selectionDisabled || !selectionDisabledTooltip}
            >
              <span>
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={onSelectAll}
                  disabled={selectionDisabled}
                  sx={{
                    width: "8px",
                    height: "8px",
                    ml: 1,
                    opacity: selectionDisabled ? 0.55 : 1,
                    cursor: selectionDisabled ? "not-allowed" : "pointer",
                    "&.Mui-checked": {
                      color: "white",
                      "& .MuiSvgIcon-root": { color: "white" },
                    },
                    "&.MuiCheckbox-indeterminate": {
                      color: "white",
                      "& .MuiSvgIcon-root": { color: "white" },
                    },
                  }}
                />
              </span>
            </Tooltip>
          </TableCell>
        )}
        {columns.map((column) => (
          <TableCell
            key={column.id}
            align={column.align || "left"}
            sx={{
              ...getHeaderCellSx(column, stickyHeader, theme),
              textAlign: column.align || "left",
            }}
          >
            {column.label}
          </TableCell>
        ))}
        {showRowActions && (
          <TableCell
            sx={{
              width: ACTION_COLUMN_WIDTH,
              minWidth: ACTION_COLUMN_WIDTH,
              maxWidth: ACTION_COLUMN_WIDTH,
              padding: 0,
              position: stickyHeader ? "sticky" : "static",
              right: stickyHeader ? 0 : "auto",
              top: stickyHeader ? 0 : "auto",
              zIndex: stickyHeader ? 11 : "auto",
              background: theme.palette.primary.main,
            }}
          />
        )}
      </TableRow>
    </TableHead>
  );
});
