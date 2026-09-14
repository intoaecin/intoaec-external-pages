import { CLIENT_REPORT_COLORS } from "@/constants/colors";
import EditIcon from "@/assets/icons/edit-icon";
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useClientReportInventory } from "./hooks/useClientReportInventory";

type InventoryReportItem = {
  id: string;
  category: string;
  name: string;
  ordered: number;
  received: number;
  used: number;
};

type ClientReportsInventoryProps = {
  isPreview?: boolean;
  disableFetch?: boolean;
  inventoryStatus?: Record<string, unknown>[];
  dateRange?: {
    startDate?: number;
    endDate?: number;
  };
  onInventoryStatusChange?: (inventoryStatus: Record<string, unknown>[]) => void;
};

const toNumber = (value: string | number | undefined) => Number(value) || 0;

const ClientReportsInventory = ({
  isPreview = false,
  disableFetch = false,
  inventoryStatus,
  dateRange,
  onInventoryStatusChange,
}: ClientReportsInventoryProps) => {
  const { t } = useTranslation();
  const { inventoryItems, loading } = useClientReportInventory(dateRange, {
    enabled: !disableFetch,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<string[]>([]);

  const inventoryReportItems = useMemo<InventoryReportItem[]>(
    () =>
      inventoryStatus
        ? inventoryStatus.map((item) => ({
            id: String(item.id ?? item.inventoryItemId ?? ""),
            category: String(item.category ?? item.groupName ?? "-"),
            name: String(item.name ?? item.itemName ?? "-"),
            ordered: toNumber(item.ordered as string | number),
            received: toNumber(item.received as string | number),
            used: toNumber(item.used as string | number),
          }))
        : inventoryItems.map((item) => ({
            id: item.inventoryItemId,
            category: item.groupName || "-",
            name: item.itemName || "-",
            ordered: toNumber(item.orderedQuantity),
            received: toNumber(item.receivedQuantity),
            used: toNumber(item.usedQuantity),
          })),
    [inventoryItems, inventoryStatus],
  );

  useEffect(() => {
    setSelectedInventoryIds(inventoryReportItems.map((item) => item.id));
  }, [inventoryReportItems]);

  const visibleInventoryItems = isEditing
    ? inventoryReportItems
    : inventoryReportItems.filter((item) =>
        selectedInventoryIds.includes(item.id),
      );
  const shouldShowGridDivider = loading || visibleInventoryItems.length > 0;

  useEffect(() => {
    onInventoryStatusChange?.(
      inventoryReportItems.filter((item) =>
        selectedInventoryIds.includes(item.id),
      ),
    );
  }, [inventoryReportItems, onInventoryStatusChange, selectedInventoryIds]);

  const handleToggleInventory = (inventoryId: string) => {
    setSelectedInventoryIds((prev) =>
      prev.includes(inventoryId)
        ? prev.filter((selectedInventoryId) => selectedInventoryId !== inventoryId)
        : [...prev, inventoryId],
    );
  };

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: CLIENT_REPORT_COLORS.sectionTitle,
          }}
        >
          {t("common.inventory", { defaultValue: "Inventory" })}
        </Typography>
        {!isPreview && isEditing && (
          <Button
            variant="contained"
            size="small"
            onClick={() => setIsEditing(false)}
            sx={{ minWidth: 56, textTransform: "none" }}
          >
            {t("common.save", { defaultValue: "Save" })}
          </Button>
        )}
        {!isPreview && !isEditing && (
          <IconButton
            size="small"
            sx={{ color: "primary.main" }}
            onClick={() => setIsEditing(true)}
          >
            <EditIcon width={16} height={16} fill="currentColor" />
          </IconButton>
        )}
      </Stack>

      <Box
        sx={{
          bgcolor: "background.paper",
          border: `1px solid ${CLIENT_REPORT_COLORS.border}`,
          borderRadius: 1,
          px: { xs: 1.5, sm: 2, lg: 3 },
          py: { xs: 1, sm: 1.5 },
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
            columnGap: { xs: 1.25, sm: 1.5, lg: 3 },
            rowGap: { xs: 1.25, sm: 1.5 },
            "&::before": {
              content: '""',
              display: {
                xs: "none",
                lg: shouldShowGridDivider ? "block" : "none",
              },
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "50%",
              width: "1px",
              bgcolor: CLIENT_REPORT_COLORS.border,
              transform: "translateX(-50%)",
            },
          }}
        >
          {loading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <Box
                key={`inventory-report-loading-${index}`}
                sx={{ px: { xs: 1.25, sm: 1.5 }, py: { xs: 1.25, sm: 1.5 } }}
              >
                <Stack spacing={1}>
                  <Skeleton variant="text" width="65%" height={20} />
                  <Skeleton variant="text" width="45%" height={24} />
                  <Skeleton variant="text" width="35%" height={20} />
                </Stack>
              </Box>
            ))
          ) : visibleInventoryItems.length > 0 ? (
            visibleInventoryItems.map((item) => {
              const isSelected = selectedInventoryIds.includes(item.id);

              return (
                <Box
                  key={item.id}
                  sx={{
                    px: { xs: 1.25, sm: 1.5 },
                    py: { xs: 1.25, sm: 1.5 },
                  }}
                >
                  <Stack
                    className="report-inventory-row"
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    spacing={{ xs: 1.25, md: 2 }}
                    sx={{ py: { xs: 1.25, sm: 1.5 } }}
                  >
                    <Stack
                      direction="row"
                      alignItems="flex-start"
                      spacing={1}
                      sx={{ minWidth: 0, flex: "1 1 auto" }}
                    >
                      {isEditing && (
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleToggleInventory(item.id)}
                          size="small"
                          sx={{ p: 0.5, mt: -0.5 }}
                        />
                      )}
                      <Box sx={{ minWidth: 0, width: "100%" }}>
                        <Typography
                          className="report-inventory-category"
                          sx={{
                            typography: "caption",
                            color: CLIENT_REPORT_COLORS.mutedText,
                            display: "block",
                            lineHeight: 1.25,
                            mb: 0.5,
                            overflowWrap: "anywhere",
                            wordBreak: "break-word",
                          }}
                        >
                          {item.category}
                        </Typography>
                        <Typography
                          className="report-inventory-name"
                          sx={{
                            typography: "body2",
                            display: "block",
                            lineHeight: 1.35,
                            overflowWrap: "anywhere",
                            wordBreak: "break-word",
                          }}
                        >
                          {item.name}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack
                      className="report-inventory-metrics"
                      spacing={0.5}
                      sx={{
                        minWidth: { md: 150 },
                        width: { xs: "100%", md: "auto" },
                        flexShrink: 0,
                      }}
                    >
                      {[
                        {
                          label: t("clientReport.ordered", {
                            defaultValue: "Ordered",
                          }),
                          value: item.ordered,
                        },
                        {
                          label: t("clientReport.received", {
                            defaultValue: "Received",
                          }),
                          value: item.received,
                        },
                        {
                          label: t("clientReport.used", {
                            defaultValue: "Used",
                          }),
                          value: item.used,
                        },
                      ].map((metric) => (
                        <Stack
                          key={metric.label}
                          direction="row"
                          justifyContent="space-between"
                          spacing={2}
                        >
                          <Typography
                            sx={{
                              typography: "caption",
                              color: CLIENT_REPORT_COLORS.mutedText,
                            }}
                          >
                            {metric.label} :
                          </Typography>
                          <Typography
                            sx={{
                              typography: "body2",
                              color: "primary.main",
                            }}
                          >
                            {metric.value}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Box>
              );
            })
          ) : (
            <Typography
              sx={{
                color: CLIENT_REPORT_COLORS.mutedText,
                typography: "body2",
                px: { xs: 1.25, sm: 1.5 },
                py: { xs: 1.25, sm: 1.5 },
              }}
            >
              {t("clientReport.noInventorySelected", {
                defaultValue: "No inventory selected",
              })}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ClientReportsInventory;
