import { type RefObject } from "react";
import { Box, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useTranslation } from "react-i18next";
import { GANTT_SCHEDULE_ROW_HEIGHT_PX } from "../../helpers/constants";
import { AssetPlan } from "../../types/assetPlanner";

const LIST_PANEL_WIDTH = 260;

interface PlannerAssetListPanelProps {
  plans: AssetPlan[];
  bodyHeightPx: string;
  headerHeightPx: number;
  scrollTopPx: number;
  scrollRef: RefObject<HTMLDivElement>;
  onDeletePlan?: (planId: string) => void;
  onPlanClick?: (plan: AssetPlan) => void;
  onWheelScroll: (deltaY: number) => void;
}

export function PlannerAssetListPanel({
  plans,
  bodyHeightPx,
  headerHeightPx,
  scrollTopPx,
  scrollRef,
  onDeletePlan,
  onPlanClick,
  onWheelScroll,
}: PlannerAssetListPanelProps) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        width: LIST_PANEL_WIDTH,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        zIndex: 3,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: headerHeightPx,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "grey.50",
        }}
      >
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
          {t("schedule.plannerAssetsTab", { defaultValue: "Planned Assets" })}
        </Typography>
        <Chip
          size="small"
          label={plans.length}
          sx={{ height: 18, fontSize: 11, fontWeight: 600 }}
        />
      </Box>

      <Box
        ref={scrollRef}
        sx={{ flex: 1, overflow: "hidden" }}
        onWheel={(event) => {
          if (event.deltaY === 0) return;
          event.preventDefault();
          onWheelScroll(event.deltaY);
        }}
      >
        <Box
          sx={{
            height: bodyHeightPx,
            transform: `translateY(-${scrollTopPx}px)`,
            willChange: "transform",
          }}
        >
          {plans.map((plan) => {
            const statusConfig =
              plan.status === "RECEIVED"
                ? { label: t("schedule.received", { defaultValue: "Received" }), color: "success" as const }
                : plan.status === "REQUESTED"
                ? { label: t("schedule.requested", { defaultValue: "Requested" }), color: "warning" as const }
                : { label: t("schedule.planned", { defaultValue: "Planned" }), color: "default" as const };

            return (
              <Box
                key={plan.id}
                sx={{
                  height: GANTT_SCHEDULE_ROW_HEIGHT_PX,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 1.25,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:hover": {
                    bgcolor: "action.hover",
                    "& .delete-btn": { opacity: 1 },
                  },
                  userSelect: "none",
                }}
                role="row"
              >
                <Box sx={{ minWidth: 0, flex: 1, mr: 1 }}>
                  <Tooltip title={plan.assetName} placement="right" disableInteractive>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: "text.primary",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {plan.assetName}
                    </Typography>
                  </Tooltip>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25 }}>
                    {plan.assetSerial && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontSize: 11,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {plan.assetSerial}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                  <Tooltip
                    title={
                      plan.status === "PLANNED"
                        ? t("schedule.clickToRequestAsset", {
                            defaultValue: "Click to request asset",
                          })
                        : plan.status === "REQUESTED"
                        ? t("schedule.clickToReceiveAsset", {
                            defaultValue: "Click to receive asset",
                          })
                        : t("schedule.assetReceived", {
                            defaultValue: "Asset received",
                          })
                    }
                  >
                    <Chip
                      size="small"
                      label={statusConfig.label}
                      variant={plan.status === "PLANNED" ? "outlined" : "filled"}
                      onClick={
                        plan.status !== "RECEIVED" && onPlanClick
                          ? (e) => {
                              e.stopPropagation();
                              onPlanClick(plan);
                            }
                          : undefined
                      }
                      sx={{
                        height: 20,
                        fontSize: 10,
                        fontWeight: 600,
                        cursor:
                          plan.status !== "RECEIVED" && onPlanClick
                            ? "pointer"
                            : "default",
                        "& .MuiChip-label": { px: 0.75 },
                        ...(plan.status === "REQUESTED"
                          ? {
                              bgcolor: "#fef3c7",
                              color: "#b45309",
                              border: "1px solid #fde68a",
                              "&:hover": { bgcolor: "#fde68a" },
                            }
                          : plan.status === "RECEIVED"
                          ? {
                              bgcolor: "#dcfce7",
                              color: "#15803d",
                              border: "1px solid #bbf7d0",
                            }
                          : {
                              bgcolor: "grey.100",
                              color: "text.secondary",
                            }),
                      }}
                    />
                  </Tooltip>
                  {onDeletePlan && (
                    <IconButton
                      size="small"
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePlan(plan.id);
                      }}
                      sx={{
                        opacity: 0,
                        transition: "opacity 0.2s",
                        p: 0.25,
                        color: "error.main",
                      }}
                      title={t("common.delete", { defaultValue: "Delete plan" })}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
