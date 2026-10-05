import React from "react";
import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MaterialScheduleCarouselProps {
  children: React.ReactNode;
}

const arrowSx = {
  bgcolor: "background.paper",
  border: 1,
  borderColor: "divider",
  color: "text.primary",
  flexShrink: 0,
  height: 28,
  width: 28,
  "&:hover": { bgcolor: "action.hover" },
};

export function MaterialScheduleCarousel({ children }: MaterialScheduleCarouselProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const visibleSlides = isMobile ? 1 : isTablet ? 2 : 3;

  const items = React.Children.toArray(children);
  const maxStartIndex = Math.max(0, items.length - visibleSlides);
  const [startIndex, setStartIndex] = React.useState(0);
  const safeStartIndex = Math.min(startIndex, maxStartIndex);
  const showArrows = items.length > visibleSlides;

  const handlePrevious = (event: React.MouseEvent) => {
    event.stopPropagation();
    setStartIndex(Math.max(0, safeStartIndex - 1));
  };

  const handleNext = (event: React.MouseEvent) => {
    event.stopPropagation();
    setStartIndex(Math.min(maxStartIndex, safeStartIndex + 1));
  };

  return (
    <Box sx={{ alignItems: "center", display: "flex", gap: 1, minWidth: 0, width: "100%" }}>
      {showArrows && (
        <IconButton
          aria-label={t("common.previous")}
          disabled={safeStartIndex === 0}
          onClick={handlePrevious}
          size="small"
          sx={arrowSx}
        >
          <ChevronLeft size={16} />
        </IconButton>
      )}
      <Box
        sx={{
          display: "grid",
          flex: 1,
          gap: 1,
          gridTemplateColumns: `repeat(${visibleSlides}, minmax(0, 1fr))`,
          minWidth: 0,
        }}
      >
        {items.slice(safeStartIndex, safeStartIndex + visibleSlides)}
      </Box>
      {showArrows && (
        <IconButton
          aria-label={t("common.next")}
          disabled={safeStartIndex >= maxStartIndex}
          onClick={handleNext}
          size="small"
          sx={arrowSx}
        >
          <ChevronRight size={16} />
        </IconButton>
      )}
    </Box>
  );
}
