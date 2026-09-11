import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useSession } from "@/features/reportsPage/publicRuntime";
import { useRouter } from "@/features/reportsPage/publicRuntime";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { getLocalizationValue } from "@/lib/helpers";
import BillsExpensesTable from "./components/BillsExpensesTable";
import { useAllBillsExpensesProjectIds } from "./hooks/useAllBillsExpensesProjectIds";
import { useBillsExpensesQuery } from "./hooks/useBillsExpensesQuery";
import { EMPTY_FILTERS } from "./types";
import type { BillsExpensesFilters } from "./types";

const BillsExpensesPublicHome = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const {
    organizationId: orgFromTheme,
    organizationType: orgTypeFromTheme,
  } = useOrganization();
  const { localizationValue } = useOrganizationLocalization();
  const currency =
    getLocalizationValue(localizationValue ?? [], "CURRENCY", "SYMBOL") ?? "";

  const organizationId =
    session?.["custom:organization_id"] ?? orgFromTheme;
  const organizationType =
    session?.["custom:organization_type"] ?? orgTypeFromTheme;

  const [filters, setFilters] =
    useState<BillsExpensesFilters>(EMPTY_FILTERS);
  const {
    ready: projectListReady,
    allProjectIds,
    isLoading: projectNamesLoading,
  } = useAllBillsExpensesProjectIds(organizationId, {
    withAuth: false,
    organizationType,
  });
  const [initialReportScopeReady, setInitialReportScopeReady] =
    useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const listQuery = useBillsExpensesQuery({
    withAuth: false,
    organizationId,
    organizationType,
    page,
    rowsPerPage,
    sortBy,
    sortOrder,
    filters,
    queryEnabled: initialReportScopeReady,
  });

  const rows = listQuery.data?.rows ?? [];

  useEffect(() => {
    if (!router.isReady) return;

    const parseDateParam = (value: string | string[] | undefined) => {
      if (!value) return undefined;
      const raw = Array.isArray(value) ? value[0] : value;
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const parseProjectIdsParam = (
      value: string | string[] | undefined,
    ): string[] | undefined => {
      if (!value) return undefined;
      const raw = Array.isArray(value) ? value[0] : value;
      const ids = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return ids.length > 0 ? ids : undefined;
    };

    const hasStartDate = Object.prototype.hasOwnProperty.call(
      router.query,
      "startDate",
    );
    const hasEndDate = Object.prototype.hasOwnProperty.call(
      router.query,
      "endDate",
    );
    const hasProjectIds = Object.prototype.hasOwnProperty.call(
      router.query,
      "projectIds",
    );

    if (!hasStartDate && !hasEndDate && !hasProjectIds) return;

    const startDate = parseDateParam(router.query.startDate);
    const endDate = parseDateParam(router.query.endDate);
    const projectIds = hasProjectIds
      ? parseProjectIdsParam(router.query.projectIds)
      : undefined;

    setFilters((prev) => ({
      ...prev,
      ...(hasStartDate && startDate !== undefined ? { startDate } : {}),
      ...(hasEndDate && endDate !== undefined ? { endDate } : {}),
      ...(hasProjectIds && projectIds !== undefined ? { projectIds } : {}),
    }));
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (!projectListReady) {
      setInitialReportScopeReady(false);
      return;
    }
    if (!router.isReady) {
      setInitialReportScopeReady(false);
      return;
    }
    const hasProjectIdsParam = Object.prototype.hasOwnProperty.call(
      router.query,
      "projectIds",
    );
    setFilters((prev) => ({
      ...prev,
      projectIds:
        hasProjectIdsParam && (prev.projectIds?.length ?? 0) > 0
          ? prev.projectIds
          : allProjectIds.length > 0
            ? allProjectIds
            : prev.projectIds,
    }));
    setInitialReportScopeReady(true);
  }, [projectListReady, allProjectIds, router.isReady, router.query]);

  useEffect(() => {
    setSortBy("");
  }, [filters]);

  const handleSort = (order: "ASC" | "DESC", column: string) => {
    setSortOrder(order);
    setSortBy(column);
  };

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
          mt: 6,
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
          <BillsExpensesTable
            isExternalReport={true}
            rows={rows}
            isLoading={projectNamesLoading || listQuery.isLoading}
            sortOrder={sortOrder}
            onSort={handleSort}
            currentPage={page}
            rowsPerPage={rowsPerPage}
            totalPages={listQuery.data?.pageCount ?? 1}
            onPageChange={setPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            currency={currency}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default BillsExpensesPublicHome;
