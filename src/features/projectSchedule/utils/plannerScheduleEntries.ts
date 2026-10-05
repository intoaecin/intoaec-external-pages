import type { GeneratedShift } from "@/features/worker-management/hooks/useGetShifts";
import {
  buildScheduleLinkedShiftGroups,
  buildScheduleLinkedShiftRows,
} from "../components/createScheduleModal/scheduleShiftLinkUtils";
import type { PlannerScheduleEntry } from "../hooks/usePlannerData";
import type { Schedule } from "../types/schedule";

/** Pairs each schedule with its linked shifts, dropping schedules that have none. */
export function buildPlannerScheduleEntries(
  schedules: Schedule[],
  shifts: GeneratedShift[],
): PlannerScheduleEntry[] {
  const shiftsBySchedule = new Map<string, GeneratedShift[]>();
  for (const shift of shifts) {
    if (!shift.linkedScheduleId) continue;
    const existing = shiftsBySchedule.get(shift.linkedScheduleId);
    if (existing) existing.push(shift);
    else shiftsBySchedule.set(shift.linkedScheduleId, [shift]);
  }

  return schedules
    .map((schedule) => {
      const linkedShifts = shiftsBySchedule.get(schedule.scheduleId) || [];
      const groups = buildScheduleLinkedShiftGroups(
        buildScheduleLinkedShiftRows(linkedShifts),
      );
      return { schedule, groups, shiftCount: linkedShifts.length };
    })
    .filter((entry) => entry.groups.length > 0);
}
