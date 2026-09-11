import { useAxios, useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import {
  formatNumberITL,
  formatSeedValues,
  getLocalizationValue,
} from "@/lib/helpers";
import { Box } from "@mui/material";
import { useRouter as useNavigation } from "@/features/reportsPage/publicRuntime";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReportsTable from "../ReportsTable";

import { useSession } from "@/features/reportsPage/publicRuntime";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";

const RfqHome = () => {
  const { t } = useTranslation();

  const columns = [
    { display: t("common.projectName"), field: "projectName", isSort: true },
    {
      display: t("reports.vendorOrganization"),
      field: "receiverName",
      isSort: true,
    },
    { display: t("reports.vendorAmount"), field: "vendorAmount", isSort: true },
    { display: t("reports.isConvertedToPo"), field: "isConvertedPo" },
    { display: t("reports.organizationStatus"), field: "aecStatus" },
    { display: t("reports.vendorStatus"), field: "vendorStatus" },
    { display: t("reports.sentOn"), field: "createdAt", isSort: true },
  ];

  const fileHeaderData = [
    t("common.sNo"),
    t("common.projectName"),
    t("reports.vendorOrganization"),
    t("reports.vendorAmount"),
    t("reports.isConvertedToPo"),
    t("reports.organizationStatus"),
    t("reports.sentOn"),
  ];
  const router = useRouter();
  const { data: session } = useSession();
  const { push: pushNav } = useNavigation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const { NEXT_PUBLIC_PROCUREMENT_ENDPOINT } = useEnv();
  const { post: fetchrfq } = useAxios(
    `${NEXT_PUBLIC_PROCUREMENT_ENDPOINT}/session`
  );

  // Add new state variables for pagination and sorting
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [sortBy, setSortBy] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [dashboardData, setDashboardData] = useState<any>();
  const [totalRfq, setTotalRfq] = useState<any>();
  const [totalConvertedPo, setTotalConvertedToPo] = useState<any>();
  const [totalDeviation, setTotalDeviation] = useState<any>();
  const [currency, setCurrency] = useState<string>();
  const { localizationValue } = useOrganizationLocalization();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const { organizationId, organizationName, organizationType, logoUrl } =
    useOrganization();

  useEffect(() => {
    if (localizationValue) {
      setCurrency(
        getLocalizationValue(localizationValue, "CURRENCY", "SYMBOL") ?? ""
      );
    }
  }, [localizationValue]);

  const [reportsConfig, setReportsConfig] = useState<any>();
  const { NEXT_PUBLIC_USERHUB_ENDPOINT } = useEnv();
  const { post: fetchReports } = useAxiosWithAuth(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/reports"
  );
  const createReportsAutomation = async () => {
    const requestData: any = {
      eventType: "FETCH_REPORTS_AUTOMATION",
      organizationId: session?.["custom:organization_id"],
      reportName: "RFQ",
    };

    try {
      const res = await fetchReports(requestData);
      if (res?.code === "REPORT_AUTOMATION_RETRIEVED") {
        setReportsConfig(res.body);
        // toast.success("Reports automation fet")
        // onClose();
      } else {
        // toast.error("Error creating reports automation");
      }
    } catch (error: any) {
      // toast.error("Network error: " + error.message);
    }
  };
  useEffect(() => {
    createReportsAutomation();
  }, []);

  // Add filters state
  const [filters, setFilters] = useState({
    projectIds: [],
    status: "",
    startDate: undefined,
    endDate: undefined,
    vendorId: { id: "" },
  });

  const fetchRfqData = async (startDate?: any, endDate?: any) => {
    setIsLoading(true);
    try {
      const res = await fetchrfq({
        eventType: "FETCH_VENDOR_RFQ",
        organizationId: session?.["custom:organization_id"] ?? organizationId,
        organizationType:
          session?.["custom:organization_type"] ?? organizationType,
        sortOrder: sortOrder,
        sortBy: sortBy,
        page: currentPage,
        receiverId: filters?.vendorId?.id,
        rowsPerPage: rowsPerPage,
        filters: {
          projectIds: filters.projectIds,
          status: filters.status,
          startDate: startDate ?? filters.startDate,
          endDate: endDate ?? filters.endDate,
          vendorId: filters.vendorId,
        },
      });

      if (res.code === "RFQ_RETRIEVED") {
        const transformedData = res.body.result.map(
          (rfqData: any, index: number) => {
            const estimateAmount = rfqData.rfq.rfqTotalFromEstimate
              ? Number(rfqData.rfq.rfqTotalFromEstimate)
              : 0;
            const vendorAmount = Number(rfqData.totalAmount) || 0;
            const profitLossPercentage =
              estimateAmount > 0
                ? ((estimateAmount - vendorAmount) / estimateAmount) * 100
                : 0;

            return {
              id: rfqData.rfqId || String(index),
              projectName: rfqData.rfq.projectName || "-",
              receiverName: rfqData.receiverName || "-",
              vendorAmount:
                vendorAmount !== 0
                  ? `${currency} ${formatNumberITL(
                      localizationValue,
                      Number(vendorAmount)
                    )}`
                  : "-",
              isConvertedPo: rfqData?.isConvertedPO ? "Yes" : "No",
              aecStatus: rfqData?.aecStatus
                ? formatSeedValues(rfqData?.aecStatus)
                : "-",
              vendorStatus: rfqData?.vendorStatus
                ? formatSeedValues(rfqData?.vendorStatus)
                : "-",
              // estimateAmount: `${currency} ${estimateAmount
              //   .toFixed(2)
              //   .toLocaleString()}`,

              // profitLossPercentage: `${profitLossPercentage}%`,
              createdAt: rfqData.createdAt
                ? new Date(Number(rfqData.createdAt)).toLocaleDateString()
                : "-",
            };
          }
        );
        setTableData(transformedData);
        setTotalPages(res?.body?.pageCount);
      } else {
        setTableData([]);
      }
    } catch (error) {
      console.error("Error fetching RFQ data:", error);
    }
    setIsLoading(false);
  };

  // Add handler for sorting
  const handleSort = (order: "ASC" | "DESC", column: string) => {
    setSortOrder(order);
    setSortBy(column);
  };

  // Add handler for filters
  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const handleSelectAllRows = (checked: boolean) => {
    if (checked) {
      setSelectedRows(tableData.map((row: any) => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  useEffect(() => {
    setSelectedRows([]);
  }, [currentPage]);

  useEffect(() => {
    setFilters((prev: any) => ({
      ...prev,
      startDate: Number(router.query?.startDate),
      endDate: Number(router.query?.endDate),
    }));
    fetchRfqData(router.query?.startDate, router.query?.endDate);
  }, [router.query?.startDate, router.query?.endDate]);

  useEffect(() => {
    fetchRfqData(router.query?.startDate, router.query?.endDate);
  }, [sortOrder, sortBy, currentPage, rowsPerPage, filters, currency]); // Add filters to dependency array

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "white",
        position: "relative",
      }}
    >
        <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 10 }}>
          <LanguageSwitcher/>
      </div>
      <Box
        sx={{
          flexGrow: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          minHeight: "1200px",
          marginX: 1,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflowY: "auto",
            overflowX: "auto",
          }}
        >
          <ReportsTable
            columns={columns}
            data={tableData}
            isLoading={isLoading}
            sortOrder={sortOrder}
            onSort={(order, column) => {
              const columnDef = columns.find((col) => col.display === column);
              if (columnDef) {
                handleSort(order, columnDef.field);
              }
            }}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            selectable={true}
            selectedRows={selectedRows}
            onSelectRow={handleSelectRow}
            onSelectAllRows={handleSelectAllRows}
            rowIdField="id"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default RfqHome;

