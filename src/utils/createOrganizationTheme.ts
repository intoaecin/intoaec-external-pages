import { createTheme } from "@mui/material";
import { hexToRgb } from "@/lib/helpers";

export const createOrganizationTheme = (
  mainColor?: string,
  textColor?: string,
) => {
  const colorToUse = mainColor || "#1976d2";

  return createTheme({
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
