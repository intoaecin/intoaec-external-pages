import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Skeleton,
  Divider,
} from "@mui/material";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import CustomTable from "@/components/custom-table";
import {
  MaterialPlan,
  isPlanConvertedToIndent,
} from "../../types/materialPlanner";
import { useLocalizedDayjs } from "@/features/hooks/useLocalizedDayjs";
import { MaterialScheduleCarousel } from "./MaterialScheduleCarousel";

export interface GroupedMaterialPlan extends MaterialPlan {
  underlyingPlanIds: string[];
}

interface MaterialScheduleCardProps {
  plan: MaterialPlan;
  dateFormat: string;
  toLocalizedDayjs: ReturnType<typeof useLocalizedDayjs>["toLocalizedDayjs"];
}

function MaterialScheduleCard({
  plan,
  dateFormat,
  toLocalizedDayjs,
}: MaterialScheduleCardProps) {
  const { t } = useTranslation();
  const unit = plan.unit || "pcs";
  const unusedQuantity = Math.max(
    0,
    (plan.receivedQuantity ?? 0) - (plan.usedQuantity ?? 0),
  );
  const quantityFields: Array<[string, number, string]> = [
    ["schedule.plannedQty", plan.plannedQuantity, "primary.main"],
    ["schedule.receivedQty", plan.receivedQuantity ?? 0, "success.main"],
    ["schedule.usedQty", plan.usedQuantity ?? 0, "info.main"],
    ["schedule.unusedQty", unusedQuantity, "warning.main"],
  ];

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: 1,
        borderColor: "primary.light",
        borderRadius: 1,
        p: 1.5,
      }}
    >
      <Box sx={{ alignItems: "center", display: "flex", mb: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={500} noWrap>
            {plan.scheduleName || t("schedule.projectLevel")}
          </Typography>
          <Box sx={{ alignItems: "center", color: "text.secondary", display: "flex", gap: 0.5 }}>
            <CalendarDays size={16} />
            <Typography variant="caption" noWrap>
              {toLocalizedDayjs(plan.startDate)?.format(dateFormat) ?? "-"} –{" "}
              {toLocalizedDayjs(plan.endDate)?.format(dateFormat) ?? "-"}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider />
      <Box
        sx={{
          display: "grid",
          gap: 1,
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
          mt: 1,
        }}
      >
        {quantityFields.map(([label, quantity, color]) => (
          <Box
            key={label}
            sx={{
              minWidth: 0,
              pl: { md: 1 },
              "&:not(:first-of-type)": {
                borderLeft: { md: "1px solid" },
                borderLeftColor: "divider",
              },
            }}
          >
            <Typography variant="caption" color="text.secondary" noWrap>
              {t(label)}
            </Typography>
            <Typography variant="body2" fontWeight={500} sx={{ color }} noWrap>
              {quantity} {unit}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

interface PlannerMaterialTableProps {
  plans: MaterialPlan[];
  onDeletePlan?: (plan: GroupedMaterialPlan) => void;
  onSelectedPlansChange?: (plans: GroupedMaterialPlan[]) => void;
  onEditPlan?: (plan: GroupedMaterialPlan) => void;
  loading?: boolean;
}

export const PlannerMaterialTable: React.FC<PlannerMaterialTableProps> = ({
  plans,
  onDeletePlan,
  onSelectedPlansChange,
  onEditPlan,
  loading = false,
}) => {
  const { t } = useTranslation();
  const { dateFormat, toLocalizedDayjs } = useLocalizedDayjs();
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [selectedGroupedPlanIds, setSelectedGroupedPlanIds] = useState<string[]>(
    [],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const aggregatedPlans = useMemo<GroupedMaterialPlan[]>(() => {
    const map = new Map<string, GroupedMaterialPlan>();

    (plans || []).forEach((plan) => {
      const explicitCatalogId =
        plan.costCatalogId &&
        plan.costCatalogId !== "null" &&
        plan.costCatalogId !== "undefined" &&
        plan.costCatalogId.trim() !== "" &&
        !plan.costCatalogId.startsWith("manual_")
          ? plan.costCatalogId.trim()
          : undefined;

      const key = explicitCatalogId
        ? `cat_${explicitCatalogId.toLowerCase()}`
        : `individual_${plan.id}`;

      if (!map.has(key)) {
        map.set(key, {
          ...plan,
          costCatalogId: explicitCatalogId || plan.costCatalogId,
          underlyingPlanIds: [plan.id],
        });
      } else {
        const existing = map.get(key)!;
        const totalPlanned = (existing.plannedQuantity || 0) + (plan.plannedQuantity || 0);
        const totalReceived = (existing.receivedQuantity || 0) + (plan.receivedQuantity || 0);
        const totalUsed = (existing.usedQuantity || 0) + (plan.usedQuantity || 0);
        const totalUnused = Math.max(0, totalReceived - totalUsed);
        const totalCost = (existing.totalCost || 0) + (plan.totalCost || 0);

        map.set(key, {
          ...existing,
          plannedQuantity: totalPlanned,
          receivedQuantity: totalReceived,
          usedQuantity: totalUsed,
          unusedQuantity: totalUnused,
          totalCost,
          endDate: Math.max(existing.endDate, plan.endDate),
          isProjectLevel: !existing.scheduleId,
          scheduleId: existing.scheduleId,
          scheduleName: existing.scheduleName,
          costCatalogId: existing.costCatalogId || explicitCatalogId || plan.costCatalogId,
          underlyingPlanIds: [...existing.underlyingPlanIds, plan.id],
        });
      }
    });

    return Array.from(map.values());
  }, [plans]);

  useEffect(() => {
    setSelectedGroupedPlanIds((currentIds) =>
      currentIds.filter((id) => aggregatedPlans.some((plan) => plan.id === id)),
    );
  }, [aggregatedPlans]);

  const selectedGroupedPlans = useMemo(
    () =>
      aggregatedPlans.filter((plan) => selectedGroupedPlanIds.includes(plan.id)),
    [aggregatedPlans, selectedGroupedPlanIds],
  );

  useEffect(() => {
    onSelectedPlansChange?.(selectedGroupedPlans);
  }, [onSelectedPlansChange, selectedGroupedPlans]);
  const totalPages = Math.max(1, Math.ceil(aggregatedPlans.length / rowsPerPage));
  const paginatedPlans = useMemo(
    () =>
      aggregatedPlans.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage,
      ),
    [aggregatedPlans, currentPage, rowsPerPage],
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const selectedRowIndexes = useMemo(
    () =>
      paginatedPlans.reduce<number[]>((indexes, plan, index) => {
        if (selectedGroupedPlanIds.includes(plan.id)) indexes.push(index);
        return indexes;
      }, []),
    [paginatedPlans, selectedGroupedPlanIds],
  );

  const handleSelectionChange = (selectedIndexes: number[]) => {
    const visiblePlanIds = new Set(paginatedPlans.map((plan) => plan.id));
    const selectedPlanIdsOnPage = selectedIndexes
      .map((index) => paginatedPlans[index]?.id)
      .filter((id): id is string => Boolean(id));

    setSelectedGroupedPlanIds((currentIds) => [
      ...currentIds.filter((id) => !visiblePlanIds.has(id)),
      ...selectedPlanIdsOnPage,
    ]);
  };

  const hasRowActions = Boolean(onEditPlan || onDeletePlan);

  const columns = [
    {
      id: "materialName",
      label: t("schedule.materialName", { defaultValue: "Material Name" }),
      width: 260,
      align: "left" as const,
      render: (row: GroupedMaterialPlan) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {row.materialName}
          </Typography>
          {row.category && (
            <Typography variant="caption" color="text.secondary">
              {row.category}
            </Typography>
          )}
          {isPlanConvertedToIndent(row) && (
            <Typography
              variant="caption"
              color="primary.main"
              sx={{ display: "block" }}
            >
              {t("schedule.materialConvertedToIndentCaption", {
                indentSerial: row.indentSerial || row.indentId,
              })}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: "plannedQuantity",
      label: t("schedule.plannedQuantity", { defaultValue: "Planned Quantity" }),
      width: 160,
      align: "left" as const,
      render: (row: GroupedMaterialPlan) => (
        <Typography variant="body2" fontWeight={500}>
          {row.plannedQuantity} {row.unit || "pcs"}
        </Typography>
      ),
    },
    {
      id: "receivedQuantity",
      label: t("schedule.receivedQty", { defaultValue: "Received Qty" }),
      width: 160,
      align: "left" as const,
      render: (row: GroupedMaterialPlan) => {
        const val = row.receivedQuantity ?? 0;
        const isOverReceived = val > row.plannedQuantity;
        const progressTotal = Math.max(row.plannedQuantity, val, 1);
        const receivedWithinPlan = Math.min(val, row.plannedQuantity);
        return (
          <Box sx={{ minWidth: 140 }}>
            <Box
              sx={{
                display: "flex",
                height: 8,
                mb: 0.5,
                overflow: "hidden",
                borderRadius: 1,
                bgcolor: "action.disabledBackground",
              }}
            >
              <Box
                sx={{
                  width: `${(receivedWithinPlan / progressTotal) * 100}%`,
                  bgcolor: isOverReceived ? "success.main" : "primary.main",
                }}
              />
              {isOverReceived && (
                <Tooltip
                  title={t("schedule.materialOverReceivedTooltip", {
                    excess: val - row.plannedQuantity,
                    unit: row.unit || "pcs",
                  })}
                >
                  <Box
                    sx={{
                      width: `${((val - row.plannedQuantity) / progressTotal) * 100}%`,
                      bgcolor: "error.main",
                    }}
                  />
                </Tooltip>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {val}/{row.plannedQuantity} {row.unit || "pcs"}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: "usedQuantity",
      label: t("schedule.usedQty", { defaultValue: "Used Qty" }),
      width: 160,
      align: "left" as const,
      render: (row: GroupedMaterialPlan) => {
        const val = row.usedQuantity ?? 0;
        return (
          <Typography variant="body2">
            {val} {row.unit || "pcs"}
          </Typography>
        );
      },
    },
    {
      id: "unusedQuantity",
      label: t("schedule.unusedQty", { defaultValue: "Unused Qty" }),
      width: 160,
      align: "left" as const,
      render: (row: GroupedMaterialPlan) => {
        const unused = Math.max(
          0,
          (row.receivedQuantity ?? 0) - (row.usedQuantity ?? 0),
        );
        return (
          <Typography variant="body2">
            {unused} {row.unit || "pcs"}
          </Typography>
        );
      },
    },
    {
      id: "actions",
      label: t("common.actions", { defaultValue: "Actions" }),
      width: 150,
      align: "center" as const,
      render: (row: GroupedMaterialPlan) => (
        <Box
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}
        >
          {onEditPlan && (
            <Tooltip title={t("common.edit", { defaultValue: "Edit" })}>
              <IconButton size="small" onClick={() => onEditPlan(row)} sx={{ p: 0.5, color: "text.secondary" }}>
                <Pencil size={14} />
              </IconButton>
            </Tooltip>
          )}
          {onDeletePlan && (
            <Tooltip title={t("common.delete", { defaultValue: "Delete" })}>
              <IconButton
                size="small"
                onClick={() => onDeletePlan(row)}
                sx={{ p: 0.5, color: "error.main" }}
              >
                <Trash2 size={14} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ].filter((column) => hasRowActions || column.id !== "actions");

  if (loading) {
    return (
      <Box sx={{ p: 1.5 }} aria-busy="true">
        <Skeleton variant="rounded" height={50} />
        {[1, 2, 3, 4, 5].map((row) => (
          <Skeleton key={row} variant="rounded" height={52} sx={{ mt: 0.5 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        boxSizing: "border-box",
        display: "flex",
        flex: 1,
        flexDirection: "column",
        minHeight: 0,
        overflow: "hidden",
        p: 1.5,
        width: "100%",
      }}
    >
      {/* This app's CustomTable has no per-row selection locking, header
          preservation or hover highlight (intoaec-UI passes those here); the
          claim tab renders the table read-only, without selection. */}
      <CustomTable
        columns={columns}
        data={paginatedPlans}
        loading={false}
        showSelectAll={Boolean(onSelectedPlansChange) && aggregatedPlans.length > 0}
        selectedRows={selectedRowIndexes}
        onSelectionChange={handleSelectionChange}
        stickyHeader
        containerHeight="100%"
        onRowClick={(row) =>
          setExpandedPlanId((currentPlanId) =>
            currentPlanId === row.id ? null : row.id,
          )
        }
        renderExpandedRow={(row) =>
          expandedPlanId === row.id ? (
          <Box
            sx={{
              bgcolor: "grey.50",
              borderBottom: 1,
              borderColor: "divider",
              p: 1.5,
            }}
          >
            <Box
              sx={{
                alignItems: "baseline",
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                mb: 1,
              }}
            >
              <Typography variant="body1" fontWeight={500}>
                {t("schedule.materialPlanDetails", {
                  materialName: row.materialName,
                  defaultValue: "{{materialName}} - Plan Details",
                })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("schedule.planEntries", {
                  count: row.underlyingPlanIds.length,
                  defaultValue: "{{count}} planned entries",
                })}
              </Typography>
            </Box>
            <MaterialScheduleCarousel>
              {plans
                .filter((plan) => row.underlyingPlanIds.includes(plan.id))
                .map((plan) => (
                  <MaterialScheduleCard
                    key={plan.id}
                    plan={plan}
                    dateFormat={dateFormat}
                    toLocalizedDayjs={toLocalizedDayjs}
                  />
                ))}
            </MaterialScheduleCarousel>
          </Box>
          ) : null
        }
        emptyStateText={t("schedule.noMaterialsPlannedYet", {
          defaultValue: "No materials planned yet.",
        })}
        pagination={{
          totalPage: totalPages,
          onChangeRowsperPage: (event) => {
            setRowsPerPage(Number(event.target.value));
            setCurrentPage(1);
          },
          rowsPerPage,
          currentPage,
          onChangePage: setCurrentPage,
        }}
      />
    </Box>
  );
};
