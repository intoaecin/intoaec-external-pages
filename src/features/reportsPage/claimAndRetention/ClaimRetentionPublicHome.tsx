import { useMemo, useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import ReportsTable from "../ReportsTable";
import ClaimRetentionReportCards from "./ClaimRetentionReportCards";
import {
  CLAIM_RETENTION_REPORT_TABS,
  EMPTY_CLAIM_RETENTION_REPORT_FILTERS,
} from "./constants";
import { useClaimRetentionReport } from "./hooks/useClaimRetentionReport";
import type {
  ClaimRetentionReportSortOrder,
  ClaimRetentionReportTab,
} from "./types";
import { getClaimRetentionReportColumns } from "./utils/claimRetentionReportRows";

const parseDateParam = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return raw && Number.isFinite(parsed) ? parsed : undefined;
};

/** Claim & Retention report opened from a scheduled report email (no login). */
const ClaimRetentionPublicHome = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [tab, setTab] = useState<ClaimRetentionReportTab>("CLAIMS");
  const [sortOrder, setSortOrder] =
    useState<ClaimRetentionReportSortOrder>("DESC");
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // The emailed link carries the period; there are no other filters here.
  const filters = useMemo(
    () => ({
      ...EMPTY_CLAIM_RETENTION_REPORT_FILTERS,
      startDate: parseDateParam(router.query.startDate),
      endDate: parseDateParam(router.query.endDate),
    }),
    [router.query.startDate, router.query.endDate],
  );

  const { isLoading, tableData, totalPages, totals } = useClaimRetentionReport({
    tab,
    filters,
    sortBy,
    sortOrder,
    currentPage,
    rowsPerPage,
  });

  const columns = useMemo(() => getClaimRetentionReportColumns(tab, t), [tab, t]);

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
      <Box sx={{ mt: 6, mx: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        <Tabs
          value={CLAIM_RETENTION_REPORT_TABS.indexOf(tab)}
          onChange={(_, index: number) => {
            setTab(CLAIM_RETENTION_REPORT_TABS[index] ?? "CLAIMS");
            // Each tab has its own columns, so a sort from one doesn't carry over.
            setSortBy("");
            setSortOrder("DESC");
            setCurrentPage(1);
          }}
          aria-label={t("common.claimAndRetention")}
        >
          <Tab label={t("claimAndRetention.claims")} />
          <Tab label={t("claimAndRetention.retention")} />
        </Tabs>
        <ClaimRetentionReportCards tab={tab} totals={totals} />
        <Box sx={{ overflowX: "auto" }}>
          <ReportsTable
            isExternalReport
            columns={columns}
            data={tableData}
            isLoading={isLoading}
            sortOrder={sortOrder}
            onSort={(order, columnDisplay) => {
              const column = columns.find((col) => col.display === columnDisplay);
              if (column) {
                setSortOrder(order);
                setSortBy(column.field);
              }
            }}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setCurrentPage(1);
            }}
            rowIdField="id"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ClaimRetentionPublicHome;
