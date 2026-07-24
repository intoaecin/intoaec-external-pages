import { Box, CircularProgress } from "@mui/material";

export const UIButtonLoader = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <CircularProgress size={20} disableShrink />
    </Box>
  );
};
