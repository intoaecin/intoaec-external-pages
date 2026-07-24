import React from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { colorOptions } from "@/constants/colors";

const ColorSwatch = styled(Box)<{ selected?: boolean }>(
  ({ theme, selected }) => ({
    width: 18,
    height: 18,
    borderRadius: "10%",
    cursor: "pointer",
    border: selected
      ? `2px solid ${theme.palette.primary.main}`
      : "1px solid transparent",
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "scale(1.1)",
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    },
  })
);

export interface ColorPickerPaletteContentProps {
  value: string;
  onColorSelect: (color: string) => void;
}

/** Palette grid shared with `ColorPicker`; use inside a `Popover` or dialog. */
export const ColorPickerPaletteContent: React.FC<ColorPickerPaletteContentProps> = ({
  value,
  onColorSelect,
}) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ width: 208, mx: "auto" }}>
      <Typography
        variant="subtitle2"
        sx={{
          mb: 1,
          color: "text.primary",
          fontWeight: 600,
          fontSize: "0.8rem",
          textAlign: "center",
        }}
      >
        {t("workerManagement.colorPicker.selectColor")}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, max-content)",
          columnGap: 1.5,
          rowGap: 0.75,
          justifyContent: "center",
        }}
      >
        {colorOptions.map((colorOption) => (
          <Box key={colorOption.name} sx={{ mb: 0.25, textAlign: "center" }}>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 500,
                mb: 0.25,
                display: "block",
                fontSize: "0.65rem",
              }}
            >
              {t(
                `workerManagement.colorPicker.${colorOption.name.toLowerCase()}`
              )}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
              {Object.entries(colorOption.shades).map(([shade, color]) => (
                <ColorSwatch
                  key={`${colorOption.name}-${shade}`}
                  sx={{ backgroundColor: color }}
                  selected={value === color}
                  onClick={() => onColorSelect(color)}
                  title={`${t(
                    `workerManagement.colorPicker.${colorOption.name.toLowerCase()}`
                  )} ${t(`workerManagement.colorPicker.${shade}`)}`}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
