import type { SystemStyleObject } from "@mui/system";
import type { SxProps, Theme } from "@mui/material";
import {
  LEAD_CAPTURE_V2_PREVIEW_CONTENT_MAX_WIDTH,
  LEAD_CAPTURE_V2_PREVIEW_SHELL_MAX_WIDTH,
} from "./leadCaptureV2CustomerPreviewTypes";

/** Outer preview scroll column — centered in the page body. */
export const leadCaptureV2PreviewPageColumnSx: SxProps<Theme> = {
  width: `min(100%, ${LEAD_CAPTURE_V2_PREVIEW_SHELL_MAX_WIDTH}px)`,
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
};

/** Stepper row width (matches shell). */
export const leadCaptureV2PreviewShellSx: SxProps<Theme> = {
  width: `min(100%, ${LEAD_CAPTURE_V2_PREVIEW_SHELL_MAX_WIDTH}px)`,
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
};

/** Cards, grids, and footers — narrower centered lane. */
export const leadCaptureV2PreviewContentColumnSx: (theme: Theme) => SystemStyleObject<Theme> = (theme) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  [theme.breakpoints.up("sm")]: {
    width: `min(100%, 520px)`,
  },
  [theme.breakpoints.up("md")]: {
    width: `min(100%, 600px)`,
  },
  [theme.breakpoints.up("lg")]: {
    width: `min(100%, 680px)`,
  },
  [theme.breakpoints.up("xl")]: {
    width: `min(100%, ${LEAD_CAPTURE_V2_PREVIEW_CONTENT_MAX_WIDTH}px)`,
  },
});

/** Long step labels in the expanded stepper (lg+). */
export const leadCaptureV2PreviewStepLabelSx: SxProps<Theme> = {
  fontWeight: 500,
  textAlign: "center",
  px: 0.5,
  width: "100%",
  minWidth: 0,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  wordBreak: "break-word",
  lineHeight: 1.35,
};
