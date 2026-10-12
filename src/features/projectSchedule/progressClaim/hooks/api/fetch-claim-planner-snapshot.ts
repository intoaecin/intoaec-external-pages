import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import type { ProgressClaimPlannerScope, ProgressClaimPlannerSnapshot } from "../../types";

export const claimPlannerSnapshotQueryKey = (progressClaimId?: string) => [
  "progress-claim-planner-snapshot",
  progressClaimId,
];

/** Only an edit of the claim replaces its snapshot, and that invalidates this query. */
const SNAPSHOT_STALE_TIME_MS = 5 * 60 * 1000;

/**
 * The planner data saved with a claim. `snapshot` is null when there is
 * nothing saved to read — no claim yet (the claim form), a claim saved before
 * claims kept their planner data, or a failed read — and the caller reads the
 * live planner instead. `pending` holds that live read back until this settles.
 */
export const useFetchClaimPlannerSnapshot = ({
  progressClaimId,
  withAuth,
}: Pick<ProgressClaimPlannerScope, "progressClaimId" | "withAuth">) => {
  const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
  const { post } = useAxios(NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/progress-claim", withAuth);

  const query = useQuery({
    queryKey: claimPlannerSnapshotQueryKey(progressClaimId),
    queryFn: async (): Promise<ProgressClaimPlannerSnapshot | null> => {
      const response = await post({
        eventType: "FETCH_PROGRESS_CLAIM_PLANNER_SNAPSHOT",
        progressClaimId,
      });
      if (response?.code === "PROGRESS_CLAIM_PLANNER_SNAPSHOT_FETCHED") {
        return response.body as ProgressClaimPlannerSnapshot;
      }
      if (response?.code === "PROGRESS_CLAIM_PLANNER_SNAPSHOT_NOT_CAPTURED") return null;

      throw new Error(response?.message || "Failed to load the claim's planner data.");
    },
    enabled: Boolean(progressClaimId),
    staleTime: SNAPSHOT_STALE_TIME_MS,
    retry: 1,
  });

  return {
    snapshot: query.data ?? null,
    pending: Boolean(progressClaimId) && query.isLoading,
  };
};
