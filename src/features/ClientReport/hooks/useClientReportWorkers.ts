import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useLeadData } from "@/features/components/providers/LeadProfileProvider";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Ported from intoaec-UI `src/features/ClientReport/hooks/useClientReportWorkers.ts`.
 * See `useClientReportSchedules.ts` in this same folder for why the source's
 * `next-auth` `useSession()` organization-id fallback was dropped in favor of
 * `useOrganization()` alone.
 */

export type ClientReportWorker = {
  shiftWorkerId: string;
  workerName?: string;
  role?: string;
  shiftName?: string;
  totalWorkedDuration?: number;
  overtimeDuration?: number;
};

type FetchWorkersResponse = {
  code?: string;
  body?: {
    result?: ClientReportWorker[];
  };
};

type ClientReportDateRange = {
  startDate?: number;
  endDate?: number;
};

type UseClientReportWorkersOptions = {
  enabled?: boolean;
};

const getDefaultWorkerDateRange = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate: date.getTime(),
    endDate: endDate.getTime(),
  };
};

export const useClientReportWorkers = (
  dateRange?: ClientReportDateRange,
  options: UseClientReportWorkersOptions = {},
) => {
  const { enabled = true } = options;
  const { NEXT_PUBLIC_PROCUREMENT_ENDPOINT } = useEnv();
  const { post } = useAxios<FetchWorkersResponse>(
    NEXT_PUBLIC_PROCUREMENT_ENDPOINT + "/session",
  );
  const postRef = useRef(post);
  const { organizationId } = useOrganization();
  const { leadData } = useLeadData();
  const [workers, setWorkers] = useState<ClientReportWorker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const workerDateRange = useMemo(() => {
    if (dateRange?.startDate && dateRange?.endDate) {
      return dateRange;
    }

    return getDefaultWorkerDateRange();
  }, [dateRange]);
  const resolvedOrganizationId = organizationId;
  const projectIds = useMemo(
    () => (leadData?.projectId ? [leadData.projectId] : []),
    [leadData?.projectId],
  );

  useEffect(() => {
    postRef.current = post;
  }, [post]);

  const fetchWorkers = useCallback(async () => {
    if (!enabled || !resolvedOrganizationId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await postRef.current({
        eventType: "GET_WORKERS_FOR_REPORTS",
        organizationId: resolvedOrganizationId,
        page: 1,
        rowsPerPage: 100,
        date: null,
        projectIds,
        workerId: null,
        sortBy: "startDate",
        sortOrder: "DESC",
        startDate: workerDateRange.startDate,
        endDate: workerDateRange.endDate,
      });

      if (response?.code === "WORKERS_FOUND") {
        setWorkers(response.body?.result ?? []);
      } else {
        setWorkers([]);
      }
    } catch (workerError) {
      setWorkers([]);
      setError(workerError);
    } finally {
      setLoading(false);
    }
  }, [
    projectIds,
    resolvedOrganizationId,
    enabled,
    workerDateRange.endDate,
    workerDateRange.startDate,
  ]);

  useEffect(() => {
    void fetchWorkers();
  }, [fetchWorkers]);

  return {
    workers,
    loading,
    error,
    refetch: fetchWorkers,
  };
};
