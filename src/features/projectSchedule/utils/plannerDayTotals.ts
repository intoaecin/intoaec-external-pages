import type { PlannerScheduleEntry } from "../hooks/usePlannerData";
import type { PlannerDayTotal, WorkloadGanttRow } from "../types/workload";
import { getShiftPresentSummary } from "../components/createScheduleModal/scheduleShiftGridUtils";
import { buildOrgTimezoneDateKey } from "./shiftGanttRows";

export const PLANNER_TOTALS_ROW_KEY = "planner-totals";

export function buildPlannerDayTotals(
  entries: PlannerScheduleEntry[],
  organizationTimezone: string,
): Map<string, PlannerDayTotal> {
  const totals = new Map<string, PlannerDayTotal>();

  for (const { groups } of entries) {
    for (const group of groups) {
      for (const day of group.days) {
        const key = buildOrgTimezoneDateKey(day.startDate, organizationTimezone);
        const { present, total } = getShiftPresentSummary(day.shift);
        const previous = totals.get(key) ?? { planned: 0, actual: 0 };

        totals.set(key, {
          planned: previous.planned + total,
          actual: previous.actual + present,
        });
      }
    }
  }

  return totals;
}

export function buildPlannerTotalsRow(
  entries: PlannerScheduleEntry[],
  organizationTimezone: string,
): WorkloadGanttRow {
  return {
    rowKey: PLANNER_TOTALS_ROW_KEY,
    schedule: null,
    dayTotals: buildPlannerDayTotals(entries, organizationTimezone),
    isResourceGroupEnd: true,
  };
}
