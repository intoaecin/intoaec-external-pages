import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import {
  formatNumberITL,
  formatSeedValues,
  formatToCamelCaseWithAmpersand,
} from "@/lib/helpers";
import { useSession } from "@/features/reportsPage/publicRuntime";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useRouter } from "@/features/reportsPage/publicRuntime";
import { getReportCurrency } from "@/features/reportsPage/utils";

export const useWorkOrderReports = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { data: session } = useSession();
  const { NEXT_PUBLIC_PROCUREMENT_ENDPOINT, NEXT_PUBLIC_USERHUB_ENDPOINT } = useEnv();
  const { localizationValue } = useOrganizationLocalization();

  const { post: fetchWO } = useAxiosWithAuth(
    `${NEXT_PUBLIC_PROCUREMENT_ENDPOINT}/po`
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [sortBy, setSortBy] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [listTotalCount, setListTotalCount] = useState(0);
  const [dashboardData, setDashboardData] = useState<any>();
  const [totalWo, setTotalWo] = useState<any>();
  const [totalAcceptedWoCount, setTotalAcceptedWo] = useState<any>();
  const [totalConvertedWoValue, setTotalConvertedWoValue] = useState<any>();
  const currency = getReportCurrency(localizationValue);

  const { post: fetchReports } = useAxiosWithAuth(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/reports"
  );
  
  const [reportsConfig, setReportsConfig] = useState<any>();

  const createReportsAutomation = async () => {
    const requestData: any = {
      eventType: "FETCH_REPORTS_AUTOMATION",
      organizationId: session?.["custom:organization_id"],
      reportName: "WO", // Changed to WO for Work Order
    };

    try {
      const res = await fetchReports(requestData);
      if (res?.code === "REPORT_AUTOMATION_RETRIEVED") {
        setReportsConfig(res.body);
      }
    } catch (error: any) {
        console.error("Error creating reports automation:", error);
    }
  };

  useEffect(() => {
    createReportsAutomation();
  }, []);

  const [filters, setFilters] = useState({
    projectIds: [],
    status: "",
    startDate: undefined,
    endDate: undefined,
    vendorId: { id: "" },
  });

  const mapPurchaseOrderResults = useCallback(
    (result: any[]) => {
      const transformedData = result.map((poData: any, index: number) => {
        const totalAmount =
          poData.poLineItems?.reduce(
            (sum: number, item: any) =>
              sum + (Number(item.poItemTotal) || 0),
            0,
          ) || 0;
        return {
          id: poData.poId || String(index),
          projectName: poData.projectName || "-",
          receiverName: poData.receiverName || "-",
          poSerial: poData.poSerial || "-",
          aecStatus: poData?.aecStatus
            ? formatSeedValues(poData?.aecStatus)
            : "-",
          vendorStatus: poData?.vendorStatus
            ? formatSeedValues(poData?.vendorStatus)
            : "-",
          vendorAmount: `${currency} ${formatNumberITL(
            localizationValue,
            Number(totalAmount),
          )}`,
          issuedOn: poData.issuedOn
            ? new Date(Number(poData.issuedOn)).toLocaleDateString()
            : "-",
        };
      });
      return transformedData.map((item: any) => ({
        ...item,
        aecStatus: t(`common.${formatToCamelCaseWithAmpersand(item.aecStatus)}`),
        vendorStatus: t(
          `common.${formatToCamelCaseWithAmpersand(item.vendorStatus)}`,
        ),
      }));
    },
    [t, currency, localizationValue],
  );

  const fetchWorkOrderTablePage = useCallback(
    async (page: number, pageSize: number) => {
      const res = await fetchWO({
        eventType: "FETCH_PURCHASE_ORDER",
        organizationId: session?.["custom:organization_id"],
        senderId: session?.["custom:organization_id"],
        sortOrder,
        sortBy,
        page,
        rowsPerPage: pageSize,
        receiverId: filters?.vendorId?.id,
        startDate: filters.startDate,
        endDate: filters.endDate,
        projectIds: filters.projectIds,
        filters: {
          status: filters.status,
          isWorkOrder: true,
        },
      });
      if (res.code !== "PURCHASE_ORDER_RETRIEVED") {
        throw new Error(res?.message || "Failed to fetch work orders");
      }
      return mapPurchaseOrderResults(res.body.result ?? []);
    },
    [
      fetchWO,
      session?.["custom:organization_id"],
      sortOrder,
      sortBy,
      filters,
      mapPurchaseOrderResults,
    ],
  );

  const fetchWOData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWO({
        eventType: "FETCH_PURCHASE_ORDER",
        organizationId: session?.["custom:organization_id"],
        senderId: session?.["custom:organization_id"],
        sortOrder: sortOrder,
        sortBy: sortBy,
        page: currentPage,
        rowsPerPage: rowsPerPage,
        receiverId: filters?.vendorId?.id,
        startDate: filters.startDate,
        endDate: filters.endDate,
        projectIds: filters.projectIds,
        filters: {
          status: filters.status,
          isWorkOrder: true,
        },
      });

      if (res.code === "PURCHASE_ORDER_RETRIEVED") {
        const updatedData = mapPurchaseOrderResults(res.body.result ?? []);
        setTableData(updatedData);
        setTotalPages(res.body.pageCount);
        setListTotalCount(Number(res.body.totalCount ?? 0));
      }
    } catch (error) {
      console.error("Error fetching Work Order data:", error);
    }
    setIsLoading(false);
  };

  const fetchWODashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWO({
        eventType: "FETCH_PO_REPORTS_DASHBOARD",
        organizationId: session?.["custom:organization_id"],
        senderId: session?.["custom:organization_id"],
        sortOrder: sortOrder,
        sortBy: sortBy,
        page: currentPage,
        rowsPerPage: rowsPerPage,
        receiverId: filters?.vendorId?.id,
        startDate: filters.startDate,
        endDate: filters.endDate,
        projectIds: filters.projectIds,
        filters: {
          status: filters.status,
          isWorkOrder: true,
        },
      });

      if (res.code === "DASHBOARD_DATA_FOUND") {
        setDashboardData(res.body);
        setTotalWo(res.body.totalPoCount); // Assuming API returns same keys for WO
        setTotalAcceptedWo(res.body.totalAcceptedPoCount);
        setTotalConvertedWoValue(res.body.totalConvertedPoValue);
      }
    } catch (error) {
      console.error("Error fetching Work Order dashboard data:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchWOData();
    fetchWODashboardData();
  }, [sortOrder, sortBy, currentPage, rowsPerPage, filters, currency, i18n.language]);

  const handleSort = (order: "ASC" | "DESC", column: string) => {
    setSortOrder(order);
    setSortBy(column);
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return {
    isLoading,
    tableData,
    sortOrder,
    sortBy,
    currentPage,
    rowsPerPage,
    totalPages,
    listTotalCount,
    fetchWorkOrderTablePage,
    dashboardData,
    totalWo,
    totalAcceptedWoCount,
    totalConvertedWoValue,
    currency,
    filters,
    localizationValue,
    reportsConfig,
    createReportsAutomation,
    fetchWOData,
    fetchWODashboardData,
    handleSort,
    handleApplyFilters,
    setCurrentPage,
    setRowsPerPage,
  };
};
