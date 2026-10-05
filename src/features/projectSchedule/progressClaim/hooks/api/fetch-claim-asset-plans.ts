import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import type { AssetPlan } from "../../../types/assetPlanner";
import { toAssetPlan, type StoredAssetPlan } from "../../../utils/plannerPlanMappers";
import type { ProgressClaimPlannerScope } from "../../types";

export const useFetchClaimAssetPlans = ({
  organizationId,
  projectId,
  withAuth,
  period,
}: ProgressClaimPlannerScope, enabled: boolean = true) => {
  const { NEXT_PUBLIC_PROCUREMENT_ENDPOINT } = useEnv();
  const { post } = useAxios(NEXT_PUBLIC_PROCUREMENT_ENDPOINT + "/assets", withAuth);

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
              startDate: dayjs(period.from).startOf("day").valueOf(),
              endDate: dayjs(period.to).endOf("day").valueOf(),
            }
          : {}),
      });
      if (response?.code !== "ASSET_PLANS_FOUND") return [];

      const storedPlans = (response.body?.plans ?? []) as StoredAssetPlan[];
      return storedPlans
        .map(toAssetPlan)
        .filter((plan) => Number.isFinite(plan.startDate) && Number.isFinite(plan.endDate));
    },
    enabled: enabled && Boolean(organizationId && projectId),
  });

  return { plans: query.data ?? [], loading: query.isLoading };
};
