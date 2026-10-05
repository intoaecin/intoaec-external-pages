import { useMemo } from "react";
import type { WorkloadGanttRow } from "../types/workload";
import type { PlannerScheduleEntry } from "./usePlannerData";
import { buildShiftGanttRow } from "../utils/shiftGanttRows";

export function usePlannerRows({
  entries,
  expandedScheduleIds,
  organizationTimezone,
}: {
  entries: PlannerScheduleEntry[];
  expandedScheduleIds: Set<string>;
  organizationTimezone: string;
}): WorkloadGanttRow[] {
  return useMemo(() => {
    const rows: WorkloadGanttRow[] = [];

    for (const entry of entries) {
      const { schedule, groups } = entry;
      const entryRows: WorkloadGanttRow[] = [
        {
          rowKey: `schedule-${schedule.scheduleId}`,
          schedule,
          barColor: schedule.scheduleColor,
          isClickable: true,
        },
      ];

      if (expandedScheduleIds.has(schedule.scheduleId)) {
        for (const group of groups) {
          const shiftRow = buildShiftGanttRow(group, organizationTimezone);
          entryRows.push({
            ...shiftRow,
            rowKey: `shift-${schedule.scheduleId}-${group.key}`,
          });
        }
      }

      entryRows[entryRows.length - 1] = {
        ...entryRows[entryRows.length - 1],
        isResourceGroupEnd: true,
      };
      rows.push(...entryRows);
    }

    return rows;
  }, [entries, expandedScheduleIds, organizationTimezone]);
}
