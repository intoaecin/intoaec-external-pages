import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchIcon from "@mui/icons-material/Search";
import { Box, IconButton, InputAdornment, TextField, Typography, type SxProps, type Theme } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const DEFAULT_EXPANDED_SPACING = 38;
const COLLAPSED_WIDTH_SPACING = 14;
const TRANSITION_MS = 220;

export type ExpandableSearchProps = {
  value: string;
  onChange: (value: string) => void;
  /** Placeholder text; defaults to `common.search`. */
  placeholder?: string;
  disabled?: boolean;
  /** Slightly wider width on focus in theme spacing units. */
  expandedSpacing?: number;
  /** Accessible label for the input. */
  ariaLabel?: string;
  sx?: SxProps<Theme>;
};

/**
 * Collapsed search trigger (icon + label) that expands into an inline search field.
 */
export default function ExpandableSearch({
  value,
  onChange,
  placeholder,
  disabled = false,
  expandedSpacing = DEFAULT_EXPANDED_SPACING,
  ariaLabel,
  sx,
}: ExpandableSearchProps) {
  const { t } = useTranslation();
  const label = ariaLabel ?? t("common.search");
  const hasValue = Boolean(value.trim());
  const [open, setOpen] = useState(hasValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hasValue) {
      setOpen(true);
    }
  }, [hasValue]);

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  const handleClear = () => onChange("");
  const handleOpen = () => {
    if (disabled) return;
    setOpen(true);
  };
  const handleBlur = () => {
    if (!hasValue) {
      setOpen(false);
    }
  };

  return (
    <Box
      role="search"
      aria-label={label}
      sx={[
        {
          display: "inline-flex",
          width: (theme) =>
            open
              ? theme.spacing(expandedSpacing)
              : theme.spacing(COLLAPSED_WIDTH_SPACING),
          maxWidth: "100%",
          transition: (theme) =>
            theme.transitions.create(["width", "box-shadow", "border-color"], {
              duration: TRANSITION_MS,
              easing: theme.transitions.easing.easeOut,
            }),
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {open ? (
        <TextField
          inputRef={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder ?? t("common.search")}
          size="small"
          variant="outlined"
          fullWidth
          disabled={disabled}
          inputProps={{ "aria-label": label }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: value ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  aria-label={t("common.clear")}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handleClear}
                  edge="end"
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          }}
        />
      ) : (
        <IconButton
          disabled={disabled}
          onClick={handleOpen}
          size="small"
          aria-label={label}
          sx={{
            borderRadius: 1,
            px: 0.75,
            py: 0.5,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 0.5,
            color: "text.primary",
          }}
        >
          <SearchIcon fontSize="small" />
          <Typography variant="body2" noWrap sx={{ lineHeight: 1 }}>
            {t("common.search")}
          </Typography>
        </IconButton>
      )}
    </Box>
  );
}
