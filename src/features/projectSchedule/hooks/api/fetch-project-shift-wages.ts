import { useQuery } from "@tanstack/react-query";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";

/** Same page size the Planner uses when loading a project's linked shifts. */
const WAGES_PAGE_SIZE = 200;

/** Days to limit wages to, as epoch ms; the server widens them to whole days. */
export interface WagePeriod {
  from: number;
  to: number;
}

/** Whose wages to read: this page has no session for the server to take it from. */
export interface WageOrganization {
  organizationId?: string;
  organizationType?: string;
}

interface ShiftWageRow {
  shiftId?: string;
  totalWage?: number | string;
}

/**
 * Wage earned on each of a project's shifts (overtime included), keyed by
 * shift id — what Worker Management's wage list shows, built from attendance.
 * With a `period`, only the wage from that period's days of each shift.
 */
export const useFetchProjectShiftWages = (
  projectId?: string,
  enabled: boolean = true,
  period?: WagePeriod | null,
  organization: WageOrganization = {},
) => {
  const { organizationId, organizationType } = organization;
  const { NEXT_PUBLIC_PROCUREMENT_ENDPOINT } = useEnv();
  const { post } = useAxiosWithAuth(NEXT_PUBLIC_PROCUREMENT_ENDPOINT + "/worker-management");

  const query = useQuery({
    queryKey: ["planner-shift-wages", organizationId, projectId, period?.from, period?.to],
    queryFn: async (): Promise<Map<string, number>> => {
      const response = await post({
        eventType: "GET_WAGE_DETAILS_BY_PROJECT_ID",
        organizationId,
        organizationType,
        projectId,
        rowsPerPage: WAGES_PAGE_SIZE,
        ...(period ? { startDate: period.from, endDate: period.to } : {}),
      });
      const rows: ShiftWageRow[] =
        response?.code === "WAGE_DETAILS_FOUND" ? (response.body?.data ?? []) : [];

      return new Map(
        rows
          .filter((row): row is ShiftWageRow & { shiftId: string } => Boolean(row.shiftId))
          .map((row) => [row.shiftId, Number(row.totalWage) || 0]),
      );
    },
    enabled: enabled && Boolean(organizationId && projectId),
    // Marking attendance changes wages without touching this key.
    staleTime: 0,
  });

  return { wageByShiftId: query.data, loading: query.isLoading };
};
