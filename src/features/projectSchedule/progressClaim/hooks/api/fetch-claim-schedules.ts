import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { convertTimestampToDate } from "../../../helpers/dateUtil";
import type { Schedule } from "../../../types/schedule";
import type { ProgressClaimPlannerScope } from "../../types";
import { useFetchClaimPlannerSnapshot } from "./fetch-claim-planner-snapshot";

const toClaimSchedule = (schedule: Schedule): Schedule => ({
  ...schedule,
  scheduleStartDate: convertTimestampToDate(schedule.scheduleStartDate),
  scheduleEndDate: convertTimestampToDate(schedule.scheduleEndDate),
  scheduleDeadlineDate: schedule.scheduleDeadlineDate
    ? convertTimestampToDate(schedule.scheduleDeadlineDate)
    : null,
});

/** The claim's schedules: the ones saved with it, else the project's live schedules. */
export const useFetchClaimSchedules = (scope: ProgressClaimPlannerScope) => {
  const { organizationId, organizationType, projectId, withAuth } = scope;
  const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
  const { post } = useAxios(NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/project-schedule", withAuth);
  const { snapshot, pending } = useFetchClaimPlannerSnapshot(scope);

  const query = useQuery({
    queryKey: ["progress-claim-schedules", organizationId, organizationType, projectId, withAuth],
    queryFn: async (): Promise<Schedule[]> => {
      const response = await post({
        eventType: "FETCH_ALL_SCHEDULE",
        organizationId,
        organizationType,
        projectIds: [projectId],
        isTemplateSchedule: false,
      });
      if (response?.code !== "SCHEDULES_FETCHED") return [];

      return (response.body?.result ?? []).map(toClaimSchedule);
    },
    enabled: !pending && !snapshot && Boolean(organizationId && projectId),
  });

  const savedSchedules = useMemo(() => snapshot?.schedules.map(toClaimSchedule), [snapshot]);

  return { schedules: savedSchedules ?? query.data ?? [], loading: pending || query.isLoading };
};
