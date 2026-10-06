import { useMemo } from "react";
import type { ProgressClaim } from "./api/create-progress-claim";
import { useFetchClaimAssetPlans } from "./api/fetch-claim-asset-plans";
import { useFetchClaimMaterialPlans } from "./api/fetch-claim-material-plans";
import { useFetchClaimSchedules } from "./api/fetch-claim-schedules";
import { useFetchClaimShifts } from "./api/fetch-claim-shifts";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { getLocalizationValue } from "@/lib/helpers";
import { useFetchWorkingCalendar } from "../../hooks/api/fetch-working-calendar";
import { useIsDateOffDay } from "../../hooks/useIsDateOffDay";
import { buildPlannerQuantityEntries } from "../../hooks/usePlannerQuantityEntries";
import { useFetchProjectShiftWages } from "../../hooks/api/fetch-project-shift-wages";
import type { ProgressClaimPlannerScope } from "../types";
import type { ProgressClaimPlannerData } from "../utils/progressClaimPlannerExcel";
import { isScheduleInClaimPeriod, toClaimPeriod } from "../utils/progressClaimPeriod";
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
      organizationType: claim.organizationType,
      projectId: claim.projectId,
      withAuth,
      period: toClaimPeriod(claim.periodFrom, claim.periodTo),
    }),
    [
      claim.organizationId,
      claim.organizationType,
      claim.projectId,
      claim.periodFrom,
      claim.periodTo,
      withAuth,
    ],
  );

  const materials = useFetchClaimMaterialPlans(scope, settings.showMaterials);
  const shifts = useFetchClaimShifts(scope, settings.showResources);
  const assets = useFetchClaimAssetPlans(scope, settings.showAssets);
  const wageOrganization = useMemo(
    () => ({ organizationId: claim.organizationId, organizationType: claim.organizationType }),
    [claim.organizationId, claim.organizationType],
  );
  const wages = useFetchProjectShiftWages(
    claim.projectId,
    settings.showResources,
    scope.period,
    wageOrganization,
  );

  // The Quantity tab's plan, for the schedules running in the claim period.
  const schedules = useFetchClaimSchedules(scope);
  const { data: workingCalendar } = useFetchWorkingCalendar(claim.projectId);
  const { localizationValue } = useOrganizationLocalization();
  const organizationTimezone =
    (localizationValue && getLocalizationValue(localizationValue, "TIMEZONE", "ID")) || "UTC";
  const isDateOffDay = useIsDateOffDay(workingCalendar, organizationTimezone);
  const quantity = useMemo(
    () =>
      buildPlannerQuantityEntries(schedules.schedules, isDateOffDay, organizationTimezone).filter(
        ({ schedule }) => isScheduleInClaimPeriod(schedule, scope.period),
      ),
    [schedules.schedules, isDateOffDay, organizationTimezone, scope.period],
  );

  const planner: ProgressClaimPlannerData = {
    materials: settings.showMaterials ? materials.plans : undefined,
    shifts: settings.showResources ? shifts.shifts : undefined,
    shiftWages: settings.showResources ? wages.wageByShiftId : undefined,
    assets: settings.showAssets ? assets.plans : undefined,
    quantity,
  };

  return {
    planner,
    loading:
      schedules.loading ||
      (settings.showMaterials && materials.loading) ||
      (settings.showResources && (shifts.loading || wages.loading)) ||
      (settings.showAssets && assets.loading),
  };
};
