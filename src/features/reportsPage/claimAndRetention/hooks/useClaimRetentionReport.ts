import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { getLocalizationValue } from "@/lib/helpers";
import type {
  ClaimRetentionReportFilters,
  ClaimRetentionReportPage,
  ClaimRetentionReportRow,
  ClaimRetentionReportSortOrder,
  ClaimRetentionReportTab,
} from "../types";
import {
  formatClaimRetentionReportMoney,
  mapClaimRetentionReportRow,
} from "../utils/claimRetentionReportRows";

interface UseClaimRetentionReportParams {
  tab: ClaimRetentionReportTab;
  filters: ClaimRetentionReportFilters;
  sortBy: string;
  sortOrder: ClaimRetentionReportSortOrder;
  currentPage: number;
  rowsPerPage: number;
}

/**
 * Claims report for the emailed (no-login) page: Leadmanager accepts the
 * apiKey on /progress-claim, scoped by the organization resolved from the
 * subdomain.
 */
export const useClaimRetentionReport = ({
  tab,
  filters,
  sortBy,
  sortOrder,
  currentPage,
  rowsPerPage,
}: UseClaimRetentionReportParams) => {
  const { t } = useTranslation();
  const { organizationId } = useOrganization();
  const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
  const { post } = useAxios<any>(
    NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/progress-claim",
  );
  const { localizationValue } = useOrganizationLocalization();

  const currency = localizationValue
    ? (getLocalizationValue(localizationValue, "CURRENCY", "SYMBOL") ?? "")
    : "";

  const query = useQuery({
    queryKey: [
      "external-progress-claims-report",
      organizationId,
      tab,
      filters,
      sortBy,
      sortOrder,
      currentPage,
      rowsPerPage,
    ],
    queryFn: async (): Promise<ClaimRetentionReportPage> => {
      const response = await post({
        eventType: "FETCH_PROGRESS_CLAIMS_REPORT",
        organizationId,
        projectIds: filters.projectIds,
        // The retention tab is always the accepted claims holding retention.
        status: tab === "CLAIMS" && filters.status ? [filters.status] : [],
        retentionOnly: tab === "RETENTION",
        startDate: filters.startDate,
        endDate: filters.endDate,
        sortBy,
        sortOrder,
        pageNumber: currentPage,
        pageSize: rowsPerPage,
      });

      if (response?.code !== "PROGRESS_CLAIMS_REPORT_FETCHED") {
        throw new Error(response?.message || "Failed to fetch the claims report.");
      }

      return response.body as ClaimRetentionReportPage;
    },
    enabled: Boolean(organizationId),
    placeholderData: keepPreviousData,
  });

  const formatters = useMemo(
    () => ({ t, currency, localizationValue }),
    [t, currency, localizationValue],
  );

  const tableData = useMemo<ClaimRetentionReportRow[]>(
    () =>
      (query.data?.result ?? []).map((claim) =>
        mapClaimRetentionReportRow(claim, formatters),
      ),
    [query.data, formatters],
  );

  return {
    isLoading: query.isLoading,
    tableData,
    totalPages: query.data?.pageCount ?? 1,
    totals: {
      claimCount: query.data?.totalCount ?? 0,
      claimedAmount: formatClaimRetentionReportMoney(
        query.data?.totalClaimedAmount,
        formatters,
      ),
      acceptedAmount: formatClaimRetentionReportMoney(
        query.data?.totalAcceptedAmount,
        formatters,
      ),
      retentionHeld: formatClaimRetentionReportMoney(
        query.data?.totalRetentionHeld,
        formatters,
      ),
    },
  };
};
