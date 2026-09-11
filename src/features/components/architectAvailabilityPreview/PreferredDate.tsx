import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { getLocalizationValue } from "@/lib/helpers";
import { Box, Button, Skeleton, Typography, useTheme } from "@mui/material";
import momentTz from "moment-timezone";
import { useEffect, useState } from "react";
import SlotsAvailable from "./SlotsAvailable"; // Import your SlotsAvailable component
import { useTranslation } from "react-i18next";
import { getDayTranslationKey } from "@/utils/helpers";

type BookingSlotSummary = {
  availableSlotCount: number;
  displayDate?: string;
  endTime: number | string;
  generatedSlotId: string;
  from: string;
  startTime: number | string;
  timeZone?: string;
  to: string;
};

const PreferredDate = (props: {
  architectData: any;
  preferredMode: any;
  selectedSlot: BookingSlotSummary | null;
  onDateSelect: (dateLabel: string) => void;
  onDatePartsChange?: (parts: {
    selectedDate: number;
    selectedMonth: string;
    selectedYear: number;
  }) => void;
  selectedSlotDateLabel?: string;
  onSlotSelect: (slot: BookingSlotSummary | null) => void;
  disabled?: boolean;
  initialDateKey?: string;
  initialSelectedDate?: number | null;
  initialSelectedMonth?: string | null;
  initialSelectedYear?: number | null;
  viewerTimeZone?: string;
}) => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState<number | null>(
    props.initialSelectedDate ?? null,
  );
  const [selectedDateKey, setSelectedDateKey] = useState(
    props.initialDateKey ?? "",
  );
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(
    props.initialSelectedMonth ?? undefined,
  );
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    props.initialSelectedYear ?? undefined,
  );
  const [timeSlots, setTimeSlots] = useState<any>();
  const [hoveredDate, setHoveredDate] = useState(null);
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [dateView, setDateView] = useState<"weekly" | "monthly">("weekly");

  const { VITE_MEETANDNOTE_ENDPOINT } = useEnv();
  const { localizationValue } = useOrganizationLocalization();
  const organizationTimeZoneId =
    getLocalizationValue(localizationValue ?? [], "TIMEZONE", "ID") ??
    "Asia/Kolkata";
  const organizationTimeZoneCode =
    getLocalizationValue(localizationValue ?? [], "TIMEZONE", "CODE") ?? "IST";
  const { post: fetchData } = useAxios<any>(
    `${VITE_MEETANDNOTE_ENDPOINT}/session`
  );
  const [slotsLoading, setSlotsLoading] = useState(false);
  const getDisplayTimeZone = () => {
    if (props.viewerTimeZone && momentTz.tz.zone(props.viewerTimeZone)) {
      return props.viewerTimeZone;
    }

    return organizationTimeZoneId;
  };

  const formatSlotTime = (timestamp: number, displayTimeZone: string) => {
    return momentTz(timestamp).tz(displayTimeZone).format("hh:mm A");
  };

  const formatFetchResult = (result: Array<any>) => {
    return result?.map((value) => {
      const startTime = momentTz
        .tz(
          {
            year: Number(value.startYear),
            month: Number(value.startMonth) - 1,
            day: Number(value.startDate),
            hour: Number(value.startHour),
            minute: Number(value.startMinutes),
            second: 0,
            millisecond: 0,
          },
          organizationTimeZoneId,
        )
        .valueOf();
      const endTime = momentTz
        .tz(
          {
            year: Number(value.endYear),
            month: Number(value.endMonth) - 1,
            day: Number(value.endDate),
            hour: Number(value.endHour),
            minute: Number(value.endMinutes),
            second: 0,
            millisecond: 0,
          },
          organizationTimeZoneId,
        )
        .valueOf();
      const displayTimeZone = getDisplayTimeZone();
      const formattedFromTime = formatSlotTime(startTime, displayTimeZone);
      const formattedToTime = formatSlotTime(endTime, displayTimeZone);

      return {
        meetingType: props.preferredMode.toUpperCase(),
        generatedSlotId: value.generatedSlotId,
        availableSlotCount: value.availableSlotCount,
        displayDate: momentTz(startTime)
          .tz(displayTimeZone)
          .format("MMM D, YYYY"),
        startTime,
        endTime,
        timeZone: organizationTimeZoneId,
        from: formattedFromTime,
        to: formattedToTime,
      };
    });
  };
  // Slots are stored/queried per organization-timezone calendar day, but a viewer's
  // calendar day (in their own timezone) can straddle one or more organization days.
  // Fetch every organization day that overlaps the viewer's day window, then filter
  // back down to only the slots that actually land within the viewer's day.
  const getOverlappingOrganizationDates = (
    viewerDayStart: any,
    viewerDayEnd: any,
  ) => {
    const orgDates: Array<{ date: number; month: number; year: number }> = [];
    const seenKeys = new Set<string>();
    const cursor = viewerDayStart.clone().tz(organizationTimeZoneId).startOf("day");
    const orgEndBoundary = viewerDayEnd.clone().tz(organizationTimeZoneId);
    while (cursor.isBefore(orgEndBoundary)) {
      const key = `${cursor.year()}-${cursor.month()}-${cursor.date()}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        orgDates.push({
          date: cursor.date(),
          month: cursor.month() + 1,
          year: cursor.year(),
        });
      }
      cursor.add(1, "day");
    }
    return orgDates;
  };

  const fetchSlots = async (date: any, month: any, year: any) => {
    setSlotsLoading(true);
    try {
      setTimeSlots([]);
      const displayTimeZone = getDisplayTimeZone();
      const viewerDayStart = momentTz.tz(
        {
          year: Number(year),
          month: Number(month) - 1,
          day: Number(date),
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        displayTimeZone,
      );
      const viewerDayEnd = viewerDayStart.clone().add(1, "day");
      const organizationDates = getOverlappingOrganizationDates(
        viewerDayStart,
        viewerDayEnd,
      );

      const responses = await Promise.all(
        organizationDates.map((orgDate) =>
          fetchData({
            eventType: "GET_ORGANIZATION_SLOTS",
            organizationId: props?.architectData?.organizationId,
            organizationType: props?.architectData?.organizationType,
            startTime: Date.now(),
            startDate: orgDate.date,
            startMonth: String(orgDate.month).padStart(2, "0"),
            startYear: orgDate.year,
            timeZone: organizationTimeZoneCode,
          }).catch(() => null),
        ),
      );

      const rawSlots = responses
        .filter((response) => response?.code === "ORGANIZATION_SLOTS_FOUND")
        .flatMap((response) => response.body ?? []);
      const dedupedSlots = Array.from(
        new Map(
          rawSlots.map((slot: any) => [slot.generatedSlotId, slot]),
        ).values(),
      );
      const currentTimestamp = Date.now();

      const result: any = formatFetchResult(dedupedSlots)
        .filter(
          (slot: any) =>
            slot.startTime > currentTimestamp &&
            slot.startTime >= viewerDayStart.valueOf() &&
            slot.startTime < viewerDayEnd.valueOf(),
        )
        .sort((a: any, b: any) => a.startTime - b.startTime);
      setTimeSlots(result);
    } catch {
      setTimeSlots([]);
    }
  };

  useEffect(() => {
    if (!selectedDate || !selectedMonth || !selectedYear) {
      return;
    }
    fetchSlots(selectedDate, selectedMonth, selectedYear).finally(() => {
      setSlotsLoading(false);
    });
  }, [selectedDate, selectedMonth, selectedYear, props.viewerTimeZone]);

  const handleDateClick = (value: any) => {
    if (props.disabled) {
      return;
    }

    const nextDateKey = value.dateKey;
    if (nextDateKey === selectedDateKey) {
      return;
    }
    setSelectedDate(value.dayOfMonth);
    setSelectedDateKey(nextDateKey);
    const month = String(value.monthNumber).padStart(2, "0");
    setSelectedMonth(month);
    setSelectedYear(value.year);
    props.onSlotSelect(null);
    const dateLabel = momentTz
      .tz(
        { year: value.year, month: value.monthNumber - 1, day: value.dayOfMonth },
        getDisplayTimeZone(),
      )
      .locale("en")
      .format("MMM D, YYYY");
    props.onDateSelect(dateLabel);
    props.onDatePartsChange?.({
      selectedDate: value.dayOfMonth,
      selectedMonth: month,
      selectedYear: value.year,
    });
  };

  const { t } = useTranslation();
  const handleDateHover = (dayOfMonth: any) => {
    setHoveredDate(dayOfMonth);
  };
  // Days are generated against the viewer's own timezone (not the browser's raw
  // local date) so the calendar grid always lines up with the day boundaries the
  // viewer will actually see their slots grouped under.
  const renderNext30Days = () => {
    const displayTimeZone = getDisplayTimeZone();
    const startOfToday = momentTz.tz(displayTimeZone).locale("en").startOf("day");
    const days = [];
    for (let i = 0; i < 30; i++) {
      const day = startOfToday.clone().add(i, "days");

      days.push({
        dateKey: `${day.year()}-${day.month()}-${day.date()}`,
        dayOfMonth: day.date(),
        monthName: day.format("MMM"),
        monthNumber: day.month() + 1,
        year: day.year(),
        dayName: day.format("ddd"),
      });
    }
    return days;
  };

  const allDays = renderNext30Days();
  const visibleDays =
    dateView === "monthly"
      ? allDays
      : allDays.slice(visibleStartIndex, visibleStartIndex + 7);
  const formatRangeBoundary = (
    day: { year: number; monthNumber: number; dayOfMonth: number } | undefined,
    withYear: boolean,
  ) => {
    if (!day) {
      return "";
    }
    return momentTz
      .tz(
        { year: day.year, month: day.monthNumber - 1, day: day.dayOfMonth },
        getDisplayTimeZone(),
      )
      .locale("en")
      .format(withYear ? "MMM D, YYYY" : "MMM D");
  };
  const rangeStart = visibleDays[0];
  const rangeEnd = visibleDays[visibleDays.length - 1];
  const rangeLabel =
    rangeStart && rangeEnd
      ? `${formatRangeBoundary(rangeStart, false)} - ${formatRangeBoundary(rangeEnd, true)}`
      : "";
  const dateGridColumns = {
    xs: "repeat(2, minmax(0, 1fr))",
    sm: "repeat(4, minmax(0, 1fr))",
    md: "repeat(7, minmax(0, 1fr))",
  };
  const weekDayLabels = dateView === "monthly" ? visibleDays.slice(0, 7) : [];

  return (
    <Box sx={{ color: "text.primary" }}>
      <Box
        sx={{
          alignItems: { xs: "flex-start", sm: "center" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1,
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
            {t("architectSlotBooking.selectDate")}
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: "11px" }}>
            {rangeLabel}
          </Typography>
        </Box>
        <Box sx={{ alignItems: "center", display: "flex", gap: 0.75 }}>
          <Box
            sx={{
              bgcolor: "background.paper",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1.5,
              display: "flex",
              p: 0.25,
            }}
          >
            <Button
              disabled={props.disabled}
              onClick={() => setDateView("weekly")}
              size="small"
              sx={{
                bgcolor:
                  dateView === "weekly" ? "primary.light" : "transparent",
                color: "text.primary",
                fontSize: "11px",
                minWidth: 64,
                px: 1,
                py: 0.5,
                textTransform: "none",
              }}
            >
              {t("architectSlotBooking.weekly")}
            </Button>
            <Button
              disabled={props.disabled}
              onClick={() => setDateView("monthly")}
              size="small"
              sx={{
                bgcolor:
                  dateView === "monthly" ? "primary.light" : "transparent",
                color: "text.primary",
                fontSize: "11px",
                minWidth: 64,
                px: 1,
                py: 0.5,
                textTransform: "none",
              }}
            >
              {t("architectSlotBooking.monthly")}
            </Button>
          </Box>
          {dateView === "weekly" && (
            <>
              <Button
                aria-label={t("common.previous")}
                disabled={props.disabled || visibleStartIndex === 0}
                onClick={() =>
                  setVisibleStartIndex((value) => Math.max(value - 7, 0))
                }
                sx={{ minWidth: 32, px: 0 }}
                variant="outlined"
              >
                {"<"}
              </Button>
              <Button
                aria-label={t("common.next")}
                disabled={props.disabled || visibleStartIndex >= 23}
                onClick={() =>
                  setVisibleStartIndex((value) => Math.min(value + 7, 23))
                }
                sx={{ minWidth: 32, px: 0 }}
                variant="outlined"
              >
                {">"}
              </Button>
            </>
          )}
        </Box>
      </Box>
      {dateView === "monthly" && (
        <Box
          sx={{
            display: "grid",
            gap: 1,
            gridTemplateColumns: dateGridColumns,
            mb: 0.75,
          }}
        >
          {weekDayLabels.map((value) => (
            <Typography
              key={`weekday-${value.dateKey}`}
              sx={{
                color: "text.secondary",
                fontSize: "10px",
                textAlign: "center",
              }}
            >
              {t(`common.day.${getDayTranslationKey(value?.dayName)}`)}
            </Typography>
          ))}
        </Box>
      )}
      <Box
        sx={{
          display: "grid",
          gap: 1,
          gridTemplateColumns: dateGridColumns,
        }}
      >
        {visibleDays.map((value) => {
          const isSelected = value.dateKey === selectedDateKey;
          const isHovered = value.dayOfMonth === hoveredDate;
          return (
            <Box key={value.dateKey} sx={{ textAlign: "center" }}>
              {dateView === "weekly" ? (
                <button
                  disabled={props.disabled}
                  onClick={() => handleDateClick(value)}
                  onMouseEnter={() => handleDateHover(value?.dayOfMonth)}
                  onMouseLeave={() => setHoveredDate(null)}
                  style={{
                    backgroundColor:
                      isSelected || isHovered
                        ? theme.palette.primary.dark
                        : "transparent",
                    border: `1px solid ${
                      isSelected
                        ? theme.palette.primary.dark
                        : theme.palette.divider
                    }`,
                    borderRadius: "8px",
                    color:
                      isSelected || isHovered
                        ? theme.palette.primary.contrastText
                        : theme.palette.text.primary,
                    cursor: props.disabled ? "not-allowed" : "pointer",
                    minHeight: "72px",
                    opacity: props.disabled ? 0.6 : 1,
                    padding: "8px 6px",
                    transition: "background-color 0.3s ease",
                    width: "100%",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 500 }}>
                    {t(`common.day.${getDayTranslationKey(value?.dayName)}`)}
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      marginTop: "4px",
                    }}
                  >
                    {value?.dayOfMonth}
                  </div>
                  <div style={{ fontSize: "10px", marginTop: "4px" }}>
                    {value?.monthName}
                  </div>
                </button>
              ) : (
                <button
                  disabled={props.disabled}
                  onClick={() => handleDateClick(value)}
                  onMouseEnter={() => handleDateHover(value?.dayOfMonth)}
                  onMouseLeave={() => setHoveredDate(null)}
                  style={{
                    backgroundColor:
                      isSelected || isHovered
                        ? theme.palette.primary.dark
                        : "transparent",
                    border: `1px solid ${
                      isSelected
                        ? theme.palette.primary.dark
                        : theme.palette.divider
                    }`,
                    borderRadius: "7px",
                    color:
                      isSelected || isHovered
                        ? theme.palette.primary.contrastText
                        : theme.palette.text.primary,
                    cursor: props.disabled ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: 600,
                    minHeight: "32px",
                    opacity: props.disabled ? 0.6 : 1,
                    padding: "5px 8px",
                    transition: "background-color 0.3s ease",
                    width: "100%",
                  }}
                >
                  {value?.dayOfMonth}
                </button>
              )}
            </Box>
          );
        })}
      </Box>

      {selectedDate ? (
        <>
          {slotsLoading ? (
            <Box
              sx={{
                pt: 3,
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                width: "40vw",
                gap: 5,
                flexWrap: "wrap",
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7]?.map((val) => (
                <Skeleton
                  variant="rectangular"
                  key={"timeslot-" + val}
                  height={30}
                  sx={{ borderRadius: 5 }}
                width={100}
              />
            ))}
            </Box>
          ) : (
            <SlotsAvailable
              disabled={props.disabled}
              selectedDateLabel={props.selectedSlotDateLabel}
              selectedSlot={props.selectedSlot}
              timeSlots={timeSlots}
              onSlotSelect={props.onSlotSelect}
            />
          )}
        </>
      ) : (
        <Box
          sx={{
            alignItems: "center",
            border: `1px dashed ${theme.palette.divider}`,
            borderRadius: 2,
            color: "text.secondary",
            display: "flex",
            fontSize: "14px",
            justifyContent: "center",
            minHeight: 140,
            mt: 3,
            textAlign: "center",
          }}
        >
          {t("architectSlotBooking.chooseDateToSeeTimes")}
        </Box>
      )}
    </Box>
  );
};

export default PreferredDate;
