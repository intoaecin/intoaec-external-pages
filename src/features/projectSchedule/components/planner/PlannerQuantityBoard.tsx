import { useCallback, useRef, useState } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import NoDataFound from "@/components_v2/NoDataFound";
import { GANTT_DAY_HEADER_TOTAL_HEIGHT_PX } from "../../helpers/constants";
import { useProjectSchedule } from "../../context/ScheduleProvider";
import type {
  DailyQuantityUpdateInput,
  WorkloadGanttRow,
} from "../../types/workload";
import type { PlannerQuantityEntry } from "../../hooks/usePlannerQuantityEntries";
import { useSyncedVerticalScroll } from "../../hooks/useSyncedVerticalScroll";
import {
  buildGanttPanelBodyHeight,
  buildListPanelBodyHeight,
} from "../../utils/ganttBodyHeight";
import { ProjectScheduleSkeleton } from "../ProjectScheduleSkeleton";
import { WorkloadGanttChart } from "../WorkloadGanttChart";
import { WorkloadToolbar } from "../WorkloadToolbar";
import { PlannerQuantityListPanel } from "./PlannerQuantityListPanel";

interface PlannerQuantityBoardProps {
  entries: PlannerQuantityEntry[];
  rows: WorkloadGanttRow[];
  loading: boolean;
  /** Disables editing the per-day quantities. */
  readOnly?: boolean;
  onUpdateDailyQuantity?: (input: DailyQuantityUpdateInput) => Promise<void>;
}

/** Schedule list + per-day quantity gantt, fed with already-built quantity entries. */
export function PlannerQuantityBoard({
  entries,
  rows,
  loading,
  readOnly = false,
  onUpdateDailyQuantity,
}: PlannerQuantityBoardProps) {
  const { t } = useTranslation();
  const { viewMode, setViewMode } = useProjectSchedule();
  const [listScrollTop, setListScrollTop] = useState(0);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const ganttScrollRef = useRef<HTMLDivElement>(null);
  const scrollToTodayRef = useRef<(() => void) | null>(null);

  useSyncedVerticalScroll(listScrollRef, ganttScrollRef);

  const handleListWheelScroll = useCallback((deltaY: number) => {
    const ganttEl = ganttScrollRef.current;
    if (!ganttEl) return;

    ganttEl.scrollTop += deltaY;
    setListScrollTop(ganttEl.scrollTop);
  }, []);

  if (loading) {
    return <ProjectScheduleSkeleton ariaLabel={t("schedule.plannerLoading")} />;
  }

  if (!entries.length) {
    return (
      <NoDataFound
        text={t("schedule.plannerQuantityNoSchedules")}
        size="large"
        sx={{
          flex: "1 1 auto",
          width: "100%",
          height: "100%",
          maxHeight: "100%",
          minHeight: 0,
        }}
      />
    );
  }

  // One header height in every view mode keeps the list header aligned.
  const headerHeightPx = GANTT_DAY_HEADER_TOTAL_HEIGHT_PX;

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
      <WorkloadToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onScrollToToday={() => scrollToTodayRef.current?.()}
      />
      <Box sx={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
        <PlannerQuantityListPanel
          entries={entries}
          bodyHeightPx={buildListPanelBodyHeight(rows.length)}
          headerHeightPx={headerHeightPx}
          scrollTopPx={listScrollTop}
          scrollRef={listScrollRef}
          onWheelScroll={handleListWheelScroll}
        />
        <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden", position: "relative" }}>
          <WorkloadGanttChart
            rows={rows}
            readOnly={readOnly}
            bodyHeightPx={buildGanttPanelBodyHeight(rows.length, headerHeightPx)}
            summaryHeaderHeightPx={headerHeightPx}
            scrollContainerRef={ganttScrollRef}
            onRegisterScrollToToday={(fn) => {
              scrollToTodayRef.current = fn;
            }}
            onUpdateDailyQuantity={onUpdateDailyQuantity}
            onVerticalScroll={setListScrollTop}
          />
        </Box>
      </Box>
    </Box>
  );
}
