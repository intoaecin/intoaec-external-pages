import { createTheme } from "@mui/material";
import { hexToRgb } from "@/lib/helpers";
import { createAppTheme } from "@/styles/theme";

/**
 * The app theme with the organization's brand color as primary. It builds on
 * the app theme, not a bare one, so the warning / success / error shades,
 * typography and component overrides match the rest of the app.
 */
export const createOrganizationTheme = (
  mainColor?: string,
  textColor?: string,
) => {
  const colorToUse = mainColor || "#1976d2";

  return createTheme(createAppTheme(), {
    palette: {
      primary: {
        main: `rgba(${hexToRgb(colorToUse)}, 0.8)`,
        contrastText: textColor ?? "#FFFFFF",
        light: `rgba(${hexToRgb(colorToUse)}, 0.1)`,
        dark: `rgba(${hexToRgb(colorToUse)}, 1)`,
      },
    },
  });
};
