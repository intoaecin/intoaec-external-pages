import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import type { ProgressClaim } from "./create-progress-claim";
import { applyProgressClaimToCache } from "./progressClaimCache";

export interface AcceptProgressClaimLineInput {
  progressClaimLineId: string;
  acceptedCumulativePct: number;
  varianceReason?: string;
}

interface AcceptProgressClaimRequest {
  progressClaimId: string;
  clientSignature?: string;
  lines: AcceptProgressClaimLineInput[];
}

/**
 * The external client acceptance page has no session, so this always
 * calls the unauthenticated `useAxios` variant (apiKey header only), matching
 * how the Change Order accept/reject flow calls the backend.
 */
export const useAcceptProgressClaim = () => {
  const queryClient = useQueryClient();
  const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
  const { post } = useAxios(NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/progress-claim");

  const mutation = useMutation({
    mutationFn: async (request: AcceptProgressClaimRequest): Promise<ProgressClaim> => {
      const response = await post({
        eventType: "ACCEPT_PROGRESS_CLAIM",
        ...request,
      });

      if (response?.code !== "PROGRESS_CLAIM_ACCEPTED_SUCCESSFULLY") {
        throw new Error(
          response?.message || "Failed to accept the progress claim.",
        );
      }

      return response.body as ProgressClaim;
    },
    onSuccess: (claim) => applyProgressClaimToCache(queryClient, claim),
  });

  return {
    acceptProgressClaim: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error as Error | null,
  };
};
