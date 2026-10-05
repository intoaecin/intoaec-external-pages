import { useCallback, useMemo, useRef, useState } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import NoDataFound from "@/components_v2/NoDataFound";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { getLocalizationValue } from "@/lib/helpers";
import { GANTT_DAY_HEADER_TOTAL_HEIGHT_PX } from "../helpers/constants";
import { useProjectSchedule } from "../context/ScheduleProvider";
import { useSyncedVerticalScroll } from "../hooks/useSyncedVerticalScroll";
import type { PlannerScheduleEntry } from "../hooks/usePlannerData";
import { usePlannerRows } from "../hooks/usePlannerRows";
import {
  PLANNER_WORKER_ROW_PREFIX,
  usePlannerWorkerRows,
} from "../hooks/usePlannerWorkerRows";
import { buildPlannerTotalsRow } from "../utils/plannerDayTotals";
import { buildPlannerWorkerEntries } from "../utils/plannerWorkerEntries";
import {
  buildGanttPanelBodyHeight,
  buildListPanelBodyHeight,
} from "../utils/ganttBodyHeight";
import { PlannerListPanel } from "./PlannerListPanel";
import { PlannerWorkerListPanel } from "./PlannerWorkerListPanel";
import type { PlannerGroupBy } from "./PlannerGroupByTabs";
import { WorkloadGanttChart } from "./WorkloadGanttChart";
import { WorkloadToolbar } from "./WorkloadToolbar";
import { ProjectScheduleSkeleton } from "./ProjectScheduleSkeleton";

interface PlannerShiftBoardProps {
  entries: PlannerScheduleEntry[];
  loading: boolean;
  /** Disables the attendance editor on shift cells. */
  readOnly?: boolean;
}

/** Schedule/resource list + shift gantt, fed with already-loaded planner entries. */
export function PlannerShiftBoard({ entries, loading, readOnly = false }: PlannerShiftBoardProps) {
  const { t } = useTranslation();
  const { viewMode, setViewMode, updateScheduleLoading } = useProjectSchedule();
  const { localizationValue } = useOrganizationLocalization();
  const organizationTimezone =
    (localizationValue &&
      getLocalizationValue(localizationValue, "TIMEZONE", "ID")) ||
    "UTC";
  const [expandedScheduleIds, setExpandedScheduleIds] = useState<Set<string>>(
    new Set(),
  );
  const [groupBy, setGroupBy] = useState<PlannerGroupBy>("schedule");
  const [expandedWorkerIds, setExpandedWorkerIds] = useState<Set<string>>(
    new Set(),
  );
  const [resourceScrollTop, setResourceScrollTop] = useState(0);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const ganttScrollRef = useRef<HTMLDivElement>(null);
  const scrollToTodayRef = useRef<(() => void) | null>(null);

  useSyncedVerticalScroll(listScrollRef, ganttScrollRef);

  const workerEntries = useMemo(
    () => buildPlannerWorkerEntries(entries),
    [entries],
  );
  const scheduleRows = usePlannerRows({
    entries,
    expandedScheduleIds,
    organizationTimezone,
  });
  const workerRows = usePlannerWorkerRows({
    workerEntries,
    expandedWorkerIds,
    organizationTimezone,
  });
  const totalsRow = useMemo(
    () => buildPlannerTotalsRow(entries, organizationTimezone),
    [entries, organizationTimezone],
  );
  const ganttRows = useMemo(
    () => [totalsRow, ...(groupBy === "resource" ? workerRows : scheduleRows)],
    [totalsRow, groupBy, workerRows, scheduleRows],
  );
  // The Schedule/Resource tabs in the list header need the full-height header
  // in every view mode, so week/month don't use the compact summary height.
  const headerHeightPx = GANTT_DAY_HEADER_TOTAL_HEIGHT_PX;
  const listBodyHeightPx = buildListPanelBodyHeight(ganttRows.length);
  const ganttBodyHeightPx = buildGanttPanelBodyHeight(
    ganttRows.length,
    headerHeightPx,
  );

  const handleToggleSchedule = useCallback((scheduleId: string) => {
    setExpandedScheduleIds((previous) => {
      const next = new Set(previous);
      if (next.has(scheduleId)) next.delete(scheduleId);
      else next.add(scheduleId);
      return next;
    });
  }, []);

  const handleToggleWorker = useCallback((workerId: string) => {
    setExpandedWorkerIds((previous) => {
      const next = new Set(previous);
      if (next.has(workerId)) next.delete(workerId);
      else next.add(workerId);
      return next;
    });
  }, []);

  const handleGroupByChange = (next: PlannerGroupBy) => {
    setGroupBy(next);
    setExpandedWorkerIds(
      new Set(next === "resource" ? workerEntries.map((w) => w.workerId) : []),
    );
  };

  const handleGanttVerticalScroll = useCallback((scrollTop: number) => {
    setResourceScrollTop(scrollTop);
  }, []);

  const handleResourceWheelScroll = useCallback((deltaY: number) => {
    const ganttEl = ganttScrollRef.current;
    if (!ganttEl) return;

    ganttEl.scrollTop += deltaY;
    setResourceScrollTop(ganttEl.scrollTop);
  }, []);

  if (loading || updateScheduleLoading) {
    return <ProjectScheduleSkeleton ariaLabel={t("schedule.plannerLoading")} />;
  }

  if (!entries.length) {
    return (
      <NoDataFound
        text={t("schedule.plannerNoSchedules")}
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
        {groupBy === "resource" ? (
          <PlannerWorkerListPanel
            workerEntries={workerEntries}
            bodyHeightPx={listBodyHeightPx}
            expandedWorkerIds={expandedWorkerIds}
            headerHeightPx={headerHeightPx}
            scrollTopPx={resourceScrollTop}
            scrollRef={listScrollRef}
            onToggleWorker={handleToggleWorker}
            groupBy={groupBy}
            onGroupByChange={handleGroupByChange}
            onWheelScroll={handleResourceWheelScroll}
          />
        ) : (
          <PlannerListPanel
            entries={entries}
            bodyHeightPx={listBodyHeightPx}
            expandedScheduleIds={expandedScheduleIds}
            headerHeightPx={headerHeightPx}
            scrollTopPx={resourceScrollTop}
            scrollRef={listScrollRef}
            onToggleSchedule={handleToggleSchedule}
            groupBy={groupBy}
            onGroupByChange={handleGroupByChange}
            onWheelScroll={handleResourceWheelScroll}
          />
        )}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <WorkloadGanttChart
            rows={ganttRows}
            readOnly={readOnly}
            bodyHeightPx={ganttBodyHeightPx}
            summaryHeaderHeightPx={headerHeightPx}
            scrollContainerRef={ganttScrollRef}
            onRegisterScrollToToday={(fn) => {
              scrollToTodayRef.current = fn;
            }}
            onRowClick={(rowKey) => {
              if (rowKey.startsWith("schedule-")) {
                handleToggleSchedule(rowKey.slice("schedule-".length));
              } else if (rowKey.startsWith(PLANNER_WORKER_ROW_PREFIX)) {
                handleToggleWorker(
                  rowKey.slice(PLANNER_WORKER_ROW_PREFIX.length),
                );
              }
            }}
            onVerticalScroll={handleGanttVerticalScroll}
          />
        </Box>
      </Box>
    </Box>
  );
}
