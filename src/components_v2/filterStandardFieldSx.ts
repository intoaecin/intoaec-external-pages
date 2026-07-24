import type { SxProps, Theme } from "@mui/material";

/** Bottom border for custom filter triggers (matches MUI `variant="standard"` underline). */
export const filterStandardUnderlineBorderSx: SxProps<Theme> = {
  borderBottom: "1px solid",
  borderColor: (theme) =>
    theme.palette.mode === "light"
      ? "rgba(0, 0, 0, 0.42)"
      : "rgba(255, 255, 255, 0.7)",
};

/** Placeholder tone aligned with standard filter inputs. */
export const filterStandardPlaceholderSx = {
  color: "text.primary",
  opacity: 0.6,
} as const;

/** Standard `variant="standard"` filter row: consistent label weight and color (autocomplete + date). */
export const filterStandardUnderlineFieldSx: SxProps<Theme> = {
  "& .MuiInputLabel-root": {
    fontSize: (theme) => theme.typography.body2.fontSize,
    fontWeight: 500,
    color: "text.secondary",
    "&.Mui-focused": { color: "primary.main" },
  },
  "& .MuiInputLabel-shrink": {
    fontWeight: 500,
    color: "text.secondary",
  },
};
