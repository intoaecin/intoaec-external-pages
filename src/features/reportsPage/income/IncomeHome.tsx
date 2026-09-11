import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import {
  formatNumberITL,
  formatSeedValues,
  getLocalizationValue,
} from "@/lib/helpers";
import { toLowerNoSpace } from "@/utils/string";
import { Box, useTheme } from "@mui/material";
import { useSession } from "@/features/reportsPage/publicRuntime";
import { useRouter as useNavigation } from "@/features/reportsPage/publicRuntime";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
type MoneyMattersDashboardType = {
  totalAmount: number;
  totalAmountPaid: number;
  totalBalanceAmount: number;
};
import ReportsTable from "../ReportsTable";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";

const IncomeHome = () => {
  const { t } = useTranslation();

  const columns = [
    { display: t("common.projectName"), field: "projectName", isSort: true },
    {
      display: t("reports.invoiceSerial"),
      field: "invoiceSerial",
      isSort: true,
    },
    {
      display: t("reports.invoiceScheduleAmount"),
      field: "amount",
      showCurrency: true,
    },
    { display: t("reports.dueDate"), field: "paymentScheduleDueDate" },
    {
      display: t("reports.receivedAmount"),
      field: "receivedAmount",
      showCurrency: true,
    },
    {
      display: t("reports.pendingAmount"),
      field: "pendingAmount",
      showCurrency: true,
    },
    { display: t("reports.status"), field: "status" },
    { display: t("reports.createdOn"), field: "createdOn" },
  ];

  const fileHeaderData = [
    t("common.sNo"),
    t("reports.projectName"),
    t("reports.invoiceSerial"),
    t("reports.invoiceScheduleAmount"),
    t("reports.dueDate"),
    t("reports.receivedAmount"),
    t("reports.pendingAmount"),
    t("reports.status"),
    t("reports.createdOn"),
  ];

  const router = useRouter();
  const { data: session } = useSession();
  const { push: pushNav } = useNavigation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const { NEXT_PUBLIC_PAYMASTER_ENDPOINT } = useEnv();
  const { post: fetch } = useAxiosWithAuth(
    NEXT_PUBLIC_PAYMASTER_ENDPOINT + "/session"
  );
  const { post: fetchInvoice } = useAxiosWithAuth(
    NEXT_PUBLIC_PAYMASTER_ENDPOINT + "/invoice"
  );
  const theme = useTheme();
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [sortBy, setSortBy] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const { localizationValue } = useOrganizationLocalization();
  const [currency, setCurrency] = useState<string>();
  const [dashboardData, setDashboardData] =
    useState<MoneyMattersDashboardType | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const { organizationId, organizationName, organizationType, logoUrl } =
    useOrganization();
  const [reportsConfig, setReportsConfig] = useState<any>();
  const { NEXT_PUBLIC_USERHUB_ENDPOINT } = useEnv();
  const { post: fetchReports } = useAxiosWithAuth(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/reports"
  );
  const createReportsAutomation = async () => {
    const requestData: any = {
      eventType: "FETCH_REPORTS_AUTOMATION",
      organizationId: session?.["custom:organization_id"],
      reportName: "INCOME",
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

  useEffect(() => {
    if (localizationValue) {
      setCurrency(
        getLocalizationValue(localizationValue, "CURRENCY", "SYMBOL") ??
          undefined
      );
    }
  }, [localizationValue]);

  const [filters, setFilters] = useState({
    projectIds: [],
    startDate: undefined,
    endDate: undefined,
    dueStartDate: undefined,
    dueEndDate: undefined,
    paymentMode: "",
    status: "",
  });

  const fetchIncomeData = async (startDate?: any, endDate?: any) => {
    setIsLoading(true);
    const requestData = {
      eventType: "FETCH_INVOICES_WITH_PAYMENT_SCHEDULES",
      page: currentPage,
      rowsPerPage: rowsPerPage,
      organizationId: session?.["custom:organization_id"] ?? organizationId,
      organizationType:
        session?.["custom:organization_type"] ?? organizationType,
      senderId: session?.["custom:organization_id"] ?? organizationId,
      sortOrder: sortOrder,
      sortBy: sortBy,
      filters: {
        projectIds: filters.projectIds,
        startDate: startDate ?? filters.startDate,
        endDate: endDate ?? filters.endDate,
        dueStartDate: filters.dueStartDate,
        dueEndDate: filters.dueEndDate,
        paymentMode: filters.paymentMode,
        statuses: filters.status ? [filters.status] : [],
      },
    };

    try {
      const res = await fetch(requestData);
      console.log(res?.body.result, "viuvnkvjs");
      if (res.code === "INVOICE_FOUND") {
        console.log(res?.body.result, "response body");

        const transformedData = res?.body.result?.map(
          (item: any, index: number) => {
            const scheduleAmount = Number(item.amount) || 0;
            const pendingAmount = Number(item.balanceAmount) || 0;
            const receivedAmount = scheduleAmount - pendingAmount;

            return {
              id: item.invoicePaymentScheduleId || String(index),
              projectName: item.projectName || "-", // assuming it might be added in future
              invoiceSerial: item.invoiceSerial || "-", // same here, otherwise remove
              amount: `${formatNumberITL(localizationValue, scheduleAmount)}`,
              paymentScheduleDueDate: item.paymentScheduleDueDate
                ? new Date(
                    Number(item.paymentScheduleDueDate)
                  ).toLocaleDateString()
                : "-",
              receivedAmount: `${formatNumberITL(
                localizationValue,
                receivedAmount
              )}`,
              pendingAmount: `${formatNumberITL(
                localizationValue,
                pendingAmount
              )}`,
              status: formatSeedValues(item.paymentSchedulestatus) || "PENDING",
              createdOn: item.createdAt
                ? new Date(Number(item.createdAt)).toLocaleDateString()
                : "-",
            };
          }
        );

        const updatedData = transformedData.map((item: any) => ({
          ...item,
          status: t(`paymentStatus.${toLowerNoSpace(item.status)}`, {
            defaultValue: item.status,
          }),
        }));

        setTableData(updatedData);
        setTotalPages(Math.ceil(res.body.pageCount || 1));
      }
    } catch (error) {
      console.error("Error fetching Income data:", error);
    }
    setIsLoading(false);
  };

  const handleSort = (order: "ASC" | "DESC", column: string) => {
    setSortOrder(order);
    setSortBy(column);
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // useEffect(() => {
  //   if (!router?.query?.startDate) {
  //     fetchIncomeData();
  //   }
  // }, [sortOrder, sortBy, currentPage, rowsPerPage, filters, currency]);

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

  const getDataForExport = () => {
    return tableData
      .filter((row: any) => selectedRows.includes(row.id))
      .map((row: any, index: number) => [
        index + 1,
        row.projectName,
        row.invoiceSerial,
        row.amount,
        row.paymentScheduleDueDate,
        row.receivedAmount,
        row.pendingAmount,
        row.status,
        row.createdOn,
      ]);
  };

  useEffect(() => {
    setFilters((prev: any) => ({
      ...prev,
      startDate: Number(router.query?.startDate),
      endDate: Number(router.query?.endDate),
    }));
    fetchIncomeData(router.query?.startDate, router.query?.endDate);
  }, [router.query?.startDate, router.query?.endDate]);

  useEffect(() => {
    fetchIncomeData(router.query?.startDate, router.query?.endDate);
  }, [sortOrder, sortBy, currentPage, rowsPerPage, filters, currency]);

  useEffect(() => {
    setSelectedRows([]);
  }, [currentPage]);

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
      <div
        style={{ position: "absolute", top: "10px", right: "10px", zIndex: 10 }}
      >
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
            sortOrder={sortOrder}
            isLoading={isLoading}
            onSort={(order, column) => {
              const columnDef = columns.find((col) => col.display === column);
              if (columnDef) {
                handleSort(order, columnDef.field);
              }
            }}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            selectable={true}
            selectedRows={selectedRows}
            onSelectRow={handleSelectRow}
            onSelectAllRows={handleSelectAllRows}
            rowIdField="id"
            currency={currency ?? ""}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default IncomeHome;
