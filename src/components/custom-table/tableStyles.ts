import type { Theme } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";
import type { Column } from "./types";

export const ACTION_COLUMN_WIDTH = "24px";
export const SELECT_COLUMN_WIDTH = "48px";
export const HEADER_SCROLLBAR_COVER_HEIGHT = "49px";
export const SELECTION_BANNER_HEIGHT = "56px";

export function getColumnWidth(column: Column) {
  return column.width || "auto";
}

export function getHeaderCellSx(
  column: Column,
  stickyHeader: boolean,
  theme: Theme,
): SystemStyleObject<Theme> {
  const stickyRight = Boolean(column.stickyOnRight);
  const stickyWidth = column.width ?? ACTION_COLUMN_WIDTH;

  return {
    width: stickyRight ? stickyWidth : getColumnWidth(column),
    minWidth: stickyRight ? stickyWidth : getColumnWidth(column),
    maxWidth: stickyRight
      ? stickyWidth
      : column.suppressCellOverflow
        ? "none"
        : column.width || "none",
    overflow: column.suppressCellOverflow ? "visible" : undefined,
    ...(stickyRight
      ? {
          padding: 0,
          position: stickyHeader ? "sticky" : "static",
          right: stickyHeader ? 0 : "auto",
          top: stickyHeader ? 0 : "auto",
          zIndex: stickyHeader ? 11 : "auto",
          background: theme.palette.primary.main,
        }
      : {}),
  };
}

export function getBodyCellSx(
  column: Column,
  theme: Theme,
): SystemStyleObject<Theme> {
  const stickyRight = Boolean(column.stickyOnRight);
  const stickyWidth = column.width ?? ACTION_COLUMN_WIDTH;

  if (stickyRight) {
    return {
      position: "sticky",
      right: 0,
      zIndex: 2,
      width: stickyWidth,
      minWidth: stickyWidth,
      maxWidth: stickyWidth,
      padding: 0,
      verticalAlign: "top",
      backgroundColor: theme.palette.background.paper,
      overflow: "visible",
    };
  }

  return {
    position: "relative",
    padding: "16px",
    width: getColumnWidth(column),
    minWidth: getColumnWidth(column),
    maxWidth: column.suppressCellOverflow ? "none" : column.width || "none",
    overflow: column.suppressCellOverflow ? "visible" : undefined,
  };
}

export function getStickyActionCellSx(theme: Theme): SystemStyleObject<Theme> {
  return {
    position: "sticky",
    right: 0,
    zIndex: 2,
    width: ACTION_COLUMN_WIDTH,
    minWidth: ACTION_COLUMN_WIDTH,
    maxWidth: ACTION_COLUMN_WIDTH,
    padding: 0,
    verticalAlign: "top",
    backgroundColor: theme.palette.background.paper,
  };
}

export function getSkeletonCellSx(
  column: Column,
  theme: Theme,
): SystemStyleObject<Theme> {
  const stickyRight = Boolean(column.stickyOnRight);
  const stickyWidth = column.width ?? ACTION_COLUMN_WIDTH;

  return stickyRight
    ? {
        borderRight: "none",
        position: "sticky",
        right: 0,
        zIndex: 2,
        width: stickyWidth,
        minWidth: stickyWidth,
        maxWidth: stickyWidth,
        padding: 0,
        verticalAlign: "middle",
        backgroundColor: theme.palette.background.paper,
      }
    : { borderRight: "none" };
}
