import { CLIENT_REPORT_COLORS } from "@/constants/colors";
import EditIcon from "@/assets/icons/edit-icon";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useClientReportTasks } from "./hooks/useClientReportTasks";
import { toLowerNoSpace } from "@/utils/string";

type TaskProgressItem = {
  id: string;
  title: string;
  progress: number;
  taskStatus: string;
  status: string;
};

type ClientReportTaskProgressProps = {
  isPreview?: boolean;
  disableFetch?: boolean;
  taskProgress?: Record<string, unknown>[];
  dateRange?: {
    startDate?: number;
    endDate?: number;
  };
  emptyStateMinHeight?: number | string;
  onTaskProgressChange?: (taskProgress: Record<string, unknown>[]) => void;
  assigneeUserId?: string;
};

const clampPercentage = (value: string | number | undefined) => {
  const percentage = Number(value) || 0;

  return Math.min(100, Math.max(0, percentage));
};

const ClientReportTaskProgress = ({
  isPreview = false,
  disableFetch = false,
  taskProgress,
  dateRange,
  emptyStateMinHeight,
  onTaskProgressChange,
  assigneeUserId,
}: ClientReportTaskProgressProps) => {
  const { t } = useTranslation();
  const { tasks, loading } = useClientReportTasks(dateRange, {
    enabled: !disableFetch,
    assigneeUserId,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const taskProgressItems = useMemo<TaskProgressItem[]>(
    () =>
      taskProgress
        ? taskProgress.map((task) => ({
            id: String(task.id ?? task.taskId ?? ""),
            title: String(task.title ?? task.taskHeader ?? "-"),
            progress: clampPercentage(task.progress as string | number),
            taskStatus: String(task.taskStatus ?? task.status ?? "TO DO"),
            status: String(task.status ?? task.taskStatus ?? "TO DO"),
          }))
        : tasks.map((task) => ({
            id: task.taskId,
            title: task.taskHeader || "-",
            progress: clampPercentage(task.progress),
            taskStatus: task.taskStatus ?? task.status ?? "TO DO",
            status: task.status ?? task.taskStatus ?? "TO DO",
          })),
    [taskProgress, tasks],
  );

  useEffect(() => {
    setSelectedTaskIds(taskProgressItems.map((task) => task.id));
  }, [taskProgressItems]);

  const visibleTasks = isEditing
    ? taskProgressItems
    : taskProgressItems.filter((task) => selectedTaskIds.includes(task.id));
  const isEmptyState = !loading && visibleTasks.length === 0;

  useEffect(() => {
    onTaskProgressChange?.(
      taskProgressItems.filter((task) => selectedTaskIds.includes(task.id)),
    );
  }, [onTaskProgressChange, selectedTaskIds, taskProgressItems]);

  const handleToggleTask = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((selectedTaskId) => selectedTaskId !== taskId)
        : [...prev, taskId],
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
          {t("clientReport.taskProgress", {
            defaultValue: "Task Progress",
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
        className="report-task-card"
        sx={{
          bgcolor: "background.paper",
          border: `1px solid ${CLIENT_REPORT_COLORS.border}`,
          borderRadius: 1,
          px: { xs: 1.5, sm: 2, lg: 3 },
          pt: { xs: 1, sm: 1.5 },
          pb: { xs: 2.5, sm: 3 },
          ...(isEmptyState && emptyStateMinHeight
            ? {
                minHeight: emptyStateMinHeight,
                display: "flex",
                alignItems: "center",
              }
            : {}),
        }}
      >
        {loading ? (
          <Box
            className="report-task-grid"
            sx={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "repeat(2, minmax(0, 1fr))",
              },
              columnGap: { xs: 1.25, sm: 1.5, lg: 3 },
              rowGap: { xs: 1.25, sm: 1.5 },
            }}
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <Box
                key={`task-progress-loading-${index}`}
                sx={{ px: { xs: 1.25, sm: 1.5 }, py: { xs: 1.25, sm: 1.5 } }}
              >
                <Stack spacing={1}>
                  <Skeleton variant="text" width="65%" height={24} />
                  <Skeleton variant="text" width="45%" height={20} />
                  <Skeleton variant="rounded" width="100%" height={4} />
                </Stack>
              </Box>
            ))}
          </Box>
        ) : visibleTasks.length > 0 ? (
          <Box
            sx={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "repeat(2, minmax(0, 1fr))",
              },
              columnGap: { xs: 1.25, sm: 1.5, lg: 3 },
              rowGap: { xs: 1.25, sm: 1.5 },
              "&::before": {
                content: '""',
                display: { xs: "none", lg: "block" },
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
            {visibleTasks.map((task) => {
              const isSelected = selectedTaskIds.includes(task.id);

              return (
                <Box
                  className="report-task-item"
                  key={task.id}
                  sx={{
                    px: { xs: 1.25, sm: 1.5 },
                    pt: { xs: 1.25, sm: 1.5 },
                    pb: { xs: 2, sm: 2.25 },
                  }}
                >
                  <Stack
                    className="report-task-row"
                    direction={{ xs: "column", md: "row" }}
                    alignItems={{ xs: "stretch", md: "center" }}
                    justifyContent="space-between"
                    spacing={{ xs: 1.25, md: 2 }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ minWidth: 0, flex: "1 1 auto" }}
                    >
                      {isEditing && (
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleToggleTask(task.id)}
                          size="small"
                          sx={{ p: 0.5 }}
                        />
                      )}
                      <Box sx={{ minWidth: 0, width: "100%" }}>
                        <Typography
                          className="report-list-title"
                          noWrap
                          sx={{
                            typography: "body2",
                            lineHeight: 1.35,
                          }}
                        >
                          {task.title}
                        </Typography>
                        <Chip
                          className="report-status-chip"
                          label={t(`taskStatus.${toLowerNoSpace(task.taskStatus)}`, {
                            defaultValue: task.taskStatus,
                          })}
                          size="small"
                          sx={{
                            height: 20,
                            maxWidth: { xs: "100%", md: 180 },
                            minWidth: 44,
                            mt: 0.75,
                            bgcolor: CLIENT_REPORT_COLORS.chipSelected,
                            color: "primary.main",
                            typography: "caption",
                            "& .MuiChip-label": {
                              display: "block",
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            },
                          }}
                        />
                      </Box>
                    </Stack>
                    <Box
                      className="report-progress-block"
                      sx={{
                        width: { xs: "100%", md: 220 },
                        flexShrink: 0,
                        ml: { md: "auto" },
                        mt: { xs: 0.5, md: 0 },
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                        sx={{ mb: 0.75 }}
                      >
                        <Typography
                          sx={{
                            typography: "caption",
                            color: CLIENT_REPORT_COLORS.mutedText,
                          }}
                        >
                          {t("clientReport.progress", {
                            defaultValue: "Progress",
                          })}
                        </Typography>
                        <Typography
                          sx={{
                            typography: "body2",
                            color: "primary.main",
                          }}
                        >
                          {task.progress} %
                        </Typography>
                      </Stack>
                      <Box
                        className="report-progress-track"
                        sx={{
                          height: 4,
                          minHeight: 4,
                          bgcolor: CLIENT_REPORT_COLORS.surfaceMuted,
                          borderRadius: 999,
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "stretch",
                        }}
                      >
                        <Box
                          sx={{
                            width: `${task.progress}%`,
                            height: 4,
                            minHeight: 4,
                            bgcolor: "primary.main",
                            borderRadius: 999,
                          }}
                        />
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: CLIENT_REPORT_COLORS.mutedText }}>
            {t("clientReport.noTasksSelected", {
              defaultValue: "No tasks selected",
            })}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ClientReportTaskProgress;
