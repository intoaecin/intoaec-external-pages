import { useAxios, useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { formatSeedValues } from "@/lib/helpers";
import { toLowerNoSpace } from "@/utils/string";
import { Box } from "@mui/material";
import { useRouter as useNavigation } from "@/features/reportsPage/publicRuntime";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReportsTable from "../ReportsTable";

import { useSession } from "@/features/reportsPage/publicRuntime";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";

const ProposalHome = () => {
  const { t } = useTranslation();

  const columns = [
    { display: t("common.projectName"), field: "projectName", isSort: true },
    {
      display: t("reports.proposalName"),
      field: "proposalTitle",
      isSort: true,
    },
    { display: t("reports.proposalStatus"), field: "proposalStatus" },
    { display: t("reports.senderName"), field: "createdBy", isSort: true },
    { display: t("reports.sentOn"), field: "createdAt", isSort: true },
    { display: t("reports.viewedOn"), field: "lastViewed", isSort: true },
    { display: t("reports.reSentCount"), field: "resent" },
    { display: t("reports.acceptedOn"), field: "acceptedOn" },
  ];

  const fileHeaderData = [
    t("common.sNo"),
    t("common.projectName"),
    t("reports.proposalName"),
    t("reports.proposalStatus"),
    t("reports.senderName"),
    t("reports.sentOn"),
    t("reports.viewedOn"),
    t("reports.reSentCount"),
    t("reports.acceptedOn"),
  ];
  const router = useRouter();
  const { push: pushNav } = useNavigation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const { NEXT_PUBLIC_PROPOSAL_ENDPOINT } = useEnv();
  const { post } = useAxios(NEXT_PUBLIC_PROPOSAL_ENDPOINT + "/session");
  const { organizationId, organizationName, organizationType, logoUrl } =
    useOrganization();
  const { data: session } = useSession();
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
  const { post: fetchReports } = useAxiosWithAuth(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/reports"
  );
  const createReportsAutomation = async () => {
    const requestData: any = {
      eventType: "FETCH_REPORTS_AUTOMATION",
      organizationId: session?.["custom:organization_id"],
      reportName: "PROPOSAL",
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

  const fetchSentProposals = async (startDate?: any, endDate?: any) => {
    setIsLoading(true);
    const requestData = {
      eventType: "FETCH_PROPOSALS_BY_PROJECT",
      organizationId: session?.["custom:organization_id"] ?? organizationId,
      organizationType:
        session?.["custom:organization_type"] ?? organizationType,
      sortOrder: sortOrder,
      sortBy: sortBy,
      page: currentPage,
      rowsPerPage: rowsPerPage,
      filters: {
        projectIds: filters.projectIds,
        status: filters.status,
        startDate: startDate ?? filters.startDate,
        endDate: endDate ?? filters.endDate,
        senderId: filters.senderId,
      },
    };

    const res: any = await post(requestData);

    if (res.code === "LEAD_PROPOSALS_RETRIEVED_SUCCESSFULLY") {
      setTotalSent(res?.body?.totalCount);
      const transformedData = res.body.result.map(
        (proposal: any, index: number) => {
          let proposalStatus = "Sent";
          if (proposal.declinedAt) {
            proposalStatus = "Declined";
          } else if (proposal.acceptedAt) {
            proposalStatus = "Accepted";
          } else if (proposal.lastViewed) {
            proposalStatus = "Viewed";
          }

          return {
            id: proposal.proposalId || String(index), // Add unique id
            projectName: proposal.projectName || "-",
            proposalTitle:
              t(`proposal.proposalCategory.${proposal.proposalTitle}`, {
                defaultValue: proposal.proposalTitle,
              }) || "-",
            proposalStatus:
              t(
                `leadDashboard.proposalStatusTypes.${toLowerNoSpace(
                  formatSeedValues(proposalStatus)
                )}`,
                {
                  defaultValue: formatSeedValues(proposalStatus),
                }
              ) || "-",
            createdBy: proposal.createdBy,
            createdAt: new Date(proposal.createdAt).toLocaleDateString(),
            lastViewed: proposal.lastViewed
              ? new Date(proposal.lastViewed).toLocaleDateString()
              : "-",
            resent: proposal.resent ? proposal.resent : "-",
            acceptedOn: proposal.acceptedAt
              ? new Date(proposal.acceptedAt).toLocaleDateString()
              : "-",
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
    fetchSentProposals(router.query?.startDate, router.query?.endDate);
  }, [router.query?.startDate, router.query?.endDate]);
  useEffect(() => {
    fetchSentProposals(router.query?.startDate, router.query?.endDate);
  }, [sortOrder, sortBy, currentPage, rowsPerPage, filters]); // Add filters to dependency array

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

export default ProposalHome;

