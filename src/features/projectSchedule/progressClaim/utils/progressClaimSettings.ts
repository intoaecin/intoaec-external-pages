import type { ProgressClaimPlannerTab } from "../hooks/useProgressClaimTabs";
import type { ProgressClaimSettings } from "../types";

/** A project with no saved settings shows every planner tab. */
export const DEFAULT_PROGRESS_CLAIM_SETTINGS: ProgressClaimSettings = {
  showMaterials: true,
  showResources: true,
  showAssets: true,
};

export const resolveProgressClaimSettings = (
  settings?: ProgressClaimSettings | null,
): ProgressClaimSettings => settings ?? DEFAULT_PROGRESS_CLAIM_SETTINGS;

export const PLANNER_TAB_SETTING_KEY: Record<ProgressClaimPlannerTab, keyof ProgressClaimSettings> = {
  MATERIALS: "showMaterials",
  RESOURCES: "showResources",
  ASSETS: "showAssets",
};
