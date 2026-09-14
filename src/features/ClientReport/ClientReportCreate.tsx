import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { CLIENT_REPORT_COLORS } from "@/constants/colors";
import {
  Box,
  Button,
  Modal,
  Slide,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import ClientReportAttachments from "./ClientReportAttachments";
import ClientReportNotes from "./ClientReportNotes";
import ClientReportScheduleProgress from "./ClientReportScheduleProgress";
import ClientReportSideBar, {
  type ClientReportLogSection,
} from "./ClientReportSideBar";
import ClientReportTaskProgress from "./ClientReportTaskProgress";
import ClientReportsInventory from "./ClientReportsInventory";
import ClientReportWorkers from "./ClientReportWorkers";
import { useLocalizedDayjs } from "../hooks/useLocalizedDayjs";
import TimeLog from "./TimeLog";
import type { ClientReportNotePayload, ClientReportRecord } from "./types";
import WeatherConditions from "./WeatherConditions";

/**
 * Ported from intoaec-UI `src/features/ClientReport/ClientReportCreate.tsx`.
 *
 * This is the client-facing PREVIEW path only. The source component also
 * handles the admin create/edit modes (`isPreview`/`isExternalPreview` both
 * false or `isPreview` false), which:
 *  - Render inside `<PageLayout>` (the admin shell with nav/breadcrumbs/back
 *    button) — confirmed unreachable here: the source's
 *    `if (isExternalPreview) { return content; }` early-return fires before
 *    the `<PageLayout>` JSX is ever reached, and this app's page always
 *    passes `isExternalPreview` (see `src/pages/client-report/index.tsx`).
 *    `PageLayout` itself is therefore not ported.
 *  - Call `useCreateClientReport`/`useUpdateClientReport`, both of which pull
 *    in `next-auth`'s `useSession` — this app has no next-auth session, so
 *    those hooks (and the "Save"/"Create" submit handler and breadcrumb/back
 *    handlers that only exist for the admin `<PageLayout>` actions/title) are
 *    dropped rather than ported. `useLeadData()` (previously only read inside
 *    the removed submit handler) is dropped for the same reason — nothing
 *    else in this component reads it.
 *  - `ClientReportFormData` was `Pick<ClientReportCreatePayload, ...>` in the
 *    source, sourced from the now-dropped `useCreateClientReport` hook file;
 *    the same field shape is inlined below instead.
 */

const defaultReport: ClientReportRecord = {
  id: "",
  date: "",
  title: "",
  startTime: "08:15 AM",
  endTime: "06:15 PM",
  totalHours: "10h00m",
  breakTime: "00h15m",
  weather: "Partly Cloudy",
  temperature: "72",
  affectingWork: false,
  status: "Draft",
  notes: "",
};

type ClientReportCreateProps = {
  report?: ClientReportRecord;
  isEdit?: boolean;
  isPreview?: boolean;
  isExternalPreview?: boolean;
};

type ClientReportFormData = {
  reportTitle?: string;
  notes?: ClientReportNotePayload[];
  attachments?: string[];
  weatherCondition?: Record<string, unknown> | null;
  scheduleProgress?: Record<string, unknown>[];
  taskProgress?: Record<string, unknown>[];
  workersProgress?: Record<string, unknown>[];
  inventoryStatus?: Record<string, unknown>[];
};

type ClientReportDateRange = {
  startDate?: number;
  endDate?: number;
};

const getTimestampFromQuery = (value: string | string[] | undefined) => {
  const timestampValue = Array.isArray(value) ? value[0] : value;
  const timestamp = Number(timestampValue);

  return Number.isFinite(timestamp) ? timestamp : undefined;
};

const getExistingReportTitle = (title?: string) => {
  if (!title || title === "-") {
    return undefined;
  }

  return title;
};

const hasRecords = (records?: unknown[]) =>
  Array.isArray(records) && records.length > 0;

const hasNoteContent = (value?: string) =>
  Boolean(
    value
      ?.replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim(),
  );

const hasNotes = (report: ClientReportRecord) =>
  hasNoteContent(report.notes) ||
  Boolean(report.noteSections?.some((note) => hasNoteContent(note.content)));

const hasWeatherData = (report: ClientReportRecord) =>
  Boolean(report.weatherCondition) ||
  Boolean(report.weather && report.weather !== "-") ||
  Boolean(report.temperature && report.temperature !== "-");

const getSelectedClientReportSections = (
  includedInLog?: ClientReportLogSection[],
): Record<ClientReportLogSection, boolean> => {
  if (!Array.isArray(includedInLog)) {
    return {
      weather: true,
      schedule: true,
      tasks: true,
      workers: true,
      inventory: true,
    };
  }

  return {
    weather: includedInLog.includes("weather"),
    schedule: includedInLog.includes("schedule"),
    tasks: includedInLog.includes("tasks"),
    workers: includedInLog.includes("workers"),
    inventory: includedInLog.includes("inventory"),
  };
};

const ClientReportCreate = ({
  report,
  isEdit = false,
  isPreview = false,
  isExternalPreview = false,
}: ClientReportCreateProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const isTabletOrBelow = useMediaQuery(theme.breakpoints.down("md"));
  const reportData = report ?? defaultReport;
  const mode = isPreview ? "preview" : isEdit ? "edit" : "create";
  const useSavedReportDataOnly = isPreview && Boolean(report);
  const { dateFormat, toLocalizedDayjs } = useLocalizedDayjs();
  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false);
  const [selectedSections, setSelectedSections] = useState<
    Record<ClientReportLogSection, boolean>
  >(() => getSelectedClientReportSections(reportData.includedInLog));

  useEffect(() => {
    setSelectedSections(
      getSelectedClientReportSections(reportData.includedInLog),
    );
  }, [reportData.includedInLog]);

  const selectedDateRange = useMemo<ClientReportDateRange>(
    () => ({
      startDate: getTimestampFromQuery(router.query.startDate),
      endDate: getTimestampFromQuery(router.query.endDate),
    }),
    [router.query.endDate, router.query.startDate],
  );

  const reportDateRange = useMemo(() => {
    if (selectedDateRange.startDate && selectedDateRange.endDate) {
      return {
        reportStartDate: selectedDateRange.startDate,
        reportEndDate: selectedDateRange.endDate,
      };
    }

    if (reportData.reportStartDate && reportData.reportEndDate) {
      return {
        reportStartDate: reportData.reportStartDate,
        reportEndDate: reportData.reportEndDate,
      };
    }

    const reportDate = reportData.date ? dayjs(reportData.date) : dayjs();
    const validReportDate = reportDate.isValid() ? reportDate : dayjs();

    return {
      reportStartDate: validReportDate.startOf("day").valueOf(),
      reportEndDate: validReportDate.endOf("day").valueOf(),
    };
  }, [
    reportData.date,
    reportData.reportEndDate,
    reportData.reportStartDate,
    selectedDateRange.endDate,
    selectedDateRange.startDate,
  ]);

  const defaultReportTitle = useMemo(() => {
    const fromDate =
      toLocalizedDayjs(reportDateRange.reportStartDate)?.format(dateFormat) ??
      "";
    const toDate =
      toLocalizedDayjs(reportDateRange.reportEndDate)?.format(dateFormat) ?? "";

    return t("clientReport.reportDateRangeTitle", {
      fromDate,
      toDate,
      defaultValue: `Report (${fromDate} - ${toDate})`,
      interpolation: { escapeValue: false },
    });
  }, [
    dateFormat,
    reportDateRange.reportEndDate,
    reportDateRange.reportStartDate,
    t,
    toLocalizedDayjs,
  ]);
  const isTodayReportDate = useMemo(() => {
    const today = dayjs();

    return (
      dayjs(reportDateRange.reportStartDate).isSame(today, "day") &&
      dayjs(reportDateRange.reportEndDate).isSame(today, "day")
    );
  }, [reportDateRange.reportEndDate, reportDateRange.reportStartDate]);
  const weatherDisabledTooltip = t("clientReport.weatherOnlyToday", {
    defaultValue: "Weather is available only for today's report.",
  });
  const disabledSections = useMemo(
    () => ({
      weather: {
        disabled: !isTodayReportDate,
        tooltip: weatherDisabledTooltip,
      },
    }),
    [isTodayReportDate, weatherDisabledTooltip],
  );

  useEffect(() => {
    if (isTodayReportDate) {
      return;
    }

    setSelectedSections((prev) =>
      prev.weather ? { ...prev, weather: false } : prev,
    );
  }, [isTodayReportDate]);

  const reportTitle =
    getExistingReportTitle(reportData.title) ?? defaultReportTitle;
  const hideEmptyPreviewSections = isPreview && Boolean(report);
  const isReportSectionIncluded = useCallback(
    (section: ClientReportLogSection) =>
      !Array.isArray(reportData.includedInLog) ||
      reportData.includedInLog.includes(section),
    [reportData.includedInLog],
  );
  const shouldShowReportSection = useCallback(
    (section: ClientReportLogSection, hasData: boolean) =>
      !hideEmptyPreviewSections ||
      (isReportSectionIncluded(section) && hasData),
    [hideEmptyPreviewSections, isReportSectionIncluded],
  );
  const shouldShowNotes = !hideEmptyPreviewSections || hasNotes(reportData);
  const shouldShowAttachments =
    !hideEmptyPreviewSections || hasRecords(reportData.attachments);
  const shouldShowWeather =
    selectedSections.weather &&
    isTodayReportDate &&
    shouldShowReportSection("weather", hasWeatherData(reportData));
  const shouldShowSchedule =
    selectedSections.schedule &&
    shouldShowReportSection(
      "schedule",
      hasRecords(reportData.scheduleProgress),
    );
  const shouldShowTasks =
    selectedSections.tasks &&
    shouldShowReportSection("tasks", hasRecords(reportData.taskProgress));
  const shouldShowWorkers =
    selectedSections.workers &&
    shouldShowReportSection("workers", hasRecords(reportData.workersProgress));
  const shouldShowInventory =
    selectedSections.inventory &&
    shouldShowReportSection(
      "inventory",
      hasRecords(reportData.inventoryStatus),
    );
  const [reportFormData, setReportFormData] = useState<ClientReportFormData>({
    reportTitle,
    notes: [],
    attachments: reportData.attachments ?? [],
    weatherCondition: null,
    scheduleProgress: [],
    taskProgress: [],
    workersProgress: [],
    inventoryStatus: [],
  });

  useEffect(() => {
    setReportFormData((prev) => ({
      ...prev,
      reportTitle,
    }));
  }, [reportTitle]);

  useEffect(() => {
    setReportFormData((prev) => ({
      ...prev,
      attachments: reportData.attachments ?? [],
    }));
  }, [reportData.attachments, reportData.id]);

  const handleToggleSection = (section: ClientReportLogSection) => {
    setSelectedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateReportFormData = useCallback(
    <Key extends keyof ClientReportFormData>(
      key: Key,
      value: ClientReportFormData[Key],
    ) => {
      setReportFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  const handleNotesChange = useCallback(
    (notes: ClientReportFormData["notes"]) =>
      updateReportFormData("notes", notes),
    [updateReportFormData],
  );

  const handleAttachmentsChange = useCallback(
    (attachments: ClientReportFormData["attachments"]) =>
      updateReportFormData("attachments", attachments),
    [updateReportFormData],
  );

  const handleWeatherChange = useCallback(
    (weatherCondition: ClientReportFormData["weatherCondition"]) =>
      updateReportFormData("weatherCondition", weatherCondition),
    [updateReportFormData],
  );

  const handleScheduleProgressChange = useCallback(
    (scheduleProgress: ClientReportFormData["scheduleProgress"]) =>
      updateReportFormData("scheduleProgress", scheduleProgress),
    [updateReportFormData],
  );

  const handleTaskProgressChange = useCallback(
    (taskProgress: ClientReportFormData["taskProgress"]) =>
      updateReportFormData("taskProgress", taskProgress),
    [updateReportFormData],
  );

  const handleWorkersProgressChange = useCallback(
    (workersProgress: ClientReportFormData["workersProgress"]) =>
      updateReportFormData("workersProgress", workersProgress),
    [updateReportFormData],
  );

  const handleInventoryStatusChange = useCallback(
    (inventoryStatus: ClientReportFormData["inventoryStatus"]) =>
      updateReportFormData("inventoryStatus", inventoryStatus),
    [updateReportFormData],
  );

  const handleReportTitleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      updateReportFormData("reportTitle", event.target.value),
    [updateReportFormData],
  );

  const content = (
    <Box
      data-mode={mode}
      sx={{
        width: "100%",
        flex: isExternalPreview ? undefined : 1,
        height: isExternalPreview ? "auto" : undefined,
        minHeight: isExternalPreview ? "auto" : 0,
        display: "flex",
        overflow: isExternalPreview ? "visible" : "hidden",
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          height: isExternalPreview ? "auto" : undefined,
          minHeight: isExternalPreview ? "auto" : 0,
          px: { xs: 1.25, sm: 2, lg: 2.5 },
          pt: { xs: 1.5, sm: 2, lg: 2.5 },
          pb: isExternalPreview ? { xs: 1.5, sm: 2, lg: 2.5 } : 0,
          overflowY: isExternalPreview ? "visible" : "auto",
          bgcolor: CLIENT_REPORT_COLORS.pageBackground,
        }}
      >
        {!isPreview && isTabletOrBelow && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mb: { xs: 1.25, sm: 1.5 },
            }}
          >
            <Button
              variant="outlined"
              startIcon={<TuneOutlinedIcon fontSize="small" />}
              onClick={() => setIsSectionMenuOpen(true)}
              sx={{
                borderRadius: 1,
                textTransform: "none",
                bgcolor: "background.paper",
              }}
            >
              {t("common.includeInYourLog", {
                defaultValue: "Include in your log",
              })}
            </Button>
          </Box>
        )}

        {!isPreview && (
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between",
              gap: 1.5,
              mb: { xs: 1.25, sm: 1.5 },
            }}
          >
            <Box
              sx={{
                width: { xs: "100%", sm: 360, md: 420 },
                maxWidth: "100%",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: CLIENT_REPORT_COLORS.sectionTitle,
                  mb: 1,
                }}
              >
                {t("clientReport.reportTitle", {
                  defaultValue: "Report title",
                })}
              </Typography>
              <TextField
                fullWidth
                placeholder={t("clientReport.enterReportTitle", {
                  defaultValue: "Enter report title",
                })}
                value={reportFormData.reportTitle ?? ""}
                onChange={handleReportTitleChange}
                size="small"
                sx={{
                  bgcolor: "background.paper",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                  },
                }}
              />
            </Box>
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          {isPreview && !isExternalPreview && (
            <Stack spacing={1}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: CLIENT_REPORT_COLORS.sectionTitle,
                }}
              >
                {t("clientReport.reportTitle", {
                  defaultValue: "Report title",
                })}
              </Typography>
              <Box
                sx={{
                  bgcolor: "background.paper",
                  border: `1px solid ${CLIENT_REPORT_COLORS.borderSoft}`,
                  borderRadius: 1,
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 1.25, sm: 1.5 },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "text.primary",
                    overflowWrap: "anywhere",
                  }}
                >
                  {reportFormData.reportTitle ||
                    t("clientReport.untitledReport", {
                      defaultValue: "Untitled report",
                    })}
                </Typography>
              </Box>
            </Stack>
          )}
          {/* <TimeLog report={reportData} isPreview={isPreview} /> */}
          {shouldShowNotes && (
            <ClientReportNotes
              report={reportData}
              notes={reportData.noteSections}
              isPreview={isPreview}
              onNotesChange={handleNotesChange}
            />
          )}
          {shouldShowAttachments && (
            <ClientReportAttachments
              isPreview={isPreview}
              clientReportId={reportData.id || "draft"}
              attachments={reportFormData.attachments}
              onAttachmentsChange={handleAttachmentsChange}
            />
          )}
          {shouldShowWeather && (
            <WeatherConditions
              report={reportData}
              isPreview={isPreview}
              disableFetch={useSavedReportDataOnly}
              weatherCondition={reportData.weatherCondition}
              dateRange={selectedDateRange}
              onWeatherChange={handleWeatherChange}
            />
          )}
          {shouldShowSchedule && (
            <ClientReportScheduleProgress
              isPreview={isPreview}
              disableFetch={useSavedReportDataOnly}
              scheduleProgress={reportData.scheduleProgress}
              dateRange={selectedDateRange}
              onScheduleProgressChange={handleScheduleProgressChange}
            />
          )}
          {shouldShowTasks && (
            <ClientReportTaskProgress
              isPreview={isPreview}
              disableFetch={useSavedReportDataOnly}
              taskProgress={reportData.taskProgress}
              dateRange={selectedDateRange}
              onTaskProgressChange={handleTaskProgressChange}
            />
          )}
          {shouldShowWorkers && (
            <ClientReportWorkers
              isPreview={isPreview}
              disableFetch={useSavedReportDataOnly}
              workersProgress={reportData.workersProgress}
              dateRange={selectedDateRange}
              onWorkersProgressChange={handleWorkersProgressChange}
            />
          )}
          {shouldShowInventory && (
            <ClientReportsInventory
              isPreview={isPreview}
              disableFetch={useSavedReportDataOnly}
              inventoryStatus={reportData.inventoryStatus}
              dateRange={selectedDateRange}
              onInventoryStatusChange={handleInventoryStatusChange}
            />
          )}
        </Box>
      </Box>
      {!isPreview && !isTabletOrBelow && (
        <ClientReportSideBar
          selectedSections={selectedSections}
          onToggleSection={handleToggleSection}
          disabledSections={disabledSections}
        />
      )}
      {!isPreview && isTabletOrBelow && (
        <Modal
          open={isSectionMenuOpen}
          onClose={() => setIsSectionMenuOpen(false)}
          keepMounted
        >
          <Slide
            direction="left"
            in={isSectionMenuOpen}
            mountOnEnter
            unmountOnExit
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                width: { xs: "min(86vw, 320px)", sm: 320 },
                height: "100dvh",
                bgcolor: "background.paper",
                boxShadow: 24,
                outline: "none",
              }}
            >
              <ClientReportSideBar
                isDrawer
                onClose={() => setIsSectionMenuOpen(false)}
                selectedSections={selectedSections}
                onToggleSection={handleToggleSection}
                disabledSections={disabledSections}
              />
            </Box>
          </Slide>
        </Modal>
      )}
    </Box>
  );

  return content;
};

export default ClientReportCreate;
