import { Box } from "@mui/material";
import { memo, useId, useMemo, type RefObject } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

import {
  DAY_VIEW_WIDTH,
  GANTT_SCHEDULE_ROW_HEIGHT_PX,
  GANTT_TODAY_INDICATOR_WIDTH_PX,
  MONTH_VIEW_WIDTH,
  WEEK_VIEW_WIDTH,
} from "../helpers/constants";
import {
  countTimelineMonthsInTimezone,
  getDateKeyInTimezone,
  getMonthIndexForDateInTimezone,
} from "../helpers/dateUtil";
import { useProjectSchedule } from "../context/ScheduleProvider";
import { useVisibleTimelineWindow } from "../hooks/useVisibleTimelineWindow";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { getLocalizationValue } from "@/lib/helpers";
import { WorkingDays } from "../hooks/api/fetch-working-calendar";
import { useCurrentDateKey } from "../hooks/useCurrentDateKey";

interface TimelineGridProps {
  dates: Date[];
  disableWindowing?: boolean;
  useStaticLines?: boolean;
  scrollContainerRef: RefObject<HTMLDivElement>;
  taskCount: number;
  workingDays?: WorkingDays;
  publicHolidays?: Array<{ name: string; date: string }>;
  showHorizontalLines?: boolean;
  startIndex?: number;
  endIndex?: number;
}

const WORKING_DAY_KEYS: (keyof WorkingDays)[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
export const TimelineGrid = memo(function TimelineGrid({
  dates,
  disableWindowing = false,
  useStaticLines = false,
  scrollContainerRef,
  taskCount,
  workingDays,
  publicHolidays,
  showHorizontalLines = true,
  startIndex: startIndexProp,
  endIndex: endIndexProp,
}: TimelineGridProps) {
  const staticGridPatternId = `timeline-grid-${useId().replace(/:/g, "")}`;
  const { viewMode } = useProjectSchedule();
  const { localizationValue } = useOrganizationLocalization();
  const organizationTimezone =
    (localizationValue &&
      getLocalizationValue(localizationValue, "TIMEZONE", "ID")) ||
    "UTC";
  const currentDateKey = useCurrentDateKey(organizationTimezone);

  const columnWidth = useMemo(
    () =>
      ({
        month: MONTH_VIEW_WIDTH,
        week: WEEK_VIEW_WIDTH,
        day: DAY_VIEW_WIDTH,
      })[viewMode],
    [viewMode],
  );

  const gridMetrics = useMemo(() => {
    let columns, totalWidth;

    if (viewMode === "day") {
      // In day view, show a vertical line for each day
      columns = dates.length;
      totalWidth = dates.length * columnWidth;
    } else if (viewMode === "week") {
      // In week view, show a vertical line for each week
      columns = dates.length === 0 ? 0 : Math.ceil(dates.length / 7);
      totalWidth = columns * columnWidth;
    } else {
      // In month view, show a vertical line for each month
      columns = countTimelineMonthsInTimezone(dates, organizationTimezone);
      totalWidth = columns * columnWidth;
    }

    const todayIndex = dates.findIndex(
      (date) => getDateKeyInTimezone(date, organizationTimezone) === currentDateKey,
    );
    let todayPosition = -1;

    if (todayIndex >= 0) {
      if (viewMode === "day") {
        todayPosition = todayIndex * columnWidth;
      } else if (viewMode === "week") {
        todayPosition = todayIndex * (WEEK_VIEW_WIDTH / 7);
      } else {
        const todayInTz = dayjs(dates[todayIndex]).tz(organizationTimezone);
        todayPosition =
          (getMonthIndexForDateInTimezone(
            dates,
            todayIndex,
            organizationTimezone,
          ) +
            (todayInTz.date() - 1) / todayInTz.daysInMonth()) *
          columnWidth;
      }
    }

    const verticalBackgroundSize =
      viewMode === "day" ? `${columnWidth}px 100%` : `${columnWidth}px 100%`;
    const horizontalBackgroundSize = `100% ${GANTT_SCHEDULE_ROW_HEIGHT_PX}px`;

    return {
      totalWidth,
      todayPosition,
      columns,
      verticalBackgroundSize,
      horizontalBackgroundSize,
    };
  }, [currentDateKey, dates, viewMode, columnWidth, organizationTimezone]);

  const visibleWindow = useVisibleTimelineWindow({
    itemWidth: columnWidth,
    overscan: viewMode === "day" ? 8 : 3,
    scrollContainerRef,
    totalItems: gridMetrics.columns,
    disabled: startIndexProp !== undefined,
  });

  const startIndex = startIndexProp !== undefined
    ? startIndexProp
    : (disableWindowing ? 0 : visibleWindow.startIndex);
  const endIndex = endIndexProp !== undefined
    ? endIndexProp
    : (disableWindowing ? Math.max(0, gridMetrics.columns - 1) : visibleWindow.endIndex);

  const visibleColumnCount = Math.max(1, endIndex - startIndex + 1);
  const visibleGridLeft = startIndex * columnWidth;
  const visibleGridWidth = visibleColumnCount * columnWidth;
  const gridHeight = taskCount * GANTT_SCHEDULE_ROW_HEIGHT_PX;
  const offDayOverlays = useMemo(() => {
    if (viewMode !== "day" || !workingDays) return [];
    const holidaySet = new Set((publicHolidays ?? []).map((h) => h.date));
    const result: React.ReactNode[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const date = dates[i];
      if (!date) continue;
      // Use organization timezone (matches how TimelineHeader labels columns)
      const dayIndex = dayjs(date).tz(organizationTimezone).day();
      const isOff = !workingDays[WORKING_DAY_KEYS[dayIndex]];
      const dateStr = dayjs(date).tz(organizationTimezone).format("YYYY-MM-DD");
      const isHoliday = holidaySet.has(dateStr);
      if (!isOff && !isHoliday) continue;
      result.push(
        <Box
          key={`offday-${i}`}
          sx={{
            position: "absolute",
            left: i * columnWidth,
            top: 0,
            width: columnWidth,
            height: "100%",
            bgcolor: isHoliday ? "rgba(244,67,54,0.06)" : "rgba(0,0,0,0.04)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />,
      );
    }
    return result;
  }, [
    viewMode,
    workingDays,
    publicHolidays,
    dates,
    startIndex,
    endIndex,
    columnWidth,
    organizationTimezone,
  ]);

  return (
    <Box
      data-timeline-grid="true"
      sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      {/* Container for grid lines */}
      {useStaticLines ? (
        <>
          {/*
            html2canvas is unreliable with CSS repeating gradients and huge numbers of
            absolutely positioned 1px lines. Render export grid as one SVG pattern layer.
          */}
          {gridHeight > 0 && (
            <Box
              component="svg"
              aria-hidden
              sx={{
                position: "absolute",
                left: visibleGridLeft,
                top: 0,
                width: `${visibleGridWidth}px`,
                height: `${gridHeight}px`,
                pointerEvents: "none",
                display: "block",
              }}
              viewBox={`0 0 ${visibleGridWidth} ${gridHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <pattern
                  id={staticGridPatternId}
                  patternUnits="userSpaceOnUse"
                  width={columnWidth}
                  height={GANTT_SCHEDULE_ROW_HEIGHT_PX}
                >
                  <line
                    x1={columnWidth - 1}
                    y1={0}
                    x2={columnWidth - 1}
                    y2={GANTT_SCHEDULE_ROW_HEIGHT_PX}
                    stroke="rgba(0, 0, 0, 0.12)"
                    strokeWidth={1}
                  />
                  <line
                    x1={0}
                    y1={GANTT_SCHEDULE_ROW_HEIGHT_PX - 1}
                    x2={columnWidth}
                    y2={GANTT_SCHEDULE_ROW_HEIGHT_PX - 1}
                    stroke="rgba(0, 0, 0, 0.12)"
                    strokeWidth={1}
                  />
                </pattern>
              </defs>
              <rect
                width={visibleGridWidth}
                height={gridHeight}
                fill={`url(#${staticGridPatternId})`}
              />
            </Box>
          )}
        </>
      ) : (
        <Box
          sx={{
            position: "absolute",
            left: visibleGridLeft,
            top: 0,
            height: "100%",
            width: `${visibleGridWidth}px`,
            backgroundImage: showHorizontalLines
              ? `
                linear-gradient(to right, transparent calc(100% - 1px), rgba(0, 0, 0, 0.12) calc(100% - 1px)),
                linear-gradient(to bottom, transparent calc(100% - 1px), rgba(0, 0, 0, 0.12) calc(100% - 1px))
              `
              : "linear-gradient(to right, transparent calc(100% - 1px), rgba(0, 0, 0, 0.12) calc(100% - 1px))",
            backgroundSize: showHorizontalLines
              ? `${gridMetrics.verticalBackgroundSize}, ${gridMetrics.horizontalBackgroundSize}`
              : gridMetrics.verticalBackgroundSize,
            backgroundRepeat: "repeat",
          }}
        />
      )}

      {offDayOverlays}

      {gridMetrics.todayPosition >= 0 && (
        <TodayIndicator
          position={gridMetrics.todayPosition}
          height={gridHeight}
        />
      )}
    </Box>
  );
});

// Separate component for Today's indicator
const TodayIndicator = memo(
  ({
    position,
    height,
  }: {
    position: number;
    height: number;
  }) => {
    TodayIndicator.displayName = "TodayIndicator";
    return (
      <Box
        sx={{
          position: "absolute",
          left: `${position - GANTT_TODAY_INDICATOR_WIDTH_PX / 2}px`,
          top: 0,
          height,
          width: `${GANTT_TODAY_INDICATOR_WIDTH_PX}px`,
          bgcolor: "primary.main",
          opacity: 1,
          zIndex: 1,
        }}
      />
    );
  },
);
