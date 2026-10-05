import { roundNumber } from "@/utils/numbers";
import {
  eachCalendarDayInTimezone,
  getDateKeyInTimezone,
} from "../helpers/dateUtil";
import type { Schedule } from "../types/schedule";
import type { DailyQuantityRowData } from "../types/workload";
import { buildDateKey } from "./workloadDateKeys";

/** Per-day planned quantity overrides keyed by YYYY-MM-DD (org timezone). */
export type DailyPlannedQuantities = Record<string, number>;

const MISMATCH_TOLERANCE = 0.01;

export interface QuantityPlanDays {
  /** Effective planned quantity per working day in the schedule range, keyed by `buildDateKey`. */
  values: Map<string, number>;
  /** Days whose value was entered by the user rather than split evenly. */
  overriddenKeys: Set<string>;
  planned: number;
  allocated: number;
  isMismatch: boolean;
}

type QuantityPlanSchedule = Pick<
  Schedule,
  | "scheduleStartDate"
  | "scheduleEndDate"
  | "plannedQuantity"
  | "dailyPlannedQuantities"
>;

export function getPlannedQuantity(
  schedule: Pick<Schedule, "plannedQuantity">,
): number {
  const planned = Number(schedule.plannedQuantity);
  return Number.isFinite(planned) && planned > 0 ? planned : 0;
}

export function hasQuantityPlanInputs(schedule: QuantityPlanSchedule): boolean {
  return Boolean(
    getPlannedQuantity(schedule) > 0 &&
      schedule.scheduleStartDate &&
      schedule.scheduleEndDate,
  );
}

/**
 * Spreads the schedule's planned quantity over its working days: a day the
 * user overrode keeps that value, the other working days evenly share what is
 * left of the total. Off-days and days outside the schedule get no entry.
 */
export function buildQuantityPlanDays({
  schedule,
  isDateOffDay,
  organizationTimezone,
}: {
  schedule: QuantityPlanSchedule;
  isDateOffDay: (date: Date) => boolean;
  organizationTimezone: string;
}): QuantityPlanDays {
  const planned = getPlannedQuantity(schedule);
  const values = new Map<string, number>();
  const overriddenKeys = new Set<string>();

  if (!hasQuantityPlanInputs(schedule)) {
    return { values, overriddenKeys, planned, allocated: 0, isMismatch: false };
  }

  const overrides = schedule.dailyPlannedQuantities ?? {};
  const workingDays = eachCalendarDayInTimezone(
    new Date(schedule.scheduleStartDate),
    new Date(schedule.scheduleEndDate),
    organizationTimezone,
  ).filter((date) => !isDateOffDay(date));

  const openDayKeys: string[] = [];
  let overriddenTotal = 0;
  for (const date of workingDays) {
    const chartKey = buildDateKey(date);
    const override = overrides[getDateKeyInTimezone(date, organizationTimezone)];
    if (typeof override === "number" && override >= 0) {
      overriddenKeys.add(chartKey);
      values.set(chartKey, override);
      overriddenTotal += override;
    } else {
      openDayKeys.push(chartKey);
      values.set(chartKey, 0);
    }
  }

  // Days the user hasn't touched share whatever the entered days leave over,
  // so the plan never adds up to more than the planned quantity. The last
  // open day absorbs the rounding difference.
  const remaining = Math.max(0, roundNumber(planned - overriddenTotal, 2));
  const evenShare = openDayKeys.length
    ? roundNumber(remaining / openDayKeys.length, 2)
    : 0;
  openDayKeys.forEach((chartKey, index) => {
    const isLast = index === openDayKeys.length - 1;
    values.set(
      chartKey,
      isLast
        ? Math.max(0, roundNumber(remaining - evenShare * index, 2))
        : evenShare,
    );
  });

  const allocated = roundNumber(
    overriddenTotal + (openDayKeys.length ? remaining : 0),
    2,
  );

  return {
    values,
    overriddenKeys,
    planned,
    allocated,
    isMismatch: Math.abs(allocated - planned) > MISMATCH_TOLERANCE,
  };
}

export function toDailyQuantityRowData(
  scheduleId: string,
  plan: QuantityPlanDays,
): DailyQuantityRowData {
  return {
    scheduleId,
    plannedQuantity: plan.planned,
    values: plan.values,
    overriddenKeys: plan.overriddenKeys,
  };
}

/** Drops overrides that fall outside the schedule's current date range. */
export function pruneDailyPlannedQuantities(
  schedule: QuantityPlanSchedule,
  organizationTimezone: string,
): DailyPlannedQuantities | null {
  const overrides = schedule.dailyPlannedQuantities;
  if (!overrides || !hasQuantityPlanInputs(schedule)) return null;

  const firstKey = getDateKeyInTimezone(
    new Date(schedule.scheduleStartDate),
    organizationTimezone,
  );
  const lastKey = getDateKeyInTimezone(
    new Date(schedule.scheduleEndDate),
    organizationTimezone,
  );
  const pruned: DailyPlannedQuantities = {};
  for (const [key, value] of Object.entries(overrides)) {
    if (key >= firstKey && key <= lastKey) pruned[key] = value;
  }

  return Object.keys(pruned).length ? pruned : null;
}

/** Sets (or, with `null`, clears) the override for one day. */
export function applyQuantityOverride({
  schedule,
  date,
  quantity,
  organizationTimezone,
}: {
  schedule: QuantityPlanSchedule;
  date: Date;
  quantity: number | null;
  organizationTimezone: string;
}): DailyPlannedQuantities | null {
  const next: DailyPlannedQuantities = {
    ...(pruneDailyPlannedQuantities(schedule, organizationTimezone) ?? {}),
  };
  const key = getDateKeyInTimezone(date, organizationTimezone);

  if (quantity === null) {
    delete next[key];
  } else {
    // One day can take at most what the other entered days leave of the total.
    const { [key]: _current, ...otherDays } = next;
    const enteredElsewhere = Object.values(otherDays).reduce(
      (sum, value) => sum + value,
      0,
    );
    const maxForDay = Math.max(
      0,
      roundNumber(getPlannedQuantity(schedule) - enteredElsewhere, 2),
    );
    next[key] = Math.min(quantity, maxForDay);
  }

  return Object.keys(next).length ? next : null;
}
