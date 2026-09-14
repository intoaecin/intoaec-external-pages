import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useLeadData } from "@/features/components/providers/LeadProfileProvider";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Ported from intoaec-UI `src/features/ClientReport/hooks/useClientReportSchedules.ts`.
 * The source hook also reads `next-auth`'s `useSession()` and prefers
 * `session?.["custom:organization_id"/"custom:organization_type"]` over
 * `useOrganization()`'s values as the organization id/type. This app has no
 * next-auth session (it's a public, apiKey-only app), so that fallback is
 * dropped and `useOrganization()` (already the source's own fallback) is used
 * directly — same effective result for this app as the source's resolved
 * value would be with no session.
 */

export type ClientReportSchedule = {
  scheduleId: string;
  projectName?: string;
  scheduleName?: string;
  scheduleCompletionPercentage?: number | string;
  childrenIds?: string[];
};

type FetchSchedulesResponse = {
  code?: string;
  body?: {
    result?: ClientReportSchedule[];
  };
};

type ClientReportDateRange = {
  startDate?: number;
  endDate?: number;
};

type UseClientReportSchedulesOptions = {
  enabled?: boolean;
  assigneeUserId?: string;
};

const getDefaultScheduleRange = () => {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate: startDate.getTime(),
    endDate: endDate.getTime(),
  };
};

export const useClientReportSchedules = (
  dateRange?: ClientReportDateRange,
  options: UseClientReportSchedulesOptions = {},
) => {
  const { enabled = true } = options;
  const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
  const { post } = useAxios<FetchSchedulesResponse>(
    NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/session",
  );
  const postRef = useRef(post);
  const { organizationId, organizationType } = useOrganization();
  const { leadData } = useLeadData();
  const [schedules, setSchedules] = useState<ClientReportSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const scheduleRange = useMemo(() => {
    if (dateRange?.startDate && dateRange?.endDate) {
      return dateRange;
    }

    return getDefaultScheduleRange();
  }, [dateRange]);
  const resolvedOrganizationId = organizationId;
  const resolvedOrganizationType = organizationType;
  const projectIds = useMemo(
    () => (leadData?.projectId ? [leadData.projectId] : []),
    [leadData?.projectId],
  );

  useEffect(() => {
    postRef.current = post;
  }, [post]);

  const fetchSchedules = useCallback(async () => {
    if (!enabled || !resolvedOrganizationId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await postRef.current({
        eventType: "FETCH_ALL_SCHEDULE",
        organizationId: resolvedOrganizationId,
        organizationType: resolvedOrganizationType,
        sortOrder: "ASC",
        sortBy: "scheduleStartDate",
        page: 1,
        rowsPerPage: 100,
        projectIds,
        excludeParents: true,
        filters: {
          startDate: scheduleRange.startDate,
          endDate: scheduleRange.endDate,
          isTodayIncluded: true,
          ...(options.assigneeUserId
            ? { assigneeId: options.assigneeUserId }
            : {}),
        },
      });

      if (response?.code === "SCHEDULES_FETCHED") {
        let list =
          response.body?.result?.filter(
            (schedule: ClientReportSchedule) =>
              !schedule.childrenIds || schedule.childrenIds.length === 0,
          ) ?? [];
        if (options.assigneeUserId) {
          list = list.filter((schedule: any) => {
            const hasMatchingAssignee = schedule.scheduleAssignees?.some(
              (assignee: any) =>
                assignee.assigneeUserId === options.assigneeUserId ||
                assignee.assigneeId === options.assigneeUserId ||
                assignee.userId === options.assigneeUserId,
            );
            return (
              schedule.scheduleAssigneeId === options.assigneeUserId ||
              hasMatchingAssignee
            );
          });
        }
        setSchedules(list);
      } else {
        setSchedules([]);
      }
    } catch (scheduleError) {
      setSchedules([]);
      setError(scheduleError);
    } finally {
      setLoading(false);
    }
  }, [
    resolvedOrganizationId,
    resolvedOrganizationType,
    enabled,
    projectIds,
    scheduleRange.endDate,
    scheduleRange.startDate,
    options.assigneeUserId,
  ]);

  useEffect(() => {
    void fetchSchedules();
  }, [fetchSchedules]);

  return {
    schedules,
    loading,
    error,
    refetch: fetchSchedules,
  };
};
