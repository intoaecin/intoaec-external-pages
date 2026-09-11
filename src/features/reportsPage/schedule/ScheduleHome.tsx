import { useAxios, useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { Box, Typography } from "@mui/material";
import { useSession } from "@/features/reportsPage/publicRuntime";
import { useRouter as useNavigation } from "@/features/reportsPage/publicRuntime";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
type Schedule = {
  scheduleId: string;
  projectName?: string;
  parentId?: string | null;
  parentScheduleName?: string;
  scheduleName: string;
  description?: string;
  scheduleAssignees?: Array<{ id: string; name: string }>;
  selectedAssignees?: Array<{ id: string; name: string }>;
  scheduleCompletionPercentage?: number | string;
  scheduleStartDate: number | Date;
  scheduleEndDate: number | Date;
  scheduleDuration?: number | string;
  completedAt?: number | null;
  createdAt?: string;
  childrenIds?: string[];
};
import ReportsTable from "../ReportsTable";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import AssigneeAvatarGroup from "@/components_v2/AssigneeAvatarGroup";
import { useUsersData } from "@/features/hooks/useUsersData";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { formatDateBasedOnOrganizationLocalization } from "@/lib/helpers";
const formatWorkingDurationMinutes = (value?: number | string | null) => {
  const totalMinutes = Math.round(Number(value));
  if (!Number.isFinite(totalMinutes) || totalMinutes === 0) return "0m";
  const sign = totalMinutes < 0 ? "-" : "";
  const absoluteMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;
  return (
    sign +
    [hours ? hours + "h" : "", minutes ? minutes + "m" : ""]
      .filter(Boolean)
      .join(" ")
  );
};

const ScheduleHome = () => {
  const { t } = useTranslation();
  const { usersData } = useUsersData();
  const { localizationValue } = useOrganizationLocalization();
  const normalizeAssignees = (
    selectedAssignees: Array<Record<string, unknown>> = []
  ) =>
    selectedAssignees
      .map((assignee) => ({
        id: String(assignee.id ?? assignee.userId ?? ""),
        name: String(assignee.name ?? assignee.userName ?? ""),
      }))
      .filter((assignee) => assignee.id && assignee.name);
  const formatLocalizedDate = (value?: string | number | null) => {
    if (!value) return "-";

    return formatDateBasedOnOrganizationLocalization(
      localizationValue,
      Number(value),
      false,
      true
    );
  };
  const formatMinutesToHours = (value?: string | number | null) => {
    return formatWorkingDurationMinutes(value, {
      minutesPerWorkingDay: Number.MAX_SAFE_INTEGER,
    });
  };
  const formatDeviationDays = (
    completedAt?: string | number | null,
    scheduleEndDate?: string | number | null
  ) => {
    const deviationMinutes = getDeviationMinutes(completedAt, scheduleEndDate);
    if (deviationMinutes === null) {
      return "-";
    }

    const deviationDays =
      deviationMinutes === 0
        ? 0
        : Math.sign(deviationMinutes) *
          Math.ceil(Math.abs(deviationMinutes) / (24 * 60));

    return `${deviationDays}d`;
  };
  const getDeviationMinutes = (
    completedAt?: string | number | null,
    scheduleEndDate?: string | number | null
  ) => {
    const completedAtMs = Number(completedAt);
    const scheduleEndDateMs = Number(scheduleEndDate);
    if (!Number.isFinite(completedAtMs) || !Number.isFinite(scheduleEndDateMs)) {
      return null;
    }

    return Math.round((completedAtMs - scheduleEndDateMs) / (1000 * 60));
  };
  const renderDeviation = (row: any) => {
    const color =
      row.deviationMinutes < 0
        ? "success.main"
        : row.deviationMinutes > 0
          ? "error.main"
          : "text.primary";

    return (
      <Typography component="span" sx={{ color, fontWeight: 500 }}>
        {row.deviation || "-"}
      </Typography>
    );
  };

  const columns = [
    { display: t("common.projectName"), field: "projectName", isSort: true },
    { display: t("reports.scheduleName"), field: "scheduleName", isSort: true },
    { display: t("reports.phaseName"), field: "phaseName", isSort: true },
    {
      display: t("reports.assignee"),
      field: "scheduleAssigneeName",
      isSort: true,
      render: (row: any) => (
        <AssigneeAvatarGroup
          assignees={row.selectedAssignees ?? []}
          usersData={usersData}
          unassignedText={t("common.unassigned")}
        />
      ),
    },
    {
      display: t("reports.completionPercentage"),
      field: "scheduleCompletionPercentage",
      isSort: true,
    },
    {
      display: t("reports.startDate"),
      field: "scheduleStartDate",
      isSort: true,
    },
    {
      display: t("reports.estimatedCompletionDate"),
      field: "scheduleEndDate",
      isSort: true,
    },
    {
      display: t("reports.actualCompletionDate"),
      field: "completedAt",
      isSort: true,
    },
    { display: t("reports.totalDuration"), field: "scheduleDuration" },
    {
      display: t("reports.deviation"),
      field: "deviation",
      render: renderDeviation,
    },
    { display: t("reports.createdOn"), field: "createdAt", isSort: true },
  ];

  const fileHeaderData = [
    t("common.sNo"),
    t("common.projectName"),
    t("reports.scheduleName"),
    t("reports.phaseName"),
    t("reports.assignee"),
    t("reports.completionPercentage"),
    t("reports.startDate"),
    t("reports.scheduleEndDate"),
    t("reports.completedAt"),
    t("reports.totalDuration"),
  ];

  const router = useRouter();
  const { push: pushNav } = useNavigation();
  const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
  const { post } = useAxios(NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/session");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState<Schedule[]>([]);
  const { data: session } = useSession();

  // Add pagination and sorting states
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSchedules, setTotalSchedules] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [totalDeviation, setTotalDeviation] = useState<number>(0);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  // Add filters state similar to TaskHome
  const [filters, setFilters] = useState({
    projectIds: [],
    startDate: undefined,
    endDate: undefined,
    assigneeId: "",
  });

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
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
      reportName: "SCHEDULE",
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

  const fetchSchedulesForTable = async (startDate?: any, endDate?: any) => {
    setLoading(true);
    try {
      const response = await post({
        eventType: "FETCH_ALL_SCHEDULE",
        organizationId: session?.["custom:organization_id"] ?? organizationId,
        organizationType:
          session?.["custom:organization_type"] ?? organizationType,
        sortOrder: sortOrder,
        sortBy: sortBy,
        page: currentPage,
        rowsPerPage: rowsPerPage,
        projectIds: filters.projectIds,
        excludeParents: true,
        filters: {
          startDate: startDate ?? filters.startDate,
          endDate: endDate ?? filters.endDate,
          assigneeId: filters.assigneeId,
        },
      });

      if (response.code === "SCHEDULES_FETCHED") {
        // First, create a map of phases
        const phaseMap = new Map();
        response.body.result.forEach((schedule: any) => {
          if (schedule.childrenIds && schedule.childrenIds.length > 0) {
            phaseMap.set(schedule.scheduleId, {
              name: schedule.scheduleName,
            });
          }
        });
        // Then, map only non-phase schedules
        const schedules = response.body.result
          .filter(
            (schedule: any) =>
              !schedule.childrenIds || schedule.childrenIds.length === 0
          )
          .map((schedule: any) => ({
            id: schedule.scheduleId || String(schedule.createdAt),
            projectName: schedule.projectName || "-",
            scheduleName: schedule.scheduleName,
            description: schedule.description || "-",
            phaseName: schedule.parentId
              ? schedule.parentScheduleName || phaseMap.get(schedule.parentId)?.name || "-"
              : "-",
            selectedAssignees: normalizeAssignees(
              schedule.scheduleAssignees ?? schedule.selectedAssignees
            ),
            scheduleAssigneeName:
              normalizeAssignees(
                schedule.scheduleAssignees ?? schedule.selectedAssignees
              )
                .map((assignee) => assignee.name)
                .join(", ") || t("common.unassigned"),
            scheduleCompletionPercentage: `${schedule.scheduleCompletionPercentage}%`,
            scheduleStartDate: formatLocalizedDate(schedule.scheduleStartDate),
            scheduleEndDate: formatLocalizedDate(schedule.scheduleEndDate),
            completedAt: schedule.completedAt
              ? formatLocalizedDate(schedule.completedAt)
              : "-",
            scheduleDuration: formatMinutesToHours(schedule.scheduleDuration),
            deviation: schedule.completedAt
              ? formatDeviationDays(schedule.completedAt, schedule.scheduleEndDate)
              : "-",
            deviationMinutes: schedule.completedAt
              ? getDeviationMinutes(schedule.completedAt, schedule.scheduleEndDate)
              : null,
            createdAt: formatLocalizedDate(schedule.createdAt),
          }));

        setData(schedules);
        const totalCount = Number(response.body.totalCount) || 0;
        setTotalSchedules(totalCount);
        setTotalPages(Math.ceil(totalCount / rowsPerPage));
      }
    } catch (error: any) {
      console.error("Error fetching schedules:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedulesForDashboard = async () => {
    try {
      const response = await post({
        eventType: "FETCH_ALL_SCHEDULE",
        organizationId: session?.["custom:organization_id"],
        sortOrder: sortOrder,
        sortBy: sortBy,
        page: 1,
        rowsPerPage: totalSchedules || 1,
        projectIds: filters.projectIds,
        filters: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          assigneeId: filters.assigneeId,
        },
      });

      if (response.code === "SCHEDULES_FETCHED") {
        const allSchedules = response.body.result;

        if (!allSchedules || allSchedules.length === 0) {
          setTotalDuration(0);
          setTotalDeviation(0);
          return;
        }

        const totalDuration = allSchedules.reduce(
          (sum: number, schedule: any) =>
            sum + (Number(schedule?.scheduleDuration) || 0),
          0
        );

        const totalDeviation = allSchedules.reduce(
          (sum: number, schedule: any) => {
            if (schedule?.completedAt) {
              const completedAt = parseInt(schedule.completedAt, 10);
              const scheduleEndDate = parseInt(schedule.scheduleEndDate, 10);
              const deviation = Math.floor(
                (completedAt - scheduleEndDate) / (1000 * 60 * 60 * 24)
              );
              return sum + deviation;
            }
            return sum;
          },
          0
        );

        setTotalDuration(totalDuration);
        setTotalDeviation(totalDeviation);
      }
    } catch (error: any) {
      console.error("Error fetching schedules for dashboard:", error);
      setTotalDuration(0);
      setTotalDeviation(0);
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
      setSelectedRows(data.map((row: any) => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  useEffect(() => {
    setSelectedRows([]);
  }, [currentPage]);

  // Add handler for sorting
  const handleSort = (order: "ASC" | "DESC", column: string) => {
    setSortOrder(order);
    setSortBy(column);
  };

  useEffect(() => {
    fetchSchedulesForTable(router.query?.startDate, router.query?.endDate);
  }, [sortOrder, sortBy, currentPage, rowsPerPage, filters]);

  useEffect(() => {
    setFilters((prev: any) => ({
      ...prev,
      startDate: Number(router.query?.startDate),
      endDate: Number(router.query?.endDate),
    }));
    fetchSchedulesForTable(router.query?.startDate, router.query?.endDate);
  }, [router.query?.startDate, router.query?.endDate]);

  useEffect(() => {
    fetchSchedulesForDashboard();
  }, [filters, sortOrder, sortBy]);

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

export default ScheduleHome;
