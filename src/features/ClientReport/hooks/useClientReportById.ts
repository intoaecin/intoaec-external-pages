import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ClientReportRecord } from "../types";
import {
  type ClientReportApiItem,
  mapClientReport,
} from "../utils/mapClientReport";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";

type GetClientReportByIdResponse = {
  code?: string;
  error?: unknown;
  body?: ClientReportApiItem | { result?: ClientReportApiItem };
};

const getReportFromResponse = (
  body: GetClientReportByIdResponse["body"],
): ClientReportApiItem | undefined => {
  if (!body || (typeof body === "object" && Object.keys(body).length === 0)) {
    return undefined;
  }

  if ("result" in body) {
    const result = (body as { result?: ClientReportApiItem }).result;

    if (
      !result ||
      (typeof result === "object" && Object.keys(result).length === 0)
    ) {
      return undefined;
    }

    return result;
  }

  return body as ClientReportApiItem;
};

const getReportIdentity = (report?: ClientReportApiItem) =>
  report?.clientReportId ?? report?.reportId ?? report?.id;

const isClientReportNotFoundResponse = (
  response?: GetClientReportByIdResponse,
) => {
  if (response?.code === "CLIENT_REPORT_NOT_FOUND") {
    return true;
  }

  const reportData = getReportFromResponse(response?.body);

  return !reportData || !getReportIdentity(reportData);
};

export const useClientReportById = (clientReportId?: string) => {
  const { NEXT_PUBLIC_MEETANDNOTE_ENDPOINT } = useEnv();
  const { post } = useAxios<GetClientReportByIdResponse>(
    `${NEXT_PUBLIC_MEETANDNOTE_ENDPOINT}/session`,
  );
  const postRef = useRef(post);
  const [report, setReport] = useState<ClientReportRecord>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const {
    organizationId,
    organizationName,
    organizationType,
    mainColor,
    textColor,
  } = useOrganization();
  useEffect(() => {
    postRef.current = post;
  }, [post]);

  const fetchClientReport = useCallback(async () => {
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
        entityType: "CLIENT_REPORT",
      });

      if (response?.error || isClientReportNotFoundResponse(response)) {
        setReport(undefined);
        setError(response?.error ?? response?.message ?? response?.code);
        return;
      }

      const reportData = getReportFromResponse(response?.body);
      setReport(reportData ? mapClientReport(reportData) : undefined);
    } catch (clientReportError) {
      setReport(undefined);
      setError(clientReportError);
    } finally {
      setLoading(false);
    }
  }, [clientReportId]);

  useEffect(() => {
    void fetchClientReport();
  }, [fetchClientReport]);

  return {
    report,
    loading,
    error,
    refetch: fetchClientReport,
  };
};
