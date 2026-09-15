import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import {
  formatNumberITL,
  formatDateBasedOnOrganizationLocalization,
} from "@/lib/helpers";
import { Box } from "@mui/material";
import { useSession } from "@/features/reportsPage/publicRuntime";
import { useRouter as useNavigation } from "@/features/reportsPage/publicRuntime";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import ReportsTable from "../ReportsTable";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import { getReportCurrency } from "../utils";

const WorkersReportsHome = () => {
  const { t } = useTranslation();

  const columns = [
    { display: t("common.projectName"), field: "projectName", isSort: true },
    {
      display: t("common.workerName", { defaultValue: "Worker Name" }),
      field: "workerName",
      isSort: true,
    },
    {
      display: t("common.role", { defaultValue: "Role" }),
      field: "role",
      isSort: true,
    },
    {
      display: t("common.shiftName", { defaultValue: "Shift Name" }),
      field: "shiftName",
      isSort: true,
    },
    {
      display: t("common.shiftTime", { defaultValue: "Shift Time" }),
      field: "shiftTime",
      isSort: false,
    },
    {
      display: t("common.totalHours", { defaultValue: "Total Hours" }),
      field: "totalWorkedDuration",
      isSort: true,
    },
    {
      display: t("common.otHours", { defaultValue: "OT Hours" }),
      field: "overtimeDuration",
      isSort: true,
    },
    {
      display: t("common.workerRate", { defaultValue: "Worker Rate" }),
      field: "workerRate",
      isSort: false,
    },
    {
      display: t("common.otRate", { defaultValue: "OT Rate" }),
      field: "overTimeRate",
      isSort: false,
    },
    {
      display: t("common.calculatedTotalWage", {
        defaultValue: "Calculated Total Wage",
      }),
      field: "calculatedTotalWage",
      isSort: true,
    },
    {
      display: t("common.date", { defaultValue: "Date" }),
      field: "date",
      isSort: true,
    },
    {
      display: t("common.status", { defaultValue: "Status" }),
      field: "status",
      isSort: true,
    },
  ];

  const fileHeaderData = [
    t("common.sNo"),
    t("common.projectName"),
    t("common.workerName", { defaultValue: "Worker Name" }),
    t("common.role", { defaultValue: "Role" }),
    t("common.shiftName", { defaultValue: "Shift Name" }),
    t("common.shiftTime", { defaultValue: "Shift Time" }),
    t("common.totalHours", { defaultValue: "Total Hours" }),
    t("common.otHours", { defaultValue: "OT Hours" }),
    t("common.workerRate", { defaultValue: "Worker Rate" }),
    t("common.otRate", { defaultValue: "OT Rate" }),
    t("common.calculatedTotalWage", { defaultValue: "Calculated Total Wage" }),
    t("common.date", { defaultValue: "Date" }),
    t("common.status", { defaultValue: "Status" }),
  ];

  const router = useRouter();
  const { push: pushNav } = useNavigation();
  const { NEXT_PUBLIC_PROCUREMENT_ENDPOINT } = useEnv();
  const { post, response, data, loading, error } = useAxios(
    NEXT_PUBLIC_PROCUREMENT_ENDPOINT + "/session"
  );
  const [tableData, setTableData] = useState<any[]>([]);
  const { organizationId, organizationName, organizationType, logoUrl } =
    useOrganization();
  const [filters, setFilters] = useState({
    projectIds: [],
    date: null,
    workerId: null,
    searchParam: undefined,
    startDate: undefined,
    endDate: undefined,
  });
  const { data: session } = useSession();
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [sortBy, setSortBy] = useState<string>("date");
  const [apiSortBy, setApiSortBy] = useState<string>("startDate");
  const [apiSortOrder, setApiSortOrder] = useState<"ASC" | "DESC">("DESC");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const { localizationValue } = useOrganizationLocalization();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [reportsConfig, setReportsConfig] = useState<any>();
  const { NEXT_PUBLIC_USERHUB_ENDPOINT } = useEnv();
  const { post: fetchReports } = useAxios(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/reports"
  );

  const currency = getReportCurrency(localizationValue);

  const createReportsAutomation = async () => {
    const requestData: any = {
      eventType: "FETCH_REPORTS_AUTOMATION",
      organizationId: session?.["custom:organization_id"],
      reportName: "WORKERS",
    };

    try {
      const res = await fetchReports(requestData);
      if (res?.code === "REPORT_AUTOMATION_RETRIEVED") {
        setReportsConfig(res.body);
      }
    } catch (error: any) {
      console.error("Error fetching reports automation:", error);
    }
  };

  useEffect(() => {
    createReportsAutomation();
  }, []);

  const [openEmailDialog, setOpenEmailDialog] = useState(false);

  const fetchData = async (date?: any) => {
    setIsLoading(true);
    const requestData = {
      eventType: "GET_WORKERS_FOR_REPORTS",
      organizationId: session?.["custom:organization_id"] ?? organizationId,
      page: currentPage,
      rowsPerPage,
      date: date ?? filters.date,
      projectIds: filters.projectIds,
      startDate: filters.startDate || router?.query?.startDate,
      endDate: filters.endDate || router?.query?.endDate,
      workerId: filters.workerId,
      searchParam: filters.searchParam,
      sortOrder: apiSortOrder,
      sortBy: apiSortBy,
    };

    const res = await post(requestData);
    setIsLoading(false);
    if (res?.body) {
      const workers = res.body.result || [];
      setTableData(workers);
      setTotalPages(Math.ceil(res.body.totalCount / rowsPerPage));
    } else {
      console.error("Error fetching data:", error);
    }
  };

  const handleSort = (order: "ASC" | "DESC", column: string) => {
    setSortOrder(order);
    setSortBy(column);

    const apiSortColumns = ["projectName", "date"];
    if (apiSortColumns.includes(column)) {
      setApiSortBy(column === "date" ? "startDate" : column);
      setApiSortOrder(order);
    }
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
    setFilters((prev: any) => ({
      ...prev,
      date: Number(router.query?.date),
    }));
    fetchData(router.query?.date);
  }, [router.query?.date]);

  useEffect(() => {
    fetchData(router.query?.date);
  }, [filters, apiSortBy, apiSortOrder, currentPage, rowsPerPage]);

  useEffect(() => {
    setSelectedRows([]);
  }, [currentPage]);

  const sortedTableData = useMemo(() => {
    const apiSortColumns = ["projectName", "date"];
    if (apiSortColumns.includes(sortBy)) {
      return tableData;
    }

    const data = [...tableData];
    data.sort((a, b) => {
      let valA, valB;

      switch (sortBy) {
        case "calculatedTotalWage":
          valA = (a.workerRate || 0) + (a.overTimeRate || 0);
          valB = (b.workerRate || 0) + (b.overTimeRate || 0);
          break;
        case "shiftTime":
          valA = a.startTime || 0;
          valB = b.startTime || 0;
          break;
        case "workerRate":
        case "overTimeRate":
        case "totalWorkedDuration":
        case "overtimeDuration":
          valA = a[sortBy] || 0;
          valB = b[sortBy] || 0;
          break;
        case "workerName":
        case "role":
        case "status":
        default:
          valA = (a[sortBy]?.toString() || "").toLowerCase();
          valB = (b[sortBy]?.toString() || "").toLowerCase();
          break;
      }

      if (valA < valB) return sortOrder === "ASC" ? -1 : 1;
      if (valA > valB) return sortOrder === "ASC" ? 1 : -1;
      return 0;
    });
    return data;
  }, [tableData, sortBy, sortOrder]);

  const mappedTableData = sortedTableData.map((worker: any) => {
    // Calculate total wage: workerRate + overTimeRate
    const totalWage = (worker.workerRate || 0) + (worker.overTimeRate || 0);

    // Format shift time from startTime and endTime
    let shiftTime = worker.shiftTime || "-";
    if (worker.startTime && worker.endTime) {
      const startDate = new Date(parseInt(worker.startTime));
      const endDate = new Date(parseInt(worker.endTime));

      const formatTime = (date: Date) => {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const minutesStr = minutes < 10 ? "0" + minutes : minutes;
        return `${hours < 10 ? "0" + hours : hours}:${minutesStr} ${ampm}`;
      };

      shiftTime = `${formatTime(startDate)} - ${formatTime(endDate)}`;
    }

    return {
      id: worker.shiftWorkerId || String(worker.createdAt),
      projectName: worker.projectName || "-",
      workerName: worker.workerName || "-",
      role: worker.role || "-",
      shiftName: worker.shiftName || "-",
      shiftTime,
      totalWorkedDuration: worker.totalWorkedDuration || 0,
      overtimeDuration: worker.overtimeDuration || 0,
      workerRate: `${currency} ${formatNumberITL(
        localizationValue,
        worker.workerRate || 0
      )}`,
      overTimeRate: `${currency} ${formatNumberITL(
        localizationValue,
        worker.overTimeRate || 0
      )}`,
      calculatedTotalWage: `${currency} ${formatNumberITL(
        localizationValue,
        totalWage
      )}`,
      date: worker.date
        ? formatDateBasedOnOrganizationLocalization(
          localizationValue,
          worker.date,
          true
        )
        : "-",
      status: worker.status || "-",
    };
  });

  const getDataForExport = () => {
    return sortedTableData
      .filter((row: any) => selectedRows.includes(row.shiftWorkerId || row.id))
      .map((row: any, index: number) => {
        // Calculate total wage for export
        const totalWage = (row.workerRate || 0) + (row.overTimeRate || 0);
        const formattedDate = row.date
          ? formatDateBasedOnOrganizationLocalization(
            localizationValue,
            row.date,
            true
          )
          : "-";

        // Format shift time from startTime and endTime (same logic as mappedTableData)
        let shiftTime = row.shiftTime || "-";
        if (row.startTime && row.endTime) {
          const startDate = new Date(parseInt(row.startTime));
          const endDate = new Date(parseInt(row.endTime));

          const formatTime = (date: Date) => {
            let hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            const minutesStr = minutes < 10 ? '0' + minutes : minutes;
            return `${hours < 10 ? '0' + hours : hours}:${minutesStr} ${ampm}`;
          };

          shiftTime = `${formatTime(startDate)} - ${formatTime(endDate)}`;
        }


        return [
          index + 1,
          row.projectName,
          row.workerName,
          row.role,
          row.shiftName,
          shiftTime,
          row.totalWorkedDuration || 0,
          row.overtimeDuration || 0,
          row.workerRate || 0,
          row.overTimeRate || 0,
          totalWage,
          formattedDate,
          row.status,
        ];
      });
  };

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
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 10,
        }}
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
            data={mappedTableData}
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

export default WorkersReportsHome;
