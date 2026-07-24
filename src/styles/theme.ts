import { createTheme } from "@mui/material/styles";

export const DEFAULT_APP_FONT_FAMILY = "'Poppins', sans-serif";

declare module "@mui/material/styles" {
  interface TypeBackground {
    subtle: string;
  }
}

export const createAppTheme = (fontFamily: string = DEFAULT_APP_FONT_FAMILY) =>
  createTheme({
    typography: {
      fontFamily,
      h1: { fontWeight: 600 },
      h2: { fontWeight: 600 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontSize: "18px", fontWeight: 600 },
    },
    palette: {
      background: {
        subtle: "#fbfdff",
      },
      primary: {
        main: "#3CA2FF",
        light: "#E5F3FF",
        dark: "#3CA2FF",
        contrastText: "#ffff",
      },
      error: {
        main: "#F7685B",
        light: "#FFE4E1",
        contrastText: "#ffff",
      },
      success: {
        main: "#2ED47A",
        light: "#E8FFF3",
        contrastText: "#ffff",
      },
      secondary: {
        main: "#F0F0F0",
        light: "#E2E6EB",
        contrastText: "#000000",
      },
      warning: {
        main: "#F7AF5B",
        light: "#FFE5C7",
        contrastText: "#000000",
      },
      info: {
        main: "#FF9F00",
        light: "#FF9F001A",
        contrastText: "#000000",
      },
    },
    components: {
      MuiTypography: {
        styleOverrides: {
          root: {
            wordWrap: "break-word",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiInput-root.Mui-error:before": {
              borderBottomColor: "#F7685B",
            },
            "& .MuiFormHelperText-root.Mui-error": {
              color: "#F7685B !important",
            },
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
              backgroundColor: "#ffffff",
            },
            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
              borderRadius: "0.7rem",
              backgroundColor: "#D3D3D3",
              minHeight: 24,
              border: "7px solid #ffffff",
              width: "15px",
            },
            "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus":
            {
              backgroundColor: "#bdbbbb",
            },
            "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active":
            {
              backgroundColor: "#bdbbbb",
            },
            "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover":
            {
              backgroundColor: "#bdbbbb",
            },
            "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
              backgroundColor: "#ffffff",
            },
            "& .MuiPickersPopper-root *, & .MuiMultiSectionDigitalClockSection-root, & .MuiYearCalendar-root": {
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(155, 155, 155, 0.5) transparent",
            },
            "& .MuiPickersPopper-root *::-webkit-scrollbar, & .MuiMultiSectionDigitalClockSection-root::-webkit-scrollbar, & .MuiYearCalendar-root::-webkit-scrollbar": {
              width: "2px",
              height: "2px",
              backgroundColor: "transparent",
            },
            "& .MuiPickersPopper-root *::-webkit-scrollbar-track, & .MuiMultiSectionDigitalClockSection-root::-webkit-scrollbar-track, & .MuiYearCalendar-root::-webkit-scrollbar-track": {
              background: "transparent",
              backgroundColor: "transparent",
            },
            "& .MuiPickersPopper-root *::-webkit-scrollbar-thumb, & .MuiMultiSectionDigitalClockSection-root::-webkit-scrollbar-thumb, & .MuiYearCalendar-root::-webkit-scrollbar-thumb": {
              borderRadius: "3px",
              backgroundColor: "#D3D3D3",
              minHeight: 24,
              border: "none",
              width: "2px",
            },
            "& .MuiPickersPopper-root *::-webkit-scrollbar-thumb:focus, & .MuiMultiSectionDigitalClockSection-root::-webkit-scrollbar-thumb:focus, & .MuiYearCalendar-root::-webkit-scrollbar-thumb:focus, & .MuiPickersPopper-root *::-webkit-scrollbar-thumb:active, & .MuiMultiSectionDigitalClockSection-root::-webkit-scrollbar-thumb:active, & .MuiYearCalendar-root::-webkit-scrollbar-thumb:active, & .MuiPickersPopper-root *::-webkit-scrollbar-thumb:hover, & .MuiMultiSectionDigitalClockSection-root::-webkit-scrollbar-thumb:hover, & .MuiYearCalendar-root::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#bdbbbb",
            },
            "& .MuiColorInput-PopoverBody .MuiBox-root:last-child": {
              display: "none",
            },
            fontFamily,
          },
          "*": {
            fontFamily,
          },
          '[role="presentation"]': {
            fontFamily,
          },
        },
      },
    },
  });
