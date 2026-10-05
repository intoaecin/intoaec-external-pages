import { useMemo } from "react";
import type { ProgressClaim } from "./api/create-progress-claim";
import { useFetchClaimAssetPlans } from "./api/fetch-claim-asset-plans";
import { useFetchClaimMaterialPlans } from "./api/fetch-claim-material-plans";
import { useFetchClaimShifts } from "./api/fetch-claim-shifts";
import type { ProgressClaimPlannerScope } from "../types";
import type { ProgressClaimPlannerData } from "../utils/progressClaimPlannerExcel";
import { toClaimPeriod } from "../utils/progressClaimPeriod";
import { resolveProgressClaimSettings } from "../utils/progressClaimSettings";

/**
 * The claim's Materials / Resources / Assets data — only for the tabs its
 * settings enable, and for the claim period, exactly as the tabs show them
 * (same queries, so the tabs and the download share one fetch).
 */
export const useProgressClaimPlannerData = (claim: ProgressClaim, withAuth: boolean) => {
  const settings = resolveProgressClaimSettings(claim.progressClaimSettings);
  const scope = useMemo<ProgressClaimPlannerScope>(
    () => ({
      organizationId: claim.organizationId,
      projectId: claim.projectId,
      withAuth,
      period: toClaimPeriod(claim.periodFrom, claim.periodTo),
    }),
    [claim.organizationId, claim.projectId, claim.periodFrom, claim.periodTo, withAuth],
  );

  const materials = useFetchClaimMaterialPlans(scope, settings.showMaterials);
  const shifts = useFetchClaimShifts(scope, settings.showResources);
  const assets = useFetchClaimAssetPlans(scope, settings.showAssets);

  const planner: ProgressClaimPlannerData = {
    materials: settings.showMaterials ? materials.plans : undefined,
    shifts: settings.showResources ? shifts.shifts : undefined,
    assets: settings.showAssets ? assets.plans : undefined,
  };

  return {
    planner,
    loading:
      (settings.showMaterials && materials.loading) ||
      (settings.showResources && shifts.loading) ||
      (settings.showAssets && assets.loading),
  };
};
