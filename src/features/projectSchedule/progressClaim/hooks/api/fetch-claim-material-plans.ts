import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import type { MaterialPlan } from "../../../types/materialPlanner";
import { toMaterialPlan } from "../../../utils/plannerPlanMappers";
import type { ProgressClaimPlannerScope } from "../../types";
import { useFetchClaimPlannerSnapshot } from "./fetch-claim-planner-snapshot";

/** The claim's material plans: the ones saved with it, else the project's live plans. */
export const useFetchClaimMaterialPlans = (
  scope: ProgressClaimPlannerScope,
  enabled: boolean = true,
) => {
  const { organizationId, projectId, withAuth } = scope;
  const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
  const { post } = useAxios(NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/material-plans", withAuth);
  const { snapshot, pending } = useFetchClaimPlannerSnapshot(scope);

  const query = useQuery({
    queryKey: ["progress-claim-material-plans", organizationId, projectId, withAuth],
    queryFn: async (): Promise<MaterialPlan[]> => {
      const response = await post({
        eventType: "FETCH_MATERIAL_PLANS",
        organizationId,
        projectId,
      });
      const result = response?.body?.result ?? response?.body;
      return Array.isArray(result) ? result.map(toMaterialPlan) : [];
    },
    enabled: enabled && !pending && !snapshot && Boolean(organizationId && projectId),
  });

  const savedPlans = useMemo(() => snapshot?.materials.map(toMaterialPlan), [snapshot]);

  return { plans: savedPlans ?? query.data ?? [], loading: pending || query.isLoading };
};
