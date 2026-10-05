import type { GeneratedShift } from "@/features/worker-management/hooks/useGetShifts";

export interface ScheduleLinkedShiftRow {
  key: string;
  generatedShiftId: string;
  shiftId: string;
  shiftName: string;
  startDate: number;
  workerCount: number;
  plannedHours: number;
  issuedHours: number | null;
  shift: GeneratedShift;
}

export function buildScheduleLinkedShiftRows(
  linkedShifts: GeneratedShift[],
): ScheduleLinkedShiftRow[] {
  return linkedShifts.map((shift) => {
    const workers = shift.workers || [];
    const attendanceRecords = workers.flatMap(
      (worker) => worker.attendanceRecords || [],
    );

    return {
      key: shift.generatedShiftId,
      generatedShiftId: shift.generatedShiftId,
      shiftId: shift.shiftId,
      shiftName: shift.generatedShiftName || shift.shiftName,
      startDate: Number(shift.startDate) || 0,
      workerCount: workers.length,
      plannedHours: shift.generatedShiftDuration || 0,
      issuedHours: attendanceRecords.length
        ? attendanceRecords.reduce(
            (sum, record) => sum + (record.totalWorkedDuration || 0),
            0,
          )
        : null,
      shift,
    };
  });
}

export interface ScheduleLinkedShiftGroup {
  key: string;
  shiftId: string;
  shiftName: string;
  days: ScheduleLinkedShiftRow[];
  dayCount: number;
  totalWorkerCount: number;
  totalPlannedHours: number;
  totalIssuedHours: number | null;
  /** A single linked-existing shift (via "+ Link") has no per-day batch to expand. */
  isBatch: boolean;
}

/**
 * Groups linked shift rows by their recurring `shiftId` so a per-day batch
 * created via "Create new shift" renders as one collapsible card instead of
 * one row per day. A shift linked individually via "+ Link" has a unique
 * `shiftId` of its own, so it naturally becomes a single-day, non-expandable
 * group — same look as before grouping existed.
 */
export function buildScheduleLinkedShiftGroups(
  rows: ScheduleLinkedShiftRow[],
): ScheduleLinkedShiftGroup[] {
  const order: string[] = [];
  const byShiftId = new Map<string, ScheduleLinkedShiftRow[]>();

  rows.forEach((row) => {
    const groupKey = row.shiftId || row.generatedShiftId;
    if (!byShiftId.has(groupKey)) {
      order.push(groupKey);
      byShiftId.set(groupKey, []);
    }
    byShiftId.get(groupKey)!.push(row);
  });

  return order.map((groupKey) => {
    const days = byShiftId
      .get(groupKey)!
      .slice()
      .sort((a, b) => a.startDate - b.startDate);
    const issuedHoursValues = days
      .map((day) => day.issuedHours)
      .filter((value): value is number => value !== null);

    return {
      key: groupKey,
      shiftId: groupKey,
      shiftName: days[0].shiftName,
      days,
      dayCount: days.length,
      totalWorkerCount: days.reduce((sum, day) => sum + day.workerCount, 0),
      totalPlannedHours: days.reduce((sum, day) => sum + day.plannedHours, 0),
      totalIssuedHours: issuedHoursValues.length
        ? issuedHoursValues.reduce((sum, value) => sum + value, 0)
        : null,
      isBatch: days.length > 1,
    };
  });
}
