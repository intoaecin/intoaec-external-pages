import type { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { LeadMasterQueryParams, ParsedQueryValue } from "./masterGridNavigation.types";

type LeadMasterPaletteKey = "primary" | "info" | "warning" | "success" | "error";
type LeadMasterPaletteShade = "main" | "light" | "dark";

export const getLeadMasterThemeColor = (theme: Theme, colorPath: string) => {
  const [paletteKey, shade] = colorPath.split(".") as [
    LeadMasterPaletteKey,
    LeadMasterPaletteShade,
  ];
  const palette = theme.palette[paletteKey];
  if (palette && shade in palette) {
    return palette[shade];
  }
  return "inherit";
};

export const safeJsonParse = (value: unknown): ParsedQueryValue | unknown => {
  if (typeof value !== "string") {
    return value;
  }
  try {
    return JSON.parse(value) as ParsedQueryValue;
  } catch {
    return value;
  }
};

export const parseLeadMasterQueryValue = (value: unknown): ParsedQueryValue | unknown => {
  if (Array.isArray(value)) {
    if (value.length === 1) {
      return safeJsonParse(value[0]);
    }
    return value.map((item) => safeJsonParse(item)) as ParsedQueryValue[];
  }
  return safeJsonParse(value);
};

const LEAD_MASTER_UI_ONLY_QUERY_KEYS = new Set<string>(["view"]);

/** Pixels from column bottom before triggering the next GET_LEADS page for that status. */
export const KANBAN_COLUMN_SCROLL_END_THRESHOLD_PX = 80;

/** Horizontal scroll container for the lead master kanban board (columns row). */
export function getLeadKanbanBoardHorizontalScrollSx(theme: Theme): SxProps<Theme> {
  const thumb = alpha(theme.palette.grey[500], 0.55);
  const track = alpha(theme.palette.grey[300], 0.45);

  return {
    flex: 1,
    minHeight: 0,
    width: "100%",
    height: "100%",
    overflowX: "scroll",
    overflowY: "hidden",
    scrollbarGutter: "stable",
    borderRadius: "4px",
    px: 1,
    pt: 1.5,
    pb: 0.5,
    boxSizing: "border-box",
    scrollbarWidth: "thin",
    scrollbarColor: `${thumb} ${track}`,
    "&::-webkit-scrollbar": {
      height: 10,
      width: 10,
    },
    "&::-webkit-scrollbar:horizontal": {
      height: 10,
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: track,
      borderRadius: 8,
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: thumb,
      borderRadius: 8,
      border: "2px solid transparent",
      backgroundClip: "padding-box",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: alpha(theme.palette.grey[600], 0.7),
    },
  };
}

export const LEAD_KANBAN_COLUMN_SCROLLBAR_PX = 8;

/**
 * Vertical scroll for kanban cards. No horizontal padding so card width matches the
 * full-width column header; on column hover, right padding reserves space for the scrollbar.
 */
export function getLeadKanbanColumnScrollSx(theme: Theme): SxProps<Theme> {
  return {
    flex: "1 1 0",
    minHeight: 0,
    overflowY: "auto",
    overflowX: "hidden",
    py: 1.25,
    px: 0,
    bgcolor: "transparent",
    borderRadius: "0 0 8px 8px",
    scrollbarWidth: "thin",
    scrollbarColor: "transparent transparent",
    transition: theme.transitions.create(["padding-right"], {
      duration: theme.transitions.duration.shortest,
    }),
    "&::-webkit-scrollbar": {
      width: LEAD_KANBAN_COLUMN_SCROLLBAR_PX,
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "transparent",
      borderRadius: 8,
    },
    "& .lead-kanban-card": {
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
    },
  };
}

/** Hovering the column shrinks cards slightly and reveals the vertical scrollbar. */
export function getLeadKanbanColumnHoverScrollSx(theme: Theme): SxProps<Theme> {
  const thumbHover = alpha(theme.palette.grey[600], 0.55);

  return {
    "&:hover .lead-kanban-column-scroll": {
      scrollbarColor: `${thumbHover} transparent`,
      paddingRight: `${LEAD_KANBAN_COLUMN_SCROLLBAR_PX}px`,
      paddingLeft: 0,
    },
    "&:hover .lead-kanban-column-scroll::-webkit-scrollbar-thumb": {
      backgroundColor: thumbHover,
    },
  };
}

/**
 * Inner row: fixed to board height (do not grow with card content) so column bodies scroll.
 */
export const leadKanbanBoardColumnsRowSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "row",
  alignItems: "stretch",
  gap: 2,
  height: "100%",
  width: "max-content",
  minWidth: "100%",
  flexShrink: 0,
  boxSizing: "border-box",
};

export function isKanbanColumnScrollNearEnd(
  element: HTMLElement,
  thresholdPx = KANBAN_COLUMN_SCROLL_END_THRESHOLD_PX,
): boolean {
  if (element.scrollHeight <= element.clientHeight + 1) {
    return false;
  }
  return (
    element.scrollTop + element.clientHeight >=
    element.scrollHeight - thresholdPx
  );
}

export function snapshotKanbanColumnScrollPositions(): Record<string, number> {
  const positions: Record<string, number> = {};
  document
    .querySelectorAll<HTMLElement>("[data-kanban-column-scroll][data-stage-id]")
    .forEach((el) => {
      const stageId = el.getAttribute("data-stage-id");
      if (stageId) {
        positions[stageId] = el.scrollTop;
      }
    });
  return positions;
}

export function restoreKanbanColumnScrollPositions(
  positions: Record<string, number>,
): void {
  for (const [stageId, scrollTop] of Object.entries(positions)) {
    const el = document.querySelector<HTMLElement>(
      `[data-kanban-column-scroll][data-stage-id="${CSS.escape(stageId)}"]`,
    );
    if (el?.isConnected) {
      el.scrollTop = scrollTop;
    }
  }
}

export const buildLeadMasterQueryParams = (
  queryParameters: Record<string, unknown>,
): LeadMasterQueryParams => {
  const query: LeadMasterQueryParams = {};
  for (const [key, value] of Object.entries(queryParameters)) {
    if (LEAD_MASTER_UI_ONLY_QUERY_KEYS.has(key)) continue;
    query[key] = parseLeadMasterQueryValue(value) as ParsedQueryValue | undefined;
  }
  return query;
};
