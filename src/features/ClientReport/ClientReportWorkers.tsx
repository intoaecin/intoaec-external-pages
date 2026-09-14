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
import { useClientReportWorkers } from "./hooks/useClientReportWorkers";

type WorkerReportItem = {
  id: string;
  shiftName: string;
  workerName: string;
  role: string;
  totalWorkedDuration: number;
  overtimeDuration: number;
};

type ClientReportWorkersProps = {
  isPreview?: boolean;
  disableFetch?: boolean;
  workersProgress?: Record<string, unknown>[];
  dateRange?: {
    startDate?: number;
    endDate?: number;
  };
  onWorkersProgressChange?: (workersProgress: Record<string, unknown>[]) => void;
};

const ClientReportWorkers = ({
  isPreview = false,
  disableFetch = false,
  workersProgress,
  dateRange,
  onWorkersProgressChange,
}: ClientReportWorkersProps) => {
  const { t } = useTranslation();
  const { workers, loading } = useClientReportWorkers(dateRange, {
    enabled: !disableFetch,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);

  const workerReportItems = useMemo<WorkerReportItem[]>(
    () =>
      workersProgress
        ? workersProgress.map((worker) => ({
            id: String(worker.id ?? worker.shiftWorkerId ?? ""),
            shiftName: String(worker.shiftName ?? "-"),
            workerName: String(worker.workerName ?? "-"),
            role: String(worker.role ?? "-"),
            totalWorkedDuration: Number(worker.totalWorkedDuration) || 0,
            overtimeDuration: Number(worker.overtimeDuration) || 0,
          }))
        : workers.map((worker) => ({
            id: worker.shiftWorkerId,
            shiftName: worker.shiftName || "-",
            workerName: worker.workerName || "-",
            role: worker.role || "-",
            totalWorkedDuration: Number(worker.totalWorkedDuration) || 0,
            overtimeDuration: Number(worker.overtimeDuration) || 0,
          })),
    [workers, workersProgress],
  );

  useEffect(() => {
    setSelectedWorkerIds(workerReportItems.map((item) => item.id));
  }, [workerReportItems]);

  const visibleWorkerItems = isEditing
    ? workerReportItems
    : workerReportItems.filter((item) => selectedWorkerIds.includes(item.id));
  const shouldShowGridDivider = loading || visibleWorkerItems.length > 0;

  useEffect(() => {
    onWorkersProgressChange?.(
      workerReportItems.filter((item) => selectedWorkerIds.includes(item.id)),
    );
  }, [onWorkersProgressChange, selectedWorkerIds, workerReportItems]);

  const handleToggleWorker = (workerId: string) => {
    setSelectedWorkerIds((prev) =>
      prev.includes(workerId)
        ? prev.filter((selectedWorkerId) => selectedWorkerId !== workerId)
        : [...prev, workerId],
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
          {t("common.workers", { defaultValue: "Workers" })}
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
          py: { xs: 1, sm: 1.5 },
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "grid",
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
                key={`worker-report-loading-${index}`}
                sx={{ px: { xs: 1.25, sm: 1.5 }, py: { xs: 1.25, sm: 1.5 } }}
              >
                <Stack spacing={1}>
                  <Skeleton variant="rounded" width={96} height={20} />
                  <Skeleton variant="text" width="65%" height={24} />
                  <Skeleton variant="text" width="45%" height={20} />
                </Stack>
              </Box>
            ))
          ) : visibleWorkerItems.length > 0 ? (
            visibleWorkerItems.map((item, index) => {
              const isSelected = selectedWorkerIds.includes(item.id);

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
                    justifyContent="space-between"
                    spacing={{ xs: 1.25, md: 2 }}
                    sx={{ py: { xs: 1.25, sm: 1.5 } }}
                  >
                    <Stack direction="row" alignItems="flex-start" spacing={1}>
                      {isEditing && (
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleToggleWorker(item.id)}
                          size="small"
                          sx={{ p: 0.5, mt: -0.5 }}
                        />
                      )}
                      <Box>
                        <Chip
                          className="report-status-chip"
                          label={item.shiftName}
                          size="small"
                          sx={{
                            height: 20,
                            maxWidth: "100%",
                            bgcolor: CLIENT_REPORT_COLORS.chipSelected,
                            color: "primary.main",
                            typography: "caption",
                            mb: 0.75,
                            "& .MuiChip-label": {
                              display: "block",
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            },
                          }}
                        />
                        <Typography
                          sx={{
                            typography: "body2",
                          }}
                        >
                          {item.workerName}
                        </Typography>
                        <Typography
                          sx={{
                            typography: "caption",
                            color: CLIENT_REPORT_COLORS.mutedText,
                          }}
                        >
                          {item.role}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={{ xs: 2, sm: 3 }}
                      sx={{
                        alignSelf: { xs: "stretch", md: "center" },
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
                          {t("reports.totalHours", {
                            defaultValue: "Total Hours",
                          })}
                        </Typography>
                        <Typography
                          sx={{
                            typography: "body2",
                            color: "primary.main",
                          }}
                        >
                          {item.totalWorkedDuration}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography
                          sx={{
                            typography: "caption",
                            color: CLIENT_REPORT_COLORS.mutedText,
                          }}
                        >
                          {t("reports.otHours", { defaultValue: "OT Hours" })}
                        </Typography>
                        <Typography
                          sx={{
                            typography: "body2",
                            color: "primary.main",
                          }}
                        >
                          {item.overtimeDuration}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
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
              {t("clientReport.noWorkersSelected", {
                defaultValue: "No workers selected",
              })}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ClientReportWorkers;
