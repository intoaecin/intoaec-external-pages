import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { WorkloadGanttRow } from "../types/workload";
import type {
  ScheduleLinkedShiftGroup,
  ScheduleLinkedShiftRow,
} from "../components/createScheduleModal/scheduleShiftLinkUtils";
import { buildDateKey } from "./workloadDateKeys";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * The Gantt timeline's `dates` column keys come from `buildDateKey` applied
 * to `dayjs.tz(calendarKey, organizationTimezone).startOf("day").toDate()`
 * (see `eachCalendarDayInTimezone`). A shift's raw `startDate` epoch has to
 * go through the same two-step conversion — org-timezone calendar key, then
 * back to a Date in that shape — or its cell lands one day off whenever the
 * viewer's browser timezone differs from the organization's.
 */
export function buildOrgTimezoneDateKey(
  epochMs: number,
  organizationTimezone: string,
): string {
  const tz = organizationTimezone || "UTC";
  const calendarKey = dayjs(epochMs).tz(tz).format("YYYY-MM-DD");
  return buildDateKey(dayjs.tz(calendarKey, tz).startOf("day").toDate());
}

export function buildShiftDayRows(
  group: ScheduleLinkedShiftGroup,
  organizationTimezone: string,
): Map<string, ScheduleLinkedShiftRow> {
  const map = new Map<string, ScheduleLinkedShiftRow>();
  for (const day of group.days) {
    map.set(
      buildOrgTimezoneDateKey(day.startDate, organizationTimezone),
      day,
    );
  }
  return map;
}

/** A single shift group as one Gantt row (attendance cells, no schedule bar). */
export function buildShiftGanttRow(
  group: ScheduleLinkedShiftGroup,
  organizationTimezone: string,
): WorkloadGanttRow {
  return {
    rowKey: `shift-${group.key}`,
    schedule: null,
    shiftDayRows: buildShiftDayRows(group, organizationTimezone),
    barColor: group.days[0].shift.generatedShiftColor,
  };
}
