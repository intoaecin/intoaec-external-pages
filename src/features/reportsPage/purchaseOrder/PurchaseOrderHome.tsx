import { useAxios, useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import {
  formatNumberITL,
  formatSeedValues,
} from "@/lib/helpers";
import { Box } from "@mui/material";
import { useSession } from "@/features/reportsPage/publicRuntime";
import { useRouter as useNavigation } from "@/features/reportsPage/publicRuntime";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReportsTable from "../ReportsTable";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import { getReportCurrency } from "../utils";

const PurchaseOrderHome = () => {
  const { t } = useTranslation();

  const columns = [
    { display: t("common.projectName"), field: "projectName", isSort: true },
    {
      display: t("reports.vendorOrganization"),
      field: "receiverName",
      isSort: true,
    },
    { display: t("reports.poId"), field: "poSerial", isSort: true },
    { display: t("reports.vendorAmount"), field: "vendorAmount" },
    { display: t("reports.organizationStatus"), field: "aecStatus" },
    { display: t("reports.vendorStatus"), field: "vendorStatus" },
    { display: t("reports.issuedOn"), field: "issuedOn", isSort: true },
  ];

  const fileHeaderData = [
    t("common.sNo"),
    t("common.projectName"),
    t("reports.vendorOrganization"),
    t("reports.poId"),
    t("reports.vendorAmount"),
    t("reports.organizationStatus"),
    t("reports.vendorStatus"),
    t("reports.issuedOn"),
  ];
  const router = useRouter();
  const { data: session } = useSession();
  const { push: pushNav } = useNavigation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const { NEXT_PUBLIC_PROCUREMENT_ENDPOINT } = useEnv();
  const { post: fetchPO } = useAxios(
    `${NEXT_PUBLIC_PROCUREMENT_ENDPOINT}/session`
  );
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [sortBy, setSortBy] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [dashboardData, setDashboardData] = useState<any>();
  const [totalPo, setTotalPo] = useState<any>();
  const [totalAcceptedPoCount, setTotalAcceptedPo] = useState<any>();
  const [totalConvertedPoValue, setTotalConvertedPoValue] = useState<any>();
  const { localizationValue } = useOrganizationLocalization();
  const currency = getReportCurrency(localizationValue);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [reportsConfig, setReportsConfig] = useState<any>();
  const { organizationId, organizationName, organizationType, logoUrl } =
    useOrganization();
  const { NEXT_PUBLIC_USERHUB_ENDPOINT } = useEnv();
  const { post: fetchReports } = useAxiosWithAuth(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/reports"
  );
  const createReportsAutomation = async () => {
    const requestData: any = {
      eventType: "FETCH_REPORTS_AUTOMATION",
      organizationId: session?.["custom:organization_id"],
      reportName: "PO",
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

  const fetchPOData = async (startDate?: any, endDate?: any) => {
    setIsLoading(true);
    try {
      const res = await fetchPO({
        eventType: "FETCH_PURCHASE_ORDER",
        organizationId: session?.["custom:organization_id"] ?? organizationId,
        organizationType:
          session?.["custom:organization_type"] ?? organizationType,
        senderId: session?.["custom:organization_id"] ?? organizationId,
        sortOrder: sortOrder,
        sortBy: sortBy,
        page: currentPage,
        rowsPerPage: rowsPerPage,
        receiverId: filters?.vendorId?.id,
        startDate: startDate ?? filters.startDate,
        endDate: endDate ?? filters.endDate,
        projectIds: filters.projectIds,
        filters: {
          status: filters.status,
        },
      });

      if (res.code === "PURCHASE_ORDER_RETRIEVED") {
        const transformedData = res.body.result.map(
          (poData: any, index: number) => {
            const totalAmount =
              poData.poLineItems?.reduce(
                (sum: number, item: any) =>
                  sum + (Number(item.poItemTotal) || 0),
                0
              ) || 0;

            const estimateAmount =
              poData.poLineItems?.reduce(
                (sum: number, item: any) =>
                  sum + (Number(item.TotalFromEntity) || 0),
                0
              ) || 0;

            const profitLossPercentage =
              estimateAmount > 0
                ? ((estimateAmount - totalAmount) / estimateAmount) * 100
                : 0;

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
              // estimateAmount: `${currency} ${estimateAmount
              //   .toFixed(2)
              //   .toLocaleString()}`,
              vendorAmount: `${currency} ${formatNumberITL(
                localizationValue,
                Number(totalAmount)
              )}`,
              // profitLossPercentage: `${profitLossPercentage}%`,
              issuedOn: poData.issuedOn
                ? new Date(Number(poData.issuedOn)).toLocaleDateString()
                : "-",
            };
          }
        );
        setTableData(transformedData);
        setTotalPages(res.body.pageCount);
      }
    } catch (error) {
      console.error("Error fetching Purchase Order data:", error);
    }
    setIsLoading(false);
  };

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
    fetchPOData(router.query?.startDate, router.query?.endDate);
  }, [router.query?.startDate, router.query?.endDate]);

  useEffect(() => {
    fetchPOData(router.query?.startDate, router.query?.endDate);
  }, [sortOrder, sortBy, currentPage, rowsPerPage, filters, currency]); // Added filters to dependency array

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
        <LanguageSwitcher />
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

export default PurchaseOrderHome;
