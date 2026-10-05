/** A single day's allocated hours for a schedule–assignee pair. */
export interface DaySlice {
  date: Date;
  scheduleId: string;
  scheduleName: string;
  scheduleColor?: string;
  assigneeId: string;
  assigneeName: string;
  /** Allocated hours on this calendar day. */
  hours: number;
  /** true when allocatedHours > calendarCapacity for this assignee on this day. */
  isOverloaded: boolean;
}

export interface AssigneeScheduleEntry {
  scheduleId: string;
  scheduleName: string;
  scheduleColor?: string;
  slices: DaySlice[];
  /** Total hours from schedule_resource table (null = legacy path, not yet stored). */
  totalHours?: number | null;
  /** Default hours per working day from schedule_resource table. */
  hoursPerDay?: number | null;
  /** Authoritative start date from the real Schedule record (ms timestamp). */
  scheduleStartDate?: number | null;
  /** Authoritative end date from the real Schedule record (ms timestamp). */
  scheduleEndDate?: number | null;
  /** Authoritative working-minutes duration from the real Schedule record. */
  scheduleDuration?: number | null;
}

export interface AssigneeWorkload {
  assigneeId: string;
  assigneeName: string;
  schedules: AssigneeScheduleEntry[];
}

/** Planned (scheduled) vs actual (present) headcount for one calendar day. */
export interface PlannerDayTotal {
  planned: number;
  actual: number;
}

/** Quantity planner row: planned quantity per working day of one schedule. */
export interface DailyQuantityRowData {
  scheduleId: string;
  /** The schedule's total planned quantity; entered days may not add up to more. */
  plannedQuantity: number;
  /** Planned quantity per calendar-day key (see `buildDateKey`); only working days inside the schedule have an entry. */
  values: Map<string, number>;
  /** Day keys whose value the user entered (the rest are an even split). */
  overriddenKeys: Set<string>;
}

/** `quantity: null` clears the day's override back to the even split. */
export interface DailyQuantityUpdateInput {
  scheduleId: string;
  date: Date;
  quantity: number | null;
}

export interface WorkloadGanttRow {
  rowKey: string;
  schedule: import("./schedule").Schedule | null;
  barColor?: string;
  collapsedAssigneeId?: string;
  dailyHoursMap?: Map<string, number>;
  editableDailyHours?: {
    assigneeId: string;
    scheduleId: string;
    scheduleStartDate?: number | null;
    scheduleEndDate?: number | null;
  };
  /** Per-date linked-shift rows for a Planner shift row, keyed by calendar-day key (see `buildDateKey`). */
  shiftDayRows?: Map<
    string,
    import("../components/createScheduleModal/scheduleShiftLinkUtils").ScheduleLinkedShiftRow
  >;
  /** Planner totals row: planned/actual headcount per calendar-day key (see `buildDateKey`). */
  dayTotals?: Map<string, PlannerDayTotal>;
  dailyQuantity?: DailyQuantityRowData;
  /** When set, shift attendance badges count only this worker (the editor still shows the whole shift). */
  shiftFocusWorkerId?: string;
  isClickable?: boolean;
  isResourceGroupEnd?: boolean;
}

export type WorkloadRangeKey = "week" | "month" | "3months" | "custom";
