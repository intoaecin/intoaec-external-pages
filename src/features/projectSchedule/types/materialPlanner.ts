export type MaterialPlanStatus = "PLANNED" | "REQUESTED" | "RECEIVED";

export interface DailyMaterialPlanOverride {
  plannedQuantity?: number;
  receivedQuantity?: number;
  notes?: string;
}

export interface MaterialPlan {
  id: string;
  projectId: string;
  scheduleId?: string; // Optional: linked schedule task ID
  scheduleName?: string; // Optional: linked schedule task name
  isProjectLevel?: boolean; // True if planned at overall project level
  costCatalogId?: string;
  materialId: string;
  materialName: string;
  category?: string;
  unit?: string;
  rate?: number;
  plannedQuantity: number;
  receivedQuantity?: number;
  usedQuantity?: number;
  unusedQuantity?: number;
  totalCost?: number;
  startDate: number; // epoch ms (start of day)
  endDate: number;   // epoch ms (end of day)
  status: MaterialPlanStatus;
  requestId?: string; // Material request / indent ID if requested
  indentId?: string; // Set once this plan has been converted into an indent
  indentSerial?: string;
  indentStatus?: string;
  convertedToIndentOn?: number;
  sourceEstimateId?: string;
  sourceLineItemId?: string;
  createdFromInventoryItemId?: string;
  notes?: string;
  dailyOverrides?: Record<string, DailyMaterialPlanOverride>; // Keyed by YYYY-MM-DD
  createdAt: number;
  updatedAt: number;
}

/** Indent states that release the plan they were raised from. */
const INDENT_RELEASING_STATUSES = ["REJECTED", "CANCELLED"];

/**
 * Whether a plan is currently held by an indent. A rejected or cancelled
 * indent no longer holds it, so the material can be converted again.
 */
export function isPlanConvertedToIndent(plan: MaterialPlan): boolean {
  if (!plan.indentId) return false;
  return !INDENT_RELEASING_STATUSES.includes(plan.indentStatus || "");
}

const STORAGE_KEY_PREFIX = "intoaec_material_plans_";

export function getProjectMaterialPlansKey(projectId: string): string {
  return `${STORAGE_KEY_PREFIX}${projectId}`;
}

export function loadMaterialPlans(projectId: string): MaterialPlan[] {
  if (typeof window === "undefined" || !projectId) return [];
  try {
    const raw = localStorage.getItem(getProjectMaterialPlansKey(projectId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load material plans from localStorage:", error);
    return [];
  }
}

export function saveMaterialPlans(projectId: string, plans: MaterialPlan[]): void {
  if (typeof window === "undefined" || !projectId) return;
  try {
    localStorage.setItem(getProjectMaterialPlansKey(projectId), JSON.stringify(plans));
    window.dispatchEvent(
      new CustomEvent("intoaec_material_plans_updated", { detail: { projectId, plans } }),
    );
  } catch (error) {
    console.error("Failed to save material plans to localStorage:", error);
  }
}

export function saveBatchMaterialPlans(projectId: string, newPlans: MaterialPlan[]): MaterialPlan[] {
  if (typeof window === "undefined" || !projectId || !newPlans.length) return [];
  const existing = loadMaterialPlans(projectId);
  const updated = [...existing];

  newPlans.forEach((newPlan) => {
    const existingIndex = updated.findIndex((p) => {
      if (newPlan.id === p.id) return true;
      if (
        newPlan.costCatalogId &&
        p.costCatalogId &&
        newPlan.costCatalogId === p.costCatalogId &&
        newPlan.scheduleId === p.scheduleId
      ) {
        return true;
      }
      return false;
    });

    if (existingIndex !== -1) {
      const curr = updated[existingIndex];
      const newPlanned = (curr.plannedQuantity || 0) + (newPlan.plannedQuantity || 0);
      const newTotal = (curr.totalCost || 0) + (newPlan.totalCost || 0);
      updated[existingIndex] = {
        ...curr,
        ...newPlan,
        id: curr.id,
        plannedQuantity: newPlanned,
        totalCost: newTotal,
        receivedQuantity: curr.receivedQuantity ?? 0,
        usedQuantity: curr.usedQuantity ?? 0,
        unusedQuantity: Math.max(0, (curr.receivedQuantity ?? 0) - (curr.usedQuantity ?? 0)),
        updatedAt: Date.now(),
      };
    } else {
      updated.unshift(newPlan);
    }
  });

  saveMaterialPlans(projectId, updated);
  return updated;
}

export function addMaterialPlan(
  plan: Omit<MaterialPlan, "id" | "createdAt" | "updatedAt" | "status"> & {
    status?: MaterialPlanStatus;
  },
): MaterialPlan {
  const existing = loadMaterialPlans(plan.projectId);
  const existingIndex = existing.findIndex((p) => {
    if (
      plan.costCatalogId &&
      p.costCatalogId &&
      plan.costCatalogId === p.costCatalogId &&
      plan.scheduleId === p.scheduleId
    ) {
      return true;
    }
    return false;
  });

  if (existingIndex !== -1) {
    const curr = existing[existingIndex];
    const newPlanned = (curr.plannedQuantity || 0) + (plan.plannedQuantity || 0);
    const newTotal = (curr.totalCost || 0) + (plan.totalCost || 0);
    const updatedPlan: MaterialPlan = {
      ...curr,
      ...plan,
      id: curr.id,
      plannedQuantity: newPlanned,
      totalCost: newTotal,
      updatedAt: Date.now(),
    };
    existing[existingIndex] = updatedPlan;
    saveMaterialPlans(plan.projectId, existing);
    return updatedPlan;
  }

  const now = Date.now();
  const receivedQty = plan.receivedQuantity ?? 0;
  const usedQty = Math.min(receivedQty, plan.usedQuantity ?? 0);
  const newPlan: MaterialPlan = {
    ...plan,
    id: `mat_plan_${now}_${Math.random().toString(36).slice(2, 8)}`,
    status: plan.status || "PLANNED",
    isProjectLevel: !plan.scheduleId,
    receivedQuantity: receivedQty,
    usedQuantity: usedQty,
    unusedQuantity:
      plan.unusedQuantity !== undefined
        ? plan.unusedQuantity
        : Math.max(0, receivedQty - usedQty),
    createdAt: now,
    updatedAt: now,
  };

  const updated = [newPlan, ...existing];
  saveMaterialPlans(plan.projectId, updated);
  return newPlan;
}

export function updateMaterialPlan(
  projectId: string,
  planId: string,
  updates: Partial<Omit<MaterialPlan, "id" | "projectId" | "createdAt">>,
): MaterialPlan | null {
  const existing = loadMaterialPlans(projectId);
  const index = existing.findIndex((p) => p.id === planId);
  if (index === -1) return null;

  const current = existing[index];
  const rec = updates.receivedQuantity !== undefined ? updates.receivedQuantity : (current.receivedQuantity ?? 0);
  const used = Math.min(
    rec,
    updates.usedQuantity !== undefined ? updates.usedQuantity : (current.usedQuantity ?? 0),
  );
  const unused = updates.unusedQuantity !== undefined ? updates.unusedQuantity : Math.max(0, rec - used);

  const updatedPlan: MaterialPlan = {
    ...current,
    ...updates,
    receivedQuantity: rec,
    usedQuantity: used,
    unusedQuantity: unused,
    isProjectLevel: updates.scheduleId !== undefined ? !updates.scheduleId : current.isProjectLevel,
    updatedAt: Date.now(),
  };

  existing[index] = updatedPlan;
  saveMaterialPlans(projectId, existing);
  return updatedPlan;
}

export function getMaterialPlanDailyValues(
  plan: MaterialPlan,
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

export function updateMaterialPlanDateOverride(
  projectId: string,
  planId: string,
  dateKey: string,
  override: DailyMaterialPlanOverride | null,
): MaterialPlan | null {
  const existing = loadMaterialPlans(projectId);
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

  const updatedPlan: MaterialPlan = {
    ...plan,
    dailyOverrides: currentOverrides,
    updatedAt: Date.now(),
  };

  existing[index] = updatedPlan;
  saveMaterialPlans(projectId, existing);
  return updatedPlan;
}

export function deleteMaterialPlan(projectId: string, planId: string): boolean {
  const existing = loadMaterialPlans(projectId);
  const filtered = existing.filter((p) => p.id !== planId);
  if (filtered.length === existing.length) return false;
  saveMaterialPlans(projectId, filtered);
  return true;
}
