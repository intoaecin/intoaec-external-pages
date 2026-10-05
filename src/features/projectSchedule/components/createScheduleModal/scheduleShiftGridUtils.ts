import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type {
  GeneratedShift,
  ShiftAttendanceRecord,
} from "@/features/worker-management/hooks/useGetShifts";

dayjs.extend(utc);
dayjs.extend(timezone);

export type ScheduleShiftGridCellStatus = "empty" | "none" | "short" | "full";

export function getShiftPresentSummary(
  shift: GeneratedShift,
  focusWorkerId?: string,
): {
  present: number;
  total: number;
} {
  const workers = (shift.workers || []).filter(
    (worker) => !focusWorkerId || worker.workerId === focusWorkerId,
  );

  const headCount = (workerType: string, contractorWorkerCount: number | null) =>
    workerType === "CONTRACTOR" ? contractorWorkerCount || 0 : 1;

  const presentHeadCount = (worker: (typeof workers)[number]) => {
    const record = (worker.attendanceRecords || []).find(
      (r) => r.generatedShiftId === shift.generatedShiftId,
    );
    if (worker.type === "CONTRACTOR") {
      return record?.contractorWorkerPresentCount ?? 0;
    }
    if (record?.shiftWorkerStatus === "PRESENT") return 1;
    if (record?.shiftWorkerStatus === "HALF_PRESENT") return 1;
    return 0;
  };

  return {
    total: workers.reduce(
      (sum, w) => sum + headCount(w.type, w.contractorWorkerCount),
      0,
    ),
    present: workers.reduce((sum, w) => sum + presentHeadCount(w), 0),
  };
}

export function getShiftGridCellStatus(
  present: number,
  total: number,
): ScheduleShiftGridCellStatus {
  if (total <= 0) {
    return "empty";
  }
  if (present <= 0) {
    return "none";
  }
  if (present < total) {
    return "short";
  }
  return "full";
}

/** Attendance can't be recorded before the shift's calendar day (in the organization's timezone) has started. */
export function isShiftInFuture(
  shift: GeneratedShift,
  organizationTimezone: string,
): boolean {
  const tz = organizationTimezone || "UTC";
  return dayjs(Number(shift.startDate) || 0)
    .tz(tz)
    .isAfter(dayjs().tz(tz), "day");
}

/**
 * Returns the shift with one worker's attendance record for this shift
 * replaced (or added). `saved` is the API response; `changes` are the fields
 * we just sent, so the result is right even if the response is partial.
 */
export function applyAttendanceRecord(
  shift: GeneratedShift,
  shiftWorkerId: string,
  saved: Partial<ShiftAttendanceRecord> | undefined,
  changes: Partial<ShiftAttendanceRecord>,
): GeneratedShift {
  return {
    ...shift,
    workers: (shift.workers || []).map((worker) => {
      if (worker.shiftWorkerId !== shiftWorkerId) return worker;

      const records = worker.attendanceRecords || [];
      const existing = records.find(
        (record) => record.generatedShiftId === shift.generatedShiftId,
      );
      const merged = {
        ...existing,
        ...saved,
        ...changes,
        shiftWorkerId,
        generatedShiftId: shift.generatedShiftId,
      } as ShiftAttendanceRecord;

      return {
        ...worker,
        attendanceRecords: existing
          ? records.map((record) => (record === existing ? merged : record))
          : [...records, merged],
      };
    }),
  };
}
