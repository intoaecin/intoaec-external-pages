import { roundNumber } from "@/utils/numbers";
import type { ScheduleLinkedShiftGroup } from "../components/createScheduleModal/scheduleShiftLinkUtils";
import type { PlannerScheduleEntry } from "../hooks/usePlannerData";
import type { PlannerWorkerEntry, PlannerWorkerGroup } from "./plannerWorkerEntries";

/** Wage per shift id, as `useFetchProjectShiftWages` returns it. */
export type ShiftWages = Map<string, number>;

/** Wage earned on a shift across all its days; 0 until attendance is marked. */
export const getShiftGroupWage = (group: ScheduleLinkedShiftGroup, wages: ShiftWages): number =>
  wages.get(group.shiftId) ?? 0;

/** Wage of all the shifts linked to one schedule. */
export const getScheduleWage = (entry: PlannerScheduleEntry, wages: ShiftWages): number =>
  roundNumber(entry.groups.reduce((sum, group) => sum + getShiftGroupWage(group, wages), 0));

export const getTotalWage = (entries: PlannerScheduleEntry[], wages: ShiftWages): number =>
  roundNumber(entries.reduce((sum, entry) => sum + getScheduleWage(entry, wages), 0));

/** Wage per worker per shift, keyed by `shiftWorkerWageKey`. */
export type ShiftWorkerWages = Map<string, number>;

export const shiftWorkerWageKey = (shiftId: string, workerId: string) => `${shiftId}:${workerId}`;

/** Every shift the entries list, once each. */
export const getEntryShiftIds = (entries: PlannerScheduleEntry[]): string[] => [
  ...new Set(entries.flatMap((entry) => entry.groups.map((group) => group.shiftId))),
];

/** Wage one worker earned on one shift across all its days. */
export const getWorkerShiftWage = (
  workerId: string,
  { group }: PlannerWorkerGroup,
  wages: ShiftWorkerWages,
): number => roundNumber(wages.get(shiftWorkerWageKey(group.shiftId, workerId)) ?? 0);

/** Wage one worker earned on all their shifts. */
export const getWorkerWage = (entry: PlannerWorkerEntry, wages: ShiftWorkerWages): number =>
  roundNumber(
    entry.groups.reduce(
      (sum, workerGroup) => sum + getWorkerShiftWage(entry.workerId, workerGroup, wages),
      0,
    ),
  );
