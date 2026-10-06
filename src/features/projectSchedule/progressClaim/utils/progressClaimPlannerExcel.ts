import type { TFunction } from "i18next";
import type { GeneratedShift } from "@/features/worker-management/hooks/useGetShifts";
import {
  EXCEL_MONEY_FORMAT,
  EXCEL_QTY_FORMAT,
  type ExcelCell,
  type ExcelRowStyle,
  type ExcelSheetSpec,
} from "@/types/excelExport";
import type { AssetPlan } from "../../types/assetPlanner";
import type { MaterialPlan } from "../../types/materialPlanner";
import { getShiftPresentSummary } from "../../components/createScheduleModal/scheduleShiftGridUtils";
import { eachCalendarDayInTimezone, getDateKeyInTimezone } from "../../helpers/dateUtil";
import type { PlannerQuantityEntry } from "../../hooks/usePlannerQuantityEntries";
import { buildDateKey } from "../../utils/workloadDateKeys";

/** Planner data for the claim; a missing entry means that tab is turned off in the claim settings. */
export interface ProgressClaimPlannerData {
  materials?: MaterialPlan[];
  shifts?: GeneratedShift[];
  /** Wage per shift id for the claim period; missing when wages couldn't be loaded. */
  shiftWages?: Map<string, number>;
  assets?: AssetPlan[];
  /** Schedules running in the claim period with their per-day quantity plan (the Quantity tab). */
  quantity?: PlannerQuantityEntry[];
}

interface PlannerSheetFormatters {
  formatDate: (value: number) => string;
  formatTime: (value: number) => string;
  /** The organization's timezone, which decides the day a timestamp falls on. */
  timeZone: string;
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

/** YYYY-MM-DD of a timestamp in the organization's timezone — the day a shift's column is. */
const toDayKey = (timestamp: number, timeZone: string): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date(timestamp));

const DAY_MS = 24 * 60 * 60 * 1000;

/** Every day from the first to the last key, as [key, "Mon 5 Oct"] pairs. */
const buildDayColumns = (dayKeys: string[]): Array<{ key: string; label: string }> => {
  const sorted = [...dayKeys].sort();
  if (sorted.length === 0) return [];
  const labelFormat = new Intl.DateTimeFormat(undefined, {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const columns: Array<{ key: string; label: string }> = [];
  const last = Date.parse(sorted[sorted.length - 1]);
  // Keys parse as UTC midnights, so stepping a day at a time never skips or repeats one.
  for (let day = Date.parse(sorted[0]); day <= last; day += DAY_MS) {
    const date = new Date(day);
    columns.push({ key: date.toISOString().slice(0, 10), label: labelFormat.format(date) });
  }
  return columns;
};

interface DayHeadcount {
  planned: number;
  actual: number;
}

const addHeadcount = (totals: Map<string, DayHeadcount>, dayKey: string, shift: GeneratedShift) => {
  const { present, total } = getShiftPresentSummary(shift);
  const previous = totals.get(dayKey) ?? { planned: 0, actual: 0 };
  totals.set(dayKey, { planned: previous.planned + total, actual: previous.actual + present });
};

/**
 * The Resources tab as a grid: one column per day, a row per schedule with its
 * shifts underneath, and each day's planned / actual headcount in the cell —
 * the same figures the tab's badges show. `shiftWages` adds a Wage column.
 */
export const buildResourcesSheet = (
  name: string,
  shifts: GeneratedShift[],
  { t }: PlannerSheetFormatters,
  shiftWages?: Map<string, number>,
): ExcelSheetSpec => {
  const linkedShifts = shifts
    .filter((shift) => shift.linkedScheduleId)
    .sort((a, b) => Number(a.startDate) - Number(b.startDate));

  const totals = new Map<string, DayHeadcount>();
  const schedules = new Map<
    string,
    {
      name: string;
      days: Map<string, DayHeadcount>;
      shifts: Map<string, { name: string; days: Map<string, DayHeadcount> }>;
    }
  >();
  linkedShifts.forEach((shift) => {
    const dayKey = toDayKey(Number(shift.startDate), shift.organizationTimezone || "UTC");
    const scheduleId = shift.linkedScheduleId as string;
    const schedule = schedules.get(scheduleId) ?? {
      name: shift.linkedScheduleName ?? "",
      days: new Map(),
      shifts: new Map(),
    };
    const shiftKey = shift.shiftId || shift.generatedShiftId;
    const shiftRow = schedule.shifts.get(shiftKey) ?? {
      name: shift.shiftName || shift.generatedShiftName,
      days: new Map(),
    };
    addHeadcount(totals, dayKey, shift);
    addHeadcount(schedule.days, dayKey, shift);
    addHeadcount(shiftRow.days, dayKey, shift);
    schedule.shifts.set(shiftKey, shiftRow);
    schedules.set(scheduleId, schedule);
  });

  const columns = buildDayColumns([...totals.keys()]);
  const dayCells = (days: Map<string, DayHeadcount>): ExcelCell[] =>
    columns.map(({ key }) => {
      const day = days.get(key);
      return day ? `${day.planned} / ${day.actual}` : null;
    });
  // The wage column only appears when wages were loaded for the claim.
  const wageCells = (wage: number): ExcelCell[] => (shiftWages ? [wage] : []);
  const shiftWage = (shiftKey: string) => shiftWages?.get(shiftKey) ?? 0;

  const rows: ExcelCell[][] = [
    [
      t("schedule.scheduleName"),
      ...(shiftWages ? [t("timeTracking.wage")] : []),
      ...columns.map(({ label }) => label),
    ],
  ];
  const rowStyles: NonNullable<ExcelSheetSpec["rowStyles"]> = [{ row: 0, style: "header" }];

  const scheduleWage = (schedule: { shifts: Map<string, unknown> }) =>
    [...schedule.shifts.keys()].reduce((sum, shiftKey) => sum + shiftWage(shiftKey), 0);
  const totalWage = [...schedules.values()].reduce((sum, schedule) => sum + scheduleWage(schedule), 0);

  rowStyles.push({ row: rows.length, style: "total" });
  rows.push([t("schedule.plannerTotalsRow"), ...wageCells(totalWage), ...dayCells(totals)]);

  schedules.forEach((schedule) => {
    rowStyles.push({ row: rows.length, style: "section" });
    rows.push([schedule.name, ...wageCells(scheduleWage(schedule)), ...dayCells(schedule.days)]);
    schedule.shifts.forEach((shiftRow, shiftKey) => {
      // Indented, like the shift rows under a schedule on the tab.
      rows.push([`    ${shiftRow.name}`, ...wageCells(shiftWage(shiftKey)), ...dayCells(shiftRow.days)]);
    });
  });

  return {
    name,
    rows,
    rowStyles,
    columnWidths: [36, ...(shiftWages ? [16] : []), ...columns.map(() => 14)],
    columnFormats: shiftWages ? [{ column: 1, numberFormat: EXCEL_MONEY_FORMAT }] : [],
    freezeRows: 1,
  };
};

/** A day-grid sheet: fixed columns, then one column per day, header frozen. */
const dayGridSheet = (
  name: string,
  fixedHeader: ExcelCell[],
  fixedWidths: number[],
  columns: Array<{ key: string; label: string }>,
  body: Array<{ cells: ExcelCell[]; days: Map<string, ExcelCell>; style?: ExcelRowStyle }>,
  columnFormats: ExcelSheetSpec["columnFormats"] = [],
): ExcelSheetSpec => ({
  name,
  rows: [
    [...fixedHeader, ...columns.map(({ label }) => label)],
    ...body.map(({ cells, days }) => [...cells, ...columns.map(({ key }) => days.get(key) ?? null)]),
  ],
  rowStyles: [
    { row: 0, style: "header" },
    ...body.flatMap(({ style }, index) => (style ? [{ row: index + 1, style }] : [])),
  ],
  columnWidths: [...fixedWidths, ...columns.map(() => 14)],
  columnFormats: [
    ...columnFormats,
    ...columns.map((_, index) => ({
      column: fixedHeader.length + index,
      numberFormat: EXCEL_QTY_FORMAT,
    })),
  ],
  freezeRows: 1,
});

/**
 * The Assets tab as a grid: one column per day, a row per schedule with its
 * assets underneath, and the quantity planned for each day the asset is booked
 * (a day's own override when it has one).
 */
export const buildAssetsSheet = (
  name: string,
  plans: AssetPlan[],
  { timeZone, t }: PlannerSheetFormatters,
): ExcelSheetSpec => {
  const statusLabel: Record<AssetPlan["status"], string> = {
    PLANNED: t("schedule.planned"),
    REQUESTED: t("schedule.requested"),
    RECEIVED: t("schedule.received"),
  };

  const totals = new Map<string, ExcelCell>();
  const bySchedule = new Map<string, Array<{ plan: AssetPlan; days: Map<string, ExcelCell> }>>();
  [...plans]
    .sort((a, b) => a.startDate - b.startDate)
    .forEach((plan) => {
      const days = new Map<string, ExcelCell>();
      eachCalendarDayInTimezone(new Date(plan.startDate), new Date(plan.endDate), timeZone).forEach(
        (date) => {
          const dayKey = getDateKeyInTimezone(date, timeZone);
          const quantity =
            Number(plan.dailyOverrides?.[dayKey]?.plannedQuantity ?? plan.plannedQuantity) || 0;
          days.set(dayKey, quantity);
          totals.set(dayKey, (Number(totals.get(dayKey)) || 0) + quantity);
        },
      );
      const scheduleName = plan.scheduleName || t("schedule.projectLevel");
      bySchedule.set(scheduleName, [...(bySchedule.get(scheduleName) ?? []), { plan, days }]);
    });

  const body: Parameters<typeof dayGridSheet>[4] = [
    { cells: [t("common.total"), null, null], days: totals, style: "total" },
  ];
  bySchedule.forEach((assetRows, scheduleName) => {
    body.push({ cells: [scheduleName, null, null], days: new Map(), style: "section" });
    assetRows.forEach(({ plan, days }) =>
      body.push({
        // Indented, like the asset rows under a schedule on the tab.
        cells: [`    ${plan.assetName}`, plan.assetSerial ?? null, statusLabel[plan.status] ?? plan.status],
        days,
      }),
    );
  });

  return dayGridSheet(
    name,
    [t("common.assetName").trim(), t("common.serial"), t("common.status")],
    [36, 16, 14],
    buildDayColumns([...totals.keys()]),
    body,
  );
};

/**
 * The Quantity tab as a grid: one column per day, a row per schedule, and the
 * quantity planned for each working day.
 */
export const buildQuantitySheet = (
  name: string,
  entries: PlannerQuantityEntry[],
  { timeZone, t }: PlannerSheetFormatters,
): ExcelSheetSpec => {
  const dayKeys = new Set<string>();
  const body = entries.map(({ schedule, plan }) => {
    const days = new Map<string, ExcelCell>();
    // The plan keys its days the chart's way; re-key them by calendar day for the columns.
    eachCalendarDayInTimezone(
      new Date(schedule.scheduleStartDate),
      new Date(schedule.scheduleEndDate),
      timeZone,
    ).forEach((date) => {
      const quantity = plan.values.get(buildDateKey(date));
      if (quantity === undefined) return;
      const dayKey = getDateKeyInTimezone(date, timeZone);
      days.set(dayKey, quantity);
      dayKeys.add(dayKey);
    });
    return { cells: [schedule.scheduleName, plan.planned, schedule.quantityUnit ?? null], days };
  });

  return dayGridSheet(
    name,
    [t("schedule.scheduleName"), t("schedule.plannedQuantity"), t("common.unit")],
    [36, 16, 10],
    buildDayColumns([...dayKeys]),
    body,
    [{ column: 1, numberFormat: EXCEL_QTY_FORMAT }],
  );
};
