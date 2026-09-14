import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useLeadData } from "@/features/components/providers/LeadProfileProvider";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Ported from intoaec-UI `src/features/ClientReport/hooks/useClientReportTasks.ts`.
 * See `useClientReportSchedules.ts` in this same folder for why the source's
 * `next-auth` `useSession()` organization-id/type fallback was dropped in
 * favor of `useOrganization()` alone.
 */

export type ClientReportTask = {
  taskId: string;
  projectName?: string;
  taskHeader?: string;
  progress?: number | string;
  taskStatus?: string;
  status?: string;
};

type FetchTasksResponse = {
  code?: string;
  body?: {
    result?: ClientReportTask[];
  };
};

type ClientReportDateRange = {
  startDate?: number;
  endDate?: number;
};

type UseClientReportTasksOptions = {
  enabled?: boolean;
  assigneeUserId?: string;
};

const getDefaultTaskRange = () => {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate: startDate.getTime(),
    endDate: endDate.getTime(),
  };
};

export const useClientReportTasks = (
  dateRange?: ClientReportDateRange,
  options: UseClientReportTasksOptions = {},
) => {
  const { enabled = true } = options;
  const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
  const { post } = useAxios<FetchTasksResponse>(
    NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/session",
  );
  const postRef = useRef(post);
  const { organizationId, organizationType } = useOrganization();
  const { leadData } = useLeadData();
  const [tasks, setTasks] = useState<ClientReportTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const taskRange = useMemo(() => {
    if (dateRange?.startDate && dateRange?.endDate) {
      return dateRange;
    }

    return getDefaultTaskRange();
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

  const fetchTasks = useCallback(async () => {
    if (!enabled || !resolvedOrganizationId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await postRef.current({
        eventType: "FETCH_TASKS",
        organizationId: resolvedOrganizationId,
        organizationType: resolvedOrganizationType,
        sortOrder: "ASC",
        sortBy: "startDate",
        page: 1,
        rowsPerPage: 100,
        projectIds,
        filters: {
          startDate: taskRange.startDate,
          endDate: taskRange.endDate,
          isTodayIncluded: true,
          assigneeUserId: options.assigneeUserId || "",
        },
      });

      if (response?.code === "TASKS_RETRIEVED") {
        setTasks(response.body?.result ?? []);
      } else {
        setTasks([]);
      }
    } catch (taskError) {
      setTasks([]);
      setError(taskError);
    } finally {
      setLoading(false);
    }
  }, [
    resolvedOrganizationId,
    resolvedOrganizationType,
    enabled,
    projectIds,
    taskRange.endDate,
    taskRange.startDate,
    options.assigneeUserId,
  ]);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
  };
};
