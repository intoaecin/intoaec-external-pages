import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import type { MaterialPlan } from "../../../types/materialPlanner";
import { toMaterialPlan } from "../../../utils/plannerPlanMappers";
import type { ProgressClaimPlannerScope } from "../../types";

export const useFetchClaimMaterialPlans = ({
  organizationId,
  projectId,
  withAuth,
}: ProgressClaimPlannerScope, enabled: boolean = true) => {
  const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
  const { post } = useAxios(NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/material-plans", withAuth);

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
    enabled: enabled && Boolean(organizationId && projectId),
  });

  return { plans: query.data ?? [], loading: query.isLoading };
};
