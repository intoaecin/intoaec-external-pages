/**
 * Trimmed port of intoaec-UI's `ScheduleProvider.tsx`: only the context, its
 * type, the inert default value and `useProjectSchedule`. The full provider
 * (session, socket, schedule/baseline mutations) is admin-only and stays in
 * intoaec-UI; here the context is filled by the read-only
 * `ProgressClaimScheduleProvider` for the progress claim planner tabs.
 */
import { createContext, useContext } from "react";
import type { Schedule, ScheduleSubEvent } from "../types/schedule";
import type { ScheduleBaseline } from "../types/baseline";

export interface ScheduleFilterState {
  type: "all" | "schedule" | "milestone";
  assigneeIds: string[];
  statuses: string[];
  startRange: { from: Date | null; to: Date | null };
  endRange: { from: Date | null; to: Date | null };
}

const DEFAULT_FILTERS: ScheduleFilterState = {
  type: "all",
  assigneeIds: [],
  statuses: [],
  startRange: { from: null, to: null },
  endRange: { from: null, to: null },
};

export function isScheduleFilterActive(filters: ScheduleFilterState): boolean {
  return (
    filters.type !== "all" ||
    filters.assigneeIds.length > 0 ||
    filters.statuses.length > 0 ||
    filters.startRange.from !== null ||
    filters.startRange.to !== null ||
    filters.endRange.from !== null ||
    filters.endRange.to !== null
  );
}

export type ScheduleContextType = {
  viewMode: "day" | "month" | "week";
  setViewMode: (mode: "day" | "month" | "week") => void;
  data: Schedule[];
  filteredData: Schedule[];
  setData: React.Dispatch<React.SetStateAction<Schedule[]>>;
  filters: ScheduleFilterState;
  setFilters: React.Dispatch<React.SetStateAction<ScheduleFilterState>>;
  loading: boolean;
  error: string | null;
  refetch: (silent?: boolean) => Promise<void>;
  handleSchedulesUpdate: (
    updatedTasks: Schedule[],
    deletedScheduleIds?: string[],
    subEvent?: ScheduleSubEvent,
    mainScheduleDetails?: { scheduleId: string; scheduleName: string },
    isFetchSchedule?: boolean,
    isTemplateSchedule?: boolean
  ) => Promise<void>;
  createSchedule: (
    schedule: Schedule | Schedule[],
    refetch?: boolean,
    skipOptimisticUpdate?: boolean,
    isTemplateSchedule?: boolean
  ) => Promise<void>;
  updateScheduleLoading: boolean;
  createScheduleLoading: boolean;
  deleteScheduleLoading: boolean;
  updateScheduleError: string | Error | null;
  createScheduleError: string | null;
  deleteScheduleError: string | null;
  socket: any;
  deleteDependency: (fromScheduleId: string, toScheduleId: string) => void;
  deleteSchedule: (schedule: Schedule) => Promise<void>;
  isProjectScheduleActive: boolean;
  setIsProjectScheduleActive: (isProjectScheduleActive: boolean) => void;
  notifyScheduleCreation: (scheduleId: string) => void;
  subscribeToScheduleCreation: (
    listener: (scheduleId: string) => void
  ) => () => void;
  notifyMilestoneCompletedAt100: (schedule: Schedule) => void;
  lastMilestoneCompletedAt100: Schedule | null;
  clearLastMilestoneCompletedAt100: () => void;
  baselines: ScheduleBaseline[];
  activeBaselineId: string | null;
  activeBaseline: ScheduleBaseline | null;
  baselineLoading: boolean;
  createBaselineLoading: boolean;
  updateBaselineLoading: boolean;
  deleteBaselineLoading: boolean;
  baselineError: unknown;
  refetchBaselines: () => Promise<void>;
  createBaseline: (baselineName: string) => Promise<void>;
  updateBaseline: (baselineId: string, baselineName: string) => Promise<void>;
  deleteBaseline: (baselineId: string) => Promise<void>;
  setActiveBaselineId: React.Dispatch<React.SetStateAction<string | null>>;
};

/** Inert context value; also the base for lightweight read-only providers. */
export const DEFAULT_SCHEDULE_CONTEXT: ScheduleContextType = {
  viewMode: "day",
  setViewMode: () => { },
  data: [],
  filteredData: [],
  setData: (() => { }) as React.Dispatch<React.SetStateAction<Schedule[]>>,
  filters: DEFAULT_FILTERS,
  setFilters: () => { },
  loading: false,
  error: null,
  refetch: async (_silent?: boolean) => { },
  handleSchedulesUpdate: async () => { },
  createSchedule: async () => { },
  updateScheduleLoading: false,
  createScheduleLoading: false,
  deleteScheduleLoading: false,
  updateScheduleError: null,
  createScheduleError: null,
  deleteScheduleError: null,
  socket: null,
  deleteDependency: () => { },
  deleteSchedule: async () => { },
  isProjectScheduleActive: false,
  setIsProjectScheduleActive: () => { },
  notifyScheduleCreation: () => { },
  subscribeToScheduleCreation: () => () => { },
  notifyMilestoneCompletedAt100: () => { },
  lastMilestoneCompletedAt100: null,
  clearLastMilestoneCompletedAt100: () => { },
  baselines: [],
  activeBaselineId: null,
  activeBaseline: null,
  baselineLoading: false,
  createBaselineLoading: false,
  updateBaselineLoading: false,
  deleteBaselineLoading: false,
  baselineError: null,
  refetchBaselines: async () => { },
  createBaseline: async () => { },
  updateBaseline: async () => { },
  deleteBaseline: async () => { },
  setActiveBaselineId: () => { },
};

export const ScheduleContext =
  createContext<ScheduleContextType>(DEFAULT_SCHEDULE_CONTEXT);

export function useProjectSchedule(): ScheduleContextType {
  const context = useContext(ScheduleContext);

  if (!context) {
    throw new Error(
      "useProjectSchedule must be used within a ScheduleProvider"
    );
  }

  return context;
}
