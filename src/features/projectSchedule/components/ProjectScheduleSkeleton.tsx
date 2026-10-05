import { Box, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PAGE_HEIGHT_WITHOUT_HEADER_WITH_TAB } from "@/components/layout/PageLayout";

// Enough 60px rows to cover the tallest viewport; the container clips the rest.
const SKELETON_ROW_COUNT = 40;

interface ProjectScheduleSkeletonProps {
  ariaLabel?: string;
}

export function ProjectScheduleSkeleton({
  ariaLabel,
}: ProjectScheduleSkeletonProps) {
  const { t } = useTranslation();

  return (
    <Box
      role="status"
      aria-label={ariaLabel ?? t("common.loading")}
      sx={{
        height: PAGE_HEIGHT_WITHOUT_HEADER_WITH_TAB,
        maxHeight: "100%",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <Box key={index} sx={{ m: 1 }}>
          <Skeleton variant="rectangular" height={60} />
        </Box>
      ))}
    </Box>
  );
}
