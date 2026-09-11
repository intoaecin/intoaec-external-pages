import { useAxios, useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { formatSeedValues } from "@/lib/helpers";
import { Box } from "@mui/material";
import { useSession } from "@/features/reportsPage/publicRuntime";
import { useRouter as useNavigation } from "@/features/reportsPage/publicRuntime";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReportsTable from "../ReportsTable";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";

const EmailsHome = () => {
  const { t } = useTranslation();

  const columns = [
    { display: t("reports.sentBy"), field: "sentBy" },
    { display: t("reports.sentTo"), field: "primaryEmailId", isSort: true },
    {
      display: t("reports.template"),
      field: "notificationTemplateName",
      isSort: true,
    },
    { display: t("reports.status"), field: "status" },
    { display: t("reports.sentOn"), field: "createdAt", isSort: true },
    { display: t("reports.deliveredOn"), field: "deliveredOn" },
    { display: t("reports.openedOn"), field: "openedOn" },
    { display: t("reports.bouncedOn"), field: "bouncedOn" },
  ];

  const fileHeaderData = [
    t("common.sNo"),
    t("reports.sentBy"),
    t("reports.sentTo"),
    t("reports.template"),
    t("reports.status"),
    t("reports.sentOn"),
    t("reports.deliveredOn"),
    t("reports.openedOn"),
    t("reports.bouncedOn"),
  ];

  const router = useRouter();
  const { data: session } = useSession();
  const { push: pushNav } = useNavigation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const { NEXT_PUBLIC_AECPOSTMAN_ENDPOINT } = useEnv();
  const { post } = useAxios(NEXT_PUBLIC_AECPOSTMAN_ENDPOINT + "/session");
  const { organizationId, organizationName, organizationType, logoUrl } =
    useOrganization();

  // Simplified state variables for pagination and sorting
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [sortBy, setSortBy] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSent, setTotalSent] = useState<any>();
  const [sentSuccessRate, setSentSuccessRate] = useState<any>();
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [reportsConfig, setReportsConfig] = useState<any>();
  const { NEXT_PUBLIC_USERHUB_ENDPOINT } = useEnv();
  const { post: fetchReports } = useAxiosWithAuth(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/reports"
  );
  const createReportsAutomation = async () => {
    const requestData: any = {
      eventType: "FETCH_REPORTS_AUTOMATION",
      organizationId: session?.["custom:organization_id"] ?? organizationId,
      organizationType:
        session?.["custom:organization_type"] ?? organizationType,
      reportName: "EMAIL",
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

  // Simplified filters state to match EmailReportsFilter
  const [filters, setFilters] = useState<{
    startDate: number | undefined;
    endDate: number | undefined;
  }>({
    startDate: undefined,
    endDate: undefined,
  });

  // Add selectedRows state with other states
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const fetchEmails = async (startDate?: any, endDate?: any) => {
    setIsLoading(true);
    const requestData = {
      eventType: "FETCH_SENT_EMAILS",
      organizationId: session?.["custom:organization_id"] ?? organizationId,
      organizationType:
        session?.["custom:organization_type"] ?? organizationType,
      sortOrder: sortOrder,
      sortBy: sortBy,
      pageNumber: currentPage,
      rowsPerPage: rowsPerPage,
      startDate: startDate ?? filters.startDate,
      endDate: endDate ?? filters.endDate,
    };

    const res = await post(requestData);
    console.log(res, "sadfsdf");
    if (res.code === "SENT_EMAILS_RETRIEVED") {
      const transformedData = res?.result?.result.map(
        (email: any, index: number) => {
          let status = "Sent";
          if (email.bouncedAt) {
            status = `Bounced`;
          } else if (email.deferredAt) {
            status = `Deferred`;
          } else if (email.clickedAt) {
            status = "Clicked";
          } else if (email.openedAt) {
            status = "Opened";
          } else if (email.deliveredAt) {
            status = "Delivered";
          } else if (email.processedAt) {
            status = "Processing";
          }

          return {
            id: email.emailId || String(index), // Add unique id
            sentBy: email.fromEmailId || "-",
            primaryEmailId: email.primaryEmailId || "-",
            notificationTemplateName: email.notificationTemplateName
              ? formatSeedValues(email.notificationTemplateName)
              : "MANUALLY SENT",
            status: status,
            createdAt: email.createdAt
              ? new Date(Number(email.createdAt)).toLocaleDateString()
              : "-",
            deliveredOn: email.deliveredAt
              ? new Date(Number(email.deliveredAt) * 1000).toLocaleDateString()
              : "-",
            openedOn: email.openedAt
              ? new Date(Number(email.openedAt) * 1000).toLocaleDateString()
              : "-",
            bouncedOn: email.bouncedAt
              ? new Date(Number(email.bouncedAt) * 1000).toLocaleDateString()
              : "-",
          };
        }
      );
      setTableData(transformedData);
      setTotalPages(Math.ceil(res.result.totalCount / rowsPerPage));
    }
    setIsLoading(false);
  };

  const handleSort = (order: "ASC" | "DESC", column: string) => {
    setSortOrder(order);
    setSortBy(column);
  };

  // Simplified handleApplyFilters to match EmailReportsFilter
  const handleApplyFilters = (newFilters: {
    startDate: number | undefined;
    endDate: number | undefined;
  }) => {
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
    setFilters((prev: any) => ({
      ...prev,
      startDate: Number(router.query?.startDate),
      endDate: Number(router.query?.endDate),
    }));
    fetchEmails(router.query?.startDate, router.query?.endDate);
  }, [router.query?.startDate, router.query?.endDate]);
  useEffect(() => {
    setSelectedRows([]);
  }, [currentPage]);

  useEffect(() => {
    fetchEmails(router.query?.startDate, router.query?.endDate);
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

export default EmailsHome;

