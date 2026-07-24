import React from "react";
import { Box, Typography, type TypographyProps } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { SxProps, Theme } from "@mui/material/styles";
import { NoDataVector } from "@/assets/icons/no-data-vector-common";

export type NoDataFoundSize = "small" | "medium" | "large";

export interface NoDataFoundProps {
  /** Image source path for the empty state illustration. If not provided, uses NoDataVector SVG. */
  image?: string;
  /** Optional custom text; defaults to localized `common.noDataFound`. */
  text?: string;
  /** Preset size for the illustration; defaults to "medium". */
  size?: NoDataFoundSize;
  /** Width of the image; overrides size if provided. */
  imageWidth?: number | string;
  /** Extra styles for the outer flex container. */
  sx?: SxProps<Theme>;
  /** Typography variant for the message; defaults to "body1". */
  textVariant?: TypographyProps["variant"];
  /** Extra styles for the message text. */
  textSx?: SxProps<Theme>;
}

/**
 * Reusable "no data found" component for tables, lists, and empty states.
 * Displays NoDataVector SVG (or custom image) with centered text below it.
 */
const NoDataFound: React.FC<NoDataFoundProps> = ({
  image,
  text,
  size = "large",
  imageWidth,
  sx,
  textVariant = "body1",
  textSx,
}) => {
  const { t } = useTranslation();

  const sizeWidths: Record<NoDataFoundSize, string | number> = {
    small: 120,
    medium: 200,
    large: 280,
  };

  const finalImageWidth = imageWidth ?? sizeWidths[size];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 2,
        ...sx,
      }}
    >
      {image ? (
        <img src={image} width={finalImageWidth} alt="" />
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            lineHeight: 0,
            "& svg": {
              width: finalImageWidth,
              height: "auto",
              maxWidth: "100%",
              display: "block",
            },
          }}
        >
          <NoDataVector />
        </Box>
      )}
      <Typography
        component="span"
        variant={textVariant}
        fontWeight="500"
        sx={{ mt: 2, ...textSx }}
      >
        {text || t("common.noDataFound")}
      </Typography>
    </Box>
  );
};

export default NoDataFound;
