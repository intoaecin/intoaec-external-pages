import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { useUsersData } from "@/features/hooks/useUsersData";
import {
  formatNumberITL,
  formatSeedValues,
  getLocalizationValue,
} from "@/lib/helpers";
import { LeadsMasterTypes } from "@/types";
import { Box } from "@mui/material";
import { useRouter as useNavigation } from "@/features/reportsPage/publicRuntime";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReportsTable from "../ReportsTable";

import { useSession } from "@/features/reportsPage/publicRuntime";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";

const LeadsHome = () => {
  const { t } = useTranslation();

  const columns = [
    // { display: "Lead Name", field: "leadName" },
    { display: t("common.projectName"), field: "projectName", isSort: true },
    { display: t("common.email"), field: "leadEmail", isSort: true },
    { display: t("common.phoneNumber"), field: "leadMobile", isSort: true },
    { display: t("common.projectType"), field: "projectType", isSort: true },
    {
      display: t("common.projectLocation"),
      field: "projectLocation",
      isSort: true,
    },
    { display: t("common.projectArea"), field: "projectArea", isSort: true },
    {
      display: t("common.projectBudget"),
      field: "projectBudget",
      isSort: true,
    },
    {
      display: t("common.projectStatus"),
      field: "projectStatus",
      isSort: true,
    },
    { display: t("common.assignee"), field: "projectOwnerId" },
    { display: t("common.createdOn"), field: "createdAt", isSort: true },
  ];

  const fileHeaderData = [
    t("common.sNo"),
    t("common.projectName"),
    t("common.leadName"),
    t("common.email"),
    t("common.phoneNumber"),
    t("common.projectType"),
    t("common.projectLocation"),
    t("common.projectArea"),
    t("common.projectBudget"),
    t("common.projectStatus"),
    t("common.assignee"),
    t("common.createdOn"),
  ];

  const router = useRouter();
  const { push: pushNav } = useNavigation();
  const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
  const { post, response, data, loading, error } = useAxiosWithAuth<{
    body: {
      result: Array<LeadsMasterTypes>;
      totalCount: number;
      pageCount: number;
    };
  }>(NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/session");
  const { usersData } = useUsersData();
  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState({
    projectType: [],
    projectOwnerId: "",
    startDate: undefined,
    endDate: undefined,
    projectIds: [],
  });
  const { data: session } = useSession();

  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [sortBy, setSortBy] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [dashboardData, setDashboardData] = useState<any>();
  const [totalLeads, setTotalLeads] = useState<any>();
  const [transitionTime, setTransitionTime] = useState<any>();
  const [businessOpportunity, setBusinessOpportunity] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      reportName: "LEADS",
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

  const [currency, setCurrency] = useState<string>();
  const { localizationValue } = useOrganizationLocalization();
  useEffect(() => {
    if (localizationValue) {
      setCurrency(
        getLocalizationValue(localizationValue, "CURRENCY", "SYMBOL") ??
          undefined
      );
    }
  }, [localizationValue]);
  const fetchData = async (startDate?: any, endDate?: any) => {
    setIsLoading(true);
    const requestData = {
      eventType: "GET_LEADS",
      isConvertedToClient: false,
      organizationId: session?.["custom:organization_id"] ?? organizationId,
      organizationType:
        session?.["custom:organization_type"] ?? organizationType,
      sortOrder: sortOrder,
      sortBy: sortBy,
      pageNumber: currentPage,
      pageCount: rowsPerPage,
      filters: {
        projectType: filters.projectType,
        projectOwnerIds: filters.projectOwnerId ? [filters.projectOwnerId] : [],
        startDate: startDate ?? filters.startDate,
        endDate: endDate ?? filters.endDate,
        projectIds: filters.projectIds,
      },
    };

    const res = await post(requestData);

    setIsLoading(false);
    if (res.code === "LEAD_RETRIEVED") {
      const leads = res.body.result.map((lead: any) => ({
        id: lead.leadId || String(lead.createdAt),
        // leadName: lead.leadName,
        leadEmail: lead.leadEmail,
        leadMobile: lead.leadMobile,
        projectName: lead.projectName || "-",
        projectType:
          t(`projectType.${formatSeedValues(lead.projectType)}`, {
            defaultValue: formatSeedValues(lead.projectType),
          }) || "-",
        projectLocation: lead.projectLocation,
        projectArea: `${lead.projectArea} ${lead.projectAreaUnit}`,
        projectBudget: lead.projectBudget
          ? `${currency} ${formatNumberITL(
              localizationValue,
              lead.projectBudget
            )}`
          : "-",
        projectStatus: lead?.projectStatus
          ? formatSeedValues(lead?.projectStatus)
          : "",
        projectOwnerId:
          lead.projectOwnerId !== null
            ? usersData?.find((user) => user.userId === lead.projectOwnerId)
                ?.name || "Unknown"
            : "-",
        createdAt: new Date(parseInt(lead.createdAt)).toLocaleDateString(),
      }));
      setTableData(leads);
      setTotalPages(Math.ceil(res.body.totalCount / rowsPerPage));
    } else {
      console.error("Error fetching data:", error);
    }
  };

  const handleSort = (order: "ASC" | "DESC", column: string) => {
    setSortOrder(order);
    setSortBy(column);
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
      startDate: Number(router.query?.startDate),
      endDate: Number(router.query?.endDate),
    }));
    fetchData(router.query?.startDate, router.query?.endDate);
  }, [router.query?.startDate, router.query?.endDate]);
  useEffect(() => {
    fetchData(router.query?.startDate, router.query?.endDate);
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

export default LeadsHome;

