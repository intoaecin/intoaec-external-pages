export const scrollbarStyles = {
    scrollbarWidth: "thin", // For Firefox
    scrollbarColor: "rgba(155, 155, 155, 0.5) transparent", // For Firefox
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "rgba(155, 155, 155, 0.5)",
      border: "2px solid transparent",
      borderRadius: "4px",
      minHeight: 40,
      minWidth: 40,
      "&:hover": {
        background: "rgba(155, 155, 155, 0.7)",
        borderWidth: "1px",
      },
    },
    // Add subtle fade effect when content is scrollable
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      right: 0,
      left: 0,
      height: "20px",
      background: "linear-gradient(to top, rgba(255,255,255,0.8), transparent)",
      pointerEvents: "none",
      display: "block",
    },
  };

export const hideScrollbarSx = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
} as const;
