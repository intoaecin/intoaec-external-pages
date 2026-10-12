import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import type { AssetPlan } from "../../../types/assetPlanner";
import { toAssetPlan, type StoredAssetPlan } from "../../../utils/plannerPlanMappers";
import type { ProgressClaimPlannerScope } from "../../types";
import { getClaimPeriodBounds } from "../../utils/progressClaimPeriod";
import { useFetchClaimPlannerSnapshot } from "./fetch-claim-planner-snapshot";

const toAssetPlans = (storedPlans: StoredAssetPlan[]): AssetPlan[] =>
  storedPlans
    .map(toAssetPlan)
    .filter((plan) => Number.isFinite(plan.startDate) && Number.isFinite(plan.endDate));

/** The claim's asset plans: the ones saved with it, else the project's live plans for the period. */
export const useFetchClaimAssetPlans = (
  scope: ProgressClaimPlannerScope,
  enabled: boolean = true,
) => {
  const { organizationId, projectId, withAuth, period } = scope;
  const { NEXT_PUBLIC_PROCUREMENT_ENDPOINT } = useEnv();
  const { post } = useAxios(NEXT_PUBLIC_PROCUREMENT_ENDPOINT + "/assets", withAuth);
  const { snapshot, pending } = useFetchClaimPlannerSnapshot(scope);

  const query = useQuery({
    queryKey: ["progress-claim-asset-plans", organizationId, projectId, withAuth, period?.from, period?.to],
    queryFn: async (): Promise<AssetPlan[]> => {
      const response = await post({
        eventType: "FETCH_PROJECT_PLANNER_ASSET_PLANS",
        organizationId,
        projectId,
        // Whole days: plans overlapping any part of the period come back.
        ...(period
          ? {
              startDate: getClaimPeriodBounds(period).start.valueOf(),
              endDate: getClaimPeriodBounds(period).end.valueOf(),
            }
          : {}),
      });
      if (response?.code !== "ASSET_PLANS_FOUND") return [];

      return toAssetPlans((response.body?.plans ?? []) as StoredAssetPlan[]);
    },
    enabled: enabled && !pending && !snapshot && Boolean(organizationId && projectId),
  });

  const savedPlans = useMemo(() => snapshot && toAssetPlans(snapshot.assets), [snapshot]);

  return { plans: savedPlans ?? query.data ?? [], loading: pending || query.isLoading };
};
