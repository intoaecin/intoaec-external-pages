import type { AssetPlan } from "../types/assetPlanner";
import type { MaterialPlan } from "../types/materialPlanner";

/** Maps a Leadmanager material plan record to the UI shape. */
export const toMaterialPlan = (item: any): MaterialPlan => ({
  id: item.id,
  projectId: item.projectId,
  scheduleId: item.scheduleId || undefined,
  scheduleName: item.scheduleName || undefined,
  isProjectLevel: item.isProjectLevel ?? !item.scheduleId,
  costCatalogId: item.costCatalogId || undefined,
  materialId: item.materialId,
  materialName: item.materialName,
  category: item.category,
  unit: item.unit || "pcs",
  rate: item.rate !== undefined ? Number(item.rate) : undefined,
  plannedQuantity: Number(item.plannedQuantity) || 1,
  receivedQuantity: item.receivedQuantity !== undefined && item.receivedQuantity !== null
    ? Number(item.receivedQuantity)
    : undefined,
  usedQuantity: item.usedQuantity !== undefined && item.usedQuantity !== null
    ? Number(item.usedQuantity)
    : 0,
  unusedQuantity: item.unusedQuantity !== undefined && item.unusedQuantity !== null
    ? Number(item.unusedQuantity)
    : Math.max(0, (Number(item.receivedQuantity) || 0) - (Number(item.usedQuantity) || 0)),
  totalCost: item.totalCost !== undefined && item.totalCost !== null
    ? Number(item.totalCost)
    : undefined,
  startDate: Number(item.startDate),
  endDate: Number(item.endDate),
  status: item.status || "PLANNED",
  requestId: item.requestId,
  indentId: item.indentId || undefined,
  indentSerial: item.indentSerial || undefined,
  indentStatus: item.indentStatus || undefined,
  convertedToIndentOn: item.convertedToIndentOn
    ? Number(item.convertedToIndentOn)
    : undefined,
  sourceEstimateId: item.sourceEstimateId,
  sourceLineItemId: item.sourceLineItemId,
  createdFromInventoryItemId: item.createdFromInventoryItemId,
  notes: item.notes,
  dailyOverrides: item.dailyOverrides || {},
  createdAt: Number(item.createdAt),
  updatedAt: Number(item.updatedAt),
});

export type StoredAssetPlan = Omit<
  AssetPlan,
  "id" | "assetName" | "assetSerial" | "assetCategory"
> & {
  projectAssetPlanId: string;
  asset?: {
    assetName?: string;
    assetSerial?: string;
    category?: string;
    assetType?: string;
  };
};

/** Maps a Procurement project asset plan record to the UI shape. */
export const toAssetPlan = (plan: StoredAssetPlan): AssetPlan => ({
  ...plan,
  id: plan.projectAssetPlanId,
  startDate: Number(plan.startDate),
  endDate: Number(plan.endDate),
  plannedQuantity: Number(plan.plannedQuantity),
  receivedQuantity:
    plan.receivedQuantity === undefined
      ? undefined
      : Number(plan.receivedQuantity),
  assetName: plan.asset?.assetName || "Asset",
  assetSerial: plan.asset?.assetSerial || "",
  assetCategory: plan.asset?.category || "",
  assetType: plan.asset?.assetType || plan.assetType,
});
