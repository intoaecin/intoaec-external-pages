import { useMemo } from "react";
import type { WorkloadGanttRow } from "../types/workload";
import type { PlannerWorkerEntry } from "../utils/plannerWorkerEntries";
import { buildShiftGanttRow } from "../utils/shiftGanttRows";

export const PLANNER_WORKER_ROW_PREFIX = "worker-";

export function usePlannerWorkerRows({
  workerEntries,
  expandedWorkerIds,
  organizationTimezone,
}: {
  workerEntries: PlannerWorkerEntry[];
  expandedWorkerIds: Set<string>;
  organizationTimezone: string;
}): WorkloadGanttRow[] {
  return useMemo(() => {
    const rows: WorkloadGanttRow[] = [];

    for (const { workerId, groups } of workerEntries) {
      const entryRows: WorkloadGanttRow[] = [
        {
          rowKey: `${PLANNER_WORKER_ROW_PREFIX}${workerId}`,
          schedule: null,
          isClickable: true,
        },
      ];

      if (expandedWorkerIds.has(workerId)) {
        for (const { key, group } of groups) {
          entryRows.push({
            ...buildShiftGanttRow(group, organizationTimezone),
            rowKey: `worker-shift-${workerId}-${key}`,
            shiftFocusWorkerId: workerId,
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
  }, [workerEntries, expandedWorkerIds, organizationTimezone]);
}
