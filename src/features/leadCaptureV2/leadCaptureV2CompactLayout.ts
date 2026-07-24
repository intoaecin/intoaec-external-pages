import { hideScrollbarSx } from "@/styles/common";
import { useMediaQuery, useTheme } from "@mui/material";

/** Form builder uses a stacked chrome + full-height editor below `lg`. */
export const useLeadCaptureV2CompactLayout = () => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("lg"));
};

export const leadCaptureV2ChromeRowSx = {
  flexShrink: 0,
  minHeight: 0,
  overflow: "hidden",
} as const;

/** Matches compact step panel title (e.g. Complaint Form). */
export const leadCaptureV2ChromeLabelSx = {
  fontWeight: 500,
  lineHeight: 1.2,
  flexShrink: 0,
  alignSelf: "center",
  ml: 1,
  mr: 2,
} as const;

export const leadCaptureV2ChromeScrollSx = {
  flex: 1,
  minWidth: 0,
  overflowX: "auto",
  overflowY: "hidden",
  WebkitOverflowScrolling: "touch",
  touchAction: "pan-x",
  py: 1,
  ...hideScrollbarSx,
} as const;

export const leadCaptureV2ChromeScrollTrackSx = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "nowrap",
  alignItems: "center",
  gap: 0.5,
  pr: 0.5,
  width: "100%",
  minWidth: "max-content",
} as const;
