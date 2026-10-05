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

/** Quantity has no setting of its own, so it is always shown. */
const PLANNER_TAB_SETTING_KEY: Partial<Record<ProgressClaimPlannerTab, keyof ProgressClaimSettings>> = {
  MATERIALS: "showMaterials",
  RESOURCES: "showResources",
  ASSETS: "showAssets",
};

export const isPlannerTabEnabled = (
  tab: ProgressClaimPlannerTab,
  settings: ProgressClaimSettings,
): boolean => {
  const settingKey = PLANNER_TAB_SETTING_KEY[tab];
  return settingKey ? settings[settingKey] : true;
};
