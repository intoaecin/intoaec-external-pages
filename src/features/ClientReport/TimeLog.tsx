import { CLIENT_REPORT_COLORS } from "@/constants/colors";
import { Box, Chip, Grid, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useTranslation } from "react-i18next";
import type { ClientReportRecord } from "./types";
import { useLocalizedDayjs } from "@/features/hooks/useLocalizedDayjs";
import { convertTimestampToHoursMinutes } from "@/lib/helpers";

dayjs.extend(customParseFormat);

const MIN_SUPPORTED_YEAR = 1900;
const MAX_SUPPORTED_YEAR = 2100;

const getSupportedDateFormats = (dateFormat: string) =>
  Array.from(
    new Set([
      dateFormat,
      dateFormat.replace(/Y{4}/g, "YY"),
      "DD/MM/YYYY",
      "DD/MM/YY",
      "MM/DD/YYYY",
      "MM/DD/YY",
      "YYYY-MM-DD",
      "YY-MM-DD",
    ]),
  );

const isSupportedYear = (value: dayjs.Dayjs) =>
  value.year() >= MIN_SUPPORTED_YEAR && value.year() <= MAX_SUPPORTED_YEAR;

const normalizeTimeValue = (timeValue: any): number | null => {
  if (timeValue === null || timeValue === undefined || timeValue === "") {
    return null;
  }

  if (typeof timeValue === "number" && Number.isFinite(timeValue)) {
    return timeValue;
  }

  if (typeof timeValue === "string") {
    const trimmedValue = timeValue.trim();
    if (!trimmedValue) return null;

    if (/^\d+$/.test(trimmedValue)) {
      const numericValue = Number(trimmedValue);
      return Number.isFinite(numericValue) ? numericValue : null;
    }

    const parsedTime = dayjs(trimmedValue);
    return parsedTime.isValid() ? parsedTime.valueOf() : null;
  }

  if (typeof timeValue === "object") {
    if (typeof timeValue.valueOf === "function") {
      const valueOfResult = timeValue.valueOf();
      if (typeof valueOfResult === "number" && Number.isFinite(valueOfResult)) {
        return valueOfResult;
      }
    }

    if ("$d" in timeValue) {
      const parsedTime = dayjs(timeValue.$d);
      return parsedTime.isValid() ? parsedTime.valueOf() : null;
    }
  }

  return null;
};

type TimeLogProps = {
  report: Pick<
    ClientReportRecord,
    "startTime" | "endTime" | "totalHours" | "breakTime"
  > & {
    timesheets?: any[];
  };
  isPreview?: boolean;
  emptyStateMinHeight?: number | string;
  onTimeLogChange?: (timeLog: {
    startTime: string;
    endTime: string;
    totalHours: string;
  }) => void;
};

const TimeLog = ({ report, emptyStateMinHeight }: TimeLogProps) => {
  const { t } = useTranslation();
  const { toLocalizedDayjs, dateFormat } = useLocalizedDayjs();
  const hasTimesheetEntries = Boolean(report?.timesheets?.length);

  const formatLocalizedDate = (value: any) => {
    if (value === null || value === undefined || value === "") {
      return "--";
    }

    let localizedValue = null;

    if (typeof value === "string") {
      const trimmedValue = value.trim();

      if (/^\d+$/.test(trimmedValue)) {
        localizedValue = toLocalizedDayjs(Number(trimmedValue));
      } else {
        const parsedLocalizedString = dayjs(
          trimmedValue,
          getSupportedDateFormats(dateFormat),
          true,
        );

        localizedValue = parsedLocalizedString.isValid()
          ? toLocalizedDayjs(parsedLocalizedString)
          : toLocalizedDayjs(trimmedValue);
      }
    } else {
      localizedValue = toLocalizedDayjs(value);
    }

    return localizedValue && isSupportedYear(localizedValue)
      ? localizedValue.format(dateFormat)
      : "--";
  };

  const formatLocalizedTime = (value: any) => {
    const normalizedValue = normalizeTimeValue(value);
    const localizedValue = normalizedValue
      ? toLocalizedDayjs(normalizedValue)
      : null;

    return localizedValue ? localizedValue.format("hh:mm A") : null;
  };

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              variant="subtitle2"
              sx={{
                color: CLIENT_REPORT_COLORS.sectionTitle,
              }}
            >
            {t("common.timeLog", { defaultValue: "Time Log" })}
          </Typography>
          <Chip
            className="report-status-chip"
            label={t("common.syncedToTimesheet", {
              defaultValue: "Synced to Timesheet",
            })}
            size="small"
            sx={{
              height: 18,
              maxWidth: "100%",
              borderRadius: 10,
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
        </Stack>
      </Stack>
      <Box
        sx={{
          bgcolor: CLIENT_REPORT_COLORS.chipSelected,
          border: `1px solid ${CLIENT_REPORT_COLORS.borderMuted}`,
          borderRadius: 2,
          boxShadow: CLIENT_REPORT_COLORS.timeLogShadow,
          px: { xs: 1.5, sm: 2, lg: 2.5 },
          py: { xs: 1.5, sm: 2, lg: 2.25 },
          ...(!hasTimesheetEntries && emptyStateMinHeight
            ? {
                minHeight: emptyStateMinHeight,
                display: "flex",
                alignItems: "center",
              }
            : {}),
        }}
      >
        {hasTimesheetEntries ? (
          <Box>
            <Typography
              sx={{
                typography: "body2",
                color: "text.secondary",
                mb: 1.5,
              }}
            >
              {t("common.timesheetEntries", {
                defaultValue: "Timesheet Entries",
              })}
            </Typography>
            <Stack spacing={1.5}>
              {report?.timesheets?.map((ts: any) => (
                <Box
                  key={ts.timesheetId}
                  sx={{
                    bgcolor: "background.paper",
                    borderRadius: 1,
                    border: `1px solid ${CLIENT_REPORT_COLORS.borderMuted}`,
                    p: 1.5,
                    boxShadow: CLIENT_REPORT_COLORS.cardShadow,
                  }}
                >
                  <Grid container spacing={1.5} alignItems="center">
                    <Grid item xs={12} md={2}>
                      <Typography
                        sx={{
                          typography: "caption",
                          color: CLIENT_REPORT_COLORS.mutedText,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {t("common.date", { defaultValue: "Date" })}
                      </Typography>
                      <Typography
                        sx={{
                          typography: "body2",
                          color: CLIENT_REPORT_COLORS.bodyText,
                          mt: 0.5,
                        }}
                      >
                        {formatLocalizedDate(ts.date)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Typography
                        sx={{
                          typography: "caption",
                          color: CLIENT_REPORT_COLORS.mutedText,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {t("common.user.one", { defaultValue: "User" })}
                      </Typography>
                      <Typography
                        sx={{
                          typography: "body2",
                          color: "text.primary",
                          mt: 0.5,
                        }}
                      >
                        {ts.username}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Typography
                        sx={{
                          typography: "caption",
                          color: CLIENT_REPORT_COLORS.mutedText,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {t("common.startTime", { defaultValue: "Start Time" })}
                      </Typography>
                      <Typography
                        sx={{
                          typography: "body2",
                          color: CLIENT_REPORT_COLORS.bodyText,
                          mt: 0.5,
                        }}
                      >
                        {formatLocalizedTime(ts.startTime) ?? "--"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Typography
                        sx={{
                          typography: "caption",
                          color: CLIENT_REPORT_COLORS.mutedText,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {t("common.endTime", { defaultValue: "End Time" })}
                      </Typography>
                      <Typography
                        sx={{
                          typography: "body2",
                          color: CLIENT_REPORT_COLORS.bodyText,
                          mt: 0.5,
                        }}
                      >
                        {formatLocalizedTime(ts.endTime) ??
                          t("common.onGoing", { defaultValue: "Ongoing" })}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Typography
                        sx={{
                          typography: "caption",
                          color: CLIENT_REPORT_COLORS.mutedText,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {t("common.duration", { defaultValue: "Duration" })}
                      </Typography>
                      <Typography
                        sx={{
                          typography: "body2",
                          color: "text.primary",
                          mt: 0.5,
                        }}
                      >
                        {convertTimestampToHoursMinutes(
                          Number(ts.totalProductiveTime || 0),
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Typography
                        sx={{
                          typography: "caption",
                          color: CLIENT_REPORT_COLORS.mutedText,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {t("common.breakHours", {
                          defaultValue: "Break Hours",
                        })}
                      </Typography>
                      <Typography
                        sx={{
                          typography: "body2",
                          color: CLIENT_REPORT_COLORS.bodyText,
                          mt: 0.5,
                        }}
                      >
                        {convertTimestampToHoursMinutes(
                          Number(ts.totalBreakTime || 0),
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                  {ts.description && (
                    <Box
                      sx={{
                        mt: 1.5,
                        pt: 1,
                        borderTop: `1px dashed ${CLIENT_REPORT_COLORS.borderSoft}`,
                      }}
                    >
                      <Typography
                        sx={{
                          typography: "caption",
                          color: CLIENT_REPORT_COLORS.mutedText,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {t("common.description", {
                          defaultValue: "Description",
                        })}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", mt: 0.5 }}
                      >
                        {ts.description}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: CLIENT_REPORT_COLORS.mutedText }}>
            {t("common.noTimesheetsSelected", {
              defaultValue: "No timesheets selected",
            })}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default TimeLog;
