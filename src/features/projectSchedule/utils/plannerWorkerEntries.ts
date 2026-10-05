import type { PlannerScheduleEntry } from "../hooks/usePlannerData";
import {
  buildScheduleLinkedShiftGroups,
  type ScheduleLinkedShiftGroup,
  type ScheduleLinkedShiftRow,
} from "../components/createScheduleModal/scheduleShiftLinkUtils";

export interface PlannerWorkerGroup {
  key: string;
  scheduleName: string;
  group: ScheduleLinkedShiftGroup;
}

export interface PlannerWorkerEntry {
  workerId: string;
  workerName: string;
  groups: PlannerWorkerGroup[];
  shiftCount: number;
}

interface WorkerAccumulator {
  workerName: string;
  shiftCount: number;
  rowsBySchedule: Map<
    string,
    { scheduleName: string; rows: ScheduleLinkedShiftRow[] }
  >;
}

/**
 * Regroups the schedule-first planner entries by worker. Day rows keep the
 * whole shift so attendance stays editable; the Gantt row's
 * `shiftFocusWorkerId` scopes the badge to the worker.
 */
export function buildPlannerWorkerEntries(
  entries: PlannerScheduleEntry[],
): PlannerWorkerEntry[] {
  const byWorker = new Map<string, WorkerAccumulator>();

  for (const { schedule, groups } of entries) {
    for (const group of groups) {
      for (const day of group.days) {
        for (const worker of day.shift.workers || []) {
          const accumulator = byWorker.get(worker.workerId) ?? {
            workerName: worker.workerName,
            shiftCount: 0,
            rowsBySchedule: new Map(),
          };
          const scheduleRows = accumulator.rowsBySchedule.get(
            schedule.scheduleId,
          ) ?? { scheduleName: schedule.scheduleName, rows: [] };

          scheduleRows.rows.push(day);
          accumulator.shiftCount += 1;
          accumulator.rowsBySchedule.set(schedule.scheduleId, scheduleRows);
          byWorker.set(worker.workerId, accumulator);
        }
      }
    }
  }

  return Array.from(byWorker.entries())
    .map(([workerId, accumulator]) => ({
      workerId,
      workerName: accumulator.workerName,
      shiftCount: accumulator.shiftCount,
      groups: Array.from(accumulator.rowsBySchedule.entries()).flatMap(
        ([scheduleId, { scheduleName, rows }]) =>
          buildScheduleLinkedShiftGroups(rows).map((group) => ({
            key: `${scheduleId}-${group.key}`,
            scheduleName,
            group,
          })),
      ),
    }))
    .sort((a, b) => a.workerName.localeCompare(b.workerName));
}
