import { useAxios, useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useRouter as useNavigation } from "@/features/reportsPage/publicRuntime";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import { useEffect, useMemo, useState } from "react";
import ReportsTable from "../ReportsTable";

import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import {
  formatNumberITL,
  formatSeedValues,
  getLocalizationValue,
} from "@/lib/helpers";
import { toLowerNoSpace } from "@/utils/string";
import { Box } from "@mui/material";
import { useSession } from "@/features/reportsPage/publicRuntime";
import { useTranslation } from "react-i18next";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";

const parseTimestampQuery = (value: unknown): number | undefined => {
  const normalizedValue = Array.isArray(value) ? value[0] : value;
  if (typeof normalizedValue !== "string" || !normalizedValue) {
    return undefined;
  }

  const timestamp = Number(normalizedValue);
  return Number.isFinite(timestamp) ? timestamp : undefined;
};

const EstimateHome = () => {
  const { t } = useTranslation();

  const columns = [
    { display: t("common.projectName"), field: "projectName", isSort: true },
    {
      display: t("reports.estimateName"),
      field: "estimateTitle",
      isSort: true,
    },
    { display: t("reports.totalAmount"), field: "grandTotal", isSort: true },
    { display: t("reports.profitValue"), field: "totalProfit", isSort: true },
    { display: t("reports.status"), field: "status" },
    // { display: "Sent By", field: "createdBy",isSort:true },
    { display: t("reports.sentOn"), field: "createdAt", isSort: true },
    { display: t("reports.acceptedOn"), field: "acceptedAt" },
    { display: t("reports.declinedOn"), field: "declinedAt" },
  ];

  const fileHeaderData = [
    t("common.sNo"),
    t("common.projectName"),
    t("reports.estimateName"),
    t("reports.totalAmount"),
    t("reports.profitValue"),
    t("reports.status"),
    // "Sent By",
    t("reports.sentOn"),
    t("reports.acceptedOn"),
    t("reports.declinedOn"),
  ];
  const router = useRouter();
  const { data: session } = useSession();
  const { push: pushNav } = useNavigation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const { NEXT_PUBLIC_PROPOSAL_ENDPOINT } = useEnv();
  const { post } = useAxios(NEXT_PUBLIC_PROPOSAL_ENDPOINT + "/session");
  const { post: postFetch } = useAxiosWithAuth(
    NEXT_PUBLIC_PROPOSAL_ENDPOINT + "/lead-estimate"
  );
  const { organizationId, organizationName, organizationType, logoUrl } =
    useOrganization();
  // Add new state variables for pagination and sorting
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [sortBy, setSortBy] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSent, setTotalSent] = useState<any>();
  const [acceptedCount, setAcceptedCount] = useState<any>();
  const [totalApprovedAmount, setTotalApprovedAmount] = useState<any>();
  const [averageTimeTaken, setAverageTimeTaken] = useState<any>();
  const { localizationValue } = useOrganizationLocalization();
  const currency = useMemo(() => {
    if (!localizationValue) {
      return "";
    }

    return (
      getLocalizationValue(localizationValue, "CURRENCY", "SYMBOL") ??
      getLocalizationValue(localizationValue, "CURRENCY", "CODE") ??
      ""
    );
  }, [localizationValue]);
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
      reportName: "ESTIMATE",
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

  // Add state for row selection
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  // const [totalSent,setTotalSent] = useState<any>();

  const fetchSentProposals = async () => {
    setIsLoading(true);
    const requestData = {
      eventType: "FETCH_ESTIMATIONS_BY_PROJECT",
      organizationId: session?.["custom:organization_id"] ?? organizationId,
      organizationType:
        session?.["custom:organization_type"] ?? organizationType,
      sortOrder: sortOrder,
      sortBy: sortBy,
      page: currentPage,
      rowsPerPage: rowsPerPage,
      // Add filters to request
      startDate: parseTimestampQuery(router.query?.startDate),
      endDate: parseTimestampQuery(router.query?.endDate),
    };
    const res = await post(requestData);
    if (res.code === "BOQ_ESTIMATION_RETRIEVED_SUCCESSFULLY") {
      setTotalSent(res?.body?.totalCount);
      const transformedData = res.body.result.map(
        (estimate: any, index: number) => {
          let estimateStatus = "Sent";
          if (estimate.declinedAt) {
            estimateStatus = "Declined";
          } else if (estimate.acceptedAt) {
            estimateStatus = "Accepted";
          } else if (estimate.lastViewed) {
            estimateStatus = "Viewed";
          }

          return {
            id: estimate.estimateId || String(index), // Add unique id
            projectName: estimate.projectName || "-",
            estimateTitle: estimate.estimateTitle || "-",
            grandTotal: `${currency ? `${currency} ` : ""}${formatNumberITL(
              localizationValue,
              Number(estimate?.grandTotal),
            )}`,
            totalProfit: `${currency ? `${currency} ` : ""}${formatNumberITL(
              localizationValue,
              Number(estimate?.totalProfit),
            )}`,
            status: t(
              `estimateStatus.${toLowerNoSpace(
                formatSeedValues(estimateStatus)
              )}`,
              {
                defaultValue: formatSeedValues(estimateStatus),
              }
            ),
            // createdBy: estimate.createdBy,
            createdAt: new Date(estimate.createdAt).toLocaleDateString(),
            acceptedAt: estimate.acceptedAt
              ? new Date(estimate.acceptedAt).toLocaleDateString()
              : "-",
            // reSentOn: estimate.resent
            //   ? new Date(estimate.resent).toLocaleDateString()
            //   : "-",
            declinedAt: estimate.declinedAt
              ? new Date(estimate.declinedAt).toLocaleDateString()
              : "-",
          };
        }
      );
      setTableData(transformedData);
      setTotalPages(res.body.pageCount);
    }
    setIsLoading(false);
  };

  // Add handler for sorting
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
      setSelectedRows(tableData.map((row) => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  useEffect(() => {
    fetchSentProposals();

    // fetchEstimatesDashboard()
  }, [
    sortOrder,
    sortBy,
    currentPage,
    rowsPerPage,
    router.query?.startDate,
    router.query?.endDate,
    currency,
  ]);

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

export default EstimateHome;
