import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import type { ProgressClaim } from "./create-progress-claim";
import { applyProgressClaimToCache } from "./progressClaimCache";

/**
 * The external client acceptance page has no session, so this always calls
 * the unauthenticated `useAxios` variant, matching `useAcceptProgressClaim`.
 */
export const useRejectProgressClaimByClient = () => {
  const queryClient = useQueryClient();
  const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
  const { post } = useAxios(NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/progress-claim");

  const mutation = useMutation({
    mutationFn: async ({
      progressClaimId,
      rejectionReason,
    }: {
      progressClaimId: string;
      rejectionReason: string;
    }): Promise<ProgressClaim> => {
      const response = await post({
        eventType: "REJECT_PROGRESS_CLAIM_BY_CLIENT",
        progressClaimId,
        rejectionReason,
      });

      if (response?.code !== "PROGRESS_CLAIM_REJECTED_BY_CLIENT_SUCCESSFULLY") {
        throw new Error(
          response?.message || "Failed to reject the progress claim.",
        );
      }

      return response.body as ProgressClaim;
    },
    onSuccess: (claim) => applyProgressClaimToCache(queryClient, claim),
  });

  return {
    rejectProgressClaimByClient: (progressClaimId: string, rejectionReason: string) =>
      mutation.mutateAsync({ progressClaimId, rejectionReason }),
    loading: mutation.isPending,
    error: mutation.error as Error | null,
  };
};
