import { UIBreadCrumbs } from "@/features/components/UIBreadCrumbs";
import { useRouter as useNavigation } from "@/features/reportsPage/publicRuntime";
import ReportCard from "../ReportsDashboard";
import ReportsTable from "../ReportsTable";
import { useEffect, useState } from "react";
import { useEnv } from "@/features/hooks/useEnv";
import { useAxios, useAxiosWithAuth } from "@/features/hooks/useAxios";
import { Box, Grid, Tooltip, IconButton } from "@mui/material";
import { useSession } from "@/features/reportsPage/publicRuntime";
import { useTranslation } from "react-i18next";
import CustomDropdownExport from "@/features/components/customDropdownBtn/customDropdownExport";
import OrderedQuantity from "@/assets/icons/orderQuantity-icon";
import OrderedQuantityValue from "@/assets/icons/orderQuantityValue-icon";
import ReceivedQuantity from "@/assets/icons/receivedQuantity-icon";
import PendingQuantityIcon from "@/assets/icons/pendingQuantity-icon";
import UsedQuantity from "@/assets/icons/usedQuantity-icon";
import SettingsIcon from "@mui/icons-material/Settings";
import EmailDeliveryDialog from "../EmailDeliveryDialog";
import {
  formatNumberITL,
  formatSeedValues,
} from "@/lib/helpers";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import InventoryReportFilter from "./InventoryReportFilter";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { getReportCurrency } from "../utils";

const InventoryHome = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<any[]>([]);
  // const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  // const [sortBy, setSortBy] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [dashboardData, setDashboardData] = useState<any>({});
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [reportsConfig, setReportsConfig] = useState<any>();
  const [filters, setFilters] = useState({
    projectId: "",
    startDate: null,
    endDate: null,
  });
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session } = useSession();
  const { push: pushNav } = useNavigation();
  const { NEXT_PUBLIC_PROCUREMENT_ENDPOINT, NEXT_PUBLIC_USERHUB_ENDPOINT } =
    useEnv();
  const { post: fetch } = useAxios(
    NEXT_PUBLIC_PROCUREMENT_ENDPOINT + "/session"
  );
  const { post: fetchReports } = useAxiosWithAuth(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/reports"
  );
  const { organizationId, organizationName, organizationType, logoUrl } =
    useOrganization();
  const { localizationValue } = useOrganizationLocalization();

  const currency = getReportCurrency(localizationValue);

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const columns = [
    { display: t("common.projectName"), field: "projectName" },
    { display: t("inventoryManagement.groupName"), field: "groupName" },
    { display: t("inventoryManagement.itemName"), field: "itemName" },
    { display: t("inventoryManagement.source"), field: "itemSource" },
    {
      display: t("inventoryManagement.orderedQuantity"),
      field: "orderedQuantity",
    },
    {
      display: t("inventoryManagement.receivedQuantity"),
      field: "receivedQuantity",
    },
    {
      display: t("inventoryManagement.pendingQuantity"),
      field: "pendingQuantity",
    },
    { display: t("inventoryManagement.usedQuantity"), field: "usedQuantity" },
    { display: t("inventoryManagement.unusedQty"), field: "unusedQuantity" },
    { display: t("inventoryManagement.damagedQty"), field: "damagedQuantity" },
    {
      display: t("inventoryManagement.replacedQty"),
      field: "replacedQuantity",
    },
    { display: t("inventoryManagement.unit"), field: "itemUnit" },
    { display: t("inventoryManagement.itemRate"), field: "itemPricePerUnit" },
    { display: t("inventoryManagement.totalRate"), field: "itemsTotalPrice" },
  ];

  const fileHeaderData = [
    t("common.sNo"),
    t("common.projectName"),
    t("inventoryManagement.groupName"),
    t("inventoryManagement.itemName"),
    t("inventoryManagement.source"),
    t("inventoryManagement.orderedQuantity"),
    t("inventoryManagement.receivedQuantity"),
    t("inventoryManagement.pendingQuantity"),
    t("inventoryManagement.usedQuantity"),
    t("inventoryManagement.unusedQty"),
    t("inventoryManagement.damagedQty"),
    t("inventoryManagement.replacedQty"),
    t("inventoryManagement.unit"),
    t("inventoryManagement.itemRate"),
    t("inventoryManagement.totalRate"),
  ];

  const handleSort = (order: "ASC" | "DESC", column: string) => {};

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const handleSelectAllRows = (checked: boolean) => {
    if (checked) {
      setSelectedRows(tableData.map((row: any) => row.inventoryItemId));
    } else {
      setSelectedRows([]);
    }
  };

  const getDataForExport = () => {
    return tableData
      .filter((row: any) => selectedRows.includes(row.inventoryItemId))
      .map((row: any, index: number) => [
        index + 1,
        row.projectName,
        row.groupName,
        row.itemName,
        formatSeedValues(row.itemSource),
        row.orderedQuantity,
        row.receivedQuantity,
        row.pendingQuantity ??
          Math.max(row.orderedQuantity - row.receivedQuantity, 0),
        row.usedQuantity,
        Math.max(Number(row.receivedQuantity || 0) - Number(row.usedQuantity || 0), 0),
        row.damagedQuantity,
        row.replacedQuantity,
        row.itemUnit,
        row.itemPricePerUnit,
        row.itemsTotalPrice,
      ]);
  };

  const fetchInventoryData = async () => {
    const payload = {
      eventType: "GET_INVENTORY_FOR_REPORTS",
      organizationId: session?.["custom:organization_id"] ?? organizationId,
      organizationType:
        session?.["custom:organization_type"] ?? organizationType,
      page: currentPage,
      rowsPerPage,
      startDate: filters.startDate || router?.query?.startDate,
      endDate: filters.endDate || router?.query?.endDate,
      projectId: filters.projectId,
    };
    try {
      setIsLoading(true);
      const response = await fetch(payload);
      if (response.body) {
        const inventoryGroups = response.body.result || [];

        // Calculate totals from all inventory items
        const totals = inventoryGroups.reduce(
          (acc: any, group: any) => {
            group.inventoryItems.forEach((item: any) => {
              acc.totalOrdered += Number(item.orderedQuantity) || 0;
              acc.totalValue += Number(item.itemsTotalPrice) || 0;
              acc.totalReceived += Number(item.receivedQuantity) || 0;
              acc.totalPending += Number(item.pendingQuantity) || 0;
              acc.totalUsed += Number(item.usedQuantity) || 0;
            });
            return acc;
          },
          {
            totalOrdered: 0,
            totalValue: 0,
            totalReceived: 0,
            totalPending: 0,
            totalUsed: 0,
          }
        );

        totals.totalPending =
          response.body.totals?.pendingQty ?? totals.totalPending;
        totals.totalUnused = Math.max(
          totals.totalReceived - totals.totalUsed,
          0
        );

        setDashboardData(totals);
        // Map each inventory item with its group name
        const flattenedItems = inventoryGroups.flatMap((group: any) =>
          group.inventoryItems.map((item: any) => ({
            ...item,
            groupName: group.name,
          }))
        );
        setTableData(flattenedItems);
        setCurrentPage(response.body.currentPage || 1);
        setTotalPages(Math.ceil(response.body.totalCount / rowsPerPage));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const createReportsAutomation = async () => {
    const requestData: any = {
      eventType: "FETCH_REPORTS_AUTOMATION",
      organizationId: session?.["custom:organization_id"],
      reportName: "INVENTORY",
    };

    try {
      const res = await fetchReports(requestData);
      if (res?.code === "REPORT_AUTOMATION_RETRIEVED") {
        setReportsConfig(res.body);
      }
    } catch (error: any) {
      console.error("Error creating reports automation:", error);
    }
  };

  useEffect(() => {
    fetchInventoryData();
    createReportsAutomation();
  }, [currentPage, rowsPerPage, filters]);

  // Map data for table rendering, including calculated and formatted fields
  const mappedTableData = tableData.map((item) => ({
    ...item,
    pendingQuantity:
      item.pendingQuantity ??
      Math.max(item.orderedQuantity - item.receivedQuantity, 0),
    unusedQuantity: Math.max(
      Number(item.receivedQuantity || 0) - Number(item.usedQuantity || 0),
      0
    ),
    itemPricePerUnit: `${currency} ${formatNumberITL(
      localizationValue,
      Number(item.itemPricePerUnit)
    )}`,
    itemsTotalPrice: `${currency} ${formatNumberITL(
      localizationValue,
      Number(item.itemsTotalPrice)
    )}`,
    itemSource: formatSeedValues(item.itemSource),
    id: item.inventoryItemId,
  }));

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
      {!router?.query?.startDate && (
        <Box sx={{ flexShrink: 0, mt: 12, mx: 2 }}>
          <UIBreadCrumbs
            currentLabel={t("module.Inventory")}
            previousActionLabel={t("sidebar.reports")}
            onPreviousAction={() => {
              pushNav("/reports");
            }}
          />
          <InventoryReportFilter
            onApplyFilters={handleApplyFilters}
            filters={filters}
          />
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
                lg: "repeat(6, minmax(0, 1fr))",
              },
              alignItems: "stretch",
            }}
          >
            <ReportCard
              title={t("inventoryManagement.orderedQty")}
              value={dashboardData.totalOrdered?.toString() || "0"}
              label={t("inventoryManagement.orderedQty")}
              labelColor="#e0f7fa"
              titleIcon={<OrderedQuantity width={"18px"} height={"18px"} />}
            />

            <ReportCard
              title={t("inventoryManagement.orderedQtyValue")}
              value={`${currency} ${formatNumberITL(
                localizationValue,
                Number(dashboardData.totalValue)
              )}`}
              label={t("inventoryManagement.orderedQtyValue")}
              labelColor="#e0f7fa"
              titleIcon={
                <OrderedQuantityValue width={"18px"} height={"18px"} />
              }
            />

            <ReportCard
              title={t("inventoryManagement.receivedQty")}
              value={dashboardData.totalReceived?.toString() || "0"}
              label={t("inventoryManagement.receivedQty")}
              labelColor="#e0f7fa"
              titleIcon={<ReceivedQuantity width={"18px"} height={"18px"} />}
            />

            <ReportCard
              title={t("inventoryManagement.pendingQty")}
              value={dashboardData.totalPending?.toString() || "0"}
              label={t("inventoryManagement.pendingQty")}
              labelColor="#e0f7fa"
              titleIcon={<PendingQuantityIcon width={"18px"} height={"18px"} />}
            />

            <ReportCard
              title={t("inventoryManagement.usedQty")}
              value={dashboardData.totalUsed?.toString() || "0"}
              label={t("inventoryManagement.usedQty")}
              labelColor="#e0f7fa"
              titleIcon={<UsedQuantity width={"18px"} height={"18px"} />}
            />
            <ReportCard
              title={t("inventoryManagement.unusedQty")}
              value={dashboardData.totalUnused?.toString() || "0"}
              label={t("inventoryManagement.unusedQty")}
              labelColor="#e0f7fa"
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 2,
              gap: 1,
              alignItems: "center",
            }}
          >
            <Tooltip title={t("reportsAutomations.configTooltip")}>
              <IconButton
                sx={{ color: "primary.main" }}
                size="medium"
                onClick={() => {
                  setOpenEmailDialog(true);
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            <CustomDropdownExport
              isDisabled={selectedRows.length === 0}
              dataToExport={getDataForExport()}
              fileHeaderData={fileHeaderData}
              fileName="Inventory"
              hidePdf={true}
              fileTitle="Inventory Reports"
            />
          </Box>
        </Box>
      )}

      <EmailDeliveryDialog
        reportsData={reportsConfig}
        reportType="INVENTORY"
        open={openEmailDialog}
        onClose={() => {
          createReportsAutomation();
          setOpenEmailDialog(false);
        }}
      />

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
            onSort={(order, column) => {
              const columnDef = columns.find((col) => col.display === column);
              if (columnDef) {
                handleSort(order, columnDef.field);
              }
            }}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
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

export default InventoryHome;
