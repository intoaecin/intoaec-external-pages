import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { convertTimestampToDate } from "../../../helpers/dateUtil";
import type { Schedule } from "../../../types/schedule";
import type { ProgressClaimPlannerScope } from "../../types";

export const useFetchClaimSchedules = ({
  organizationId,
  organizationType,
  projectId,
  withAuth,
}: ProgressClaimPlannerScope) => {
  const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
  const { post } = useAxios(NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/project-schedule", withAuth);

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

      return (response.body?.result ?? []).map((schedule: Schedule) => ({
        ...schedule,
        scheduleStartDate: convertTimestampToDate(schedule.scheduleStartDate),
        scheduleEndDate: convertTimestampToDate(schedule.scheduleEndDate),
        scheduleDeadlineDate: schedule.scheduleDeadlineDate
          ? convertTimestampToDate(schedule.scheduleDeadlineDate)
          : null,
      }));
    },
    enabled: Boolean(organizationId && projectId),
  });

  return { schedules: query.data ?? [], loading: query.isLoading };
};
