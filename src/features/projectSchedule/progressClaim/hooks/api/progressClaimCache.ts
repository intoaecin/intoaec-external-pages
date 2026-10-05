import type { QueryClient } from "@tanstack/react-query";
import { progressClaimQueryKey } from "./fetch-progress-claim";
import type { ProgressClaim } from "./create-progress-claim";

/**
 * Accept/reject return the full updated claim, so the single-claim cache is
 * patched directly instead of refetching. intoaec-UI also patches the claim's
 * row in the project's claim list; this app has no such list.
 */
export const applyProgressClaimToCache = (
  queryClient: QueryClient,
  claim: ProgressClaim,
) => {
  queryClient.setQueryData(progressClaimQueryKey(claim.id), claim);
};
