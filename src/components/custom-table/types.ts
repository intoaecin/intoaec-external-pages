import type React from "react";
import type { SxProps, Theme } from "@mui/material";

export interface Column {
  id: string;
  label: string | React.ReactNode;
  align?: "left" | "center" | "right" | "justify" | "inherit";
  suppressCellOverflow?: boolean;
  render?: (
    row: any,
    rowIndex?: number,
    isRowHovered?: boolean,
  ) => React.ReactNode;
  editable?: boolean;
  selectOptions?: Array<{ value: any; label: string }>;
  datepicker?: boolean;
  cellColor?: (row: any) => string;
  isTooltip?: boolean;
  tooltipText?: string | ((row: any) => string);
  width?: string | number;
  stickyOnRight?: boolean;
}

export interface ActionItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  color?: "inherit" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  condition?: (row: any) => boolean;
  disabled?: (row: any) => boolean;
  disabledTooltip?: (row: any) => string;
  loading?: (row: any) => boolean;
  keepMenuOpenOnClick?: boolean;
  onRowClick?: (row: any) => void;
}

export interface CustomTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  stickyHeader?: boolean;
  emptyStateImage?: string;
  emptyStateText?: string;
  emptyStateMinHeight?: string | number;
  /** When true, empty data shows header only (no NoDataFound vector). */
  hideEmptyState?: boolean;
  containerHeight?: string | number;
  showRowActions?: boolean;
  /** Render the action icon(s) directly instead of a three-dot menu. */
  inlineRowActions?: boolean;
  onRowAction?: (action: string, row: any) => void;
  actionItems?: ActionItem[];
  onRowClick?: (row: any) => void;
  renderExpandedRow?: (row: any, rowIndex: number) => React.ReactNode;
  renderExpandedRowCells?: (row: any, rowIndex: number) => React.ReactNode;
  expandedRowCellSx?: SxProps<Theme>;
  onCellEdit?: (rowIndex: number, columnId: string, newValue: string) => void;
  showSelectAll?: boolean;
  selectionDisabled?: boolean;
  selectionDisabledTooltip?: string;
  selectedRows?: number[];
  onSelectionChange?: (selectedRows: number[]) => void;
  getRowId?: (row: any, index: number) => string | number;
  currentRowData?: any[];
  sx?: SxProps<Theme>;
  selectionToolbarExtra?: React.ReactNode;
  pagination?: {
    currentPage: number;
    rowsPerPage: number;
    totalPage: number;
    onChangePage: (page: number) => void;
    onChangeRowsperPage: (e: any) => void;
  };
}

export interface MenuState {
  anchorEl: HTMLElement | null;
  rowIndex: number | null;
}
