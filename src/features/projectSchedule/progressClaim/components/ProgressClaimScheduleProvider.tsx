import { useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_SCHEDULE_CONTEXT,
  ScheduleContext,
  type ScheduleContextType,
} from "../../context/ScheduleProvider";
import { useFetchClaimSchedules } from "../hooks/api/fetch-claim-schedules";
import type { ProgressClaimPlannerScope } from "../types";

interface ProgressClaimScheduleProviderProps extends ProgressClaimPlannerScope {
  children: ReactNode;
}

/**
 * Read-only stand-in for ScheduleProvider: gives the Planner boards the
 * project's schedules and a view mode, without the full provider's session,
 * socket and mutation wiring (the client page has no session).
 */
export default function ProgressClaimScheduleProvider({
  children,
  ...scope
}: ProgressClaimScheduleProviderProps) {
  const { schedules, loading } = useFetchClaimSchedules(scope);
  const [viewMode, setViewMode] = useState<ScheduleContextType["viewMode"]>("day");

  const value = useMemo<ScheduleContextType>(
    () => ({
      ...DEFAULT_SCHEDULE_CONTEXT,
      viewMode,
      setViewMode,
      data: schedules,
      filteredData: schedules,
      loading,
    }),
    [loading, schedules, viewMode],
  );

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}
