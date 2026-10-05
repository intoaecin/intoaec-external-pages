import { PlannerMaterialTable } from "../../components/planner/PlannerMaterialTable";
import { useFetchClaimMaterialPlans } from "../hooks/api/fetch-claim-material-plans";
import type { ProgressClaimPlannerScope } from "../types";

/** The Planner's material table without selection, edit or delete actions. */
export default function ProgressClaimMaterialsTab(scope: ProgressClaimPlannerScope) {
  const { plans, loading } = useFetchClaimMaterialPlans(scope);

  return <PlannerMaterialTable plans={plans} loading={loading} />;
}
