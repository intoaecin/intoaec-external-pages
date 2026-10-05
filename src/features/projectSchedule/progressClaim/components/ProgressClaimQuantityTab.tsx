import { useMemo } from "react";
import { PlannerQuantityBoard } from "../../components/planner/PlannerQuantityBoard";
import {
  buildPlannerQuantityRows,
  usePlannerQuantityEntries,
} from "../../hooks/usePlannerQuantityEntries";
import type { ProgressClaimPlannerScope } from "../types";
import { isScheduleInClaimPeriod } from "../utils/progressClaimPeriod";

/** The Planner's per-day quantity plan without editing, for schedules running in the claim period. */
export default function ProgressClaimQuantityTab({ projectId, period }: ProgressClaimPlannerScope) {
  const { entries, loading } = usePlannerQuantityEntries(projectId);

  const periodEntries = useMemo(
    () => entries.filter(({ schedule }) => isScheduleInClaimPeriod(schedule, period)),
    [entries, period],
  );
  const rows = useMemo(() => buildPlannerQuantityRows(periodEntries), [periodEntries]);

  return <PlannerQuantityBoard entries={periodEntries} rows={rows} loading={loading} readOnly />;
}
