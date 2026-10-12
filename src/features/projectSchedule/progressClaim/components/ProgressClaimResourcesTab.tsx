import { useMemo } from "react";
import { PlannerShiftBoard } from "../../components/PlannerShiftBoard";
import { useProjectSchedule } from "../../context/ScheduleProvider";
import { buildPlannerScheduleEntries } from "../../utils/plannerScheduleEntries";
import { useFetchClaimShiftWages } from "../hooks/api/fetch-claim-shift-wages";
import { useFetchClaimShifts } from "../hooks/api/fetch-claim-shifts";
import type { ProgressClaimPlannerScope } from "../types";

/** The Planner's schedule/resource shift gantt without the attendance editor. */
export default function ProgressClaimResourcesTab(scope: ProgressClaimPlannerScope) {
  const { data: schedules, loading: schedulesLoading } = useProjectSchedule();
  // Shifts come back already limited to the claim period.
  const { shifts, loading: shiftsLoading } = useFetchClaimShifts(scope);
  const wageOrganization = useMemo(
    () => ({ organizationId: scope.organizationId, organizationType: scope.organizationType }),
    [scope.organizationId, scope.organizationType],
  );
  // Like the shifts, wages are limited to the claim period.
  const { wageByShiftId } = useFetchClaimShiftWages(scope);

  const entries = useMemo(
    () => buildPlannerScheduleEntries(schedules, shifts),
    [schedules, shifts],
  );

  return (
    <PlannerShiftBoard
      entries={entries}
      loading={schedulesLoading || shiftsLoading}
      readOnly
      wageByShiftId={wageByShiftId}
      wagePeriod={scope.period}
      wageOrganization={wageOrganization}
    />
  );
}
