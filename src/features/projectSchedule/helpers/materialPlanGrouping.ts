import type { MaterialPlan } from "../types/materialPlanner";

export interface GroupedMaterialPlan extends MaterialPlan {
  underlyingPlanIds: string[];
}

/**
 * Plans for the same cost catalog material merged into one row with summed
 * quantities and cost. A material typed in by hand (no catalog id) stays on its own.
 */
export const groupMaterialPlans = (plans: MaterialPlan[]): GroupedMaterialPlan[] => {
  const map = new Map<string, GroupedMaterialPlan>();

  (plans || []).forEach((plan) => {
    const explicitCatalogId =
      plan.costCatalogId &&
      plan.costCatalogId !== "null" &&
      plan.costCatalogId !== "undefined" &&
      plan.costCatalogId.trim() !== "" &&
      !plan.costCatalogId.startsWith("manual_")
        ? plan.costCatalogId.trim()
        : undefined;

    const key = explicitCatalogId
      ? `cat_${explicitCatalogId.toLowerCase()}`
      : `individual_${plan.id}`;

    if (!map.has(key)) {
      map.set(key, {
        ...plan,
        costCatalogId: explicitCatalogId || plan.costCatalogId,
        underlyingPlanIds: [plan.id],
      });
    } else {
      const existing = map.get(key)!;
      const totalPlanned = (existing.plannedQuantity || 0) + (plan.plannedQuantity || 0);
      const totalReceived = (existing.receivedQuantity || 0) + (plan.receivedQuantity || 0);
      const totalUsed = (existing.usedQuantity || 0) + (plan.usedQuantity || 0);
      const totalUnused = Math.max(0, totalReceived - totalUsed);
      const totalCost = (existing.totalCost || 0) + (plan.totalCost || 0);

      map.set(key, {
        ...existing,
        plannedQuantity: totalPlanned,
        receivedQuantity: totalReceived,
        usedQuantity: totalUsed,
        unusedQuantity: totalUnused,
        totalCost,
        endDate: Math.max(existing.endDate, plan.endDate),
        isProjectLevel: !existing.scheduleId,
        scheduleId: existing.scheduleId,
        scheduleName: existing.scheduleName,
        costCatalogId: existing.costCatalogId || explicitCatalogId || plan.costCatalogId,
        underlyingPlanIds: [...existing.underlyingPlanIds, plan.id],
      });
    }
  });

  return Array.from(map.values());
};
