import { useMemo } from "react";
import { PlannerQuantityBoard } from "../../components/planner/PlannerQuantityBoard";
import { buildPlannerQuantityRows } from "../../hooks/usePlannerQuantityEntries";
import { useClaimQuantityEntries } from "../hooks/useClaimQuantityEntries";
import type { ProgressClaimPlannerScope } from "../types";

/** The Planner's per-day quantity plan without editing, for schedules running in the claim period. */
export default function ProgressClaimQuantityTab(scope: ProgressClaimPlannerScope) {
  const { entries, loading } = useClaimQuantityEntries(scope);
  const rows = useMemo(() => buildPlannerQuantityRows(entries), [entries]);

  return <PlannerQuantityBoard entries={entries} rows={rows} loading={loading} readOnly />;
}
