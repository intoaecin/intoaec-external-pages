import { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { TruncatedText } from "@/components_v2/TruncatedText";
import { formatDateBasedOnOrganizationLocalization } from "@/lib/helpers";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import ReportsTable from "../ReportsTable";
import { useExternalInventoryHistory } from "./useExternalInventoryHistory";

type ReportRow = { [key: string]: any };

const firstQueryValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/** Inventory history opened from a scheduled report email (no login). */
const InventoryHistoryPublicHome = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { localizationValue } = useOrganizationLocalization();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isFetching } = useExternalInventoryHistory({
    startDate: firstQueryValue(router.query.startDate),
    endDate: firstQueryValue(router.query.endDate),
    page: currentPage,
    rowsPerPage,
  });

  const columns = [
    { display: t("common.projectName"), field: "projectName" },
    { display: t("inventoryManagement.groupName"), field: "groupName" },
    { display: t("inventoryManagement.itemName"), field: "itemName" },
    {
      display: t("inventoryManagement.activity"),
      field: "logDescription",
      render: (row: ReportRow) => (
        <TruncatedText text={row.logDescription} limit={60} />
      ),
    },
    {
      display: t("inventoryManagement.quantityUpdate.usedBy"),
      field: "usedByName",
    },
    {
      display: t("inventoryManagement.quantityUpdate.remarks"),
      field: "remarks",
      render: (row: ReportRow) =>
        row.remarks ? <TruncatedText text={row.remarks} limit={40} /> : "-",
    },
    { display: t("inventoryManagement.receivedQty"), field: "receivedQuantity" },
    { display: t("inventoryManagement.pendingQty"), field: "pendingQuantity" },
    { display: t("inventoryManagement.usedQty"), field: "usedQuantity" },
    { display: t("inventoryManagement.damagedQty"), field: "damagedQuantity" },
    { display: t("inventoryManagement.replacedQty"), field: "replacedQuantity" },
    { display: t("inventoryManagement.movedToWarehouse"), field: "movedQuantity" },
    { display: t("common.createdBy"), field: "createdBy" },
    { display: t("inventoryManagement.timeStamp"), field: "createdAt" },
  ];

  const tableData = useMemo(
    () =>
      (data?.logs ?? []).map((log) => ({
        ...log,
        id: log.inventoryLogId,
        groupName: log.groupName || "-",
        usedByName: log.usedByName || "-",
        receivedQuantity: Number(log.receivedQuantity ?? 0),
        pendingQuantity: Number(log.pendingQuantity ?? 0),
        usedQuantity: Number(log.usedQuantity ?? 0),
        damagedQuantity: Number(log.damagedQuantity ?? 0),
        replacedQuantity: Number(log.replacedQuantity ?? 0),
        movedQuantity: Number(log.movedQuantity ?? 0),
        createdAt: localizationValue
          ? formatDateBasedOnOrganizationLocalization(
              localizationValue,
              Number(log.createdAt),
            )
          : new Date(Number(log.createdAt)).toLocaleString(),
      })),
    [data?.logs, localizationValue],
  );

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        position: "relative",
      }}
    >
      <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}>
        <LanguageSwitcher />
      </Box>
      <Box sx={{ mt: 6, mx: 1, overflowX: "auto" }}>
        <ReportsTable
          isExternalReport
          columns={columns}
          data={tableData}
          isLoading={isFetching}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          totalPages={Math.ceil((data?.totalCount ?? 0) / rowsPerPage)}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          rowIdField="id"
        />
      </Box>
    </Box>
  );
};

export default InventoryHistoryPublicHome;
