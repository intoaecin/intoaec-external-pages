import { useMemo } from "react";
import { useFetchProjectShiftWages } from "../../../hooks/api/fetch-project-shift-wages";
import type { ProgressClaimPlannerScope } from "../../types";
import { useFetchClaimPlannerSnapshot } from "./fetch-claim-planner-snapshot";

/**
 * Wage per shift id for the claim period: the wages saved with the claim,
 * else the live ones (read with the apiKey for the claim's organization).
 */
export const useFetchClaimShiftWages = (
  scope: ProgressClaimPlannerScope,
  enabled: boolean = true,
) => {
  const { organizationId, organizationType } = scope;
  const { snapshot, pending } = useFetchClaimPlannerSnapshot(scope);
  const wageOrganization = useMemo(
    () => ({ organizationId, organizationType }),
    [organizationId, organizationType],
  );
  const live = useFetchProjectShiftWages(
    scope.projectId,
    enabled && !pending && !snapshot,
    scope.period,
    wageOrganization,
  );

  const savedWages = useMemo(
    () =>
      snapshot?.shiftWages
        ? new Map(Object.entries(snapshot.shiftWages).map(([shiftId, wage]) => [shiftId, Number(wage) || 0]))
        : undefined,
    [snapshot],
  );

  return {
    wageByShiftId: snapshot ? savedWages : live.wageByShiftId,
    loading: pending || live.loading,
  };
};
