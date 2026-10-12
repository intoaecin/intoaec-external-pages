import { useMemo } from "react";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { getLocalizationValue } from "@/lib/helpers";
import {
  normalizeWorkingDays,
  normalizeWorkingHoursByDay,
  useFetchWorkingCalendar,
  type WorkingCalendarData,
} from "../../hooks/api/fetch-working-calendar";
import { useIsDateOffDay } from "../../hooks/useIsDateOffDay";
import { buildPlannerQuantityEntries } from "../../hooks/usePlannerQuantityEntries";
import type { ProgressClaimPlannerScope, ProgressClaimPlannerSnapshot } from "../types";
import { isScheduleInClaimPeriod } from "../utils/progressClaimPeriod";
import { useFetchClaimPlannerSnapshot } from "./api/fetch-claim-planner-snapshot";
import { useFetchClaimSchedules } from "./api/fetch-claim-schedules";

const toWorkingCalendar = (
  saved: ProgressClaimPlannerSnapshot["workingCalendar"],
): WorkingCalendarData => ({
  workingDays: normalizeWorkingDays(saved?.workingDays),
  workingHoursByDay: normalizeWorkingHoursByDay(saved?.workingHoursByDay),
  publicHolidays: saved?.publicHolidays ?? [],
});

/**
 * The Quantity tab's plan: the schedules running in the claim period with
 * their per-day planned quantity. A saved claim spreads it over the working
 * calendar and timezone saved with it, so a later calendar change can't move it.
 */
export const useClaimQuantityEntries = (scope: ProgressClaimPlannerScope) => {
  const { snapshot } = useFetchClaimPlannerSnapshot(scope);
  const { schedules, loading } = useFetchClaimSchedules(scope);
  // This can run outside the Planner tabs (the download), so it names the calendar's owner itself.
  const { data: liveWorkingCalendar } = useFetchWorkingCalendar(scope.projectId, scope);
  const { localizationValue } = useOrganizationLocalization();
  const liveTimezone =
    (localizationValue && getLocalizationValue(localizationValue, "TIMEZONE", "ID")) || "UTC";

  const savedWorkingCalendar = useMemo(
    () => (snapshot ? toWorkingCalendar(snapshot.workingCalendar) : null),
    [snapshot],
  );
  const organizationTimezone = snapshot?.timezone || liveTimezone;
  const isDateOffDay = useIsDateOffDay(
    savedWorkingCalendar ?? liveWorkingCalendar,
    organizationTimezone,
  );

  const entries = useMemo(
    () =>
      buildPlannerQuantityEntries(schedules, isDateOffDay, organizationTimezone).filter(
        ({ schedule }) => isScheduleInClaimPeriod(schedule, scope.period),
      ),
    [schedules, isDateOffDay, organizationTimezone, scope.period],
  );

  return { entries, loading };
};
