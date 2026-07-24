import { Box, SxProps, Theme, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import React from "react";

interface Props {
  children?: React.ReactNode;
  boxShadow?: number;
  borderRadius?: number;
  isClickable?: boolean;
  padding?: number;
  sx?: SxProps<Theme>;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  bottomDivider?: boolean;
  border?: boolean;
}
const defaultRestBoxShadow = (theme: Theme) =>
  [
    `0px 2px 4px -1px ${alpha(theme.palette.common.black, 0.06)}`,
    `0px 4px 6px -1px ${alpha(theme.palette.common.black, 0.08)}`,
  ].join(", ");

export const CardLayout = ({
  children,
  boxShadow,
  borderRadius = 2,
  isClickable = true,
  padding = 2,
  sx,
  bottomDivider = false,
  border = false,
  onClick,
}: Props) => {
  const theme = useTheme();
  const restBoxShadow =
    boxShadow === undefined
      ? defaultRestBoxShadow(theme)
      : boxShadow > 0
        ? boxShadow
        : "none";

  return (
    <Box
      onClick={onClick}
      sx={{
        backgroundColor: "#fff",
        p: padding,
        boxShadow: restBoxShadow,
        borderRadius,
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
        ...(isClickable && {
          cursor: "pointer",
          "&:hover": {
            boxShadow: [
              `0px 1px 3px 0px ${alpha(theme.palette.common.black, 0x4d / 255)}`,
              `0px 4px 8px 3px ${alpha(theme.palette.common.black, 0x26 / 255)}`,
            ].join(", "),
            transform: "translateY(-2px)",
          },
        }),
        ...sx,
        ...(bottomDivider && {
          borderBottom: "1px solid",
          borderColor: "divider",
        }),
        ...(border && {
          border: "1px solid " + theme.palette.divider,
        }),
      }}
    >
      {children}
    </Box>
  );
};
