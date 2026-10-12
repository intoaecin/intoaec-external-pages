import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import type { GeneratedShift } from "@/features/worker-management/hooks/useGetShifts";
import type { ProgressClaimPlannerScope } from "../../types";
import { useFetchClaimPlannerSnapshot } from "./fetch-claim-planner-snapshot";

/** Same page size the Planner uses when loading a project's linked shifts. */
const SHIFTS_PAGE_SIZE = 200;

/** The claim's shifts: the ones saved with it, else the project's live shifts for the period. */
export const useFetchClaimShifts = (
  scope: ProgressClaimPlannerScope,
  enabled: boolean = true,
) => {
  const { organizationId, projectId, withAuth, period } = scope;
  const { NEXT_PUBLIC_PROCUREMENT_ENDPOINT } = useEnv();
  const { post } = useAxios(NEXT_PUBLIC_PROCUREMENT_ENDPOINT + "/worker-management", withAuth);
  const { snapshot, pending } = useFetchClaimPlannerSnapshot(scope);

  const query = useQuery({
    queryKey: ["progress-claim-shifts", organizationId, projectId, withAuth, period?.from, period?.to],
    queryFn: async (): Promise<GeneratedShift[]> => {
      const response = await post({
        eventType: "GET_GENERATED_SHIFTS",
        organizationId,
        projectId,
        rowsPerPage: SHIFTS_PAGE_SIZE,
        // The server widens these to whole days in the organization's timezone.
        ...(period ? { startDate: period.from, endDate: period.to } : {}),
      });
      if (response?.code !== "GENERATED_SHIFTS_FOUND") return [];

      return (response.body?.result ?? []) as GeneratedShift[];
    },
    enabled: enabled && !pending && !snapshot && Boolean(organizationId && projectId),
  });

  return { shifts: snapshot?.shifts ?? query.data ?? [], loading: pending || query.isLoading };
};
