import type { Schedule } from "../types/schedule";
import {
  differenceInCalendarDaysForTimezone,
  inclusiveCalendarDaySpanInTimezone,
  calculateDuration,
  calculateDaysDifference,
  getWorkingMinutesForDay,
} from "./dateUtil";
import type {
  WorkingDays,
  WorkingHoursByDay,
} from "../hooks/api/fetch-working-calendar";
import { normalizeWorkingHoursByDay } from "../hooks/api/fetch-working-calendar";
import {
  DAY_VIEW_WIDTH,
  GANTT_ZERO_DURATION_BAR_WIDTH_PX,
  MONTH_VIEW_WIDTH,
  WEEK_VIEW_WIDTH,
} from "./constants";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;
};

/** End (right edge) of an organization-local calendar day in the active Gantt scale. */
export function getCalendarDayEndPosition(
  date: Date,
  minDate: Date,
  viewMode: "day" | "month" | "week",
  organizationTimezone = "UTC",
): number {
  const timezoneId = organizationTimezone || "UTC";
  const dateInTimezone = dayjs(date).tz(timezoneId);

  if (viewMode === "week") {
    const minDateInTimezone = dayjs(minDate).tz(timezoneId);
    const daysToMonday = (minDateInTimezone.day() + 6) % 7;
    const weekOrigin = minDateInTimezone
      .subtract(daysToMonday, "day")
      .startOf("day");
    const dateDay = dayjs.tz(
      dateInTimezone.format("YYYY-MM-DD"),
      timezoneId,
    );
    return (dateDay.diff(weekOrigin, "day") + 1) * (WEEK_VIEW_WIDTH / 7);
  }

  if (viewMode === "month") {
    const minDateInTimezone = dayjs(minDate).tz(timezoneId);
    const monthsDifference =
      (dateInTimezone.year() - minDateInTimezone.year()) * 12 +
      (dateInTimezone.month() - minDateInTimezone.month());
    const monthFraction =
      dateInTimezone.date() / dateInTimezone.daysInMonth();
    return (monthsDifference + monthFraction) * MONTH_VIEW_WIDTH;
  }

  return (
    (differenceInCalendarDaysForTimezone(date, minDate, timezoneId) + 1) *
    DAY_VIEW_WIDTH
  );
}

interface GetSchedulePositionOptions {
  useWorkingHoursInDayView?: boolean;
  workingHoursByDay?: WorkingHoursByDay;
}

const DAY_KEYS_ORDERED: Array<keyof WorkingDays> = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function getWorkingDayFraction(
  date: Date,
  timezoneId: string,
  workingHoursByDay?: WorkingHoursByDay,
): number {
  const localDate = dayjs(date).tz(timezoneId || "UTC");
  const normalizedWorkingHoursByDay =
    normalizeWorkingHoursByDay(workingHoursByDay);
  const dayKey = DAY_KEYS_ORDERED[localDate.day()];
  const dayHours = normalizedWorkingHoursByDay[dayKey];
  const startMinute = dayHours.startMinute;
  const endMinute = dayHours.endMinute;
  const dayStart = localDate
    .startOf("day")
    .hour(Math.floor(startMinute / 60))
    .minute(startMinute % 60)
    .second(0)
    .millisecond(0);
  const dayEnd = localDate
    .startOf("day")
    .hour(Math.floor(endMinute / 60))
    .minute(endMinute % 60)
    .second(0)
    .millisecond(0);

  if (!localDate.isAfter(dayStart)) {
    return 0;
  }

  if (!localDate.isBefore(dayEnd)) {
    return 1;
  }

  const workedMinutes = localDate.diff(dayStart, "minute", true);
  const totalWorkingMinutes = getWorkingMinutesForDay(
    normalizedWorkingHoursByDay,
    dayKey,
  );
  return Math.max(0, Math.min(1, workedMinutes / totalWorkingMinutes));
}

/** Left edge of the org-local calendar day column (matches schedule list dates). */
function getDayViewCalendarDayLeftPx(
  date: Date,
  minDate: Date,
  timezoneId: string
): number {
  return (
    differenceInCalendarDaysForTimezone(date, minDate, timezoneId) *
    DAY_VIEW_WIDTH
  );
}

/** Intra-day position from working-window time (used for bar end / width only). */
function getDayViewPositionInPixels(
  date: Date,
  minDate: Date,
  timezoneId: string,
  workingHoursByDay?: WorkingHoursByDay,
): number {
  const dayOffset = differenceInCalendarDaysForTimezone(
    date,
    minDate,
    timezoneId,
  );
  const dayFraction = getWorkingDayFraction(
    date,
    timezoneId,
    workingHoursByDay,
  );
  return (dayOffset + dayFraction) * DAY_VIEW_WIDTH;
}

/**
 * Calculates the pixel positions for rendering a Schedule in a timeline view.
 * @param schedule - The Schedule to calculate positions for
 * @param minDate - The minimum date of the timeline view (left-most date)
 * @param viewMode - The current view mode ('day', 'week', or 'month')
 * @param organizationTimezone - Optional IANA timezone identifier
 * @returns Object containing start, end, and center positions in pixels
 */
export function getSchedulePosition(
  schedule: Schedule,
  minDate: Date,
  viewMode: "day" | "month" | "week",
  organizationTimezone?: string,
  options: GetSchedulePositionOptions = {},
) {
  const start = new Date(schedule.scheduleStartDate);
  const end = new Date(schedule.scheduleEndDate);
  const storedWorkingMinutes = Number(schedule.scheduleDuration);
  /** Same instant (or invalid order) and no positive stored duration → bar should not default to one full column/day. */
  const isZeroWorkingSpan =
    end.getTime() <= start.getTime() &&
    (!Number.isFinite(storedWorkingMinutes) || storedWorkingMinutes <= 0);
  const { useWorkingHoursInDayView = true } = options;
  const normalizedWorkingHoursByDay = normalizeWorkingHoursByDay(
    options.workingHoursByDay,
  );

  if (viewMode === "week") {
    const tz = organizationTimezone || "UTC";
    const dayWidth = WEEK_VIEW_WIDTH / 7;

    // Align minDate to the Monday of its week (in org timezone), exactly as
    // eachWeekOfInterval({ weekStartsOn: 1 }) does in the header.
    const minDateInTz = dayjs(minDate).tz(tz);
    // dayjs .day() is 0=Sun … 6=Sat; Monday offset = (day + 6) % 7
    const minDateDayOfWeek = minDateInTz.day();
    const daysToMonday = (minDateDayOfWeek + 6) % 7;
    const weekOrigin = minDateInTz.subtract(daysToMonday, "day").startOf("day");

    // Days from the week-origin Monday to the schedule date (in org tz)
    const startKey = dayjs(start).tz(tz).format("YYYY-MM-DD");
    const startDayjs = dayjs.tz(startKey, tz).startOf("day");
    const startDiff = startDayjs.diff(weekOrigin, "day");
    const pixelStart = startDiff * dayWidth;

    if (isZeroWorkingSpan && !schedule.isMilestone) {
      return {
        start: pixelStart,
        end: pixelStart + GANTT_ZERO_DURATION_BAR_WIDTH_PX,
        center: pixelStart + GANTT_ZERO_DURATION_BAR_WIDTH_PX / 2,
      };
    }

    const endKey = dayjs(end).tz(tz).format("YYYY-MM-DD");
    const endDayjs = dayjs.tz(endKey, tz).startOf("day");
    const endDiff = endDayjs.diff(weekOrigin, "day");
    // +1: a bar spanning the same start/end calendar day still fills one day-slot
    const width = endDiff - startDiff + 1;
    const pixelEnd = pixelStart + width * dayWidth;
    return {
      start: pixelStart,
      end: pixelEnd,
      center: (pixelStart + pixelEnd) / 2,
    };
  }

  if (viewMode === "month") {
    const tz = organizationTimezone || "UTC";
    const startInTz = dayjs(start).tz(tz);
    const endInTz = dayjs(end).tz(tz);
    const minDateInTz = dayjs(minDate).tz(tz);

    if (isZeroWorkingSpan && !schedule.isMilestone) {
      const startMonthsDiff =
        (startInTz.year() - minDateInTz.year()) * 12 +
        (startInTz.month() - minDateInTz.month());
      const daysInStartMonth = startInTz.daysInMonth();
      const startPosition =
        startMonthsDiff + (startInTz.date() - 1) / daysInStartMonth;
      const pixelStart = startPosition * MONTH_VIEW_WIDTH;
      return {
        start: pixelStart,
        end: pixelStart + GANTT_ZERO_DURATION_BAR_WIDTH_PX,
        center: pixelStart + GANTT_ZERO_DURATION_BAR_WIDTH_PX / 2,
      };
    }
    const startMonthsDiff =
      (startInTz.year() - minDateInTz.year()) * 12 +
      (startInTz.month() - minDateInTz.month());
    const endMonthsDiff =
      (endInTz.year() - minDateInTz.year()) * 12 +
      (endInTz.month() - minDateInTz.month());
    const daysInStartMonth = startInTz.daysInMonth();
    const daysInEndMonth = endInTz.daysInMonth();
    const startPosition =
      startMonthsDiff + (startInTz.date() - 1) / daysInStartMonth;
    const endPosition = endMonthsDiff + endInTz.date() / daysInEndMonth;
    const pixelStart = startPosition * MONTH_VIEW_WIDTH;
    const pixelEnd = endPosition * MONTH_VIEW_WIDTH;
    return {
      start: pixelStart,
      end: pixelEnd,
      center: (pixelStart + pixelEnd) / 2,
    };
  }

  // Day view: align with org-local calendar columns (see eachCalendarDayInTimezone).
  if (organizationTimezone && useWorkingHoursInDayView) {
    const tz = organizationTimezone || "UTC";
    const startDayKey = DAY_KEYS_ORDERED[dayjs(start).tz(tz).day()];
    const pixelStart = getDayViewPositionInPixels(
      start,
      minDate,
      tz,
      normalizedWorkingHoursByDay,
    );
    const pixelEnd = Math.max(
      pixelStart,
      getDayViewPositionInPixels(end, minDate, tz, normalizedWorkingHoursByDay),
    );

    if (schedule.isMilestone) {
      return {
        start: pixelStart - DAY_VIEW_WIDTH / 2,
        end: pixelStart + DAY_VIEW_WIDTH / 2,
        center: pixelStart,
      };
    }

    if (pixelEnd > pixelStart) {
      return {
        start: pixelStart,
        end: pixelEnd,
        center: (pixelStart + pixelEnd) / 2,
      };
    }

    if (!Number.isFinite(storedWorkingMinutes) || storedWorkingMinutes <= 0) {
      const w = schedule.isMilestone ? 0 : GANTT_ZERO_DURATION_BAR_WIDTH_PX;
      return {
        start: pixelStart,
        end: pixelStart + w,
        center: pixelStart + w / 2,
      };
    }

    const baseWorkingMinutesForStartDay = getWorkingMinutesForDay(
      normalizedWorkingHoursByDay,
      startDayKey,
    );
    const fallbackDurationInDayUnits =
      storedWorkingMinutes / baseWorkingMinutesForStartDay;
    const barWidth = fallbackDurationInDayUnits * DAY_VIEW_WIDTH;
    return {
      start: pixelStart,
      end: pixelStart + barWidth,
      center: pixelStart + barWidth / 2,
    };
  }

  if (organizationTimezone) {
    const tz = organizationTimezone || "UTC";
    const pixelStart =
      differenceInCalendarDaysForTimezone(start, minDate, tz) * DAY_VIEW_WIDTH;
    if (isZeroWorkingSpan && !schedule.isMilestone) {
      return {
        start: pixelStart,
        end: pixelStart + GANTT_ZERO_DURATION_BAR_WIDTH_PX,
        center: pixelStart + GANTT_ZERO_DURATION_BAR_WIDTH_PX / 2,
      };
    }
    const durationDays = Math.max(
      1,
      inclusiveCalendarDaySpanInTimezone(start, end, tz),
    );
    const barWidth = durationDays * DAY_VIEW_WIDTH;
    return {
      start: pixelStart,
      end: pixelStart + barWidth,
      center: pixelStart + barWidth / 2,
    };
  }

  const duration = isZeroWorkingSpan
    ? 0
    : calculateDuration(end, start, viewMode);
  const pixelStart =
    calculateDaysDifference(
      schedule.scheduleStartDate as Date,
      minDate,
      viewMode,
    ) * DAY_VIEW_WIDTH;
  const barWidth =
    isZeroWorkingSpan && !schedule.isMilestone
      ? GANTT_ZERO_DURATION_BAR_WIDTH_PX
      : duration * DAY_VIEW_WIDTH;
  return {
    start: pixelStart,
    end: pixelStart + barWidth,
    center: pixelStart + barWidth / 2,
  };
}
