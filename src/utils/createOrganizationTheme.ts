import { createTheme } from "@mui/material";
import { hexToRgb } from "@/lib/helpers";
import { createAppTheme } from "@/styles/theme";
import type { ExcelTheme } from "@/types/excelExport";

const DEFAULT_MAIN_COLOR = "#1976d2";
const DEFAULT_TEXT_COLOR = "#FFFFFF";
const PRIMARY_MAIN_ALPHA = 0.8;
const PRIMARY_LIGHT_ALPHA = 0.1;
const HEX_COLOR = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

const toHex = (channels: number[]) =>
  `#${channels.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;

/** A hex color at `alpha` over a white page, as the opaque hex it looks like. */
const hexOverWhite = (hex: string, alpha: number) =>
  toHex(
    String(hexToRgb(hex))
      .split(",")
      .map((channel) => Number(channel) * alpha + 255 * (1 - alpha)),
  );

/**
 * The app theme with the organization's brand color as primary. It builds on
 * the app theme, not a bare one, so the warning / success / error shades,
 * typography and component overrides match the rest of the app.
 */
export const createOrganizationTheme = (
  mainColor?: string,
  textColor?: string,
) => {
  const colorToUse = mainColor || DEFAULT_MAIN_COLOR;

  return createTheme(createAppTheme(), {
    palette: {
      primary: {
        main: `rgba(${hexToRgb(colorToUse)}, ${PRIMARY_MAIN_ALPHA})`,
        contrastText: textColor ?? DEFAULT_TEXT_COLOR,
        light: `rgba(${hexToRgb(colorToUse)}, ${PRIMARY_LIGHT_ALPHA})`,
        dark: `rgba(${hexToRgb(colorToUse)}, 1)`,
      },
    },
  });
};

/**
 * The same organization colors for an Excel download. A workbook has no
 * transparency, so the translucent primary shades are flattened to what they
 * look like on the page's white background.
 */
export const getOrganizationExcelTheme = (
  mainColor?: string,
  textColor?: string,
): ExcelTheme => {
  const colorToUse = mainColor && HEX_COLOR.test(mainColor) ? mainColor : DEFAULT_MAIN_COLOR;
  const textToUse = textColor && HEX_COLOR.test(textColor) ? textColor : DEFAULT_TEXT_COLOR;

  return {
    primary: hexOverWhite(colorToUse, PRIMARY_MAIN_ALPHA),
    primaryLight: hexOverWhite(colorToUse, PRIMARY_LIGHT_ALPHA),
    contrastText: hexOverWhite(textToUse, 1),
  };
};
