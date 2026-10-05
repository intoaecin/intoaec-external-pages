import { useCallback } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { WorkingCalendarData } from "./api/fetch-working-calendar";

dayjs.extend(utc);
dayjs.extend(timezone);

const WORKING_DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

/** True for non-working weekdays and public holidays in the organization timezone. */
export function useIsDateOffDay(
  workingCalendarData: WorkingCalendarData | null | undefined,
  organizationTimezone: string,
) {
  return useCallback(
    (date: Date) => {
      if (!workingCalendarData) return false;
      const dateInOrganizationTimezone = dayjs(date).tz(organizationTimezone);
      const dayKey = WORKING_DAY_KEYS[dateInOrganizationTimezone.day()];
      const dateKey = dateInOrganizationTimezone.format("YYYY-MM-DD");
      const isNonWorkingDay = !workingCalendarData.workingDays[dayKey];
      const isPublicHoliday = workingCalendarData.publicHolidays.some(
        (holiday) => holiday.date === dateKey,
      );

      return isNonWorkingDay || isPublicHoliday;
    },
    [organizationTimezone, workingCalendarData],
  );
}
