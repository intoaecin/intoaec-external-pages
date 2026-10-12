import type { NumberInputBoxValue } from "@/components_v2/NumberInputBox";
import type { GeneratedShift } from "@/features/worker-management/hooks/useGetShifts";
import type { Schedule } from "../types/schedule";
import type { StoredAssetPlan } from "../utils/plannerPlanMappers";

export interface ProgressClaimLine {
  id: string;
  scheduleId: string;
  parentId: string | null;
  name: string;
  depth: number;
  /** Parent/group rows are read-only weighted subtotals; only leaf rows are billable. */
  isGroup: boolean;
  claimValue: number;
  /** The line's planned quantity; null when the schedule isn't quantity-based (and for groups). */
  plannedQuantity: number | null;
  unit: string | null;
  previousAcceptedPct: number;
  /** What earlier claims actually had accepted for this line (a sum, for groups). */
  previousAcceptedAmount: number;
  scheduleSuggestedPct: number;
  /** "" while the user is mid-edit and has cleared the field. */
  claimPct: NumberInputBoxValue;
  periodAmount: number;
  /** Whether the PM has checked this line in to be included in the claim. */
  selected: boolean;
}

export interface ProgressClaimTotals {
  claimValue: number;
  previousAcceptedAmount: number;
  periodAmount: number;
}

/** Which project's planner data a claim tab reads, and whether the viewer is signed in. */
export interface ProgressClaimPlannerScope {
  organizationId?: string;
  /** Sent with schedule fetches: without a session the backend can't take it from the token. */
  organizationType?: string;
  projectId?: string;
  /** A saved claim's id: its tabs read the planner data saved with the claim. */
  progressClaimId?: string;
  /** False on the external client page, which authenticates with the apiKey instead. */
  withAuth: boolean;
  /** When set, only planner data inside the claim period is shown. */
  period?: ProgressClaimPeriod | null;
}

/** The days a claim covers, as epoch ms (inclusive at both ends). */
export interface ProgressClaimPeriod {
  from: number;
  to: number;
}

/** Project-level choice of which planner tabs progress claims show. */
export interface ProgressClaimSettings {
  showMaterials: boolean;
  showResources: boolean;
  showAssets: boolean;
}

/**
 * The planner data saved with a claim, as it stood when the claim was last
 * saved. Each section holds the rows as their own fetch endpoint returns them.
 */
export interface ProgressClaimPlannerSnapshot {
  progressClaimId: string;
  capturedAt: number | string;
  /** The organization's timezone and the project's working calendar: what the per-day quantity plan is built from. */
  timezone: string;
  workingCalendar: {
    workingDays?: unknown;
    workingHoursByDay?: unknown;
    publicHolidays?: Array<{ name: string; date: string }>;
  } | null;
  schedules: Schedule[];
  materials: unknown[];
  shifts: GeneratedShift[];
  /** Wage per shift id for the claim period (overtime included). */
  shiftWages?: Record<string, number>;
  assets: StoredAssetPlan[];
}
