// Trimmed port: the working-calendar types, defaults and normalizers, plus a
// `useFetchWorkingCalendar` that returns the defaults. intoaec-UI's hook reads
// the organization from the next-auth session and stays disabled without one,
// so on its own session-less client page it also resolves to these defaults.

export interface WorkingDays {
  sunday: boolean;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
}

export interface WorkingDayHours {
  startMinute: number;
  endMinute: number;
}

export type WorkingHoursByDay = Record<keyof WorkingDays, WorkingDayHours>;

export const DEFAULT_WORKING_DAY_HOURS: WorkingDayHours = {
  startMinute: 9 * 60,
  endMinute: 17 * 60,
};

export const DEFAULT_WORKING_HOURS_BY_DAY: WorkingHoursByDay = {
  sunday: { ...DEFAULT_WORKING_DAY_HOURS },
  monday: { ...DEFAULT_WORKING_DAY_HOURS },
  tuesday: { ...DEFAULT_WORKING_DAY_HOURS },
  wednesday: { ...DEFAULT_WORKING_DAY_HOURS },
  thursday: { ...DEFAULT_WORKING_DAY_HOURS },
  friday: { ...DEFAULT_WORKING_DAY_HOURS },
  saturday: { ...DEFAULT_WORKING_DAY_HOURS },
};

export interface WorkingCalendarData {
  workingDays: WorkingDays;
  workingHoursByDay: WorkingHoursByDay;
  publicHolidays: Array<{ name: string; date: string }>;
  inheritGlobal?: boolean;
}

/** YYYY-MM-DD for duplicate checks; handles ISO strings and trimmed values from the API. */
export function normalizePublicHolidayDateKey(raw: unknown): string | null {
  if (raw == null) return null;
  if (typeof raw !== "string") return null;
  const match = raw.trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

const DEFAULT_WORKING_CALENDAR: WorkingCalendarData = {
  workingDays: {
    sunday: true,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
  },
  workingHoursByDay: {
    sunday: { ...DEFAULT_WORKING_HOURS_BY_DAY.sunday },
    monday: { ...DEFAULT_WORKING_HOURS_BY_DAY.monday },
    tuesday: { ...DEFAULT_WORKING_HOURS_BY_DAY.tuesday },
    wednesday: { ...DEFAULT_WORKING_HOURS_BY_DAY.wednesday },
    thursday: { ...DEFAULT_WORKING_HOURS_BY_DAY.thursday },
    friday: { ...DEFAULT_WORKING_HOURS_BY_DAY.friday },
    saturday: { ...DEFAULT_WORKING_HOURS_BY_DAY.saturday },
  },
  publicHolidays: [],
  inheritGlobal: true,
};

/** API may return numeric keys "0"–"6" (JS getDay: 0=Sun … 6=Sat) mixed with weekday names; backend UPSERT requires all seven names. */
const WORKING_DAY_ORDER: (keyof WorkingDays)[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function normalizeWorkingDays(raw: unknown): WorkingDays {
  const fallback = DEFAULT_WORKING_CALENDAR.workingDays;
  if (!raw || typeof raw !== "object") {
    return { ...fallback };
  }
  const record = raw as Record<string, unknown>;
  const out: WorkingDays = { ...fallback };
  for (let i = 0; i < WORKING_DAY_ORDER.length; i++) {
    const key = WORKING_DAY_ORDER[i];
    const named = record[key];
    if (typeof named === "boolean") {
      out[key] = named;
      continue;
    }
    const numeric = record[String(i)];
    if (typeof numeric === "boolean") {
      out[key] = numeric;
    }
  }
  return out;
}

function isValidWorkingDayHours(value: unknown): value is WorkingDayHours {
  if (!value || typeof value !== "object") return false;
  const casted = value as WorkingDayHours;
  return Number.isInteger(casted.startMinute) &&
    Number.isInteger(casted.endMinute) &&
    casted.startMinute >= 0 &&
    casted.startMinute <= 1439 &&
    casted.endMinute >= 1 &&
    casted.endMinute <= 1440 &&
    casted.endMinute > casted.startMinute;
}

export function normalizeWorkingHoursByDay(raw: unknown): WorkingHoursByDay {
  if (!raw || typeof raw !== "object") {
    return {
      sunday: { ...DEFAULT_WORKING_HOURS_BY_DAY.sunday },
      monday: { ...DEFAULT_WORKING_HOURS_BY_DAY.monday },
      tuesday: { ...DEFAULT_WORKING_HOURS_BY_DAY.tuesday },
      wednesday: { ...DEFAULT_WORKING_HOURS_BY_DAY.wednesday },
      thursday: { ...DEFAULT_WORKING_HOURS_BY_DAY.thursday },
      friday: { ...DEFAULT_WORKING_HOURS_BY_DAY.friday },
      saturday: { ...DEFAULT_WORKING_HOURS_BY_DAY.saturday },
    };
  }
  const record = raw as Record<string, unknown>;
  const out = normalizeWorkingHoursByDay(null);
  for (const dayKey of WORKING_DAY_ORDER) {
    const dayHours = record[dayKey];
    if (isValidWorkingDayHours(dayHours)) {
      out[dayKey] = {
        startMinute: dayHours.startMinute,
        endMinute: dayHours.endMinute,
      };
    }
  }
  return out;
}

export const useFetchWorkingCalendar = (_projectId?: string | null) => ({
  loading: false,
  data: DEFAULT_WORKING_CALENDAR,
  hasData: false,
  refetch: async () => undefined,
});
