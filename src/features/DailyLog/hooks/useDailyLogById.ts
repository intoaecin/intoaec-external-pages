import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DailyLogRecord } from "../types";
import {
  type DailyLogApiItem,
  mapDailyLog,
} from "../utils/mapDailyLog";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";

type GetDailyLogByIdResponse = {
  code?: string;
  error?: unknown;
  body?: DailyLogApiItem | { result?: DailyLogApiItem };
};

const getReportFromResponse = (
  body: GetDailyLogByIdResponse["body"],
): DailyLogApiItem | undefined => {
  if (!body || (typeof body === "object" && Object.keys(body).length === 0)) {
    return undefined;
  }

  if ("result" in body) {
    const result = (body as { result?: DailyLogApiItem }).result;

    if (
      !result ||
      (typeof result === "object" && Object.keys(result).length === 0)
    ) {
      return undefined;
    }

    return result;
  }

  return body as DailyLogApiItem;
};

const getReportIdentity = (report?: DailyLogApiItem) =>
  report?.clientReportId ?? report?.reportId ?? report?.id;

const isDailyLogNotFoundResponse = (
  response?: GetDailyLogByIdResponse,
) => {
  if (response?.code === "CLIENT_REPORT_NOT_FOUND") {
    return true;
  }

  const reportData = getReportFromResponse(response?.body);

  return !reportData || !getReportIdentity(reportData);
};

export const useDailyLogById = (clientReportId?: string) => {
  const { NEXT_PUBLIC_MEETANDNOTE_ENDPOINT } = useEnv();
  const { post } = useAxios<GetDailyLogByIdResponse>(
    `${NEXT_PUBLIC_MEETANDNOTE_ENDPOINT}/session`,
  );
  const postRef = useRef(post);
  const [report, setReport] = useState<DailyLogRecord>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const {
    organizationId,
    organizationType,
  } = useOrganization();
  useEffect(() => {
    postRef.current = post;
  }, [post]);

  const fetchDailyLog = useCallback(async () => {
    if (!clientReportId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await postRef.current({
        eventType: "GET_CLIENT_REPORT_BY_ID",
        clientReportId,
        organizationId,
        organizationType,
        entityType: "DAILY_LOG",
      });

      if (response?.error || isDailyLogNotFoundResponse(response)) {
        setReport(undefined);
        setError(response?.error ?? response?.message ?? response?.code);
        return;
      }

      const reportData = getReportFromResponse(response?.body);
      setReport(reportData ? mapDailyLog(reportData) : undefined);
    } catch (dailyLogError) {
      setReport(undefined);
      setError(dailyLogError);
    } finally {
      setLoading(false);
    }
  }, [clientReportId, organizationId, organizationType]);

  useEffect(() => {
    void fetchDailyLog();
  }, [fetchDailyLog]);

  return {
    report,
    loading,
    error,
    refetch: fetchDailyLog,
  };
};
