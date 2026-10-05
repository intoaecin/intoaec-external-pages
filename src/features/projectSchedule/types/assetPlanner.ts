export type AssetPlanStatus = "PLANNED" | "REQUESTED" | "RECEIVED";

export interface DailyAssetPlanOverride {
  plannedQuantity?: number;
  receivedQuantity?: number;
  notes?: string;
}

export interface AssetPlan {
  id: string;
  projectId: string;
  scheduleId?: string;
  scheduleName?: string;
  assetId: string;
  assetName: string;
  assetSerial?: string;
  assetCategory?: string;
  assetType?: string;
  startDate: number; // epoch ms (start of day)
  endDate: number;   // epoch ms (end of day)
  plannedQuantity: number;
  receivedQuantity?: number;
  status: AssetPlanStatus;
  assetRequestId?: string;
  notes?: string;
  dailyOverrides?: Record<string, DailyAssetPlanOverride>; // Keyed by YYYY-MM-DD
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY_PREFIX = "intoaec_asset_plans_";

export function getProjectAssetPlansKey(projectId: string): string {
  return `${STORAGE_KEY_PREFIX}${projectId}`;
}

export function loadAssetPlans(projectId: string): AssetPlan[] {
  if (typeof window === "undefined" || !projectId) return [];
  try {
    const raw = localStorage.getItem(getProjectAssetPlansKey(projectId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load asset plans from localStorage:", error);
    return [];
  }
}

export function saveAssetPlans(projectId: string, plans: AssetPlan[]): void {
  if (typeof window === "undefined" || !projectId) return;
  try {
    localStorage.setItem(getProjectAssetPlansKey(projectId), JSON.stringify(plans));
    window.dispatchEvent(
      new CustomEvent("intoaec_asset_plans_updated", { detail: { projectId, plans } }),
    );
  } catch (error) {
    console.error("Failed to save asset plans to localStorage:", error);
  }
}

export function addAssetPlan(
  plan: Omit<AssetPlan, "id" | "createdAt" | "updatedAt" | "status"> & {
    status?: AssetPlanStatus;
  },
): AssetPlan {
  const now = Date.now();
  const newPlan: AssetPlan = {
    ...plan,
    id: `plan_${now}_${Math.random().toString(36).slice(2, 8)}`,
    status: plan.status || "PLANNED",
    createdAt: now,
    updatedAt: now,
  };

  const existing = loadAssetPlans(plan.projectId);
  const updated = [newPlan, ...existing];
  saveAssetPlans(plan.projectId, updated);
  return newPlan;
}

export function updateAssetPlan(
  projectId: string,
  planId: string,
  updates: Partial<Omit<AssetPlan, "id" | "projectId" | "createdAt">>,
): AssetPlan | null {
  const existing = loadAssetPlans(projectId);
  const index = existing.findIndex((p) => p.id === planId);
  if (index === -1) return null;

  const updatedPlan: AssetPlan = {
    ...existing[index],
    ...updates,
    updatedAt: Date.now(),
  };

  existing[index] = updatedPlan;
  saveAssetPlans(projectId, existing);
  return updatedPlan;
}

export function getPlanDailyValues(
  plan: AssetPlan,
  dateKey: string,
): {
  plannedQuantity: number;
  receivedQuantity: number | undefined;
  hasOverride: boolean;
} {
  const override = plan.dailyOverrides?.[dateKey];
  const hasOverride =
    override?.plannedQuantity !== undefined ||
    override?.receivedQuantity !== undefined;
  const plannedQuantity = override?.plannedQuantity ?? plan.plannedQuantity;
  const receivedQuantity =
    override?.receivedQuantity ??
    (plan.status === "RECEIVED" ? plannedQuantity : plan.receivedQuantity);
  return { plannedQuantity, receivedQuantity, hasOverride };
}

export function updatePlanDateOverride(
  projectId: string,
  planId: string,
  dateKey: string,
  override: DailyAssetPlanOverride | null,
): AssetPlan | null {
  const existing = loadAssetPlans(projectId);
  const index = existing.findIndex((p) => p.id === planId);
  if (index === -1) return null;

  const plan = existing[index];
  const currentOverrides = { ...(plan.dailyOverrides || {}) };

  if (override === null) {
    delete currentOverrides[dateKey];
  } else {
    currentOverrides[dateKey] = {
      ...(currentOverrides[dateKey] || {}),
      ...override,
    };
  }

  const updatedPlan: AssetPlan = {
    ...plan,
    dailyOverrides: currentOverrides,
    updatedAt: Date.now(),
  };

  existing[index] = updatedPlan;
  saveAssetPlans(projectId, existing);
  return updatedPlan;
}

export function deleteAssetPlan(projectId: string, planId: string): boolean {
  const existing = loadAssetPlans(projectId);
  const filtered = existing.filter((p) => p.id !== planId);
  if (filtered.length === existing.length) return false;
  saveAssetPlans(projectId, filtered);
  return true;
}
