import { CLIENT_REPORT_COLORS } from "@/constants/colors";
import EditIcon from "@/assets/icons/edit-icon";
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useClientReportSchedules } from "./hooks/useClientReportSchedules";

type ScheduleProgressItem = {
  id: string;
  title: string;
  planned: number;
  actual: number;
};

type ClientReportScheduleProgressProps = {
  isPreview?: boolean;
  disableFetch?: boolean;
  scheduleProgress?: Record<string, unknown>[];
  dateRange?: {
    startDate?: number;
    endDate?: number;
  };
  emptyStateMinHeight?: number | string;
  onScheduleProgressChange?: (scheduleProgress: Record<string, unknown>[]) => void;
  assigneeUserId?: string;
};

const clampPercentage = (value: string | number | undefined) => {
  const percentage = Number(value) || 0;

  return Math.min(100, Math.max(0, percentage));
};

const ClientReportScheduleProgress = ({
  isPreview = false,
  disableFetch = false,
  scheduleProgress,
  dateRange,
  emptyStateMinHeight,
  onScheduleProgressChange,
  assigneeUserId,
}: ClientReportScheduleProgressProps) => {
  const { t } = useTranslation();
  const { schedules, loading } = useClientReportSchedules(dateRange, {
    enabled: !disableFetch,
    assigneeUserId,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<string[]>([]);

  const scheduleProgressItems = useMemo<ScheduleProgressItem[]>(
    () =>
      scheduleProgress
        ? scheduleProgress.map((schedule) => ({
            id: String(schedule.id ?? schedule.scheduleId ?? ""),
            title: String(schedule.title ?? schedule.scheduleName ?? "-"),
            planned: Number(schedule.planned ?? 100),
            actual: clampPercentage(
              (schedule.actual ??
                schedule.scheduleCompletionPercentage) as string | number,
            ),
          }))
        : schedules.map((schedule) => ({
            id: schedule.scheduleId,
            title: schedule.scheduleName || "-",
            planned: 100,
            actual: clampPercentage(schedule.scheduleCompletionPercentage),
          })),
    [scheduleProgress, schedules],
  );

  useEffect(() => {
    setSelectedScheduleIds(scheduleProgressItems.map((item) => item.id));
  }, [scheduleProgressItems]);

  const visibleScheduleItems = isEditing
    ? scheduleProgressItems
    : scheduleProgressItems.filter((item) =>
        selectedScheduleIds.includes(item.id),
      );
  const isEmptyState = !loading && visibleScheduleItems.length === 0;
  const shouldShowGridDivider = loading || visibleScheduleItems.length > 0;

  useEffect(() => {
    onScheduleProgressChange?.(
      scheduleProgressItems.filter((item) => selectedScheduleIds.includes(item.id)),
    );
  }, [onScheduleProgressChange, scheduleProgressItems, selectedScheduleIds]);

  const handleToggleSchedule = (scheduleId: string) => {
    setSelectedScheduleIds((prev) =>
      prev.includes(scheduleId)
        ? prev.filter((selectedScheduleId) => selectedScheduleId !== scheduleId)
        : [...prev, scheduleId],
    );
  };

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: CLIENT_REPORT_COLORS.sectionTitle,
          }}
        >
          {t("clientReport.scheduleProgress", {
            defaultValue: "Schedule Progress",
          })}
        </Typography>
        {!isPreview && isEditing && (
          <Button
            variant="contained"
            size="small"
            onClick={() => setIsEditing(false)}
            sx={{ minWidth: 56, textTransform: "none" }}
          >
            {t("common.save", { defaultValue: "Save" })}
          </Button>
        )}
        {!isPreview && !isEditing && (
          <IconButton
            size="small"
            sx={{ color: "primary.main" }}
            onClick={() => setIsEditing(true)}
          >
            <EditIcon width={16} height={16} fill="currentColor" />
          </IconButton>
        )}
      </Stack>

      <Box
        sx={{
          bgcolor: "background.paper",
          border: `1px solid ${CLIENT_REPORT_COLORS.border}`,
          borderRadius: 1,
          px: { xs: 1.5, sm: 2, lg: 3 },
          py: { xs: 1.5, sm: 2 },
          ...(isEmptyState && emptyStateMinHeight
            ? {
                minHeight: emptyStateMinHeight,
                display: "flex",
                alignItems: "center",
              }
            : {}),
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "grid",
            width: "100%",
            gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
            columnGap: { xs: 1.25, sm: 1.5, lg: 3 },
            rowGap: { xs: 1.25, sm: 1.5 },
            "&::before": {
              content: '""',
              display: {
                xs: "none",
                lg: shouldShowGridDivider ? "block" : "none",
              },
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "50%",
              width: "1px",
              bgcolor: CLIENT_REPORT_COLORS.border,
              transform: "translateX(-50%)",
            },
          }}
        >
          {loading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <Box
                key={`schedule-progress-loading-${index}`}
                sx={{ px: { xs: 1.25, sm: 1.5 }, py: { xs: 1.25, sm: 1.5 } }}
              >
                <Stack spacing={1}>
                  <Skeleton variant="text" width="65%" height={24} />
                  <Skeleton variant="text" width="45%" height={20} />
                  <Skeleton variant="rounded" width="100%" height={4} />
                </Stack>
              </Box>
            ))
          ) : visibleScheduleItems.length > 0 ? (
            visibleScheduleItems.map((item, index) => {
              const isSelected = selectedScheduleIds.includes(item.id);

              return (
                <Box
                  key={`${item.id}-${index}`}
                  sx={{
                    px: { xs: 1.25, sm: 1.5 },
                    py: { xs: 1.25, sm: 1.5 },
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    alignItems="flex-start"
                    justifyContent="space-between"
                    spacing={{ xs: 1.5, md: 2 }}
                    sx={{ mb: { xs: 1.5, sm: 2 } }}
                  >
                    <Stack direction="row" alignItems="flex-start" spacing={1}>
                      {isEditing && (
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleToggleSchedule(item.id)}
                          size="small"
                          sx={{ p: 0.5, mt: -0.5 }}
                        />
                      )}
                      <Box>
                        <Typography
                          className="report-list-title"
                          sx={{
                            typography: "body2",
                            lineHeight: 1.35,
                          }}
                        >
                          {item.title}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={{ xs: 2, sm: 2.5 }}
                      sx={{
                        flexShrink: 0,
                        alignSelf: { xs: "stretch", md: "flex-start" },
                        justifyContent: {
                          xs: "space-between",
                          md: "flex-start",
                        },
                      }}
                    >
                      <Box sx={{ textAlign: "right" }}>
                        <Typography
                          sx={{
                            typography: "caption",
                            color: CLIENT_REPORT_COLORS.mutedText,
                          }}
                        >
                          {t("clientReport.planned", {
                            defaultValue: "Planned",
                          })}
                        </Typography>
                        <Typography
                          sx={{
                            typography: "body2",
                          }}
                        >
                          {item.planned} %
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography
                          sx={{
                            typography: "caption",
                            color: CLIENT_REPORT_COLORS.mutedText,
                          }}
                        >
                          {t("clientReport.actual", {
                            defaultValue: "Actual",
                          })}
                        </Typography>
                        <Typography
                          sx={{
                            typography: "body2",
                            color: "primary.main",
                          }}
                        >
                          {item.actual} %
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                  <Box
                    sx={{
                      height: 4,
                      minHeight: 4,
                      bgcolor: CLIENT_REPORT_COLORS.surfaceMuted,
                      borderRadius: 999,
                      overflow: "hidden",
                      position: "relative",
                      display: "flex",
                      alignItems: "stretch",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${item.actual}%`,
                        height: 4,
                        minHeight: 4,
                        bgcolor: "primary.main",
                        borderRadius: 999,
                      }}
                    />
                  </Box>
                </Box>
              );
            })
          ) : (
            <Typography
              sx={{
                color: CLIENT_REPORT_COLORS.mutedText,
                typography: "body2",
                px: { xs: 1.25, sm: 1.5 },
                py: { xs: 1.25, sm: 1.5 },
              }}
            >
              {t("clientReport.noSchedulesSelected", {
                defaultValue: "No schedules selected",
              })}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ClientReportScheduleProgress;
