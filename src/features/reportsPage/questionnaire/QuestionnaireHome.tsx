import { useAxios, useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { formatSeedValues } from "@/lib/helpers";
import { toLowerNoSpace } from "@/utils/string";
import { Box } from "@mui/material";
import { useSession } from "@/features/reportsPage/publicRuntime";
import { useRouter as useNavigation } from "@/features/reportsPage/publicRuntime";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReportsTable from "../ReportsTable";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";

const QuestionnaireHome = () => {
  const { t } = useTranslation();

  const columns = [
    { display: t("common.projectName"), field: "projectName", isSort: true },
    { display: t("reports.questionnaireName"), field: "title", isSort: true },
    { display: t("reports.status"), field: "status" },
    { display: t("reports.senderName"), field: "createdBy", isSort: true },
    { display: t("reports.sentOn"), field: "createdAt", isSort: true },
    { display: t("reports.respondedOn"), field: "respondedOn" },
    { display: t("reports.reSentCount"), field: "resent" },
    { display: t("reports.questionsSent"), field: "questionsSent" },
  ];

  const fileHeaderData = [
    t("common.sNo"),
    t("common.projectName"),
    t("reports.questionnaireName"),
    t("reports.status"),
    t("reports.senderName"),
    t("reports.sentOn"),
    t("reports.respondedOn"),
    t("reports.reSentCount"),
    t("reports.questionsSent"),
  ];

  const router = useRouter();
  const { data: session } = useSession();
  const { push: pushNav } = useNavigation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const { NEXT_PUBLIC_PROPOSAL_ENDPOINT } = useEnv();
  const { post } = useAxios(NEXT_PUBLIC_PROPOSAL_ENDPOINT + "/answer");

  // Add new state variables for pagination and sorting
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [sortBy, setSortBy] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSent, setTotalSent] = useState<any>();
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [reportsConfig, setReportsConfig] = useState<any>();
  const { NEXT_PUBLIC_USERHUB_ENDPOINT } = useEnv();
  const { organizationId, organizationName, organizationType, logoUrl } =
    useOrganization();
  const { post: fetchReports } = useAxiosWithAuth(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/reports"
  );
  const createReportsAutomation = async () => {
    const requestData: any = {
      eventType: "FETCH_REPORTS_AUTOMATION",
      organizationId: session?.["custom:organization_id"],
      reportName: "QUESTIONNAIRE",
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
    senderId: "",
  });

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const fetchQuestionnaires = async (startDate?: any, endDate?: any) => {
    setIsLoading(true);
    const requestData = {
      eventType: "GET_ANSWER_QUESTIONNAIRE",
      organizationId: session?.["custom:organization_id"] ?? organizationId,
      organizationType:
        session?.["custom:organization_type"] ?? organizationType,
      sortOrder: sortOrder,
      sortBy: sortBy,
      page: currentPage,
      isSent: true,
      submittedByType: "USER",
      rowsPerPage: rowsPerPage,
      filters: {
        projectIds: filters.projectIds,
        status: filters.status,
        senderId: filters.senderId,
      },
      startDate: startDate ?? filters.startDate,
      endDate: endDate ?? filters.endDate,
    };
    const res = await post(requestData);

    if (res.code === "QUESTIONNAIRE_RETRIEVED") {
      setTotalSent(res.body.totalCount);
      const transformedData = res.body.result.map(
        (questionnaire: any, index: number) => {
          let status = "Sent";
          if (questionnaire.isSubmitted) {
            status = "Responded";
          } else if (questionnaire.opened) {
            status = "Viewed";
          }

          return {
            id: questionnaire.questionnaireId || String(index),
            projectName: questionnaire.projectName || "-",
            title:
              t(`questionnaire.questionnaireCategory.${questionnaire.title}`, {
                defaultValue: questionnaire.title,
              }) || "-",
            status:
              t(
                `leadDashboard.questionnaireStatusTypes.${toLowerNoSpace(
                  formatSeedValues(status)
                )}`,
                {
                  defaultValue: formatSeedValues(status),
                }
              ) || "-",
            createdBy: questionnaire.createdBy,
            createdAt: new Date(questionnaire.createdAt).toLocaleDateString(),
            respondedOn: questionnaire.submittedAt
              ? new Date(questionnaire.submittedAt).toLocaleDateString()
              : "-",
            resent: questionnaire.resent ? questionnaire.resent : "-",
            // lastRemainderSentOn: questionnaire.reminderSent
            //   ? new Date(questionnaire.reminderSent).toLocaleDateString()
            //   : "-",
            questionsSent: questionnaire.content
              ? `${questionnaire.content.length}`
              : "0",
          };
        }
      );
      setTableData(transformedData);
      setTotalPages(Math.ceil(res.body.totalCount / rowsPerPage));
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
    fetchQuestionnaires(router.query?.startDate, router.query?.endDate);
  }, [router.query?.startDate, router.query?.endDate]);

  useEffect(() => {
    fetchQuestionnaires(router.query?.startDate, router.query?.endDate);
  }, [sortOrder, sortBy, currentPage, rowsPerPage, filters]);

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

export default QuestionnaireHome;

