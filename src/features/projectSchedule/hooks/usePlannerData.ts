import type { Schedule } from "../types/schedule";
import type { ScheduleLinkedShiftGroup } from "../components/createScheduleModal/scheduleShiftLinkUtils";

// Trimmed port: only the entry type. intoaec-UI's `usePlannerData` hook loads
// shifts for the signed-in Planner; the claim tabs get theirs from
// `useFetchClaimShifts` instead.
export interface PlannerScheduleEntry {
  schedule: Schedule;
  groups: ScheduleLinkedShiftGroup[];
  shiftCount: number;
}
