import { useMemo } from "react";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { getLocalizationValue } from "@/lib/helpers";
import { useProjectSchedule } from "../context/ScheduleProvider";
import type { Schedule } from "../types/schedule";
import type { WorkloadGanttRow } from "../types/workload";
import {
  buildQuantityPlanDays,
  hasQuantityPlanInputs,
  toDailyQuantityRowData,
  type QuantityPlanDays,
} from "../utils/quantityPlan";
import { useFetchWorkingCalendar } from "./api/fetch-working-calendar";
import { useIsDateOffDay } from "./useIsDateOffDay";

export interface PlannerQuantityEntry {
  schedule: Schedule;
  plan: QuantityPlanDays;
}

const isQuantityPlannable = (schedule: Schedule): boolean =>
  !schedule.isMilestone &&
  !schedule.isTemplateSchedule &&
  Number(schedule.totalChildren || 0) === 0 &&
  hasQuantityPlanInputs(schedule);

export const buildPlannerQuantityRows = (
  entries: PlannerQuantityEntry[],
): WorkloadGanttRow[] =>
  entries.map(({ schedule, plan }) => ({
    rowKey: `quantity-${schedule.scheduleId}`,
    schedule: null,
    barColor: schedule.scheduleColor,
    dailyQuantity: toDailyQuantityRowData(schedule.scheduleId, plan, schedule.quantityUnit),
    isResourceGroupEnd: true,
  }));

export const buildPlannerQuantityEntries = (
  schedules: Schedule[],
  isDateOffDay: (date: Date) => boolean,
  organizationTimezone: string,
): PlannerQuantityEntry[] =>
  schedules.filter(isQuantityPlannable).map((schedule) => ({
    schedule,
    plan: buildQuantityPlanDays({ schedule, isDateOffDay, organizationTimezone }),
  }));

/** Schedules with a planned quantity and their per-day plan. */
export function usePlannerQuantityEntries(projectId?: string | null) {
  const { data: schedules, loading } = useProjectSchedule();
  const { data: workingCalendarData } = useFetchWorkingCalendar(
    projectId ?? null,
  );
  const { localizationValue } = useOrganizationLocalization();
  const organizationTimezone =
    (localizationValue &&
      getLocalizationValue(localizationValue, "TIMEZONE", "ID")) ||
    "UTC";
  const isDateOffDay = useIsDateOffDay(workingCalendarData, organizationTimezone);

  const entries = useMemo<PlannerQuantityEntry[]>(
    () => buildPlannerQuantityEntries(schedules, isDateOffDay, organizationTimezone),
    [schedules, isDateOffDay, organizationTimezone],
  );

  return { entries, loading, organizationTimezone };
}
