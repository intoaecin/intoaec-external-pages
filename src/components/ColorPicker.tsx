import React, { useState, useRef, useEffect } from "react";
import { Box, Popover } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { ColorPickerPaletteContent } from "./ColorPickerPaletteContent";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  onClose?: () => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  width?: string | number;
  height?: string | number;
  openTrigger?: number;
  /** `swatch` — compact color chip only; opens palette in a portal `Popover` (works inside `Dialog`). */
  variant?: "default" | "swatch";
}

const ColorPickerContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "inline-block",
}));

const ColorPickerButton = styled(Box)<{ disabled?: boolean; height?: string | number }>(
  ({ theme, disabled, height }) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "0 12px",
    height: height || "38px",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: "4px",
    cursor: disabled ? "not-allowed" : "pointer",
    backgroundColor: theme.palette.background.paper,
    opacity: disabled ? 0.6 : 1,
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    "&:hover": {
      borderColor: disabled
        ? theme.palette.divider
        : theme.palette.primary.main,
    },
    "&:focus-within": {
      borderColor: theme.palette.primary.main,
      borderWidth: "2px",
    },
  })
);

const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  onClose,
  disabled = false,
  size = "medium",
  width,
  height,
  openTrigger,
  variant = "default",
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [defaultAnchor, setDefaultAnchor] = useState<HTMLElement | null>(null);
  const [swatchAnchor, setSwatchAnchor] = useState<HTMLElement | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!disabled) {
      setOpen((prevOpen) => {
        const next = !prevOpen;
        if (next && variant === "default" && anchorRef.current) {
          setDefaultAnchor(anchorRef.current);
        }
        if (!next) {
          setDefaultAnchor(null);
        }
        if (!next) onClose?.();
        return next;
      });
    }
  };

  const handleClose = (event: Event | TouchEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
    setDefaultAnchor(null);
    onClose?.();
  };

  const handleColorSelect = (color: string) => {
    onChange(color);
    setOpen(false);
    setDefaultAnchor(null);
    setSwatchAnchor(null);
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return { width: 12, height: 12 };
      case "large":
        return { width: 16, height: 16 };
      default:
        return { width: 14, height: 14 };
    }
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        onClose?.();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (typeof openTrigger === "number" && !disabled) {
      if (variant === "default" && anchorRef.current) {
        setDefaultAnchor(anchorRef.current);
      }
      setOpen(true);
    }
  }, [openTrigger, disabled, variant]);

  useEffect(() => {
    if (variant !== "default" || !open || !defaultAnchor) return;

    const rect = defaultAnchor.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const estimatedMenuHeight = 260;

    if (spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow) {
      setOpenUpwards(true);
    } else {
      setOpenUpwards(false);
    }
  }, [defaultAnchor, open, variant]);

  const paletteContent = (
    <ColorPickerPaletteContent value={value} onColorSelect={handleColorSelect} />
  );

  if (variant === "swatch") {
    const swatchOpen = Boolean(swatchAnchor);
    const swatchHeight = height ?? 40;
    const swatchWidth = width ?? swatchHeight;
    return (
      <>
        <Box
          component="button"
          type="button"
          disabled={disabled}
          aria-haspopup="true"
          aria-expanded={swatchOpen}
          aria-label={t("workerManagement.colorPicker.selectColor")}
          onClick={(event) => {
            if (disabled) return;
            setSwatchAnchor(swatchOpen ? null : event.currentTarget);
          }}
          sx={{
            width: swatchWidth,
            height: swatchHeight,
            flexShrink: 0,
            p: 0,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            bgcolor: value,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
            boxSizing: "border-box",
            "&:hover": {
              boxShadow: (theme) =>
                disabled ? undefined : `0 0 0 2px ${theme.palette.action.hover}`,
            },
            "&:focus-visible": {
              outline: (theme) => `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 2,
            },
          }}
        />
        <Popover
          open={swatchOpen}
          anchorEl={swatchAnchor}
          onClose={() => setSwatchAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
          slotProps={{
            paper: {
              sx: {
                p: 1.5,
                minWidth: 220,
                maxWidth: 280,
                maxHeight: "60vh",
                overflowY: "auto",
              },
            },
          }}
        >
          {paletteContent}
        </Popover>
      </>
    );
  }

  const defaultOpen = open && Boolean(defaultAnchor);

  return (
    <ColorPickerContainer ref={anchorRef}>
      <ColorPickerButton
        onClick={handleToggle}
        disabled={disabled}
        height={height}
        sx={width ? { width } : {}}
      >
        <Box
          sx={{
            width: getSizeStyles().width,
            height: getSizeStyles().height,
            backgroundColor: value,
            borderRadius: "10%",
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        />
        <Box
          sx={{
            width: 0,
            height: 0,
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderTop: (theme) => `4px solid ${theme.palette.text.secondary}`,
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </ColorPickerButton>
      <Popover
        open={defaultOpen}
        anchorEl={defaultAnchor}
        onClose={handleClose}
        anchorOrigin={{
          vertical: openUpwards ? "top" : "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: openUpwards ? "bottom" : "top",
          horizontal: "left",
        }}
        disableScrollLock
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
        slotProps={{
          paper: {
            sx: {
              p: 1.5,
              minWidth: 220,
              maxWidth: 280,
              maxHeight: "60vh",
              overflowY: "auto",
            },
          },
        }}
      >
        {paletteContent}
      </Popover>
    </ColorPickerContainer>
  );
};

export default ColorPicker;

export { COLOR_PICKER_PALETTE, getRandomColor } from "@/constants/colors";
export { ColorPickerPaletteContent } from "./ColorPickerPaletteContent";
export type { ColorPickerPaletteContentProps } from "./ColorPickerPaletteContent";
