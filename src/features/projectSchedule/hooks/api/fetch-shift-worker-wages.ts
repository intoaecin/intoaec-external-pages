import { useMemo } from "react";
import { useQueries, type UseQueryResult } from "@tanstack/react-query";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { shiftWorkerWageKey, type ShiftWorkerWages } from "../../utils/plannerWages";
import type { WageOrganization, WagePeriod } from "./fetch-project-shift-wages";

/** More than any one shift's crew, so a shift's workers always come back in one page. */
const WORKERS_PAGE_SIZE = 200;

interface WorkerWageRow {
  shiftId?: string;
  workerId?: string;
  totalWage?: number | string;
}

// Module-level so the combined result stays the same array between renders.
const combineRows = (queries: UseQueryResult<WorkerWageRow[]>[]) =>
  queries.map((query) => query.data);

/**
 * Wage each worker earned on each of the given shifts (overtime included) —
 * the per-worker breakdown behind Worker Management's wage list. The server
 * only serves it one shift at a time, so this is one request per shift. With
 * a `period`, only the wage from that period's days.
 */
export const useFetchShiftWorkerWages = (
  shiftIds: string[],
  enabled: boolean = true,
  period?: WagePeriod | null,
  organization: WageOrganization = {},
) => {
  const { organizationId, organizationType } = organization;
  const { NEXT_PUBLIC_PROCUREMENT_ENDPOINT } = useEnv();
  const { post } = useAxiosWithAuth(NEXT_PUBLIC_PROCUREMENT_ENDPOINT + "/worker-management");

  const results = useQueries({
    queries: shiftIds.map((shiftId) => ({
      queryKey: ["planner-shift-worker-wages", organizationId, shiftId, period?.from, period?.to],
      queryFn: async (): Promise<WorkerWageRow[]> => {
        const response = await post({
          eventType: "GET_WORKER_WAGE_DETAILS_BY_SHIFT_ID",
          organizationId,
          organizationType,
          shiftId,
          rowsPerPage: WORKERS_PAGE_SIZE,
          ...(period ? { startDate: period.from, endDate: period.to } : {}),
        });
        return response?.code === "WAGE_DETAILS_FOUND" ? (response.body?.data ?? []) : [];
      },
      enabled: enabled && Boolean(organizationId),
      // Marking attendance changes wages without touching this key.
      staleTime: 0,
    })),
    combine: combineRows,
  });

  // A contractor comes back as one row per worker type, all under the contractor's id.
  const wageByShiftWorker = useMemo(() => {
    const wages: ShiftWorkerWages = new Map();
    results.forEach((rows) => {
      (rows ?? []).forEach((row) => {
        if (!row.shiftId || !row.workerId) return;
        const key = shiftWorkerWageKey(row.shiftId, row.workerId);
        wages.set(key, (wages.get(key) ?? 0) + (Number(row.totalWage) || 0));
      });
    });
    return wages;
  }, [results]);

  return { wageByShiftWorker };
};
