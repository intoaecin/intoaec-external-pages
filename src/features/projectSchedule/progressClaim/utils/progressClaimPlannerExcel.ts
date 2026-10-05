import type { TFunction } from "i18next";
import type { GeneratedShift } from "@/features/worker-management/hooks/useGetShifts";
import {
  EXCEL_MONEY_FORMAT,
  EXCEL_QTY_FORMAT,
  type ExcelCell,
  type ExcelSheetSpec,
} from "@/types/excelExport";
import type { AssetPlan } from "../../types/assetPlanner";
import type { MaterialPlan } from "../../types/materialPlanner";

/** Planner data for the claim; a missing entry means that tab is turned off in the claim settings. */
export interface ProgressClaimPlannerData {
  materials?: MaterialPlan[];
  shifts?: GeneratedShift[];
  assets?: AssetPlan[];
}

interface PlannerSheetFormatters {
  formatDate: (value: number) => string;
  formatTime: (value: number) => string;
  t: TFunction;
}

const optionalNumber = (value?: number | null) =>
  value === undefined || value === null ? null : Number(value);

/** A planner list sheet: one styled header row, frozen while scrolling. */
const listSheet = (
  name: string,
  header: ExcelCell[],
  body: ExcelCell[][],
  columnWidths: number[],
  columnFormats: ExcelSheetSpec["columnFormats"] = [],
): ExcelSheetSpec => ({
  name,
  rows: [header, ...body],
  columnWidths,
  columnFormats,
  rowStyles: [{ row: 0, style: "header" }],
  freezeRows: 1,
});

export const buildMaterialsSheet = (
  name: string,
  plans: MaterialPlan[],
  { formatDate, t }: PlannerSheetFormatters,
): ExcelSheetSpec =>
  listSheet(
    name,
    [
      t("schedule.scheduleName"), t("schedule.materialName"), t("common.category"), t("common.unit"),
      t("schedule.plannedQuantity"), t("schedule.receivedQty"), t("schedule.usedQty"),
      t("schedule.unusedQty"), t("common.rate"), t("common.totalCost"),
      t("common.startDate"), t("common.endDate"),
    ],
    plans.map((plan) => [
      plan.scheduleName || t("schedule.projectLevel"),
      plan.materialName,
      plan.category ?? null,
      plan.unit ?? null,
      Number(plan.plannedQuantity) || 0,
      optionalNumber(plan.receivedQuantity),
      optionalNumber(plan.usedQuantity),
      optionalNumber(plan.unusedQuantity),
      optionalNumber(plan.rate),
      optionalNumber(plan.totalCost),
      formatDate(plan.startDate),
      formatDate(plan.endDate),
    ]),
    [30, 30, 16, 8, 12, 12, 12, 12, 14, 16, 14, 14],
    [
      ...[4, 5, 6, 7].map((column) => ({ column, numberFormat: EXCEL_QTY_FORMAT })),
      ...[8, 9].map((column) => ({ column, numberFormat: EXCEL_MONEY_FORMAT })),
    ],
  );

/** One row per shift linked to a schedule — the same shifts the Resources tab shows. */
export const buildResourcesSheet = (
  name: string,
  shifts: GeneratedShift[],
  { formatDate, formatTime, t }: PlannerSheetFormatters,
): ExcelSheetSpec => {
  const linkedShifts = shifts
    .filter((shift) => shift.linkedScheduleId)
    .sort((a, b) => Number(a.startDate) - Number(b.startDate));

  return listSheet(
    name,
    [
      t("common.date"), t("schedule.scheduleName"), t("common.shiftName"),
      t("common.startTime"), t("common.endTime"), t("common.workers"),
      t("progressClaim.table.workerNames"),
    ],
    linkedShifts.map((shift) => {
      const workers = shift.workers ?? [];
      return [
        formatDate(Number(shift.startDate)),
        shift.linkedScheduleName ?? null,
        shift.generatedShiftName || shift.shiftName,
        shift.startTime ? formatTime(Number(shift.startTime)) : null,
        shift.endTime ? formatTime(Number(shift.endTime)) : null,
        workers.length,
        workers.map((worker) => worker.workerName).join(", ") || null,
      ];
    }),
    [14, 30, 24, 12, 12, 10, 50],
  );
};

export const buildAssetsSheet = (
  name: string,
  plans: AssetPlan[],
  { formatDate, t }: PlannerSheetFormatters,
): ExcelSheetSpec => {
  const statusLabel: Record<AssetPlan["status"], string> = {
    PLANNED: t("schedule.planned"),
    REQUESTED: t("schedule.requested"),
    RECEIVED: t("schedule.received"),
  };

  return listSheet(
    name,
    [
      t("schedule.scheduleName"), t("common.assetName").trim(), t("common.serial"),
      t("common.category"), t("schedule.plannedQuantity"), t("schedule.receivedQty"),
      t("common.startDate"), t("common.endDate"), t("common.status"),
    ],
    plans.map((plan) => [
      plan.scheduleName || t("schedule.projectLevel"),
      plan.assetName,
      plan.assetSerial ?? null,
      plan.assetCategory ?? null,
      Number(plan.plannedQuantity) || 0,
      optionalNumber(plan.receivedQuantity),
      formatDate(plan.startDate),
      formatDate(plan.endDate),
      statusLabel[plan.status] ?? plan.status,
    ]),
    [30, 30, 16, 16, 12, 12, 14, 14, 12],
    [4, 5].map((column) => ({ column, numberFormat: EXCEL_QTY_FORMAT })),
  );
};
