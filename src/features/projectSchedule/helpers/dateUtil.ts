import {
  addMonths,
  subMonths,
  differenceInMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  differenceInWeeks,
  addWeeks,
  differenceInDays,
} from "date-fns";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { Schedule, ScheduleDependency } from "../types/schedule";
import type {
  WorkingDays,
  WorkingHoursByDay,
} from "../hooks/api/fetch-working-calendar";
import {
  DEFAULT_WORKING_DAY_HOURS,
  DEFAULT_WORKING_HOURS_BY_DAY,
  normalizeWorkingHoursByDay,
} from "../hooks/api/fetch-working-calendar";

dayjs.extend(utc);
dayjs.extend(timezone);

export type WorkingCalendarConfig = {
  workingDays: WorkingDays;
  workingHoursByDay: WorkingHoursByDay;
  publicHolidays: Array<{ name: string; date: string }>;
  organizationTimezone?: string;
};

type WorkingCalendarContext = {
  workingDays: WorkingDays;
  workingHoursByDay: WorkingHoursByDay;
  publicHolidays: Array<{ name: string; date: string }>;
  holidaySet: Set<string>;
  organizationTimezone: string;
};

function createHolidaySet(
  publicHolidays: Array<{ name: string; date: string }>
): Set<string> {
  return new Set(publicHolidays.map((h) => h.date));
}

function createWorkingCalendarContext(
  workingDays: WorkingDays,
  publicHolidays: Array<{ name: string; date: string }>,
  organizationTimezone = "UTC",
  rawWorkingHoursByDay?: WorkingHoursByDay
): WorkingCalendarContext {
  return {
    workingDays,
    workingHoursByDay: normalizeWorkingHoursByDay(
      rawWorkingHoursByDay ?? DEFAULT_WORKING_HOURS_BY_DAY
    ),
    publicHolidays,
    holidaySet: createHolidaySet(publicHolidays),
    organizationTimezone: organizationTimezone || "UTC",
  };
}

function createWorkingCalendarContextFromConfig(
  workingCalendar: WorkingCalendarConfig
): WorkingCalendarContext {
  return createWorkingCalendarContext(
    workingCalendar.workingDays,
    workingCalendar.publicHolidays,
    workingCalendar.organizationTimezone || "UTC",
    workingCalendar.workingHoursByDay
  );
}

function startOfOrgDay(date: Date, organizationTimezone = "UTC") {
  const dayKey = dayjs(date).tz(organizationTimezone).format("YYYY-MM-DD");
  return dayjs.tz(dayKey, organizationTimezone).startOf("day");
}

export function applySourceClockToTargetDate(
  targetDate: Date,
  sourceDate: Date,
  organizationTimezone = "UTC"
): Date {
  const targetDayKey = dayjs(targetDate).tz(organizationTimezone).format("YYYY-MM-DD");
  const targetDay = dayjs.tz(targetDayKey, organizationTimezone);
  const sourceInOrgTz = dayjs(sourceDate).tz(organizationTimezone);

  return targetDay
    .hour(sourceInOrgTz.hour())
    .minute(sourceInOrgTz.minute())
    .second(sourceInOrgTz.second())
    .millisecond(sourceInOrgTz.millisecond())
    .toDate();
}

/** Advance a YYYY-MM-DD key by one calendar day (immune to DST). */
export function addCalendarDayKey(dayKey: string, days = 1): string {
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function getDateKeyInTimezone(
  date: Date,
  timezoneId: string,
): string {
  return dayjs(date)
    .tz(timezoneId || "UTC")
    .format("YYYY-MM-DD");
}

/** Whether a YYYY-MM-DD key falls after the organization's current calendar day. */
export function isDateKeyInFuture(dateKey: string, timezoneId: string): boolean {
  const todayKey = dayjs().tz(timezoneId || "UTC").format("YYYY-MM-DD");
  return dateKey > todayKey;
}

/** Day offset from the Monday that owns the first timeline date. */
export function getWeekDayOffsetForDateKey(
  timelineDates: Date[],
  dateKey: string,
  timezoneId: string,
): number | null {
  if (timelineDates.length === 0) {
    return null;
  }

  const tz = timezoneId || "UTC";
  const firstKey = getDateKeyInTimezone(timelineDates[0], tz);
  const daysToMonday = (dayjs.tz(firstKey, tz).day() + 6) % 7;
  const weekOriginKey = addCalendarDayKey(firstKey, -daysToMonday);
  const offset = differenceBetweenCalendarDayKeys(weekOriginKey, dateKey);

  return offset >= 0 ? offset : null;
}

/** Whole calendar days between two YYYY-MM-DD keys (later − earlier). */
export function differenceBetweenCalendarDayKeys(
  earlierKey: string,
  laterKey: string
): number {
  const [y1, m1, d1] = earlierKey.split("-").map(Number);
  const [y2, m2, d2] = laterKey.split("-").map(Number);
  return Math.round(
    (Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000
  );
}

/**
 * Returns true if the given date's calendar day (in the given timezone) equals
 * "today" in that timezone. Use organization timezone so "today" in the Gantt
 * reflects the org's date (e.g. US/Central) not the user's browser local date.
 */
export function isTodayInTimezone(date: Date, timezoneId: string): boolean {
  const tz = timezoneId || "UTC";
  const dateInTz = getDateKeyInTimezone(date, tz);
  const todayInTz = getDateKeyInTimezone(new Date(), tz);
  return dateInTz === todayInTz;
}

/**
 * One Date per calendar day in `timezoneId` from the org-local day of `rangeStart`
 * through the org-local day of `rangeEnd` (inclusive). Use this for the Gantt day
 * columns so headers, weekend shading, and bar math agree (browser-local
 * `eachDayOfInterval` drifts from org TZ labels).
 */
export function eachCalendarDayInTimezone(
  rangeStart: Date,
  rangeEnd: Date,
  timezoneId: string
): Date[] {
  const tz = timezoneId || "UTC";
  const firstKey = dayjs(rangeStart).tz(tz).format("YYYY-MM-DD");
  const lastKey = dayjs(rangeEnd).tz(tz).format("YYYY-MM-DD");

  const result: Date[] = [];
  let currentKey = firstKey;

  // Step by calendar-day keys, not `add(1, "day")`, so DST transitions (e.g.
  // Australia/Sydney) never emit duplicate or skipped column dates.
  while (currentKey <= lastKey) {
    result.push(dayjs.tz(currentKey, tz).startOf("day").toDate());
    currentKey = addCalendarDayKey(currentKey);
  }

  return result;
}

/** Whole org-local calendar days from `earlier` to `later` (later − earlier). */
export function differenceInCalendarDaysForTimezone(
  later: Date,
  earlier: Date,
  timezoneId: string
): number {
  const tz = timezoneId || "UTC";
  const laterKey = dayjs(later).tz(tz).format("YYYY-MM-DD");
  const earlierKey = dayjs(earlier).tz(tz).format("YYYY-MM-DD");
  return differenceBetweenCalendarDayKeys(earlierKey, laterKey);
}

/** Inclusive count of org-local calendar days from `start` through `end`. */
export function inclusiveCalendarDaySpanInTimezone(
  start: Date,
  end: Date,
  timezoneId: string
): number {
  return differenceInCalendarDaysForTimezone(end, start, timezoneId) + 1;
}

/** Month column count for Gantt month view; uses org TZ so headers/grid align. */
export function countTimelineMonthsInTimezone(
  timelineDates: Date[],
  timezoneId: string
): number {
  if (timelineDates.length === 0) {
    return 0;
  }

  const tz = timezoneId || "UTC";

  return timelineDates.reduce((count, date, index) => {
    if (index === 0) {
      return 1;
    }

    const prevInTz = dayjs(timelineDates[index - 1]).tz(tz);
    const currInTz = dayjs(date).tz(tz);
    const isSameMonth =
      prevInTz.year() === currInTz.year() &&
      prevInTz.month() === currInTz.month();

    return isSameMonth ? count : count + 1;
  }, 0);
}

export function getMonthIndexForDateInTimezone(
  timelineDates: Date[],
  dateIndex: number,
  timezoneId: string
): number {
  if (dateIndex < 0 || timelineDates.length === 0) {
    return 0;
  }

  return (
    countTimelineMonthsInTimezone(
      timelineDates.slice(0, dateIndex + 1),
      timezoneId
    ) - 1
  );
}

export function calculateDateRange(
  schedules: Schedule[],
  scheduleStartDate?: Date,
  scheduleEndDate?: Date,
  viewMode: "day" | "month" | "week" = "day",
  additionalDates?: Date[],
  extraPaddingMonths = 0
) {
  const monthPadCount =
    (viewMode === "month" ? 12 : viewMode === "week" ? 7 : 1) +
    extraPaddingMonths;
  // Day view keeps an explicit schedule span exact unless extra padding is asked for.
  const isExactDayRange = viewMode === "day" && extraPaddingMonths === 0;

  // If no schedules, use today's date as reference
  if (schedules.length === 0) {
    const today = startOfMonth(new Date());
    // For month/week views, always pad around an explicit schedule date too,
    // so the timeline isn't clamped to exactly the schedule's own span.
    const minDate = scheduleStartDate
      ? isExactDayRange
        ? scheduleStartDate
        : subMonths(scheduleStartDate, monthPadCount)
      : subMonths(today, monthPadCount);
    const maxDate = scheduleEndDate
      ? isExactDayRange
        ? scheduleEndDate
        : addMonths(scheduleEndDate, monthPadCount)
      : addMonths(today, monthPadCount);

    if (viewMode === "week") {
      return {
        minDate: startOfWeek(minDate, { weekStartsOn: 1 }),
        maxDate: endOfWeek(maxDate, { weekStartsOn: 1 }),
      };
    }

    return { minDate: startOfMonth(minDate), maxDate: endOfMonth(maxDate) };
  }

  const allDates = schedules
    .flatMap((schedule) => [
      schedule.scheduleStartDate,
      schedule.scheduleEndDate,
      schedule.scheduleDeadlineDate,
    ])
    .filter(
      (dateValue): dateValue is number | Date =>
        dateValue !== null && dateValue !== undefined,
    )
    .map((dateValue) => new Date(dateValue))
    .filter((dateValue) => !Number.isNaN(dateValue.getTime()));
  if (additionalDates?.length) {
    allDates.push(...additionalDates);
  }
  const minTaskDate = startOfMonth(
    new Date(Math.min(...allDates.map((d) => d.getTime())))
  );
  const maxTaskDate = endOfMonth(
    new Date(Math.max(...allDates.map((d) => d.getTime())))
  );

  // Add padding based on view mode - 1 year for month view, 7 months for week
  // view, 1 month for day view. For month/week views, pad around an explicit
  // schedule date too, so the timeline isn't clamped to exactly its span.
  const minDate = scheduleStartDate
    ? isExactDayRange
      ? scheduleStartDate
      : subMonths(scheduleStartDate, monthPadCount)
    : subMonths(minTaskDate, monthPadCount);
  const maxDate = scheduleEndDate
    ? isExactDayRange
      ? scheduleEndDate
      : addMonths(scheduleEndDate, monthPadCount)
    : addMonths(maxTaskDate, monthPadCount);

  if (viewMode === "week") {
    // For week view, use start of week instead of start of month
    return { 
      minDate: startOfWeek(minDate, { weekStartsOn: 1 }), // Monday as start of week
      maxDate: endOfWeek(maxDate, { weekStartsOn: 1 }) 
    };
  }
  
  return { minDate: startOfMonth(minDate), maxDate: endOfMonth(maxDate) };
}

export function calculateDuration(
  date1: Date,
  date2: Date,
  viewMode: "day" | "month" | "week" = "day"
): number {
  if (viewMode === "month") {
    return differenceInMonths(date1, date2);
  }
  if (viewMode === "week") {
    return differenceInWeeks(date1, date2);
  }
  return Math.floor(differenceInDays(date1, date2) + 1);
}

export function calculateDaysDifference(
  date1: Date,
  date2: Date,
  viewMode: "day" | "month" | "week" = "day"
): number {
  if (viewMode === "month") {
    return differenceInMonths(date1, date2);
  }
  if (viewMode === "week") {
    return differenceInWeeks(date1, date2);
  }
  return Math.floor(
    (date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export function addDaysToDate(
  date: Date,
  days: number,
  viewMode: "day" | "month" | "week" = "day"
): Date {
  if (viewMode === "month") {
    return addMonths(date, days);
  }
  if (viewMode === "week") {
    return addWeeks(date, days);
  }
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

/**
 * Adds (or subtracts) *working* days from `date`, skipping off-days and public holidays.
 * The returned date is always a working day (unless the calendar config is missing).
 */
export function addWorkingDays(
  date: Date,
  workingDays: WorkingDays,
  publicHolidays: Array<{ name: string; date: string }>,
  deltaWorkingDays: number,
  organizationTimezone = "UTC"
): Date {
  if (isNaN(new Date(date).getTime()) || isNaN(deltaWorkingDays) || !Number.isFinite(deltaWorkingDays)) {
    return new Date(date);
  }

  if (deltaWorkingDays === 0) {
    return snapToNextWorkingDay(date, workingDays, publicHolidays, organizationTimezone);
  }

  const step = deltaWorkingDays > 0 ? 1 : -1;
  const remaining = Math.abs(deltaWorkingDays);
  let cursor = new Date(date);

  // Ensure we start from a valid working day.
  cursor =
    step > 0
      ? snapToNextWorkingDay(cursor, workingDays, publicHolidays, organizationTimezone)
      : snapToPreviousWorkingDay(cursor, workingDays, publicHolidays, organizationTimezone);

  let moved = 0;
  for (let i = 0; i < 3660; i++) {
    if (moved >= remaining) return cursor;
    cursor = new Date(cursor.getTime() + step * 86400000);
    const snapped =
      step > 0
        ? snapToNextWorkingDay(cursor, workingDays, publicHolidays, organizationTimezone)
        : snapToPreviousWorkingDay(cursor, workingDays, publicHolidays, organizationTimezone);
    cursor = snapped;
    moved++;
  }

  return cursor;
}

/**
 * Returns the start date that gives exactly `targetWorkingDays` working days
 * ending at (and including) `end`. Off days and public holidays are skipped.
 * The returned date is always the first working day counted.
 */
export function startDateForWorkingDuration(
  end: Date,
  targetWorkingDays: number,
  workingDays: WorkingDays,
  publicHolidays: Array<{ name: string; date: string }>,
  organizationTimezone = "UTC"
): Date {
  if (isNaN(new Date(end).getTime()) || isNaN(targetWorkingDays) || targetWorkingDays <= 0) return new Date(end);

  const holidaySet = new Set(publicHolidays.map((h) => h.date));
  let count = 0;
  let cursor = startOfOrgDay(end, organizationTimezone);

  for (let i = 0; i < 7300; i++) {
    const inTz = cursor.tz(organizationTimezone);
    const key = DAY_KEYS_ORDERED[inTz.day()];
    const dateStr = inTz.format("YYYY-MM-DD");
    if (workingDays[key] && !holidaySet.has(dateStr)) {
      count++;
      if (count === targetWorkingDays) return cursor.toDate();
    }
    cursor = cursor.subtract(1, "day");
  }
  return cursor.toDate();
}

export function adjustScheduleDates(
  parentSchedule: Schedule,
  childSchedule: Schedule,
  dependencyType: ScheduleDependency["type"],
  delay: number = 0,
  workingCalendar?: WorkingCalendarConfig
): { scheduleStartDate: Date; scheduleEndDate: Date } {
  // If parent/predecessor schedule has no valid start or end dates, we cannot adjust dates
  if (
    !parentSchedule.scheduleStartDate ||
    !parentSchedule.scheduleEndDate ||
    isNaN(new Date(parentSchedule.scheduleStartDate).getTime()) ||
    isNaN(new Date(parentSchedule.scheduleEndDate).getTime())
  ) {
    return {
      scheduleStartDate: new Date(childSchedule.scheduleStartDate || 0),
      scheduleEndDate: new Date(childSchedule.scheduleEndDate || 0),
    };
  }

  const parentStart = new Date(parentSchedule.scheduleStartDate as Date);
  const parentEnd = new Date(parentSchedule.scheduleEndDate as Date);
  const childStart = new Date(childSchedule.scheduleStartDate || 0);
  const childEnd = new Date(childSchedule.scheduleEndDate || 0);
  const childStartMs = childStart.getTime();
  const childEndMs = childEnd.getTime();
  const hasExplicitChildRange =
    Number.isFinite(childStartMs) &&
    childStartMs > 0 &&
    Number.isFinite(childEndMs) &&
    childEndMs > childStartMs;

  const durationCalendarDays = hasExplicitChildRange ? calculateDuration(childEnd, childStart) : 1;
  const cleanDelay = Number.isFinite(delay) ? delay : 0;
  const hasWorkingCalendar = Boolean(workingCalendar?.workingDays);
  const tz = workingCalendar?.organizationTimezone || "UTC";
  const calendarContext = workingCalendar
    ? createWorkingCalendarContextFromConfig(workingCalendar)
    : null;
  const workingHoursByDay =
    calendarContext?.workingHoursByDay ??
    normalizeWorkingHoursByDay(DEFAULT_WORKING_HOURS_BY_DAY);

  // Use the child's stored scheduleDuration (working minutes) as the authoritative value.
  // This ensures B.end = B.start + B.scheduleDuration regardless of B's prior timestamps.
  const storedMinutes = Number(childSchedule.scheduleDuration);
  const baseChildWorkingMinutes = storedMinutes > 0
    ? storedMinutes
    : (hasWorkingCalendar
        ? (hasExplicitChildRange
            ? countWorkingHours(
                childStart,
                childEnd,
                workingCalendar!.workingDays,
                workingCalendar!.publicHolidays,
                tz,
                workingHoursByDay
              )
            : 0)
        : durationCalendarDays * WORKING_MINUTES_PER_DAY);

  if (!hasWorkingCalendar || !workingCalendar) {
    switch (dependencyType) {
      case "start-to-start":
        return {
          scheduleStartDate: addDaysToDate(parentStart, cleanDelay),
          scheduleEndDate: addDaysToDate(
            parentStart,
            cleanDelay + durationCalendarDays - 1
          ),
        };

      case "end-to-end":
        return {
          scheduleStartDate: addDaysToDate(
            parentEnd,
            -(durationCalendarDays - 1) + cleanDelay
          ),
          scheduleEndDate: addDaysToDate(parentEnd, cleanDelay),
        };

      case "start-to-end": {
        const newEndDate = addDaysToDate(parentStart, cleanDelay - 1);
        return {
          scheduleStartDate: addDaysToDate(
            newEndDate,
            -(durationCalendarDays - 1)
          ),
          scheduleEndDate: newEndDate,
        };
      }

      case "end-to-start": {
        const newStartDate = addDaysToDate(parentEnd, cleanDelay + 1);
        return {
          scheduleStartDate: newStartDate,
          scheduleEndDate: addDaysToDate(
            newStartDate,
            durationCalendarDays - 1
          ),
        };
      }

      default:
        return {
          scheduleStartDate: childStart,
          scheduleEndDate: childEnd,
        };
    }
  }

  const wDays = workingCalendar.workingDays;
  const pubHols = workingCalendar.publicHolidays;
  const resolveWorkingMinutesForDate = (date: Date): number => {
    const dayKey = DAY_KEYS_ORDERED[dayjs(date).tz(tz).day()];
    return getWorkingMinutesForDay(workingHoursByDay, dayKey);
  };
  const resolveChildWorkingMinutes = (date: Date): number =>
    baseChildWorkingMinutes > 0
      ? baseChildWorkingMinutes
      : resolveWorkingMinutesForDate(date);

  const snapForward = (date: Date): Date =>
    calendarContext ? snapToWorkingMomentForward(date, calendarContext) : date;
  const snapBackward = (date: Date): Date =>
    calendarContext ? snapToWorkingMomentBackward(date, calendarContext) : date;
  const snapBackwardExclusive = (date: Date): Date =>
    calendarContext
      ? snapToWorkingMomentBackwardExclusive(date, calendarContext)
      : date;

  // Add `minutes` working minutes forward (positive) or backward (negative) from `date`.
  const addWorkingMinutes = (date: Date, minutes: number): Date => {
    if (minutes === 0) return date;
    return minutes > 0
      ? endDateForWorkingHours(
          date,
          minutes,
          wDays,
          pubHols,
          tz,
          workingHoursByDay
        )
      : startDateForWorkingHours(
          date,
          -minutes,
          wDays,
          pubHols,
          tz,
          workingHoursByDay
        );
  };

  switch (dependencyType) {
    // SS: B starts when A starts (+ delay minutes). B end = B start + B duration.
    case "start-to-start":
      if (hasWorkingCalendar) {
        const anchor = snapForward(parentStart);
        const newStart = snapForward(addWorkingMinutes(anchor, cleanDelay));
        const childWorkingMinutes = resolveChildWorkingMinutes(newStart);
        const newEnd = endDateForWorkingHours(
          newStart,
          childWorkingMinutes,
          wDays,
          pubHols,
          tz,
          workingHoursByDay
        );
        return { scheduleStartDate: newStart, scheduleEndDate: newEnd };
      }
      return {
        scheduleStartDate: addDaysToDate(parentStart, cleanDelay),
        scheduleEndDate: addDaysToDate(parentStart, cleanDelay + durationCalendarDays - 1),
      };

    // FF: B ends when A ends (+ delay minutes). B start = B end − B duration.
    case "end-to-end":
      if (hasWorkingCalendar) {
        const anchor = snapBackward(parentEnd);
        const delayedEnd = addWorkingMinutes(anchor, cleanDelay);
        let newEnd = delayedEnd;
        if (cleanDelay < 0 && calendarContext) {
          const delayedEndInTz = dayjs(delayedEnd).tz(tz);
          const delayedEndWindow = getWorkingWindowForDate(
            delayedEndInTz,
            wDays,
            calendarContext.holidaySet,
            workingHoursByDay
          );
          // Keep negative E-E offsets from ending at window-start boundary (e.g. 07:00),
          // which causes confusing pre-save previews in the modal.
          if (
            delayedEndWindow &&
            delayedEndInTz.isSame(delayedEndWindow.start)
          ) {
            newEnd = snapBackwardExclusive(delayedEnd);
          }
        }
        const childWorkingMinutes = resolveChildWorkingMinutes(newEnd);
        const newStart = startDateForWorkingHours(
          newEnd,
          childWorkingMinutes,
          wDays,
          pubHols,
          tz,
          workingHoursByDay
        );
        return { scheduleStartDate: newStart, scheduleEndDate: newEnd };
      }
      return {
        scheduleStartDate: addDaysToDate(parentEnd, -(durationCalendarDays - 1) + cleanDelay),
        scheduleEndDate: addDaysToDate(parentEnd, cleanDelay),
      };

    // SF: B ends just before A starts. B start = B end − B duration.
    case "start-to-end": {
      if (hasWorkingCalendar) {
        // Snap to last working moment at-or-before A's start, then apply delay.
        const anchor = snapBackwardExclusive(parentStart);
        const delayedEnd = addWorkingMinutes(anchor, cleanDelay);
        let newEnd = delayedEnd;
        if (cleanDelay < 0 && calendarContext) {
          const delayedEndInTz = dayjs(delayedEnd).tz(tz);
          const delayedEndWindow = getWorkingWindowForDate(
            delayedEndInTz,
            wDays,
            calendarContext.holidaySet,
            workingHoursByDay
          );
          // For negative SF delays, avoid landing exactly at window start (e.g. 07:00).
          // Align to the previous working-window end so dependency offsets remain intuitive.
          if (
            delayedEndWindow &&
            delayedEndInTz.isSame(delayedEndWindow.start)
          ) {
            newEnd = snapBackwardExclusive(delayedEnd);
          }
        }
        const childWorkingMinutes = resolveChildWorkingMinutes(newEnd);
        const newStart = startDateForWorkingHours(
          newEnd,
          childWorkingMinutes,
          wDays,
          pubHols,
          tz,
          workingHoursByDay
        );
        return { scheduleStartDate: newStart, scheduleEndDate: newEnd };
      }
      const newEndDate = addDaysToDate(parentStart, cleanDelay - 1);
      return {
        scheduleStartDate: addDaysToDate(newEndDate, -(durationCalendarDays - 1)),
        scheduleEndDate: newEndDate,
      };
    }

    // FS: B starts when A ends if there is still time left in the workday; otherwise
    // it starts at the next working day's 9am. B end = B start + B duration.
    case "end-to-start": {
      if (hasWorkingCalendar) {
        const anchor = snapForward(parentEnd);
        const newStart = snapForward(addWorkingMinutes(anchor, cleanDelay));
        const childWorkingMinutes = resolveChildWorkingMinutes(newStart);
        const newEnd = endDateForWorkingHours(
          newStart,
          childWorkingMinutes,
          wDays,
          pubHols,
          tz,
          workingHoursByDay
        );
        return { scheduleStartDate: newStart, scheduleEndDate: newEnd };
      }
      const newStartDate = addDaysToDate(parentEnd, cleanDelay + 1);
      return {
        scheduleStartDate: newStartDate,
        scheduleEndDate: addDaysToDate(newStartDate, durationCalendarDays - 1),
      };
    }

    default:
      return {
        scheduleStartDate: childStart,
        scheduleEndDate: childEnd,
      };
  }
}

const DAY_KEYS_ORDERED: (keyof WorkingDays)[] = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
];

function getWorkingWindowForDate(
  cursor: dayjs.Dayjs,
  workingDays: WorkingDays,
  publicHolidays: Set<string>,
  workingHoursByDay: WorkingHoursByDay
): { start: dayjs.Dayjs; end: dayjs.Dayjs } | null {
  const dayKey = DAY_KEYS_ORDERED[cursor.day()];
  const dateStr = cursor.format("YYYY-MM-DD");
  if (!workingDays[dayKey] || publicHolidays.has(dateStr)) {
    return null;
  }

  const dayHours = workingHoursByDay[dayKey] ?? DEFAULT_WORKING_DAY_HOURS;
  const start = cursor
    .startOf("day")
    .hour(Math.floor(dayHours.startMinute / 60))
    .minute(dayHours.startMinute % 60)
    .second(0)
    .millisecond(0);
  const end = cursor
    .startOf("day")
    .hour(Math.floor(dayHours.endMinute / 60))
    .minute(dayHours.endMinute % 60)
    .second(0)
    .millisecond(0);

  if (!end.isAfter(start)) {
    return null;
  }

  return { start, end };
}

function findWorkingWindowFromDay(
  startDay: dayjs.Dayjs,
  direction: 1 | -1,
  calendar: WorkingCalendarContext,
  maxIterations = 14
): { start: dayjs.Dayjs; end: dayjs.Dayjs } | null {
  let cursor = startDay.startOf("day");

  for (let i = 0; i < maxIterations; i++) {
    const window = getWorkingWindowForDate(
      cursor.tz(calendar.organizationTimezone),
      calendar.workingDays,
      calendar.holidaySet,
      calendar.workingHoursByDay
    );
    if (window) {
      return window;
    }
    cursor = cursor.add(direction, "day");
  }

  return null;
}

function snapToWorkingMomentForward(
  date: Date,
  calendar: WorkingCalendarContext
): Date {
  const inTz = dayjs(date).tz(calendar.organizationTimezone);
  const dayWindow = getWorkingWindowForDate(
    inTz,
    calendar.workingDays,
    calendar.holidaySet,
    calendar.workingHoursByDay
  );

  if (dayWindow) {
    if (inTz.isBefore(dayWindow.start)) return dayWindow.start.toDate();
    if (inTz.isBefore(dayWindow.end)) return date;
  }

  const nextWindow = findWorkingWindowFromDay(
    inTz.add(1, "day"),
    1,
    calendar
  );
  return nextWindow ? nextWindow.start.toDate() : date;
}

function snapToWorkingMomentBackward(
  date: Date,
  calendar: WorkingCalendarContext
): Date {
  const inTz = dayjs(date).tz(calendar.organizationTimezone);
  const dayWindow = getWorkingWindowForDate(
    inTz,
    calendar.workingDays,
    calendar.holidaySet,
    calendar.workingHoursByDay
  );

  if (dayWindow) {
    if (!inTz.isBefore(dayWindow.end)) return dayWindow.end.toDate();
    if (!inTz.isBefore(dayWindow.start)) return date;
  }

  const prevWindow = findWorkingWindowFromDay(
    inTz.subtract(1, "day"),
    -1,
    calendar
  );
  return prevWindow ? prevWindow.end.toDate() : date;
}

function snapToWorkingMomentBackwardExclusive(
  date: Date,
  calendar: WorkingCalendarContext
): Date {
  const inTz = dayjs(date).tz(calendar.organizationTimezone);
  const dayWindow = getWorkingWindowForDate(
    inTz,
    calendar.workingDays,
    calendar.holidaySet,
    calendar.workingHoursByDay
  );

  if (dayWindow) {
    if (inTz.isAfter(dayWindow.start) && !inTz.isAfter(dayWindow.end)) {
      return date;
    }
    if (inTz.isAfter(dayWindow.end)) {
      return dayWindow.end.toDate();
    }
  }

  const prevWindow = findWorkingWindowFromDay(
    inTz.subtract(1, "day"),
    -1,
    calendar
  );
  return prevWindow ? prevWindow.end.toDate() : date;
}

/**
 * Uses the MS Project instant's **org-local calendar day** (not its clock time), then returns
 * the start of that day's working window. If that day is off or a holiday, walks forward.
 */
export function snapInstantToWorkingDayWindowStart(
  instant: Date,
  workingDays: WorkingDays,
  workingHoursByDay: WorkingHoursByDay,
  publicHolidays: Array<{ name: string; date: string }>,
  organizationTimezone = "UTC"
): Date {
  if (isNaN(new Date(instant).getTime())) {
    return new Date(instant);
  }
  const tz = organizationTimezone || "UTC";
  const holidaySet = new Set(publicHolidays.map((h) => h.date));
  const hours = normalizeWorkingHoursByDay(workingHoursByDay);
  const ymd = dayjs(instant).tz(tz).format("YYYY-MM-DD");
  let dayCursor = dayjs.tz(ymd, tz).startOf("day");

  for (let i = 0; i < 366; i++) {
    const inTz = dayCursor.tz(tz);
    const window = getWorkingWindowForDate(inTz, workingDays, holidaySet, hours);
    if (window) return window.start.toDate();
    dayCursor = dayCursor.add(1, "day");
  }

  return dayCursor.toDate();
}

/**
 * Uses the MS Project instant's **org-local calendar day**, then returns the end of that day's
 * working window. If that day is off or a holiday, walks backward.
 */
export function snapInstantToWorkingDayWindowEnd(
  instant: Date,
  workingDays: WorkingDays,
  workingHoursByDay: WorkingHoursByDay,
  publicHolidays: Array<{ name: string; date: string }>,
  organizationTimezone = "UTC"
): Date {
  if (isNaN(new Date(instant).getTime())) {
    return new Date(instant);
  }
  const tz = organizationTimezone || "UTC";
  const holidaySet = new Set(publicHolidays.map((h) => h.date));
  const hours = normalizeWorkingHoursByDay(workingHoursByDay);
  const ymd = dayjs(instant).tz(tz).format("YYYY-MM-DD");
  let dayCursor = dayjs.tz(ymd, tz).startOf("day");

  for (let i = 0; i < 366; i++) {
    const inTz = dayCursor.tz(tz);
    const window = getWorkingWindowForDate(inTz, workingDays, holidaySet, hours);
    if (window) return window.end.toDate();
    dayCursor = dayCursor.subtract(1, "day");
  }

  return dayCursor.toDate();
}

export function getWorkingMinutesForDay(
  workingHoursByDay: WorkingHoursByDay,
  dayKey: keyof WorkingDays
): number {
  const dayHours = workingHoursByDay[dayKey] ?? DEFAULT_WORKING_DAY_HOURS;
  return Math.max(1, dayHours.endMinute - dayHours.startMinute);
}

export function getWorkingMinutesForCalendarAnchor(
  anchorDate: Date | number,
  workingDays: WorkingDays,
  publicHolidays: Array<{ name: string; date: string }>,
  organizationTimezone = "UTC",
  rawWorkingHoursByDay?: WorkingHoursByDay
): number {
  if (isNaN(new Date(anchorDate).getTime())) {
    return 0;
  }
  const tz = organizationTimezone || "UTC";
  const holidaySet = new Set(publicHolidays.map((h) => h.date));
  const workingHoursByDay = normalizeWorkingHoursByDay(
    rawWorkingHoursByDay ?? DEFAULT_WORKING_HOURS_BY_DAY
  );
  let cursor = dayjs(anchorDate).tz(tz).startOf("day");

  for (let i = 0; i < 366; i++) {
    const dayKey = DAY_KEYS_ORDERED[cursor.day()];
    const dateStr = cursor.format("YYYY-MM-DD");
    if (workingDays[dayKey] && !holidaySet.has(dateStr)) {
      return getWorkingMinutesForDay(workingHoursByDay, dayKey);
    }
    cursor = cursor.add(1, "day");
  }

  return WORKING_MINUTES_PER_DAY;
}

function getWorkingMinutesForDurationDays(
  anchorDate: Date | number,
  durationDays: number,
  workingDays: WorkingDays,
  publicHolidays: Array<{ name: string; date: string }>,
  organizationTimezone = "UTC",
  rawWorkingHoursByDay?: WorkingHoursByDay
): number {
  if (isNaN(new Date(anchorDate).getTime()) || !Number.isFinite(durationDays) || durationDays <= 0) return 0;

  const tz = organizationTimezone || "UTC";
  const holidaySet = new Set(publicHolidays.map((h) => h.date));
  const workingHoursByDay = normalizeWorkingHoursByDay(
    rawWorkingHoursByDay ?? DEFAULT_WORKING_HOURS_BY_DAY
  );
  let cursor = dayjs(anchorDate).tz(tz).startOf("day");
  let remainingDays = durationDays;
  let totalMinutes = 0;

  for (let i = 0; i < 3660 && remainingDays > 0; i++) {
    const dayKey = DAY_KEYS_ORDERED[cursor.day()];
    const dateStr = cursor.format("YYYY-MM-DD");
    if (workingDays[dayKey] && !holidaySet.has(dateStr)) {
      const dayMinutes = getWorkingMinutesForDay(workingHoursByDay, dayKey);
      const dayPart = Math.min(1, remainingDays);
      totalMinutes += dayMinutes * dayPart;
      remainingDays -= dayPart;
    }
    cursor = cursor.add(1, "day");
  }

  return Math.round(totalMinutes);
}

/**
 * Counts the number of working days (inclusive) between start and end,
 * excluding public holidays. Day-of-week and holiday date strings are
 * evaluated in `organizationTimezone` so they match the Gantt display.
 */
export function countWorkingDays(
  start: Date,
  end: Date,
  workingDays: WorkingDays,
  publicHolidays: Array<{ name: string; date: string }>,
  organizationTimezone = "UTC"
): number {
  if (isNaN(new Date(start).getTime()) || isNaN(new Date(end).getTime())) {
    return 0;
  }
  const holidaySet = new Set(publicHolidays.map((h) => h.date));
  let count = 0;
  let current = startOfOrgDay(start, organizationTimezone);
  const endDay = startOfOrgDay(end, organizationTimezone);
  while (current.isBefore(endDay) || current.isSame(endDay)) {
    const inTz = current.tz(organizationTimezone);
    const key = DAY_KEYS_ORDERED[inTz.day()];
    const dateStr = inTz.format("YYYY-MM-DD");
    if (workingDays[key] && !holidaySet.has(dateStr)) count++;
    current = current.add(1, "day");
  }
  return count;
}

/**
 * Returns every working day (inclusive) between start and end as Date objects,
 * excluding public holidays. Same predicate as {@link countWorkingDays}, but
 * collects the qualifying dates instead of just counting them — used to
 * enumerate the exact days a per-day shift batch should be generated for.
 */
export function getWorkingDaysInRange(
  start: Date,
  end: Date,
  workingDays: WorkingDays,
  publicHolidays: Array<{ name: string; date: string }>,
  organizationTimezone = "UTC"
): Date[] {
  if (isNaN(new Date(start).getTime()) || isNaN(new Date(end).getTime())) {
    return [];
  }
  const holidaySet = new Set(publicHolidays.map((h) => h.date));
  const days: Date[] = [];
  let current = startOfOrgDay(start, organizationTimezone);
  const endDay = startOfOrgDay(end, organizationTimezone);
  while (current.isBefore(endDay) || current.isSame(endDay)) {
    const inTz = current.tz(organizationTimezone);
    const key = DAY_KEYS_ORDERED[inTz.day()];
    const dateStr = inTz.format("YYYY-MM-DD");
    if (workingDays[key] && !holidaySet.has(dateStr)) {
      days.push(current.toDate());
    }
    current = current.add(1, "day");
  }
  return days;
}

/**
 * Weekday numbers for shift recurrence payloads (`repeatOnDays`): 1 = Sunday
 * … 7 = Saturday, i.e. dayjs `.day()` + 1. Returns the org's working weekdays
 * in that convention, for driving a weekly-recurring shift batch.
 */
export function getWorkingWeekdayApiNumbers(workingDays: WorkingDays): number[] {
  return DAY_KEYS_ORDERED.reduce<number[]>((acc, key, index) => {
    if (workingDays[key]) acc.push(index + 1);
    return acc;
  }, []);
}

/**
 * Returns the end date that gives exactly `targetWorkingDays` working days
 * starting from (and including) `start`. Off days and public holidays are
 * skipped. The returned date is always the last working day counted.
 * Day-of-week is evaluated in `organizationTimezone`.
 */
export function endDateForWorkingDuration(
  start: Date,
  targetWorkingDays: number,
  workingDays: WorkingDays,
  publicHolidays: Array<{ name: string; date: string }>,
  organizationTimezone = "UTC"
): Date {
  if (isNaN(new Date(start).getTime()) || isNaN(targetWorkingDays) || targetWorkingDays <= 0) return new Date(start);
  const holidaySet = new Set(publicHolidays.map((h) => h.date));
  let count = 0;
  let current = startOfOrgDay(start, organizationTimezone);
  for (let i = 0; i < 730; i++) {
    const inTz = current.tz(organizationTimezone);
    const key = DAY_KEYS_ORDERED[inTz.day()];
    const dateStr = inTz.format("YYYY-MM-DD");
    if (workingDays[key] && !holidaySet.has(dateStr)) {
      count++;
      if (count === targetWorkingDays) return current.toDate();
    }
    current = current.add(1, "day");
  }
  return current.toDate(); // fallback
}

/**
 * Advances `date` forward until it lands on a working day that is not a public holiday.
 * Returns the original date unchanged if it is already a working day.
 * Day-of-week is evaluated in `organizationTimezone`.
 */
export function snapToNextWorkingDay(
  date: Date,
  workingDays: WorkingDays,
  publicHolidays: Array<{ name: string; date: string }>,
  organizationTimezone = "UTC"
): Date {
  if (isNaN(new Date(date).getTime())) return new Date(date);
  const holidaySet = new Set(publicHolidays.map((h) => h.date));
  let current = new Date(date);
  for (let i = 0; i < 14; i++) {
    const inTz = dayjs(current).tz(organizationTimezone);
    const key = DAY_KEYS_ORDERED[inTz.day()];
    const dateStr = inTz.format("YYYY-MM-DD");
    if (workingDays[key] && !holidaySet.has(dateStr)) return current;
    current = new Date(current.getTime() + 86400000);
  }
  return current;
}

/**
 * Moves `date` backward until it lands on a working day that is not a public holiday.
 * Returns the original date unchanged if it is already a working day.
 * Day-of-week is evaluated in `organizationTimezone`.
 */
export function snapToPreviousWorkingDay(
  date: Date,
  workingDays: WorkingDays,
  publicHolidays: Array<{ name: string; date: string }>,
  organizationTimezone = "UTC"
): Date {
  if (isNaN(new Date(date).getTime())) return new Date(date);
  const holidaySet = new Set(publicHolidays.map((h) => h.date));
  let current = new Date(date);
  for (let i = 0; i < 14; i++) {
    const inTz = dayjs(current).tz(organizationTimezone);
    const key = DAY_KEYS_ORDERED[inTz.day()];
    const dateStr = inTz.format("YYYY-MM-DD");
    if (workingDays[key] && !holidaySet.has(dateStr)) return current;
    current = new Date(current.getTime() - 86400000);
  }
  return current;
}

export function convertTimestampToDate(
  timestamp: string | number | Date
): Date {
  if (timestamp instanceof Date) return timestamp;
  return new Date(Number(timestamp));
}


export function calculateDelay(
  successorDate: Date,
  predecessorDate: Date
): number {
  return Math.floor(
    (successorDate.getTime() - predecessorDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

// ---------------------------------------------------------------------------
// Working-hours constants (hardcoded; configurable via WorkingCalendar later)
// ---------------------------------------------------------------------------

export const WORKING_HOURS_PER_DAY =
  (DEFAULT_WORKING_DAY_HOURS.endMinute - DEFAULT_WORKING_DAY_HOURS.startMinute) /
  60;
export const WORKING_MINUTES_PER_DAY = WORKING_HOURS_PER_DAY * 60;
export const WORK_DAY_START_HOUR = Math.floor(
  DEFAULT_WORKING_DAY_HOURS.startMinute / 60
);
export const WORK_DAY_END_HOUR = Math.floor(
  DEFAULT_WORKING_DAY_HOURS.endMinute / 60
);

/**
 * Count working minutes between `start` and `end`.
 * Only time within [WORK_DAY_START_HOUR, WORK_DAY_END_HOUR) on working days counts.
 */
export function countWorkingHours(
  start: Date,
  end: Date,
  workingDays: WorkingDays,
  publicHolidays: Array<{ name: string; date: string }>,
  organizationTimezone = "UTC",
  rawWorkingHoursByDay?: WorkingHoursByDay
): number {
  if (end.getTime() <= start.getTime()) return 0;
  const tz = organizationTimezone;
  const holidaySet = new Set(publicHolidays.map((h) => h.date));
  const workingHoursByDay = normalizeWorkingHoursByDay(
    rawWorkingHoursByDay ?? DEFAULT_WORKING_HOURS_BY_DAY
  );
  let totalMinutes = 0;

  let dayCursor = dayjs(start).tz(tz).startOf("day");
  const endDay = dayjs(end).tz(tz).startOf("day");

  while (!dayCursor.isAfter(endDay)) {
    const inTz = dayCursor.tz(tz);
    const window = getWorkingWindowForDate(
      inTz,
      workingDays,
      holidaySet,
      workingHoursByDay
    );
    if (window) {
      const sliceStart = Math.max(start.getTime(), window.start.valueOf());
      const sliceEnd = Math.min(end.getTime(), window.end.valueOf());
      if (sliceEnd > sliceStart) {
        totalMinutes += (sliceEnd - sliceStart) / (1000 * 60);
      }
    }
    dayCursor = dayCursor.add(1, "day");
  }
  return Math.round(totalMinutes);
}

export function countScheduleWorkingMinutes(
  start: Date,
  end: Date,
  workingCalendar: WorkingCalendarConfig
): number {
  return countWorkingHours(
    start,
    end,
    workingCalendar.workingDays,
    workingCalendar.publicHolidays,
    workingCalendar.organizationTimezone || "UTC",
    workingCalendar.workingHoursByDay
  );
}

const DEFAULT_PARENT_ROLLUP_WORKING_DAYS: WorkingDays = {
  sunday: true,
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: true,
};

/**
 * Working minutes for a summary/parent schedule between rolled-up child bounds.
 * Uses the date span (min child start → max child end), not the sum of child durations.
 */
export function computeParentScheduleDuration(
  start: Date,
  end: Date,
  workingCalendar?: WorkingCalendarConfig
): number {
  if (end.getTime() <= start.getTime()) {
    return 0;
  }

  if (workingCalendar) {
    return countScheduleWorkingMinutes(start, end, workingCalendar);
  }

  return countWorkingHours(
    start,
    end,
    DEFAULT_PARENT_ROLLUP_WORKING_DAYS,
    [],
    "UTC",
    DEFAULT_WORKING_HOURS_BY_DAY
  );
}

/**
 * Advance `start` by `durationMinutes` working minutes (9 am–5 pm on working days).
 * If start is before 9 am it is treated as 9 am; if after 5 pm the search
 * begins on the next working day at 9 am.
 */
export function endDateForWorkingHours(
  start: Date,
  durationMinutes: number,
  workingDays: WorkingDays,
  publicHolidays: Array<{ name: string; date: string }>,
  organizationTimezone = "UTC",
  rawWorkingHoursByDay?: WorkingHoursByDay
): Date {
  if (isNaN(new Date(start).getTime()) || isNaN(durationMinutes) || durationMinutes <= 0) return new Date(start);
  const tz = organizationTimezone;
  const holidaySet = new Set(publicHolidays.map((h) => h.date));
  const workingHoursByDay = normalizeWorkingHoursByDay(
    rawWorkingHoursByDay ?? DEFAULT_WORKING_HOURS_BY_DAY
  );
  let remaining = durationMinutes;

  let dayCursor = dayjs(start).tz(tz).startOf("day");
  const startInTz = dayjs(start).tz(tz);
  let isFirst = true;

  for (let i = 0; i < 3660; i++) {
    const inTz = dayCursor.tz(tz);
    const window = getWorkingWindowForDate(
      inTz,
      workingDays,
      holidaySet,
      workingHoursByDay
    );

    if (window) {
      const dayWorkStart = window.start;
      const dayWorkEnd = window.end;

      let effectiveStart: ReturnType<typeof dayjs>;
      if (isFirst) {
        isFirst = false;
        if (startInTz.isBefore(dayWorkStart)) {
          effectiveStart = dayWorkStart;
        } else if (!startInTz.isBefore(dayWorkEnd)) {
          dayCursor = dayCursor.add(1, "day");
          continue;
        } else {
          effectiveStart = startInTz;
        }
      } else {
        effectiveStart = dayWorkStart;
      }

      const minutesAvailable = dayWorkEnd.diff(effectiveStart, "minute");
      if (remaining <= minutesAvailable) {
        return effectiveStart.add(remaining, "minute").toDate();
      }
      remaining -= minutesAvailable;
    } else if (isFirst) {
      isFirst = false;
    }

    dayCursor = dayCursor.add(1, "day");
  }
  return dayCursor.tz(tz).endOf("day").toDate();
}

/**
 * Find the start date that, when advanced by `durationMinutes` working minutes, arrives at `end`.
 */
export function startDateForWorkingHours(
  end: Date,
  durationMinutes: number,
  workingDays: WorkingDays,
  publicHolidays: Array<{ name: string; date: string }>,
  organizationTimezone = "UTC",
  rawWorkingHoursByDay?: WorkingHoursByDay
): Date {
  if (isNaN(new Date(end).getTime()) || isNaN(durationMinutes) || durationMinutes <= 0) return new Date(end);
  const tz = organizationTimezone;
  const holidaySet = new Set(publicHolidays.map((h) => h.date));
  const workingHoursByDay = normalizeWorkingHoursByDay(
    rawWorkingHoursByDay ?? DEFAULT_WORKING_HOURS_BY_DAY
  );
  let remaining = durationMinutes;

  let dayCursor = dayjs(end).tz(tz).startOf("day");
  const endInTz = dayjs(end).tz(tz);
  let isFirst = true;

  for (let i = 0; i < 3660; i++) {
    const inTz = dayCursor.tz(tz);
    const window = getWorkingWindowForDate(
      inTz,
      workingDays,
      holidaySet,
      workingHoursByDay
    );

    if (window) {
      const dayWorkStart = window.start;
      const dayWorkEnd = window.end;

      let effectiveEnd: ReturnType<typeof dayjs>;
      if (isFirst) {
        isFirst = false;
        if (endInTz.isAfter(dayWorkEnd)) {
          effectiveEnd = dayWorkEnd;
        } else if (!endInTz.isAfter(dayWorkStart)) {
          dayCursor = dayCursor.subtract(1, "day");
          continue;
        } else {
          effectiveEnd = endInTz;
        }
      } else {
        effectiveEnd = dayWorkEnd;
      }

      const minutesAvailable = effectiveEnd.diff(dayWorkStart, "minute");
      if (remaining <= minutesAvailable) {
        return effectiveEnd.subtract(remaining, "minute").toDate();
      }
      remaining -= minutesAvailable;
    } else if (isFirst) {
      isFirst = false;
    }

    dayCursor = dayCursor.subtract(1, "day");
  }
  return dayCursor.tz(tz).startOf("day").toDate();
}

export type WorkingDurationDayLengthOptions = {
  /**
   * Minutes counted as one "working day" for `Xd` parsing and block display fallback.
   * Prefer deriving from {@link referenceDate} + {@link workingHoursByDay} when possible.
   */
  minutesPerWorkingDay?: number;
  /**
   * With {@link workingHoursByDay} and {@link organizationTimezone}, the weekday of this
   * instant (in org TZ) selects the window length for one `d` when `minutesPerWorkingDay` is omitted.
   */
  referenceDate?: Date | number;
  workingHoursByDay?: WorkingHoursByDay;
  organizationTimezone?: string;
  /**
   * When set together with calendar fields, `Xd` means "full working window(s)" along this
   * span (each day can have a different length, e.g. 10–15 vs 9–12), not a fixed 8h block.
   */
  rangeStart?: Date | number;
  rangeEnd?: Date | number;
  workingDays?: WorkingDays;
  publicHolidays?: Array<{ name: string; date: string }>;
};

/**
 * Splits working minutes along [start, end] into: calendar days where the task fills that day's
 * entire working window → count as 1d each; all other in-window time → remainder (shown as h/m).
 */
export function decomposeWorkingMinutesByRange(
  start: Date,
  end: Date,
  workingDays: WorkingDays,
  publicHolidays: Array<{ name: string; date: string }>,
  organizationTimezone: string,
  rawWorkingHoursByDay?: WorkingHoursByDay
): { fullWorkingDayCount: number; remainderMinutes: number } {
  if (end.getTime() <= start.getTime()) {
    return { fullWorkingDayCount: 0, remainderMinutes: 0 };
  }

  const tz = organizationTimezone || "UTC";
  const holidaySet = new Set(publicHolidays.map((h) => h.date));
  const workingHoursByDay = normalizeWorkingHoursByDay(
    rawWorkingHoursByDay ?? DEFAULT_WORKING_HOURS_BY_DAY
  );

  let fullWorkingDayCount = 0;
  let remainderMinutes = 0;

  let dayCursor = dayjs(start).tz(tz).startOf("day");
  const endDay = dayjs(end).tz(tz).startOf("day");

  while (!dayCursor.isAfter(endDay)) {
    const inTz = dayCursor.tz(tz);
    const window = getWorkingWindowForDate(
      inTz,
      workingDays,
      holidaySet,
      workingHoursByDay
    );
    if (window) {
      const capacityMinutes = window.end.diff(window.start, "minute");
      const sliceStart = Math.max(start.getTime(), window.start.valueOf());
      const sliceEnd = Math.min(end.getTime(), window.end.valueOf());
      if (sliceEnd > sliceStart) {
        const used = Math.round((sliceEnd - sliceStart) / (1000 * 60));
        if (used >= capacityMinutes) {
          fullWorkingDayCount += 1;
        } else {
          remainderMinutes += used;
        }
      }
    }
    dayCursor = dayCursor.add(1, "day");
  }

  return { fullWorkingDayCount, remainderMinutes };
}

function resolveMinutesPerWorkingDay(
  options?: WorkingDurationDayLengthOptions
): number {
  const explicit = Number(options?.minutesPerWorkingDay);
  if (Number.isFinite(explicit) && explicit > 0) {
    return explicit;
  }

  const ref = options?.referenceDate;
  const hours = options?.workingHoursByDay;
  const tz = options?.organizationTimezone;
  if (ref != null && hours && tz) {
    const inTz = dayjs(ref).tz(tz);
    const dayKey = DAY_KEYS_ORDERED[inTz.day()];
    return getWorkingMinutesForDay(hours, dayKey);
  }

  return WORKING_MINUTES_PER_DAY;
}

function isPositiveScheduleTimestamp(value: unknown): boolean {
  if (value == null || value === "") return false;
  const t = new Date(value as Date | number).getTime();
  return Number.isFinite(t) && t > 0;
}

function appendHourMinuteRemainderParts(
  parts: string[],
  remainderMinutes: number
): void {
  const r = Math.max(0, Math.round(remainderMinutes));
  if (r === 0) {
    if (parts.length === 0) {
      parts.push("0m");
    }
    return;
  }
  const h = Math.floor(r / 60);
  const m = r % 60;
  if (h > 0) {
    parts.push(`${h}h`);
  }
  if (m > 0 || parts.length === 0) {
    parts.push(`${m}m`);
  }
}

/** Parse a human-readable duration string (e.g. "1d 2h 30m") into working minutes. */
export function parseDurationInput(
  input: string,
  options?: WorkingDurationDayLengthOptions
): number {
  if (!input || !input.trim()) return 0;
  const asNum = Number(input.trim());
  if (!isNaN(asNum) && asNum >= 0) return Math.round(asNum);

  const dayBlockMinutes = resolveMinutesPerWorkingDay(options);

  let total = 0;
  const dayMatch = input.match(/(\d+(?:\.\d+)?)\s*d/i);
  const hourMatch = input.match(/(\d+(?:\.\d+)?)\s*h/i);
  const minMatch = input.match(/(\d+(?:\.\d+)?)\s*m(?!o)/i);
  if (dayMatch) {
    const dayCount = parseFloat(dayMatch[1]);
    const hasCalendarDayContext =
      isPositiveScheduleTimestamp(options?.rangeStart) &&
      options?.workingDays &&
      options?.workingHoursByDay &&
      options?.organizationTimezone;
    total += hasCalendarDayContext
      ? getWorkingMinutesForDurationDays(
          options!.rangeStart as Date | number,
          dayCount,
          options!.workingDays!,
          options!.publicHolidays ?? [],
          options!.organizationTimezone!,
          options!.workingHoursByDay
        )
      : dayCount * dayBlockMinutes;
  }
  if (hourMatch) total += parseFloat(hourMatch[1]) * 60;
  if (minMatch) total += parseFloat(minMatch[1]);
  return Math.round(total);
}

/** Parse signed duration input (e.g. "-1d 2h", "+30m", "-120"). */
export function parseSignedDurationInput(
  input: string,
  options?: WorkingDurationDayLengthOptions
): number {
  const trimmedInput = input.trim();
  if (!trimmedInput) return 0;

  const numericValue = Number(trimmedInput);
  if (Number.isFinite(numericValue)) {
    return Math.round(numericValue);
  }

  const sign = trimmedInput.startsWith("-") ? -1 : 1;
  const unsignedInput = trimmedInput.replace(/^[+-]\s*/, "");
  const parsedDuration = parseDurationInput(unsignedInput, options);
  return sign * parsedDuration;
}

export function formatWorkingDurationMinutes(
  value: number | string | null | undefined,
  options?: WorkingDurationDayLengthOptions
): string {
  const minutes = Number(value);
  if (!Number.isFinite(minutes)) {
    return "0m";
  }

  const wholeMinutes = Math.round(minutes);
  if (wholeMinutes === 0) {
    return "0m";
  }

  const sign = wholeMinutes < 0 ? "-" : "";
  const absoluteMinutes = Math.abs(wholeMinutes);
  const opts = options ?? {};

  const hasRangeCalendar =
    isPositiveScheduleTimestamp(opts.rangeStart) &&
    isPositiveScheduleTimestamp(opts.rangeEnd) &&
    opts.workingDays &&
    opts.workingHoursByDay &&
    opts.organizationTimezone;

  if (hasRangeCalendar && wholeMinutes > 0) {
    const workingDays = opts.workingDays!;
    const workingHoursByDay = opts.workingHoursByDay!;
    const organizationTimezone = opts.organizationTimezone!;
    const start = new Date(opts.rangeStart as Date | number);
    const end = new Date(opts.rangeEnd as Date | number);
    if (end.getTime() > start.getTime()) {
      const counted = countWorkingHours(
        start,
        end,
        workingDays,
        opts.publicHolidays ?? [],
        organizationTimezone,
        workingHoursByDay
      );
      if (Math.abs(counted - absoluteMinutes) <= 1) {
        const { fullWorkingDayCount, remainderMinutes } =
          decomposeWorkingMinutesByRange(
            start,
            end,
            workingDays,
            opts.publicHolidays ?? [],
            organizationTimezone,
            workingHoursByDay
          );
        const parts: string[] = [];
        if (fullWorkingDayCount > 0) {
          parts.push(`${fullWorkingDayCount}d`);
        }
        appendHourMinuteRemainderParts(parts, remainderMinutes);
        return `${sign}${parts.join(" ")}`;
      }
    }
  }

  const dayBlockMinutes = resolveMinutesPerWorkingDay(opts);
  const days = Math.floor(absoluteMinutes / dayBlockMinutes);
  const minutesAfterDays = absoluteMinutes % dayBlockMinutes;
  const hours = Math.floor(minutesAfterDays / 60);
  const remainingMinutes = minutesAfterDays % 60;

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days}d`);
  }

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (remainingMinutes > 0 || parts.length === 0) {
    parts.push(`${remainingMinutes}m`);
  }

  return `${sign}${parts.join(" ")}`;
}

/** Calendar fields needed so duration labels match {@link countWorkingHours} / org working windows. */
export type WorkingCalendarDurationFormatParams = {
  workingDays: WorkingDays;
  workingHoursByDay: WorkingHoursByDay;
  publicHolidays: Array<{ name: string; date: string }>;
  organizationTimezone: string;
};

/** Formats stored `scheduleDuration` using start/end + project working calendar (not a fixed 8h “day”). */
export function formatScheduleWorkingDuration(
  schedule: Pick<
    Schedule,
    "scheduleStartDate" | "scheduleEndDate" | "scheduleDuration" | "childrenIds"
  >,
  cal: WorkingCalendarDurationFormatParams
): string {
  const minutesPerWorkingDay = getWorkingMinutesForCalendarAnchor(
    schedule.scheduleStartDate,
    cal.workingDays,
    cal.publicHolidays,
    cal.organizationTimezone,
    cal.workingHoursByDay
  );

  if (schedule.childrenIds?.length) {
    const start = new Date(schedule.scheduleStartDate);
    const end = new Date(schedule.scheduleEndDate);
    if (end.getTime() > start.getTime()) {
      const spanMinutes = countWorkingHours(
        start,
        end,
        cal.workingDays,
        cal.publicHolidays,
        cal.organizationTimezone,
        cal.workingHoursByDay
      );
      return formatWorkingDurationMinutes(spanMinutes, {
        minutesPerWorkingDay,
        referenceDate: schedule.scheduleStartDate,
      });
    }
  }

  return formatWorkingDurationMinutes(schedule.scheduleDuration, {
    minutesPerWorkingDay,
    rangeStart: schedule.scheduleStartDate,
    rangeEnd: schedule.scheduleEndDate,
    workingDays: cal.workingDays,
    publicHolidays: cal.publicHolidays,
    organizationTimezone: cal.organizationTimezone,
    workingHoursByDay: cal.workingHoursByDay,
    referenceDate: schedule.scheduleStartDate,
  });
}

/**
 * Formats dependency delay (working minutes). One `d` is the successor’s start-day working window.
 */
export function formatDependencyDelayMinutes(
  delayMinutes: number | string | null | undefined,
  successorStart: Date | number,
  cal: WorkingCalendarDurationFormatParams
): string {
  return formatWorkingDurationMinutes(delayMinutes, {
    referenceDate: successorStart,
    workingHoursByDay: cal.workingHoursByDay,
    organizationTimezone: cal.organizationTimezone,
    workingDays: cal.workingDays,
    publicHolidays: cal.publicHolidays,
  });
}
