import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import type { ProgressClaim } from "./create-progress-claim";

export const progressClaimQueryKey = (progressClaimId?: string) => [
  "progress-claim",
  progressClaimId,
];

/**
 * `withAuth: false` is required for the external client acceptance page,
 * which has no session — it relies on the `apiKey` header `useAxios` already
 * attaches automatically when unauthenticated.
 */
export const useFetchProgressClaimById = (
  progressClaimId?: string,
  withAuth: boolean = true,
) => {
  const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
  const path = NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/progress-claim";
  // Call useAxios directly (not the useAxiosWithAuth wrapper) so this stays
  // one hook invocation regardless of `withAuth` — conditionally choosing
  // between two different hooks per render would break Rules of Hooks.
  const { post } = useAxios(path, withAuth);

  const query = useQuery({
    queryKey: progressClaimQueryKey(progressClaimId),
    queryFn: async (): Promise<ProgressClaim | null> => {
      const response = await post({
        eventType: "FETCH_PROGRESS_CLAIM_BY_ID",
        progressClaimId,
      });

      if (response?.code === "PROGRESS_CLAIM_NOT_FOUND") {
        return null;
      }

      if (response?.code !== "PROGRESS_CLAIM_FETCHED") {
        throw new Error(
          response?.message || "Failed to load the progress claim.",
        );
      }

      return response.body as ProgressClaim;
    },
    enabled: Boolean(progressClaimId),
  });

  return {
    claim: query.data ?? null,
    loading: query.isLoading,
    error: query.error as Error | null,
  };
};
