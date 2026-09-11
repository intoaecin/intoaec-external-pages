  import { useAxios, useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import {
  formatDateBasedOnOrganizationLocalization,
  formatSeedValues,
} from "@/lib/helpers";
import { toLowerNoSpace } from "@/utils/string";
import { Box } from "@mui/material";
import { useSession } from "@/features/reportsPage/publicRuntime";
import { useRouter as useNavigation } from "@/features/reportsPage/publicRuntime";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ReportsTable from "../ReportsTable";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import { useProjectNames } from "@/features/reports/indent/hooks/useProjectNames";
import AssigneeAvatarGroup from "@/components_v2/AssigneeAvatarGroup";
import { useUsersData } from "@/features/hooks/useUsersData";
import {
  buildAssigneeFilterPayload,
  formatTaskAssigneeDisplayText,
  normalizeTaskAssigneesFromTask,
} from "@/features/TaskManagement/utils/assignees";

type TaskReportTableRow = {
  id: string;
  projectName: string;
  taskHeader: string;
  taskAssigneesDisplay: { id: string; name: string }[];
  assignee: string;
  taskStatus: string;
  startDate: string;
  endDate: string;
  completedAt: string;
  overDue: string;
  createdAt: string;
};

const TasksHome = () => {
  const { t } = useTranslation();
  const { usersData } = useUsersData();
  const columns = useMemo(
    () => [
    { display: t("common.projectName"), field: "projectName", isSort: true },
    { display: t("reports.taskName"), field: "taskHeader", isSort: true },
    {
      display: t("reports.assignee"),
      field: "taskAssignee",
      isSort: true,
      render: (row: { taskAssigneesDisplay?: { id: string; name: string }[] }) => (
        <AssigneeAvatarGroup
          assignees={row.taskAssigneesDisplay ?? []}
          usersData={usersData}
          unassignedText={t("common.unassigned")}
          layout="inline"
          showName={(row.taskAssigneesDisplay?.length ?? 0) === 1}
        />
      ),
    },
    { display: t("reports.status"), field: "taskStatus", isSort: true },
    { display: t("reports.startDate"), field: "startDate", isSort: true },
    {
      display: t("reports.estimatedCompletionDate"),
      field: "endDate",
      isSort: true,
    },
    {
      display: t("reports.actualCompletionDate"),
      field: "completedAt",
      isSort: true,
    },
    { display: t("reports.overDue"), field: "overDue" },
    { display: t("reports.createdOn"), field: "createdAt", isSort: true },
  ],
    [t, usersData],
  );

  const fileHeaderData = [
    t("common.sNo"),
    t("common.projectName"),
    t("reports.taskName"),
    t("reports.assignee"),
    t("reports.status"),
    t("reports.startDate"),
    t("reports.estimatedCompletionDate"),
    t("reports.actualCompletionDate"),
    t("reports.overDue"),
    t("reports.createdOn"),
  ];
  const router = useRouter();
  const { push: pushNav } = useNavigation();
  const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
  const { post: fetchStatus } = useAxios(
    NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/session"
  );
  const [isTaskLoading, setIsTaskLoading] = useState<boolean>(false);
  const [data, setData] = useState<TaskReportTableRow[]>([]);
  const [dashboardData, setDashboardData] = useState<any>();
  const [totalSchedules, setTotalSchedules] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [totalDeviation, setTotalDeviation] = useState<number>(0);
  // Add pagination and sorting states
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [sortBy, setSortBy] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const { organizationId, organizationName, organizationType, logoUrl } =
    useOrganization();

  const { localizationLoading, localizationValue, refetch } =
    useOrganizationLocalization();

  const { data: session } = useSession();
  const orgId = session?.["custom:organization_id"] ?? organizationId;
  const { projectNames } = useProjectNames(orgId);

  const getProjectName = (projectId?: string, fallbackProjectName?: string | null) => {
    if (fallbackProjectName) return fallbackProjectName;
    if (!projectId) return "-";
    const project = projectNames?.find((p: { projectId: string }) => p.projectId === projectId);
    return project?.projectName || "-";
  };

  // Updated filters state - removed taskStatus
  const [filters, setFilters] = useState({
    projectIds: [],
    startDate: undefined,
    endDate: undefined,
    assigneeIds: [] as string[],
  });

  const assigneeFilterPayload = useMemo(
    () => buildAssigneeFilterPayload(filters.assigneeIds),
    [filters.assigneeIds],
  );

  // Add selectedRows state with other states
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [reportsConfig, setReportsConfig] = useState<any>();
  const { NEXT_PUBLIC_USERHUB_ENDPOINT } = useEnv();
  const { post: fetchReports } = useAxiosWithAuth(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/reports"
  );
  const createReportsAutomation = async () => {
    const requestData: any = {
      eventType: "FETCH_REPORTS_AUTOMATION",
      organizationId: session?.["custom:organization_id"],
      reportName: "TASKS",
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

  const mapApiTasksToRows = useCallback(
    (taskList: any[]) =>
      taskList.map((task: any, index: number) => ({
        id: task.taskId || String(index),
        projectName: getProjectName(task.projectId, task.projectName),
        taskHeader: task.taskHeader || "-",
        taskAssigneesDisplay: normalizeTaskAssigneesFromTask(task).map(
          ({ id, name }) => ({ id, name }),
        ),
        assignee: formatTaskAssigneeDisplayText(task, t("common.unassigned")),
        taskStatus: t(
          `taskStatus.${toLowerNoSpace(formatSeedValues(task.taskStatus))}`,
          { defaultValue: task.taskStatus },
        ),
        startDate: formatDateBasedOnOrganizationLocalization(
          localizationValue,
          task.startDate,
          false,
          true,
        ),
        endDate: formatDateBasedOnOrganizationLocalization(
          localizationValue,
          task.endDate,
          false,
          true,
        ),
        completedAt: task.isCompleted
          ? formatDateBasedOnOrganizationLocalization(
              localizationValue,
              task.completedAt,
              false,
              true,
            )
          : "-",
        overDue:
          task.endDate < Date.now() && !task.isCompleted
            ? (() => {
                const h = Math.floor((Date.now() - task.endDate) / 3600000);
                return `${Math.floor(h / 24)} day(s) ${h % 24} hour(s)`;
              })()
            : "-",
        createdAt: new Date(parseInt(task.createdAt)).toLocaleDateString(),
      })),
    [t, localizationValue, projectNames],
  );

  const fetchTasksForTable = async (startDate?: any, endDate?: any) => {
    try {
      setIsTaskLoading(true);
      const requestData = {
        eventType: "FETCH_TASKS",
        organizationId: session?.["custom:organization_id"] ?? organizationId,
        organizationType:
          session?.["custom:organization_type"] ?? organizationType,
        sortOrder: sortOrder,
        sortBy: sortBy,
        page: currentPage,
        rowsPerPage: rowsPerPage,
        projectIds: filters.projectIds,
        filters: {
          ...(Number.isFinite(filters.startDate)
            ? { startDate: filters.startDate }
            : {}),
          ...(Number.isFinite(filters.endDate)
            ? { endDate: filters.endDate }
            : {}),
          ...assigneeFilterPayload,
        },
      };

      const res = await fetchStatus(requestData);
      setIsTaskLoading(false);

      if (res.code === "TASKS_RETRIEVED") {
        setTotalSchedules(res?.body?.totalCount);
        setData(mapApiTasksToRows(res.body.result ?? []));
        setTotalPages(res.body.pageCount);
      } else {
        console.error("Failed to fetch tasks:", res.message);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setIsTaskLoading(false);
    }
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
      setSelectedRows(data.map((row: any) => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const getDataForExport = () => {
    return data
      .filter((row: any) => selectedRows.includes(row.id))
      .map((row: any, index: number) => [
        index + 1,
        row.projectName,
        row.taskHeader,
        row.assignee,
        row.taskStatus,
        row.startDate,
        row.endDate,
        row.completedAt,
        row.overDue,
        row.createdAt,
      ]);
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
    fetchTasksForTable(router.query?.startDate, router.query?.endDate);
  }, [router.query?.startDate, router.query?.endDate]);

  useEffect(() => {
    fetchTasksForTable(router.query?.startDate, router.query?.endDate);
  }, [sortOrder, sortBy, currentPage, rowsPerPage, filters, projectNames]);

  // useEffect(() => {
  //   if (totalSchedules > 0) {
  //     fetchTasksForDashboard();
  //   }
  // }, [totalSchedules]);

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
            isLoading={isTaskLoading}
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

export default TasksHome;

