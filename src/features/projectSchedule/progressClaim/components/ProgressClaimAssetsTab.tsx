import { PlannerAssetBoard } from "../../components/planner/PlannerAssetBoard";
import { useFetchClaimAssetPlans } from "../hooks/api/fetch-claim-asset-plans";
import type { ProgressClaimPlannerScope } from "../types";

/** The Planner's asset list + gantt without plan, request, receive or edit actions. */
export default function ProgressClaimAssetsTab(scope: ProgressClaimPlannerScope) {
  // Plans come back already limited to the claim period.
  const { plans, loading } = useFetchClaimAssetPlans(scope);

  return <PlannerAssetBoard plans={plans} loading={loading} readOnly />;
}
