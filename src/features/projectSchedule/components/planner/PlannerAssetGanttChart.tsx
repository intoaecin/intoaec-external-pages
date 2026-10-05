import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { getLocalizationValue } from "@/lib/helpers";
import { usePanning } from "@/hooks/usePanning";
import {
  GANTT_DAY_HEADER_TOTAL_HEIGHT_PX,
  GANTT_SCHEDULE_ROW_HEIGHT_PX,
  GANTT_SUMMARY_TIMELINE_HEADER_HEIGHT_PX,
} from "../../helpers/constants";
import { useFetchWorkingCalendar } from "../../hooks/api/fetch-working-calendar";
import { useWorkloadGanttTimeline } from "../../hooks/useWorkloadGanttTimeline";
import type { WorkloadGanttRow } from "../../types/workload";
import { TimelineGrid } from "../TimelineGrid";
import { MemoizedTimelineHeader } from "../TimelineHeader";
import {
  AssetPlan,
  DailyAssetPlanOverride,
  getPlanDailyValues,
} from "../../types/assetPlanner";
import { buildDateKey } from "../../utils/workloadDateKeys";

dayjs.extend(utc);
dayjs.extend(timezone);

interface PlannerAssetGanttChartProps {
  plans: AssetPlan[];
  bodyHeightPx: string;
  scrollContainerRef?: RefObject<HTMLDivElement>;
  /** Disables cell clicks and inline quantity edits. */
  readOnly?: boolean;
  onPlanCellClick?: (plan: AssetPlan) => void;
  onUpdateDateOverride?: (
    planId: string,
    dateKey: string,
    override: DailyAssetPlanOverride | null,
  ) => void;
  onRequestAssetClick?: (plan: AssetPlan) => void;
  onReceiveAssetClick?: (plan: AssetPlan) => void;
  onRegisterScrollToToday?: (fn: () => void) => void;
  onVerticalScroll?: (scrollTop: number) => void;
}

export function PlannerAssetGanttChart({
  plans,
  bodyHeightPx,
  scrollContainerRef,
  readOnly = false,
  onPlanCellClick,
  onUpdateDateOverride,
  onRequestAssetClick,
  onReceiveAssetClick,
  onRegisterScrollToToday,
  onVerticalScroll,
}: PlannerAssetGanttChartProps) {
  const localContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = scrollContainerRef ?? localContainerRef;
  const router = useRouter();
  const projectId = router.query.projectId as string | undefined;
  const { t } = useTranslation();
  const { localizationValue } = useOrganizationLocalization();
  const organizationTimezone =
    (localizationValue &&
      getLocalizationValue(localizationValue, "TIMEZONE", "ID")) ||
    "UTC";
  const { data: workingCalendarData } = useFetchWorkingCalendar(projectId ?? null);

  const [editingCell, setEditingCell] = useState<{
    planId: string;
    dateKey: string;
  } | null>(null);
  const [inlinePlannedValue, setInlinePlannedValue] = useState<string>("");

  const handleStartInlineEdit = (
    plan: AssetPlan,
    dateKey: string,
    plannedQty: number,
    receivedQty?: number,
  ) => {
    setEditingCell({ planId: plan.id, dateKey });
    const currentVal =
      plan.status === "RECEIVED" || receivedQty !== undefined
        ? `${receivedQty ?? plannedQty}/${plannedQty}`
        : String(plannedQty);
    setInlinePlannedValue(currentVal);
  };

  const handleCommitInlineEdit = (
    plan: AssetPlan,
    dateKey: string,
  ) => {
    const val = inlinePlannedValue.trim();
    const currentValues = getPlanDailyValues(plan, dateKey);

    if (val.includes("/")) {
      const parts = val.split("/");
      const r = parseInt(parts[0].trim(), 10);
      const p = parseInt(parts[1].trim(), 10);
      if (!isNaN(p) && p > 0) {
        const receivedQuantity = !isNaN(r) && r >= 0 ? r : p;
        if (
          p === currentValues.plannedQuantity &&
          receivedQuantity === currentValues.receivedQuantity
        ) {
          setEditingCell(null);
          return;
        }

        onUpdateDateOverride?.(plan.id, dateKey, {
          plannedQuantity: p,
          receivedQuantity,
        });
      }
    } else {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        const receivedQuantity =
          plan.status === "RECEIVED" ? parsed : undefined;
        if (
          parsed === currentValues.plannedQuantity &&
          receivedQuantity === currentValues.receivedQuantity
        ) {
          setEditingCell(null);
          return;
        }

        if (plan.status === "RECEIVED") {
          onUpdateDateOverride?.(plan.id, dateKey, {
            plannedQuantity: parsed,
            receivedQuantity: parsed,
          });
        } else {
          onUpdateDateOverride?.(plan.id, dateKey, {
            plannedQuantity: parsed,
          });
        }
      }
    }
    setEditingCell(null);
  };

  const handleCancelInlineEdit = () => {
    setEditingCell(null);
  };

  // Synthetic WorkloadGanttRows for timeline calculation
  const syntheticRows: WorkloadGanttRow[] = useMemo(() => {
    return plans.map((p) => ({
      rowKey: `plan-${p.id}`,
      schedule: null,
    }));
  }, [plans]);

  // Overall min and max dates from plans
  const { minPlanDate, maxPlanDate } = useMemo(() => {
    if (!plans.length) {
      const now = new Date();
      return { minPlanDate: now, maxPlanDate: now };
    }
    let min = plans[0].startDate;
    let max = plans[0].endDate;
    for (const p of plans) {
      if (p.startDate < min) min = p.startDate;
      if (p.endDate > max) max = p.endDate;
    }
    return {
      minPlanDate: new Date(min),
      maxPlanDate: new Date(max),
    };
  }, [plans]);

  const {
    dates,
    pixelsPerUnit,
    scrollToToday,
    visibleTimelineRange,
    visibleTimelineStartIndex,
    visibleTimelineEndIndex,
    viewMode,
  } = useWorkloadGanttTimeline({
    rows: syntheticRows,
    startDate: minPlanDate,
    endDate: maxPlanDate,
    organizationTimezone,
    workingCalendarData,
    scrollContainerRef: containerRef,
  });

  const panningHandlers = usePanning(containerRef, { isBlocked: () => false });

  useEffect(() => {
    onRegisterScrollToToday?.(scrollToToday);
  }, [onRegisterScrollToToday, scrollToToday]);

  const headerHeightPx =
    viewMode === "day"
      ? GANTT_DAY_HEADER_TOTAL_HEIGHT_PX
      : GANTT_SUMMARY_TIMELINE_HEADER_HEIGHT_PX;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <Box
        ref={containerRef}
        aria-label={t("schedule.assetPlannerTimelineAriaLabel", {
          defaultValue: "Asset planner timeline",
        })}
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflowX: "auto",
          overflowY: "auto",
          position: "relative",
          cursor: "grab",
          borderLeft: "1px solid",
          borderColor: "divider",
        }}
        onMouseDown={panningHandlers.onMouseDown}
        onMouseMove={panningHandlers.onMouseMove}
        onMouseLeave={panningHandlers.onMouseLeave}
        onScroll={(event) => onVerticalScroll?.(event.currentTarget.scrollTop)}
      >
        <Box
          sx={{
            position: "sticky",
            top: 0,
            height: headerHeightPx,
            minWidth: "fit-content",
            zIndex: 10,
          }}
        >
          <MemoizedTimelineHeader
            dates={dates}
            disableWindowing={false}
            scrollContainerRef={containerRef}
            startIndex={visibleTimelineStartIndex}
            endIndex={visibleTimelineEndIndex}
          />
        </Box>

        <Box
          position="relative"
          sx={{
            height: bodyHeightPx,
            width: dates.length * pixelsPerUnit,
            minWidth: "100%",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <TimelineGrid
            dates={dates}
            disableWindowing={false}
            scrollContainerRef={containerRef}
            taskCount={plans.length}
            useStaticLines={false}
            workingDays={workingCalendarData?.workingDays}
            publicHolidays={workingCalendarData?.publicHolidays}
            showHorizontalLines={false}
            startIndex={visibleTimelineStartIndex}
            endIndex={visibleTimelineEndIndex}
          />

          {plans.map((plan, planIndex) => {
            const planStart = dayjs(plan.startDate).startOf("day").valueOf();
            const planEnd = dayjs(plan.endDate).endOf("day").valueOf();

            return (
              <Box
                key={plan.id}
                sx={{
                  position: "absolute",
                  top: planIndex * GANTT_SCHEDULE_ROW_HEIGHT_PX,
                  left: 0,
                  width: dates.length * pixelsPerUnit,
                  minWidth: "100%",
                  height: GANTT_SCHEDULE_ROW_HEIGHT_PX,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {dates.map((date, colIndex) => {
                  const left = colIndex * pixelsPerUnit;
                  if (
                    left + pixelsPerUnit < visibleTimelineRange.startPx ||
                    left > visibleTimelineRange.endPx
                  ) {
                    return null;
                  }

                  const dateTime = date.getTime();
                  const isWithinPlan =
                    dateTime >= planStart && dateTime <= planEnd;

                  if (!isWithinPlan) return null;

                  const dateKey = dayjs(date).format("YYYY-MM-DD");
                  const { plannedQuantity, receivedQuantity, hasOverride } =
                    getPlanDailyValues(plan, dateKey);

                  const isReceived = plan.status === "RECEIVED";
                  const isRequested = plan.status === "REQUESTED";

                  const badgeBg = isReceived
                    ? hasOverride
                      ? "#bbf7d0"
                      : "#dcfce7"
                    : isRequested
                    ? hasOverride
                      ? "#fef08a"
                      : "#fffbeb"
                    : hasOverride
                    ? "#dbeafe"
                    : "#eff6ff";

                  const badgeBorder = isReceived
                    ? "#22c55e"
                    : isRequested
                    ? "#f59e0b"
                    : "#3b82f6";

                  const badgeTextColor = isReceived
                    ? "#15803d"
                    : isRequested
                    ? "#92400e"
                    : "#1d4ed8";

                  const displayValue =
                    isReceived || receivedQuantity !== undefined
                      ? `${receivedQuantity ?? plannedQuantity}/${plannedQuantity}`
                      : `${plannedQuantity}`;

                  const tooltipTitle = hasOverride
                    ? t("schedule.assetCellOverriddenTooltip", {
                        defaultValue:
                          "{{name}}: Custom for this date ({{display}}). Double-click to edit.",
                        name: plan.assetName,
                        display: displayValue,
                        interpolation: { escapeValue: false },
                      })
                    : isReceived
                    ? t("schedule.assetReceivedCellTooltip", {
                        defaultValue:
                          "{{name}}: Received ({{received}}/{{planned}} planned). Double-click to edit.",
                        name: plan.assetName,
                        received: receivedQuantity ?? plannedQuantity,
                        planned: plannedQuantity,
                      })
                    : isRequested
                    ? t("schedule.assetRequestedCellTooltip", {
                        defaultValue:
                          "{{name}}: Requested (Awaiting receive). Click to receive asset.",
                        name: plan.assetName,
                      })
                    : t("schedule.assetPlannedCellTooltip", {
                        defaultValue:
                          "{{name}}: Planned ({{qty}} units). Click to request asset.",
                        name: plan.assetName,
                        qty: plannedQuantity,
                      });

                  const isEditing =
                    editingCell?.planId === plan.id &&
                    editingCell?.dateKey === dateKey;
                  const isReceivedValue =
                    plan.status === "RECEIVED" ||
                    receivedQuantity !== undefined;
                  const [editableReceived = "", editablePlanned = ""] =
                    inlinePlannedValue.split("/");
                  const inlineInputStyle: CSSProperties = {
                    background: "transparent",
                    border: "none",
                    color: badgeTextColor,
                    flex: 1,
                    fontFamily: "inherit",
                    fontSize: "12px",
                    fontWeight: 700,
                    height: 20,
                    margin: 0,
                    minWidth: 0,
                    outline: "none",
                    padding: 0,
                    textAlign: "center",
                    width: "100%",
                  };

                  return (
                    <Box
                      key={`cell-${plan.id}-${dateKey}`}
                      sx={{
                        position: "absolute",
                        left,
                        width: pixelsPerUnit,
                        top: 0,
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: isEditing ? 25 : 2,
                      }}
                    >
                      {isEditing ? (
                        <Box
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onBlur={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                              handleCommitInlineEdit(plan, dateKey);
                            }
                          }}
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: Math.min(pixelsPerUnit - 2, 56),
                            maxWidth: pixelsPerUnit - 2,
                            height: 26,
                            px: 0.5,
                            borderRadius: 1,
                            border: `1.5px solid ${badgeBorder}`,
                            bgcolor: "#ffffff",
                            boxShadow: `0 2px 8px ${badgeBorder}33`,
                            zIndex: 20,
                          }}
                        >
                          {isReceivedValue ? (
                            <>
                              <input
                                autoFocus
                                type="text"
                                inputMode="numeric"
                                maxLength={12}
                                value={editableReceived}
                                onChange={(e) =>
                                  setInlinePlannedValue(
                                    `${e.target.value.replace(/\D/g, "")}/${editablePlanned}`,
                                  )
                                }
                                onFocus={(e) => e.target.select()}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleCommitInlineEdit(plan, dateKey);
                                  } else if (e.key === "Escape") {
                                    handleCancelInlineEdit();
                                  }
                                }}
                                style={inlineInputStyle}
                              />
                              <Box component="span" sx={{ flexShrink: 0 }}>
                                /
                              </Box>
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={12}
                                value={editablePlanned}
                                onChange={(e) =>
                                  setInlinePlannedValue(
                                    `${editableReceived}/${e.target.value.replace(/\D/g, "")}`,
                                  )
                                }
                                onFocus={(e) => e.target.select()}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleCommitInlineEdit(plan, dateKey);
                                  } else if (e.key === "Escape") {
                                    handleCancelInlineEdit();
                                  }
                                }}
                                style={inlineInputStyle}
                              />
                            </>
                          ) : (
                            <input
                              autoFocus
                              type="text"
                              inputMode="numeric"
                              maxLength={12}
                              value={inlinePlannedValue}
                              onChange={(e) =>
                                setInlinePlannedValue(
                                  e.target.value.replace(/\D/g, ""),
                                )
                              }
                              onFocus={(e) => e.target.select()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleCommitInlineEdit(plan, dateKey);
                                } else if (e.key === "Escape") {
                                  handleCancelInlineEdit();
                                }
                              }}
                              style={inlineInputStyle}
                            />
                          )}
                        </Box>
                      ) : (
                        <Tooltip title={tooltipTitle} arrow placement="top">
                          <Box
                            onClick={readOnly ? undefined : (e) => {
                              e.stopPropagation();
                              if (plan.status === "RECEIVED") {
                                handleStartInlineEdit(
                                  plan,
                                  dateKey,
                                  plannedQuantity,
                                  receivedQuantity,
                                );
                              } else {
                                onPlanCellClick?.(plan);
                              }
                            }}
                            onDoubleClick={readOnly ? undefined : (e) => {
                              e.stopPropagation();
                              handleStartInlineEdit(
                                plan,
                                dateKey,
                                plannedQuantity,
                                receivedQuantity,
                              );
                            }}
                            role={readOnly ? undefined : "button"}
                            tabIndex={readOnly ? undefined : 0}
                            sx={{
                              minWidth: Math.min(pixelsPerUnit - 2, 56),
                              maxWidth: pixelsPerUnit - 2,
                              height: 26,
                              px: 0.5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 1,
                              border: `1.5px ${hasOverride ? "dashed" : "solid"} ${badgeBorder}`,
                              bgcolor: badgeBg,
                              color: badgeTextColor,
                              cursor: readOnly ? "default" : "pointer",
                              userSelect: "none",
                              transition: "all 0.15s ease-in-out",
                              boxShadow: hasOverride
                                ? "0 1px 4px rgba(0,0,0,0.12)"
                                : "0 1px 2px rgba(0,0,0,0.05)",
                              "&:hover": {
                                transform: "scale(1.06)",
                                boxShadow: "0 3px 6px rgba(0,0,0,0.12)",
                                borderColor: "#2563eb",
                              },
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 700,
                                fontSize: 11,
                                lineHeight: 1,
                                color: "inherit",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {displayValue}
                            </Typography>
                          </Box>
                        </Tooltip>
                      )}
                    </Box>
                  );
                })}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
