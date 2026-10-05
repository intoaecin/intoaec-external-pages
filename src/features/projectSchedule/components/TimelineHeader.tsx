import {
  DAY_VIEW_WIDTH,
  GANTT_DAY_HEADER_DAY_ROW_HEIGHT_PX,
  GANTT_DAY_HEADER_MONTH_ROW_HEIGHT_PX,
  GANTT_DAY_HEADER_TOTAL_HEIGHT_PX,
  GANTT_SUMMARY_TIMELINE_HEADER_HEIGHT_PX,
  GANTT_TODAY_INDICATOR_WIDTH_PX,
  MONTH_VIEW_WIDTH,
  WEEK_VIEW_WIDTH,
} from "../helpers/constants";
import { Box, Typography } from "@mui/material";
import { useProjectSchedule } from "../context/ScheduleProvider";
import { memo, useMemo, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useVisibleTimelineWindow } from "../hooks/useVisibleTimelineWindow";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { getLocalizationValue } from "@/lib/helpers";
import { getDateKeyInTimezone } from "../helpers/dateUtil";
import { useCurrentDateKey } from "../hooks/useCurrentDateKey";

dayjs.extend(utc);
dayjs.extend(timezone);

/** i18n keys under `months.*` — do not derive from dayjs format (locale breaks keys). */
const MONTH_TRANSLATION_KEYS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

/** i18n keys under `common.day.*` (dayjs .day(): 0 = Sunday … 6 = Saturday). */
const WEEKDAY_TRANSLATION_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;
interface TimelineHeaderProps {
  dates: Date[];
  disableWindowing?: boolean;
  scrollContainerRef: RefObject<HTMLDivElement>;
  startIndex?: number;
  endIndex?: number;
  /** Week/month header height; defaults to the compact summary height. */
  summaryHeaderHeightPx?: number;
}

interface MonthItem {
  datesCount: number;
  index: number;
  key: string;
  /** Combined label for accessibility / fallbacks */
  label: string;
  monthLabel: string;
  yearLabel: string;
  startDateIndex: number;
  width: number;
}

interface WeekItem {
  index: number;
  key: string;
  label: string;
  yearLabel: string;
  width: number;
}

function TodayHeaderTag({
  left,
  height,
  labelPlacement = "top",
}: {
  left: number;
  height: number;
  labelPlacement?: "top" | "below";
}) {
  const { t } = useTranslation();

  return (
    <>
      {labelPlacement === "top" && (
        <Box
          sx={{
            position: "absolute",
            left: left - GANTT_TODAY_INDICATOR_WIDTH_PX / 2,
            top: 0,
            width: `${GANTT_TODAY_INDICATOR_WIDTH_PX}px`,
            height: "100%",
            bgcolor: "primary.main",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
      )}
      {/* Today label box — fills the row height exactly */}
      <Box
        sx={{
          position: "absolute",
          left,
          top: labelPlacement === "top" ? 0 : "100%",
          height,
          display: "flex",
          alignItems: "center",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          fontSize: "10px",
          fontWeight: 500,
          px: 1.65,
          zIndex: 2,
          pointerEvents: "none",
          userSelect: "none",
          whiteSpace: "nowrap",
          boxSizing: "border-box",
          borderBottomLeftRadius: labelPlacement === "below" ? 2 : 0,
          borderBottomRightRadius: labelPlacement === "below" ? 2 : 0,
        }}
      >
        {t("common.today")}
      </Box>
    </>
  );
}

function MonthYearLabel({
  monthLabel,
  yearLabel,
}: {
  monthLabel: string;
  yearLabel: string;
}) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      fontWeight="medium"
      noWrap
      sx={{
        minWidth: 0,
        maxWidth: "100%",
        textAlign: "center",
      }}
    >
      {monthLabel} {yearLabel}
    </Typography>
  );
}

function TimelineHeader({
  dates,
  disableWindowing = false,
  scrollContainerRef,
  startIndex: startIndexProp,
  endIndex: endIndexProp,
  summaryHeaderHeightPx = GANTT_SUMMARY_TIMELINE_HEADER_HEIGHT_PX,
}: TimelineHeaderProps) {
  const { viewMode } = useProjectSchedule();
  const { t } = useTranslation();
  const { localizationValue } = useOrganizationLocalization();
  const organizationTimezone =
    (localizationValue &&
      getLocalizationValue(localizationValue, "TIMEZONE", "ID")) ||
    "UTC";
  const currentDateKey = useCurrentDateKey(organizationTimezone);

  const weekItems = useMemo<WeekItem[]>(() => {
    if (viewMode !== "week" || dates.length === 0) {
      return [];
    }

    return dates
      .filter((_, dateIndex) => dateIndex % 7 === 0)
      .map((weekStart, index) => {
      const startInTz = dayjs(weekStart).tz(organizationTimezone);
      const endInTz = startInTz.add(7, "day");

      const startMonthKey = MONTH_TRANSLATION_KEYS[startInTz.month()];
      const endMonthKey = MONTH_TRANSLATION_KEYS[endInTz.month()];

      return {
        index,
        key: startInTz.format("YYYY-MM-DD"),
        label: `${t(`months.${startMonthKey}`).slice(0, 3)} ${startInTz.format(
          "D",
        )} - ${t(`months.${endMonthKey}`).slice(0, 3)} ${endInTz.format("D")}`,
        yearLabel:
          `${t(`months.${startMonthKey}`).slice(0, 3)} ${startInTz.format("YYYY")}`,
        width: WEEK_VIEW_WIDTH,
      };
      });
  }, [dates, organizationTimezone, t, viewMode]);

  const monthItems = useMemo<MonthItem[]>(() => {
    if (dates.length === 0) {
      return [];
    }

    return dates.reduce<MonthItem[]>((accumulator, date, index) => {
      const dateInTz = dayjs(date).tz(organizationTimezone);

      if (
        index === 0 ||
        !dayjs(dates[index - 1])
          .tz(organizationTimezone)
          .isSame(dateInTz, "month")
      ) {
        const monthKey = MONTH_TRANSLATION_KEYS[dateInTz.month()];
        const monthLabel = t(`months.${monthKey}`);
        const yearLabel = dateInTz.format("YYYY");
        accumulator.push({
          datesCount: 1,
          index: accumulator.length,
          key: dateInTz.format("YYYY-MM"),
          label: `${monthLabel} ${yearLabel}`,
          monthLabel,
          yearLabel,
          startDateIndex: index,
          width: MONTH_VIEW_WIDTH,
        });
      } else {
        accumulator[accumulator.length - 1].datesCount++;
      }

      return accumulator;
    }, []);
  }, [dates, organizationTimezone, t]);

  const totalWidth = useMemo(() => {
    if (viewMode === "month") {
      return Math.max(monthItems.length, 1) * MONTH_VIEW_WIDTH;
    }
    if (viewMode === "week") {
      return Math.max(weekItems.length, 1) * WEEK_VIEW_WIDTH;
    }
    return dates.length * DAY_VIEW_WIDTH;
  }, [dates.length, monthItems.length, viewMode, weekItems.length]);

  const itemWidth =
    viewMode === "month"
      ? MONTH_VIEW_WIDTH
      : viewMode === "week"
        ? WEEK_VIEW_WIDTH
        : DAY_VIEW_WIDTH;

  const totalItems =
    viewMode === "month"
      ? Math.max(monthItems.length, 1)
      : viewMode === "week"
        ? Math.max(weekItems.length, 1)
        : Math.max(dates.length, 1);

  const visibleWindow = useVisibleTimelineWindow({
    itemWidth,
    overscan: viewMode === "day" ? 6 : 2,
    scrollContainerRef,
    totalItems,
    disabled: startIndexProp !== undefined,
  });

  const startIndex = startIndexProp !== undefined
    ? startIndexProp
    : (disableWindowing ? 0 : visibleWindow.startIndex);
  const endIndex = endIndexProp !== undefined
    ? endIndexProp
    : (disableWindowing ? Math.max(0, totalItems - 1) : visibleWindow.endIndex);

  const visibleWeekItems = useMemo(
    () => weekItems.slice(startIndex, endIndex + 1),
    [endIndex, startIndex, weekItems],
  );

  const visibleWeekYearGroups = useMemo(() => {
    return visibleWeekItems.reduce<Array<{ label: string; startIndex: number; count: number }>>(
      (groups, item) => {
        const previous = groups[groups.length - 1];
        if (previous?.label === item.yearLabel && previous.startIndex + previous.count === item.index) {
          previous.count += 1;
        } else {
          groups.push({ label: item.yearLabel, startIndex: item.index, count: 1 });
        }
        return groups;
      },
      [],
    );
  }, [visibleWeekItems]);

  const visibleMonthItems = useMemo(
    () => monthItems.slice(startIndex, endIndex + 1),
    [endIndex, monthItems, startIndex],
  );

  const visibleDayItems = useMemo(() => {
    if (viewMode !== "day") {
      return [];
    }

    return dates.slice(startIndex, endIndex + 1).map((date, index) => {
      const actualIndex = startIndex + index;
      const dateInTz = dayjs(date).tz(organizationTimezone);
      const weekdayKey = WEEKDAY_TRANSLATION_KEYS[dateInTz.day()];

      return {
        key: date.toISOString(),
        label: `${t(`common.day.${weekdayKey}`)} ${dateInTz.format("D")}`,
        left: actualIndex * DAY_VIEW_WIDTH,
        actualIndex,
      };
    });
  }, [dates, endIndex, organizationTimezone, startIndex, t, viewMode]);

  const visibleDayMonthLabels = useMemo(() => {
    if (viewMode !== "day") {
      return [];
    }

    return monthItems.filter((item) => {
      const monthStartIndex = item.startDateIndex;
      const monthEndIndex = item.startDateIndex + item.datesCount - 1;

      return monthEndIndex >= startIndex && monthStartIndex <= endIndex;
    });
  }, [endIndex, monthItems, startIndex, viewMode]);

  const todayHeaderLeft = useMemo(() => {
    const todayIndex = dates.findIndex((date) =>
      getDateKeyInTimezone(date, organizationTimezone) === currentDateKey,
    );

    if (todayIndex < 0) return null;

    if (viewMode === "month") {
      const today = dayjs.tz(currentDateKey, organizationTimezone);
      const monthIndex = monthItems.findIndex((item) => {
        const monthStart = dayjs(dates[item.startDateIndex]).tz(
          organizationTimezone,
        );
        return monthStart.isSame(today, "month");
      });
      return monthIndex >= 0
        ? (monthIndex + (today.date() - 1) / today.daysInMonth()) *
            MONTH_VIEW_WIDTH
        : null;
    }

    if (viewMode === "week") {
      return todayIndex * (WEEK_VIEW_WIDTH / 7);
    }

    return todayIndex * DAY_VIEW_WIDTH;
  }, [currentDateKey, dates, monthItems, organizationTimezone, viewMode]);

  if (viewMode === "week" || viewMode === "month") {
    const items = viewMode === "week" ? visibleWeekItems : visibleMonthItems;

    return (
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          height: summaryHeaderHeightPx,
          width: totalWidth,
          backgroundColor: "background.paper",
          overflow: "visible",
          borderBottom: 1,
          borderColor: "divider",
          boxSizing: "border-box",
          "& .MuiTypography-root": { fontSize: "10px" },
        }}
      >
        {viewMode === "week" &&
          visibleWeekYearGroups.map(group => (
            <Typography
              key={`${group.startIndex}-${group.label}`}
              variant="caption"
              color="text.secondary"
              fontWeight="medium"
              sx={{
                position: "absolute",
                left: `${group.startIndex * WEEK_VIEW_WIDTH}px`,
                top: 0,
                width: `${group.count * WEEK_VIEW_WIDTH}px`,
                height: GANTT_DAY_HEADER_MONTH_ROW_HEIGHT_PX,
                textAlign: "center",
                lineHeight: `${GANTT_DAY_HEADER_MONTH_ROW_HEIGHT_PX}px`,
                borderBottom: 1,
                borderColor: "divider",
                boxSizing: "border-box",
              }}
            >
              {group.label}
            </Typography>
          ))}
        {items.map((item) => {
          const { index, key, width } = item;
          const isMonthColumn = viewMode === "month";
          return (
            <Box
              key={key}
              sx={{
                position: "absolute",
                left: `${index * width}px`,
                width: `${width}px`,
                top: isMonthColumn ? 0 : GANTT_DAY_HEADER_MONTH_ROW_HEIGHT_PX,
                height: isMonthColumn
                  ? "100%"
                  : `calc(100% - ${GANTT_DAY_HEADER_MONTH_ROW_HEIGHT_PX}px)`,
                px: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                backgroundColor: "background.paper",
                overflow: "hidden",
                boxSizing: "border-box",
                borderRight: 1,
                borderColor: "divider",
                ...(index === 0
                  ? { borderLeft: 1, borderLeftColor: "divider" }
                  : null),
              }}
            >
              {isMonthColumn ? (
                <MonthYearLabel
                  monthLabel={(item as MonthItem).monthLabel}
                  yearLabel={(item as MonthItem).yearLabel}
                />
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    minWidth: 0,
                    width: "100%",
                    pt: 0,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" fontWeight="medium" noWrap>
                    {(item as WeekItem).label}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
        {todayHeaderLeft != null && (
          <TodayHeaderTag
            left={todayHeaderLeft}
            height={GANTT_DAY_HEADER_MONTH_ROW_HEIGHT_PX}
            labelPlacement="below"
          />
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        left: 0,
        width: totalWidth,
        height: GANTT_DAY_HEADER_TOTAL_HEIGHT_PX,
        minHeight: GANTT_DAY_HEADER_TOTAL_HEIGHT_PX,
        overflow: "hidden",
        boxSizing: "border-box",
        backgroundColor: "background.paper",
        "& .MuiTypography-root": { fontSize: "10px" },
      }}
    >
      <Box
        sx={{
          position: "relative",
          height: GANTT_DAY_HEADER_MONTH_ROW_HEIGHT_PX,
          width: totalWidth,
          boxSizing: "border-box",
          overflow: "hidden",
          borderBottom: 1,
          borderBottomColor: "grey.200",
          borderBottomStyle: "solid",
        }}
      >
        {visibleDayMonthLabels.map(
          ({ key, monthLabel, yearLabel, startDateIndex, datesCount }) => {
            const startPosition = startDateIndex * DAY_VIEW_WIDTH;
            const monthWidth = datesCount * DAY_VIEW_WIDTH;

            return (
              <Box
                key={key}
                sx={{
                  position: "absolute",
                  left: startPosition,
                  width: monthWidth,
                  top: 0,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  boxSizing: "border-box",
                  px: 0.5,
                }}
              >
                <MonthYearLabel monthLabel={monthLabel} yearLabel={yearLabel} />
              </Box>
            );
          },
        )}
      </Box>

      {todayHeaderLeft != null && (
        <TodayHeaderTag
          left={todayHeaderLeft}
          height={GANTT_DAY_HEADER_MONTH_ROW_HEIGHT_PX}
        />
      )}

      <Box
        component="div"
        sx={{
          position: "relative",
          width: totalWidth,
          height: GANTT_DAY_HEADER_DAY_ROW_HEIGHT_PX,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {visibleDayItems.map(({ key, label, left, actualIndex }) => (
          <Box
            key={key}
            sx={{
              position: "absolute",
              left,
              top: 0,
              width: DAY_VIEW_WIDTH,
              height: "100%",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              borderStyle: "solid",
              borderColor: "grey.200",
              borderWidth: 0,
              borderRightWidth: 1,
              borderBottomWidth: 1,
              borderLeftWidth: actualIndex === 0 ? 1 : 0,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight="medium"
            >
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export const MemoizedTimelineHeader = memo(TimelineHeader);
