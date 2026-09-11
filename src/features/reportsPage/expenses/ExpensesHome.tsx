import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import {
  formatNumberITL,
  formatSeedValues,
  getLocalizationValue,
} from "@/lib/helpers";
import { toLowerNoSpace } from "@/utils/string";
import { Box } from "@mui/material";
import { useSession } from "@/features/reportsPage/publicRuntime";
import { useRouter as useNavigation } from "@/features/reportsPage/publicRuntime";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import ReportsTable from "../ReportsTable";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import { useUsersData } from "@/features/hooks/useUsersData";
import { getReceiverName } from "../../billsAndExpenses/utils/helper";

const ExpensesHome = () => {
  const { t } = useTranslation();

  const columns = [
    { display: t("common.projectName"), field: "projectName", isSort: true },
    { display: t("common.name"), field: "name" },
    { display: t("receipt.receiverName"), field: "receiverName" },
    { display: t("expenseContent.expenseType"), field: "entityType" },
    // {
    //   display: t("reports.isExpenseAgainstInvoice"),
    //   field: "isExpenseAgainstInvoice",
    // },
    // { display: "Vendor Invoice ID", field: "vendorInvoiceId" },
    { display: t("reports.spentOn"), field: "dueDate", isSort: true },
    { display: t("reports.workType"), field: "workCategory" },
    { display: t("common.qty"), field: "qty" },
    { display: t("common.unit"), field: "unit" },
    {
      display: t("reports.amount"),
      field: "totalAmount",
      isSort: true,
      showCurrency: true,
    },
    { display: t("reports.modeOfPayment"), field: "modeOfPayment" },
    { display: t("reports.status"), field: "status" },
  ];

  const fileHeaderData = [
    t("common.sNo"),
    t("common.projectName"),
    t("common.name"),
    t("receipt.receiverName"),
    t("expenseContent.expenseType"),
    // t("reports.isExpenseAgainstInvoice"),
    t("reports.spentOn"),
    t("reports.workType"),
    t("common.qty"),
    t("common.unit"),
    t("reports.amount"),
    t("reports.modeOfPayment"),
    t("reports.status"),
  ];

  const { data: session } = useSession();
  const { usersData } = useUsersData();
  const vendorData: any[] = [];
  const leadData = undefined;
  const router = useRouter();
  const { push: pushNav } = useNavigation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rawExpenseData, setRawExpenseData] = useState<any[]>([]);
  const { NEXT_PUBLIC_PAYMASTER_ENDPOINT } = useEnv();
  const { post: fetchAllData } = useAxiosWithAuth<any>(
    `${NEXT_PUBLIC_PAYMASTER_ENDPOINT}/session`
  );
  const { organizationId, organizationName, organizationType, logoUrl } =
    useOrganization();
  // Pagination and sorting states
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [sortBy, setSortBy] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    projectIds: [],
    startDate: undefined,
    endDate: undefined,
    paymentMode: "",
  });
  const [currency, setCurrency] = useState<string>();
  const { localizationValue } = useOrganizationLocalization();
  const [reportsConfig, setReportsConfig] = useState<any>();
  const { NEXT_PUBLIC_USERHUB_ENDPOINT } = useEnv();
  const { post: fetchReports } = useAxiosWithAuth(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/reports"
  );
  const createReportsAutomation = async () => {
    const requestData: any = {
      eventType: "FETCH_REPORTS_AUTOMATION",
      organizationId: session?.["custom:organization_id"],
      reportName: "EXPENSE",
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

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const fetchExpenseData = async (startDate?: any, endDate?: any) => {
    setIsLoading(true);
    try {
      const requestData = {
        eventType: "GET_BILLS_AND_EXPENSES",
        senderId: session?.["custom:organization_id"] ?? organizationId,
        organizationId: session?.["custom:organization_id"] ?? organizationId,
        organizationType:
          session?.["custom:organization_type"] ?? organizationType,
        pageNumber: currentPage,
        rowsPerPage: rowsPerPage,
        sortOrder: sortOrder,
        sortBy: sortBy,
        modeOfPayment: filters.paymentMode,
        startDate: startDate ?? filters.startDate,
        endDate: endDate ?? filters.endDate,
        filters: {
          projectIds: filters.projectIds,
        },
      };

      const res = await fetchAllData(requestData);

      if (res.code === "BILLS_AND_EXPENSES_RETRIEVED") {
        const orgId = session?.["custom:organization_id"] ?? organizationId;
        const resultList = res.body.result || [];
        setRawExpenseData(resultList);
        setTotalPages(Math.ceil(res.body.pageCount));

        const expenseTotal = resultList
          .filter(
            (item: any) => item.senderId === orgId
          )
          .reduce(
            (sum: number, item: any) => sum + Number(item.totalAmount || 0),
            0
          );

        setExpenseTotal(expenseTotal);
      }
    } catch (error) {
      console.error("Error fetching Expense data:", error);
    }
    setIsLoading(false);
  };

  const tableData = useMemo(() => {
    const orgId = session?.["custom:organization_id"] ?? organizationId;
    return rawExpenseData
      .filter((item: any) => item.senderId === orgId)
      .map((expenseData: any, index: number) => ({
        id: expenseData.expenseId || String(index), // Add unique id
        projectName: expenseData.projectName || "-",
        name: expenseData.name || "-",
        receiverName: getReceiverName(
          expenseData.receiverId,
          expenseData.receiverType,
          usersData,
          vendorData,
          leadData
        ),
        entityType: expenseData.entityType ? t(`common.${expenseData.entityType}`) : "-",
        isExpenseAgainstInvoice: expenseData.entityId ? "Yes" : "No",
        dueDate: expenseData.dueDate
          ? new Date(Number(expenseData.dueDate)).toLocaleDateString()
          : "-",
        workCategory: expenseData.workCategory
          ? formatSeedValues(expenseData.workCategory)
          : "-",
        qty: expenseData.quantity !== undefined && expenseData.quantity !== null ? expenseData.quantity : "-",
        unit: expenseData.unit || "-",
        totalAmount: expenseData.totalAmount
          ? `${formatNumberITL(
            localizationValue,
            Number(expenseData.totalAmount)
          )}`
          : "-",
        modeOfPayment: expenseData.modeOfPayment
          ? t(
            `revenueDashboard.paymentMethodLabels.${toLowerNoSpace(
              formatSeedValues(expenseData.modeOfPayment)
            )}`,
            {
              defaultValue: formatSeedValues(expenseData.modeOfPayment),
            }
          )
          : "-",
        status: expenseData.status
          ? t(
            `paymentStatus.${toLowerNoSpace(
              formatSeedValues(expenseData.status)
            )}`,
            {
              defaultValue: formatSeedValues(expenseData.status),
            }
          )
          : "-",
      }));
  }, [rawExpenseData, usersData, vendorData, leadData, t, localizationValue, session, organizationId]);

  // Handler for sorting
  const handleSort = (order: "ASC" | "DESC", column: string) => {
    setSortOrder(order);
    setSortBy(column);
  };

  // Handler for filters
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
    const queryFilters: any = { ...filters };
    let hasChanged = false;

    if (router.query?.startDate && Number(router.query.startDate) !== filters.startDate) {
      queryFilters.startDate = Number(router.query.startDate);
      hasChanged = true;
    }
    if (router.query?.endDate && Number(router.query.endDate) !== filters.endDate) {
      queryFilters.endDate = Number(router.query.endDate);
      hasChanged = true;
    }
    if (router.query?.projectId && !filters.projectIds.includes(router.query.projectId as never)) {
      queryFilters.projectIds = [router.query.projectId];
      hasChanged = true;
    }

    if (hasChanged) {
      setFilters(queryFilters);
    }
  }, [router.query?.startDate, router.query?.endDate, router.query?.projectId]);

  useEffect(() => {
    setSelectedRows([]);
  }, [currentPage]);

  useEffect(() => {
    fetchExpenseData(router.query?.startDate, router.query?.endDate);
  }, [sortOrder, sortBy, currentPage, rowsPerPage, filters, currency]);

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

export default ExpensesHome;
