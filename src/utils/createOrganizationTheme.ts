import { createTheme } from "@mui/material";
import { hexToRgb } from "@/lib/helpers";
import { DEFAULT_APP_FONT_FAMILY } from "@/styles/theme";

export const createOrganizationTheme = (
  mainColor?: string,
  textColor?: string,
) => {
  const colorToUse = mainColor || "#1976d2";

  return createTheme({
    typography: { fontFamily: DEFAULT_APP_FONT_FAMILY },
    palette: {
      background: {
        subtle: "#fbfdff",
      },
      primary: {
        main: `rgba(${hexToRgb(colorToUse)}, 0.8)`,
        contrastText: textColor ?? "#FFFFFF",
        light: `rgba(${hexToRgb(colorToUse)}, 0.1)`,
        dark: `rgba(${hexToRgb(colorToUse)}, 1)`,
      },
    },
  });
};
