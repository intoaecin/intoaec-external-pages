import { useCallback, useRef, useState, type ReactNode } from "react";
import { Box, Button } from "@mui/material";
import TodayIcon from "@mui/icons-material/Today";
import { useTranslation } from "react-i18next";

import NoDataFound from "@/components_v2/NoDataFound";
import { useProjectSchedule } from "../../context/ScheduleProvider";
import { useSyncedVerticalScroll } from "../../hooks/useSyncedVerticalScroll";
import {
  GANTT_DAY_HEADER_TOTAL_HEIGHT_PX,
  GANTT_SUMMARY_TIMELINE_HEADER_HEIGHT_PX,
} from "../../helpers/constants";
import {
  buildGanttPanelBodyHeight,
  buildListPanelBodyHeight,
} from "../../utils/ganttBodyHeight";
import { ProjectScheduleSkeleton } from "../ProjectScheduleSkeleton";
import type { AssetPlan, DailyAssetPlanOverride } from "../../types/assetPlanner";
import { PlannerAssetListPanel } from "./PlannerAssetListPanel";
import { PlannerAssetGanttChart } from "./PlannerAssetGanttChart";

interface PlannerAssetBoardProps {
  plans: AssetPlan[];
  loading: boolean;
  /** Disables cell clicks and inline quantity edits. */
  readOnly?: boolean;
  /** Extra toolbar buttons rendered after "Today" (e.g. "Plan Asset"). */
  toolbarActions?: ReactNode;
  /** Call to action rendered under the empty state. */
  emptyStateAction?: ReactNode;
  onDeletePlan?: (planId: string) => void;
  onPlanClick?: (plan: AssetPlan) => void;
  onUpdateDateOverride?: (
    planId: string,
    dateKey: string,
    override: DailyAssetPlanOverride | null,
  ) => void;
}

/** Asset list + asset gantt with synced scrolling, fed with already-loaded plans. */
export function PlannerAssetBoard({
  plans,
  loading,
  readOnly = false,
  toolbarActions,
  emptyStateAction,
  onDeletePlan,
  onPlanClick,
  onUpdateDateOverride,
}: PlannerAssetBoardProps) {
  const { t } = useTranslation();
  const { viewMode } = useProjectSchedule();

  const [resourceScrollTop, setResourceScrollTop] = useState(0);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const ganttScrollRef = useRef<HTMLDivElement>(null);
  const scrollToTodayRef = useRef<(() => void) | null>(null);

  useSyncedVerticalScroll(listScrollRef, ganttScrollRef);

  const headerHeightPx =
    viewMode === "day"
      ? GANTT_DAY_HEADER_TOTAL_HEIGHT_PX
      : GANTT_SUMMARY_TIMELINE_HEADER_HEIGHT_PX;

  const listBodyHeightPx = buildListPanelBodyHeight(plans.length);
  const ganttBodyHeightPx = buildGanttPanelBodyHeight(
    plans.length,
    headerHeightPx,
  );

  const handleGanttVerticalScroll = useCallback((scrollTop: number) => {
    setResourceScrollTop(scrollTop);
  }, []);

  const handleResourceWheelScroll = useCallback((deltaY: number) => {
    const ganttEl = ganttScrollRef.current;
    if (!ganttEl) return;
    ganttEl.scrollTop += deltaY;
    setResourceScrollTop(ganttEl.scrollTop);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {/* Top Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: 1.5,
          py: 0.75,
          borderBottom: 1,
          borderColor: "divider",
          gap: 1.5,
        }}
      >
        <Button
          startIcon={<TodayIcon />}
          onClick={() => scrollToTodayRef.current?.()}
          size="small"
          variant="outlined"
          sx={{
            textTransform: "none",
            fontSize: 12,
            height: 32,
            fontWeight: 600,
          }}
        >
          {t("common.today", { defaultValue: "Today" })}
        </Button>
        {toolbarActions}
      </Box>

      {/* Main Grid View */}
      {loading ? (
        <ProjectScheduleSkeleton ariaLabel={t("schedule.plannerLoading")} />
      ) : plans.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            p: 4,
          }}
        >
          <NoDataFound
            text={t("schedule.noAssetsPlannedYet", {
              defaultValue: "No assets planned for this project yet",
            })}
            size="large"
          />
          {emptyStateAction}
        </Box>
      ) : (
        <Box sx={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
          <PlannerAssetListPanel
            plans={plans}
            bodyHeightPx={listBodyHeightPx}
            headerHeightPx={headerHeightPx}
            scrollTopPx={resourceScrollTop}
            scrollRef={listScrollRef}
            onDeletePlan={onDeletePlan}
            onPlanClick={onPlanClick}
            onWheelScroll={handleResourceWheelScroll}
          />
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <PlannerAssetGanttChart
              plans={plans}
              bodyHeightPx={ganttBodyHeightPx}
              scrollContainerRef={ganttScrollRef}
              readOnly={readOnly}
              onPlanCellClick={onPlanClick}
              onUpdateDateOverride={onUpdateDateOverride}
              onRegisterScrollToToday={(fn) => {
                scrollToTodayRef.current = fn;
              }}
              onVerticalScroll={handleGanttVerticalScroll}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
