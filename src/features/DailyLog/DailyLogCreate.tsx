import { CLIENT_REPORT_COLORS } from "@/constants/colors";
import {
  Box,
  Modal,
  Slide,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useRouter } from "next/router";

dayjs.extend(customParseFormat);
import { useCallback, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import DailyLogAttachments from "./DailyLogAttachments";
import DailyLogNotes from "./DailyLogNotes";
import ClientReportScheduleProgress from "@/features/ClientReport/ClientReportScheduleProgress";
import DailyLogSideBar, {
  type DailyLogLogSection,
} from "./DailyLogSideBar";
import ClientReportTaskProgress from "@/features/ClientReport/ClientReportTaskProgress";
import { useEffect } from "react";
import TimeLog from "@/features/ClientReport/TimeLog";
import WeatherConditions from "@/features/ClientReport/WeatherConditions";
import type { DailyLogRecord } from "./types";

/**
 * Ported from intoaec-UI `src/features/DailyLog/DailyLogCreate.tsx`.
 *
 * Client-facing PREVIEW path only — same shape and same reasoning as
 * `ClientReport/ClientReportCreate.tsx` in this app (read that file's
 * top-of-file comment for the full explanation of what's dropped and why).
 * Specific to this file:
 *  - `useCreateDailyLog`/`useUpdateDailyLog` (both pull `next-auth`'s
 *    `useSession`) and their submit handler / breadcrumb / back handlers
 *    (only reachable from the removed `<PageLayout>` actions) are dropped.
 *  - `useFetchDailyLogTimesheets` also pulls `next-auth`'s `useSession`, and
 *    is only used to *fetch* timesheets for the admin create/edit flow — the
 *    effect that calls it is gated on `!useSavedReportDataOnly`, which is
 *    always `false` here (`isPreview && Boolean(report)` is always true in
 *    this app's usage), so it never actually fetches in preview. Dropped
 *    along with that effect and `computeTimesheetSummary` (only fed by it);
 *    the preview instead renders straight from `reportData.timesheets`,
 *    which the fetched report already carries.
 *  - `useUsersData` (`FixtureContext`) is only used to look up the display
 *    name of a live-selected user before a report exists — this app has no
 *    `FixtureProvider` (its source file itself pulls `next-auth`), and in
 *    preview `reportData.username` is already the correct, saved value, so
 *    the lookup is replaced with `reportData.username || selectedUserId`.
 *  - `useLeadData()`'s only use in the source was a `leadData?.projectId`
 *    fallback for the now-removed timesheet-fetch effect, so it is dropped
 *    too — nothing else in this component reads it.
 *  - `TuneOutlinedIcon` was only referenced inside the removed
 *    `<PageLayout>` `actions` (this file's `content`, unlike
 *    `ClientReportCreate.tsx`'s, has no mobile "include in your log" button
 *    of its own), so that import is dropped as unused.
 */

const defaultReport: DailyLogRecord = {
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

const DAILY_LOG_EMPTY_SECTION_MIN_HEIGHT = 96;

type DailyLogCreateProps = {
  report?: DailyLogRecord;
  isEdit?: boolean;
  isPreview?: boolean;
  isExternalPreview?: boolean;
};

type DailyLogFormData = {
  reportTitle?: string;
  notes?: unknown[];
  attachments?: string[];
  weatherCondition?: Record<string, unknown> | null;
  scheduleProgress?: Record<string, unknown>[];
  taskProgress?: Record<string, unknown>[];
  timesheets?: any[];
  startTime?: string;
  endTime?: string;
  totalHours?: string;
  breakTime?: string;
};

type DailyLogDateRange = {
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

const getSelectedDailyLogSections = (
  includedInLog?: DailyLogLogSection[],
): Record<DailyLogLogSection, boolean> => {
  if (!Array.isArray(includedInLog)) {
    return {
      weather: true,
      schedule: true,
      tasks: true,
      timesheet: true,
    };
  }

  return {
    weather: includedInLog.includes("weather"),
    schedule: includedInLog.includes("schedule"),
    tasks: includedInLog.includes("tasks"),
    timesheet: includedInLog.includes("timesheet"),
  };
};

const DailyLogCreate = ({
  report,
  isEdit = false,
  isPreview = false,
  isExternalPreview = false,
}: DailyLogCreateProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const isTabletOrBelow = useMediaQuery(theme.breakpoints.down("md"));
  const reportData = report ?? defaultReport;
  const mode = isPreview ? "preview" : isEdit ? "edit" : "create";
  const useSavedReportDataOnly = isPreview && Boolean(report);
  const selectedUserId =
    (router.query.selectedUserId as string) || reportData.userId || "";
  const userNameForDisplay = reportData.username || selectedUserId;
  const dailyLogApiTitle = `Daily Log - ${userNameForDisplay}`;
  const reportTitle =
    getExistingReportTitle(reportData.title) ?? dailyLogApiTitle;

  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false);
  const [selectedSections, setSelectedSections] = useState<
    Record<DailyLogLogSection, boolean>
  >(() => getSelectedDailyLogSections(reportData.includedInLog));

  useEffect(() => {
    setSelectedSections(getSelectedDailyLogSections(reportData.includedInLog));
  }, [reportData.includedInLog]);

  const [reportFormData, setReportFormData] = useState<DailyLogFormData>({
    reportTitle,
    notes: [],
    attachments: reportData.attachments ?? [],
    weatherCondition: null,
    scheduleProgress: [],
    taskProgress: [],
    startTime: reportData.startTime,
    endTime: reportData.endTime,
    totalHours: reportData.totalHours,
    breakTime: reportData.breakTime,
    timesheets: reportData.timesheets ?? [],
  });

  useEffect(() => {
    setReportFormData((prev) => ({
      ...prev,
      reportTitle:
        !prev.reportTitle || prev.reportTitle.startsWith("Daily Log - ")
          ? reportTitle
          : prev.reportTitle,
    }));
  }, [reportTitle]);

  useEffect(() => {
    setReportFormData((prev) => ({
      ...prev,
      attachments: reportData.attachments ?? [],
    }));
  }, [reportData.attachments, reportData.id]);

  const selectedDateRange = useMemo<DailyLogDateRange>(
    () => ({
      startDate: getTimestampFromQuery(router.query.startDate) ?? dayjs().startOf("day").valueOf(),
      endDate: getTimestampFromQuery(router.query.endDate) ?? dayjs().endOf("day").valueOf(),
    }),
    [router.query.endDate, router.query.startDate],
  );

  const handleToggleSection = (section: DailyLogLogSection) => {
    setSelectedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateReportFormData = useCallback(
    <Key extends keyof DailyLogFormData>(
      key: Key,
      value: DailyLogFormData[Key],
    ) => {
      setReportFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  const handleNotesChange = useCallback(
    (notes: DailyLogFormData["notes"]) =>
      updateReportFormData("notes", notes),
    [updateReportFormData],
  );

  const handleAttachmentsChange = useCallback(
    (attachments: DailyLogFormData["attachments"]) =>
      updateReportFormData("attachments", attachments),
    [updateReportFormData],
  );

  const handleWeatherChange = useCallback(
    (weatherCondition: DailyLogFormData["weatherCondition"]) =>
      updateReportFormData("weatherCondition", weatherCondition),
    [updateReportFormData],
  );

  const handleScheduleProgressChange = useCallback(
    (scheduleProgress: DailyLogFormData["scheduleProgress"]) =>
      updateReportFormData("scheduleProgress", scheduleProgress),
    [updateReportFormData],
  );

  const handleTaskProgressChange = useCallback(
    (taskProgress: DailyLogFormData["taskProgress"]) =>
      updateReportFormData("taskProgress", taskProgress),
    [updateReportFormData],
  );

  const handleTimeLogChange = useCallback(
    (timeLog: { startTime: string; endTime: string; totalHours: string }) => {
      setReportFormData((prev) => ({
        ...prev,
        startTime: timeLog.startTime,
        endTime: timeLog.endTime,
        totalHours: timeLog.totalHours,
      }));
    },
    [],
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
        {!isPreview && (
          <Box
            sx={{
              display: "flex",
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
          {selectedSections.timesheet && (
            <TimeLog
              report={{
                startTime: reportFormData.startTime ?? "08:15 AM",
                endTime: reportFormData.endTime ?? "06:15 PM",
                totalHours: reportFormData.totalHours ?? "10h00m",
                breakTime: reportFormData.breakTime ?? "00h15m",
                timesheets: reportFormData.timesheets ?? [],
              }}
              isPreview={isPreview}
              emptyStateMinHeight={DAILY_LOG_EMPTY_SECTION_MIN_HEIGHT}
              onTimeLogChange={handleTimeLogChange}
            />
          )}
          <DailyLogNotes
            report={reportData}
            notes={reportData.noteSections}
            isPreview={isPreview}
            onNotesChange={handleNotesChange}
          />
          <DailyLogAttachments
            isPreview={isPreview}
            clientReportId={reportData.id || "draft"}
            attachments={reportFormData.attachments}
            onAttachmentsChange={handleAttachmentsChange}
          />
          {selectedSections.weather && (
            <WeatherConditions
              report={reportData}
              isPreview={isPreview}
              disableFetch={useSavedReportDataOnly}
              weatherCondition={reportData.weatherCondition}
              dateRange={selectedDateRange}
              onWeatherChange={handleWeatherChange}
            />
          )}
          {selectedSections.schedule && (
            <ClientReportScheduleProgress
              isPreview={isPreview}
              disableFetch={useSavedReportDataOnly}
              scheduleProgress={reportData.scheduleProgress}
              dateRange={selectedDateRange}
              emptyStateMinHeight={DAILY_LOG_EMPTY_SECTION_MIN_HEIGHT}
              onScheduleProgressChange={handleScheduleProgressChange}
              assigneeUserId={selectedUserId || undefined}
            />
          )}
          {selectedSections.tasks && (
            <ClientReportTaskProgress
              isPreview={isPreview}
              disableFetch={useSavedReportDataOnly}
              taskProgress={reportData.taskProgress}
              dateRange={selectedDateRange}
              emptyStateMinHeight={DAILY_LOG_EMPTY_SECTION_MIN_HEIGHT}
              onTaskProgressChange={handleTaskProgressChange}
              assigneeUserId={selectedUserId || undefined}
            />
          )}
        </Box>
      </Box>
      {!isPreview && !isTabletOrBelow && (
        <DailyLogSideBar
          selectedSections={selectedSections}
          onToggleSection={handleToggleSection}
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
              <DailyLogSideBar
                isDrawer
                onClose={() => setIsSectionMenuOpen(false)}
                selectedSections={selectedSections}
                onToggleSection={handleToggleSection}
              />
            </Box>
          </Slide>
        </Modal>
      )}
    </Box>
  );

  return content;
};

export default DailyLogCreate;
