import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { formatSeedValues } from "@/lib/helpers";
import { Box } from "@mui/material";
import { useSession } from "@/features/reportsPage/publicRuntime";
import { useRouter as useNavigation } from "@/features/reportsPage/publicRuntime";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReportsTable from "../ReportsTable";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";

import { toLowerNoSpace } from "@/utils/string";

const AssetsHome = () => {
  const { t } = useTranslation();

  const columns = [
    {
      display: t("common.assetName", { defaultValue: "Asset Name" }),
      field: "assetName",
      isSort: true,
    },
    {
      display: t("common.category", { defaultValue: "Category" }),
      field: "category",
      isSort: true,
    },
    {
      display: t("common.assetId", { defaultValue: "Asset ID" }),
      field: "assetSerial",
      isSort: true,
    },
    {
      display: t("common.status", { defaultValue: "Status" }),
      field: "assetStatus",
      isSort: true,
    },
    {
      display: t("common.assetType", { defaultValue: "Asset Type" }),
      field: "assetType",
      isSort: true,
    },
    {
      display: t("common.ownershipType", { defaultValue: "Ownership Type" }),
      field: "ownershipType",
      isSort: true,
    },
    {
      display: t("common.assetLocation", { defaultValue: "Asset Location" }),
      field: "assetLocation",
      isSort: true,
    },
  ];

  const fileHeaderData = [
    t("common.sNo"),
    t("common.assetName", { defaultValue: "Asset Name" }),
    t("common.category", { defaultValue: "Category" }),
    t("common.assetId", { defaultValue: "Asset ID" }),
    t("common.status", { defaultValue: "Status" }),
    t("common.assetType", { defaultValue: "Asset Type" }),
    t("common.ownershipType", { defaultValue: "Ownership Type" }),
    t("common.assetLocation", { defaultValue: "Asset Location" }),
  ];

  const router = useRouter();
  const { push: pushNav } = useNavigation();
  const { NEXT_PUBLIC_PROCUREMENT_ENDPOINT } = useEnv();
  const { post, response, data, loading, error } = useAxios(
    NEXT_PUBLIC_PROCUREMENT_ENDPOINT + "/session"
  );
  const [tableData, setTableData] = useState([]);
  const { organizationId, organizationName, organizationType, logoUrl } =
    useOrganization();
  const [filters, setFilters] = useState({
    status: null,
    assetType: null,
    ownershipType: null,
    startDate: undefined,
    endDate: undefined,
  });
  const { data: session } = useSession();
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [sortBy, setSortBy] = useState<string>("");
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

  const createReportsAutomation = async () => {
    const requestData: any = {
      eventType: "FETCH_REPORTS_AUTOMATION",
      organizationId: session?.["custom:organization_id"],
      reportName: "ASSETS",
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

  const fetchData = async (startDate?: any, endDate?: any) => {
    setIsLoading(true);
    const requestData = {
      eventType: "GET_ASSETS_FOR_REPORTS",
      organizationId: session?.["custom:organization_id"] ?? organizationId,
      page: currentPage,
      rowsPerPage,
      startDate: startDate ?? filters.startDate,
      endDate: endDate ?? filters.endDate,
      status: filters.status,
      assetType: filters.assetType,
      ownershipType: filters.ownershipType,
      sortOrder: sortOrder,
      sortBy: sortBy,
    };

    const res = await post(requestData);
    setIsLoading(false);
    if (res?.body) {
      const assets =
        res.body.result?.map((asset: any) => ({
          id: asset.assetId || String(asset.createdAt),
          assetName: asset.assetName || "-",
          category: asset.category || "-",
          assetSerial: asset.assetSerial || "-",
          assetStatus:
            t(
              `common.${toLowerNoSpace(formatSeedValues(asset.assetStatus))}`,
              {
                defaultValue: formatSeedValues(asset.assetStatus),
              }
            ) || "-",
          assetType:
            t(
              `common.${toLowerNoSpace(formatSeedValues(asset.assetType))}`,
              {
                defaultValue: formatSeedValues(asset.assetType),
              }
            ) || "-",
          ownershipType:
            t(
              `common.${toLowerNoSpace(formatSeedValues(asset.ownershipType))}`,
              {
                defaultValue: formatSeedValues(asset.ownershipType),
              }
            ) || "-",
          assetLocation: asset.assetLocation || "-",
        })) || [];
      setTableData(assets);
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
  }, [filters, sortOrder, sortBy, currentPage, rowsPerPage]);

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

export default AssetsHome;

