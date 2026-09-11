import { useLeadData } from "@/features/components/providers/LeadProfileProvider";
import { useAxios, useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { getLocalizationValue, formatNumberITL } from "@/lib/helpers";
import { Box } from "@mui/material";
import { useSession } from "@/features/reportsPage/publicRuntime";
import { useRouter as useNavigation } from "@/features/reportsPage/publicRuntime";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReportsTable from "../ReportsTable";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";

const TimeTrackingHome = () => {
  const { t } = useTranslation();
  const columns = [
    { display: t("common.projectName"), field: "projectName", isSort: true },
    { display: t("timeTracking.linkedSchedule"), field: "scheduleName", isSort: true },
    { display: t("common.date"), field: "date", isSort: true },
    { display: t("common.user.one"), field: "username", isSort: true },
    { display: t("common.startTime"), field: "startTime" },
    { display: t("common.endTime"), field: "endTime" },
    { display: t("common.duration"), field: "duration" },
    { display: t("common.breakHours"), field: "totalBreakTime", isSort: true },
    { display: t("common.WAGE", { defaultValue: "Wage" }), field: "wage", isSort: true },
    { display: t("common.createdOn"), field: "createdAt", isSort: true },
  ];

  const fileHeaderData = [
    t("common.sNo"),
    t("common.projectName"),
    t("common.date"),
    t("common.user.one"),
    t("common.startTime"),
    t("common.endTime"),
    t("common.duration"),
    t("common.breakHours"),
    t("common.WAGE", { defaultValue: "Wage" }),
    t("common.createdOn"),
  ];

  const router = useRouter();
  const { push: pushNav } = useNavigation();
  const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
  const { post: fetchTimeSheets } = useAxios(
    NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/session"
  );
  const { data: session } = useSession();
  const { leadData } = useLeadData();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>();
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [sortBy, setSortBy] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    projectIds: [],
    startDate: undefined,
    endDate: undefined,
    userId: "",
  });
  const [currency, setCurrency] = useState<string>();
  const { localizationValue } = useOrganizationLocalization();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [reportsConfig, setReportsConfig] = useState<any>();
  const { NEXT_PUBLIC_USERHUB_ENDPOINT } = useEnv();
  const { post: fetchReports } = useAxiosWithAuth(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/reports"
  );
  const { organizationId, organizationName, organizationType, logoUrl } =
    useOrganization();

  const createReportsAutomation = async () => {
    const requestData: any = {
      eventType: "FETCH_REPORTS_AUTOMATION",
      organizationId: session?.["custom:organization_id"],
      reportName: "TIME_TRACKING",
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

  const getTimeSheets = async (startDate?: any, endDate?: any) => {
    setLoading(true);
    const requestData: any = {
      eventType: "GET_TIMESHEETS",
      organizationId: session?.["custom:organization_id"] ?? organizationId,
      organizationType:
        session?.["custom:organization_type"] ?? organizationType,
      filters: {
        projectIds: filters.projectIds,
        startDate: startDate ?? filters.startDate,
        endDate: endDate ?? filters.endDate,
        userId: filters.userId,
        pageNumber: currentPage,
        pageCount: rowsPerPage,
      },
      sortOrder: sortOrder,
      sortBy: sortBy,
    };

    try {
      const res = await fetchTimeSheets(requestData);
      if (res?.code === "TIMESHEET_RETRIEVED") {
        const timesheets = res.body.timesheets
          .filter((timesheet: any) => timesheet.status !== "CLOCKED_IN")
          .map(
            (timesheet: any, index: number) => ({
            id: timesheet.timesheetId || String(index),
            projectName: timesheet.projectName || "-",
            scheduleName: timesheet.scheduleName || "-",
            date: new Date(parseInt(timesheet.date)).toLocaleDateString(),
            username: timesheet.username,
            startTime: new Date(
              parseInt(timesheet.startTime)
            ).toLocaleTimeString(),
            endTime: new Date(parseInt(timesheet.endTime)).toLocaleTimeString(),
            duration: `${Math.floor(
              parseInt(timesheet.totalTimeLogged) / 3600000
            )} hrs`,
            totalBreakTime: `${Math.floor(
              parseInt(timesheet.totalBreakTime) / 3600000
            )} hrs`,
            wage: `${currency || ""} ${formatNumberITL(
              localizationValue,
              Number(timesheet.wage ?? 0),
            )}`.trim(),
            createdAt: new Date(
              parseInt(timesheet.createdAt)
            ).toLocaleDateString(),
          })
        );
        setData(timesheets);
        setTotalPages(res?.body?.pagination?.totalPages);
      } else {
        setError("Error fetching timesheets");
      }
    } catch (error: any) {
      setError(error.message);
      console.error("Network error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeSheetsDashboard = async () => {
    setLoading(true);
    const requestData: any = {
      eventType: "FETCH_TIMESHEET_DASHBOARD",
      organizationId: session?.["custom:organization_id"],
      filters: {
        projectIds: filters.projectIds,
        startDate: filters.startDate,
        endDate: filters.endDate,
        userId: filters.userId,
      },
    };

    try {
      const res = await fetchTimeSheets(requestData);
      if (res?.code === "TIMESHEET_PROJECT_DASHBOARD_DATA_RETRIEVED") {
        setDashboardData(res.body);
      } else {
        setError("Error fetching timesheets");
      }
    } catch (error: any) {
      setError(error.message);
      console.error("Network error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (order: "ASC" | "DESC", column: string) => {
    setSortOrder(order);
    setSortBy(column);
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
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
      setSelectedRows(data.map((row: any) => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  useEffect(() => {
    getTimeSheets(router.query?.startDate, router.query?.endDate);
  }, [sortOrder, sortBy, currentPage, rowsPerPage, filters]);

  useEffect(() => {
    setFilters((prev: any) => ({
      ...prev,
      startDate: Number(router.query?.startDate),
      endDate: Number(router.query?.endDate),
    }));
    getTimeSheets(router.query?.startDate, router.query?.endDate);
  }, [router.query?.startDate, router.query?.endDate]);

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
            data={data}
            isLoading={loading}
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

export default TimeTrackingHome;

