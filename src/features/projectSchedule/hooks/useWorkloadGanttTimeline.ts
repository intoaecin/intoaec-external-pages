import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import {
  calculateDateRange,
  countTimelineMonthsInTimezone,
  eachCalendarDayInTimezone,
  getMonthIndexForDateInTimezone,
  isTodayInTimezone,
} from "../helpers/dateUtil";
import { getSchedulePosition } from "../helpers/schedulePositioning";
import {
  DAY_VIEW_WIDTH,
  GANTT_SCHEDULE_ROW_HEIGHT_PX,
  MONTH_VIEW_WIDTH,
  WEEK_VIEW_WIDTH,
} from "../helpers/constants";
import { useProjectSchedule } from "../context/ScheduleProvider";
import { useVisibleRowWindow } from "./useVisibleRowWindow";
import { useVisibleTimelineWindow } from "./useVisibleTimelineWindow";
import type { WorkingCalendarDurationFormatParams } from "../helpers/dateUtil";
import type { WorkloadGanttRow } from "../types/workload";

const SCHEDULE_SCROLL_PADDING = 100;
const EXTRA_TIMELINE_PADDING_MONTHS = { day: 12, week: 6, month: 6 };

function getViewWidth(viewMode: "day" | "week" | "month"): number {
  if (viewMode === "month") return MONTH_VIEW_WIDTH;
  if (viewMode === "week") return WEEK_VIEW_WIDTH;
  return DAY_VIEW_WIDTH;
}

export function useWorkloadGanttTimeline({
  rows,
  startDate,
  endDate,
  exactRange = false,
  organizationTimezone,
  workingCalendarData,
  scrollContainerRef,
}: {
  rows: WorkloadGanttRow[];
  startDate?: Date;
  endDate?: Date;
  /** Show only `startDate`..`endDate`, with no padding around it, in every view mode. */
  exactRange?: boolean;
  organizationTimezone: string;
  workingCalendarData?: {
    workingDays?: WorkingCalendarDurationFormatParams["workingDays"];
    workingHoursByDay?: WorkingCalendarDurationFormatParams["workingHoursByDay"];
    publicHolidays?: WorkingCalendarDurationFormatParams["publicHolidays"];
  } | null;
  scrollContainerRef: RefObject<HTMLDivElement>;
}) {
  const didInitialScrollRef = useRef(false);
  const { viewMode, data: schedules } = useProjectSchedule();
  const { minDate, maxDate } = useMemo(
    () =>
      exactRange && startDate && endDate
        ? { minDate: startDate, maxDate: endDate }
        : calculateDateRange(
            schedules,
            startDate,
            endDate,
            viewMode,
            [new Date()],
            EXTRA_TIMELINE_PADDING_MONTHS[viewMode],
          ),
    [schedules, startDate, endDate, exactRange, viewMode],
  );
  const dates = useMemo(
    () =>
      eachCalendarDayInTimezone(
        new Date(minDate.getTime()),
        new Date(maxDate.getTime()),
        organizationTimezone,
      ),
    [minDate, maxDate, organizationTimezone],
  );
  const pixelsPerUnit = useMemo(() => getViewWidth(viewMode), [viewMode]);
  const totalTimelineItems = useMemo(() => {
    if (viewMode === "day") return Math.max(dates.length, 1);
    if (viewMode === "week") return Math.max(Math.ceil(dates.length / 7), 1);
    return Math.max(countTimelineMonthsInTimezone(dates, organizationTimezone), 1);
  }, [dates, organizationTimezone, viewMode]);
  const { startIndex: visibleRowStartIndex, endIndex: visibleRowEndIndex } =
    useVisibleRowWindow({
      overscan: 10,
      rowHeight: GANTT_SCHEDULE_ROW_HEIGHT_PX,
      scrollContainerRef,
      totalRows: rows.length,
    });
  const windowedTimelineRange = useVisibleTimelineWindow({
    itemWidth: pixelsPerUnit,
    overscan: viewMode === "day" ? 8 : 3,
    scrollContainerRef,
    totalItems: totalTimelineItems,
  });
  const visibleTimelineRange = useMemo(
    () => ({
      startPx: windowedTimelineRange.startIndex * pixelsPerUnit,
      endPx: (windowedTimelineRange.endIndex + 1) * pixelsPerUnit,
    }),
    [pixelsPerUnit, windowedTimelineRange],
  );
  const visibleRows = useMemo(
    () =>
      rows.slice(visibleRowStartIndex, visibleRowEndIndex + 1).map((row, index) => ({
        rowIndex: visibleRowStartIndex + index,
        row,
      })),
    [rows, visibleRowStartIndex, visibleRowEndIndex],
  );
  const scheduleMetricsById = useMemo(() => {
    const metrics = new Map<string, { startDiff: number; duration: number }>();
    for (const { row } of visibleRows) {
      if (!row.schedule) continue;
      const position = getSchedulePosition(row.schedule, minDate, viewMode, organizationTimezone, {
        workingHoursByDay: workingCalendarData?.workingHoursByDay,
      });
      metrics.set(row.rowKey, {
        startDiff: position.start / pixelsPerUnit,
        duration: (position.end - position.start) / pixelsPerUnit,
      });
    }
    return metrics;
  }, [visibleRows, minDate, viewMode, organizationTimezone, pixelsPerUnit, workingCalendarData]);
  const scrollToToday = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const todayIndex = dates.findIndex((date) => isTodayInTimezone(date, organizationTimezone));
    if (todayIndex < 0) {
      if (dates.length > 0) container.scrollLeft = 0;
      return;
    }
    const position =
      viewMode === "month"
        ? getMonthIndexForDateInTimezone(dates, todayIndex, organizationTimezone) * MONTH_VIEW_WIDTH
        : viewMode === "week"
          ? Math.floor(todayIndex / 7) * WEEK_VIEW_WIDTH
          : todayIndex * DAY_VIEW_WIDTH;
    container.scrollLeft = Math.max(0, position - SCHEDULE_SCROLL_PADDING);
  }, [dates, organizationTimezone, scrollContainerRef, viewMode]);

  useEffect(() => {
    if (didInitialScrollRef.current) return;
    didInitialScrollRef.current = true;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scrollToToday);
    });
  }, [scrollToToday]);

  return {
    dates,
    pixelsPerUnit,
    scheduleMetricsById,
    scrollToToday,
    visibleRows,
    visibleTimelineRange,
    visibleTimelineStartIndex: windowedTimelineRange.startIndex,
    visibleTimelineEndIndex: windowedTimelineRange.endIndex,
    viewMode,
  };
}
