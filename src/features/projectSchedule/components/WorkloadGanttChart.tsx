import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Box } from "@mui/material";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { getLocalizationValue } from "@/lib/helpers";
import { usePanning } from "@/hooks/usePanning";
import {
  GANTT_DAY_HEADER_TOTAL_HEIGHT_PX,
  GANTT_SCHEDULE_ROW_HEIGHT_PX,
  GANTT_SUMMARY_TIMELINE_HEADER_HEIGHT_PX,
} from "../helpers/constants";
import { useFetchWorkingCalendar } from "../hooks/api/fetch-working-calendar";
import { useIsDateOffDay } from "../hooks/useIsDateOffDay";
import { useWorkloadGanttTimeline } from "../hooks/useWorkloadGanttTimeline";
import type { WorkingCalendarDurationFormatParams } from "../helpers/dateUtil";
import type {
  DailyQuantityUpdateInput,
  WorkloadGanttRow,
} from "../types/workload";
import { TimelineGrid } from "./TimelineGrid";
import { MemoizedTimelineHeader } from "./TimelineHeader";
import { QuantityDayCells } from "./PlannerQuantityCells";
import { PlannerTotalsCells } from "./PlannerTotalsCells";
import { WorkloadScheduleBar } from "./WorkloadScheduleBar";
import { CollapsedRowCells, DailyMapCells, ShiftAttendanceCells } from "./WorkloadGanttCells";

interface WorkloadGanttChartProps {
  rows: WorkloadGanttRow[];
  bodyHeightPx: string;
  startDate?: Date;
  endDate?: Date;
  /** Show only `startDate`..`endDate`, with no padding around it. */
  exactRange?: boolean;
  scrollContainerRef?: RefObject<HTMLDivElement>;
  getTotalHoursForAssigneeOnDate?: (assigneeId: string, date: Date) => number;
  getAssignedTaskCountForAssigneeInRange?: (
    assigneeId: string,
    startDate: Date,
    endDate: Date,
  ) => number;
  getCapacityForAssigneeOnDate?: (assigneeId: string, date: Date) => number;
  onUpdateDailyHours?: (input: {
    assigneeId: string;
    scheduleId: string;
    date: Date;
    hours: number;
  }) => Promise<void>;
  onUpdateDailyQuantity?: (input: DailyQuantityUpdateInput) => Promise<void>;
  onRowClick?: (rowKey: string) => void;
  onRegisterScrollToToday?: (fn: () => void) => void;
  onVerticalScroll?: (scrollTop: number) => void;
  /** Week/month header height; defaults to the compact summary height. */
  summaryHeaderHeightPx?: number;
  /** Disables the attendance editor on shift cells. */
  readOnly?: boolean;
}

export function WorkloadGanttChart({
  rows,
  bodyHeightPx,
  startDate,
  endDate,
  exactRange,
  scrollContainerRef,
  getTotalHoursForAssigneeOnDate,
  getAssignedTaskCountForAssigneeInRange,
  getCapacityForAssigneeOnDate,
  onUpdateDailyHours,
  onUpdateDailyQuantity,
  onRegisterScrollToToday,
  onRowClick,
  onVerticalScroll,
  summaryHeaderHeightPx = GANTT_SUMMARY_TIMELINE_HEADER_HEIGHT_PX,
  readOnly = false,
}: WorkloadGanttChartProps) {
  const localContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = scrollContainerRef ?? localContainerRef;
  const router = useRouter();
  const projectId = router.query.projectId as string | undefined;
  const { t } = useTranslation();
  const { data: workingCalendarData } = useFetchWorkingCalendar(projectId ?? null);
  const { localizationValue } = useOrganizationLocalization();
  const organizationTimezone =
    (localizationValue &&
      getLocalizationValue(localizationValue, "TIMEZONE", "ID")) ||
    "UTC";

  const {
    dates,
    pixelsPerUnit,
    scheduleMetricsById,
    scrollToToday,
    visibleRows,
    visibleTimelineRange,
    visibleTimelineStartIndex,
    visibleTimelineEndIndex,
    viewMode,
  } = useWorkloadGanttTimeline({
    rows,
    startDate,
    endDate,
    exactRange,
    organizationTimezone,
    workingCalendarData,
    scrollContainerRef: containerRef,
  });
  const panningHandlers = usePanning(containerRef, { isBlocked: () => false });
  const workingCalendarForDuration =
    useMemo<WorkingCalendarDurationFormatParams | null>(
      () =>
        workingCalendarData
          ? {
              workingDays: workingCalendarData.workingDays,
              workingHoursByDay: workingCalendarData.workingHoursByDay,
              publicHolidays: workingCalendarData.publicHolidays,
              organizationTimezone,
            }
          : null,
      [organizationTimezone, workingCalendarData],
    );
  const isDateOffDay = useIsDateOffDay(
    workingCalendarData,
    organizationTimezone,
  );

  useEffect(() => {
    onRegisterScrollToToday?.(scrollToToday);
  }, [onRegisterScrollToToday, scrollToToday]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, overflow: "hidden" }}>
      <Box
        ref={containerRef}
        aria-label={t("schedule.workloadTimelineAriaLabel")}
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
            height:
              viewMode === "day"
                ? GANTT_DAY_HEADER_TOTAL_HEIGHT_PX
                : summaryHeaderHeightPx,
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
            summaryHeaderHeightPx={summaryHeaderHeightPx}
          />
        </Box>
        <Box
          position="relative"
          sx={{
            height: bodyHeightPx,
            width: "fit-content",
            minWidth: "100%",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <TimelineGrid
            dates={dates}
            disableWindowing={false}
            scrollContainerRef={containerRef}
            taskCount={rows.length}
            useStaticLines={false}
            workingDays={workingCalendarData?.workingDays}
            publicHolidays={workingCalendarData?.publicHolidays}
            showHorizontalLines={false}
            startIndex={visibleTimelineStartIndex}
            endIndex={visibleTimelineEndIndex}
          />
          {visibleRows.map(({ row, rowIndex }) => {
            const metrics = scheduleMetricsById.get(row.rowKey);
            return (
              <Box
                key={row.rowKey}
                sx={{
                  height: GANTT_SCHEDULE_ROW_HEIGHT_PX,
                  position: "absolute",
                  top: rowIndex * GANTT_SCHEDULE_ROW_HEIGHT_PX,
                  left: 0,
                  right: 0,
                  cursor: row.isClickable ? "pointer" : "inherit",
                }}
                onClick={row.isClickable && onRowClick ? () => onRowClick(row.rowKey) : undefined}
              >
                {row.schedule && metrics && (
                  <WorkloadScheduleBar
                    schedule={row.schedule}
                    startDiff={metrics.startDiff}
                    duration={metrics.duration}
                    visibleEndPx={visibleTimelineRange.endPx}
                    visibleStartPx={visibleTimelineRange.startPx}
                    workingCalendarForDuration={workingCalendarForDuration}
                    barColor={row.barColor}
                  />
                )}
                {row.collapsedAssigneeId && getTotalHoursForAssigneeOnDate && getCapacityForAssigneeOnDate && (
                  <CollapsedRowCells
                    assigneeId={row.collapsedAssigneeId}
                    dates={dates}
                    viewMode={viewMode}
                    pixelsPerUnit={pixelsPerUnit}
                    visibleStartPx={visibleTimelineRange.startPx}
                    visibleEndPx={visibleTimelineRange.endPx}
                    getTotalHours={getTotalHoursForAssigneeOnDate}
                    getAssignedTaskCount={getAssignedTaskCountForAssigneeInRange}
                    getCapacity={getCapacityForAssigneeOnDate}
                    isDateOffDay={isDateOffDay}
                  />
                )}
                {row.dailyHoursMap && (
                  <DailyMapCells
                    dailyHoursMap={row.dailyHoursMap}
                    editableDailyHours={row.editableDailyHours}
                    dates={dates}
                    viewMode={viewMode}
                    pixelsPerUnit={pixelsPerUnit}
                    visibleStartPx={visibleTimelineRange.startPx}
                    visibleEndPx={visibleTimelineRange.endPx}
                    barColor={row.barColor}
                    onUpdateDailyHours={onUpdateDailyHours}
                    isDateOffDay={isDateOffDay}
                  />
                )}
                {row.dayTotals && (
                  <PlannerTotalsCells
                    dayTotals={row.dayTotals}
                    organizationTimezone={organizationTimezone}
                    dates={dates}
                    viewMode={viewMode}
                    pixelsPerUnit={pixelsPerUnit}
                    visibleStartPx={visibleTimelineRange.startPx}
                    visibleEndPx={visibleTimelineRange.endPx}
                  />
                )}
                {row.dailyQuantity && (
                  <QuantityDayCells
                    dailyQuantity={row.dailyQuantity}
                    organizationTimezone={organizationTimezone}
                    readOnly={readOnly}
                    dates={dates}
                    viewMode={viewMode}
                    pixelsPerUnit={pixelsPerUnit}
                    visibleStartPx={visibleTimelineRange.startPx}
                    visibleEndPx={visibleTimelineRange.endPx}
                    onUpdateDailyQuantity={onUpdateDailyQuantity}
                  />
                )}
                {row.shiftDayRows && (
                  <ShiftAttendanceCells
                    shiftDayRows={row.shiftDayRows}
                    focusWorkerId={row.shiftFocusWorkerId}
                    organizationTimezone={organizationTimezone}
                    readOnly={readOnly}
                    dates={dates}
                    viewMode={viewMode}
                    pixelsPerUnit={pixelsPerUnit}
                    visibleStartPx={visibleTimelineRange.startPx}
                    visibleEndPx={visibleTimelineRange.endPx}
                  />
                )}
              </Box>
            );
          })}
          {rows
            .map((row, rowIndex) => ({ row, rowIndex }))
            .filter(({ row }) => row.isResourceGroupEnd)
            .map(({ row, rowIndex }) => (
              <Box
                key={`${row.rowKey}-resource-separator`}
                aria-hidden
                sx={{
                  position: "absolute",
                  left: visibleTimelineRange.startPx,
                  width: visibleTimelineRange.endPx - visibleTimelineRange.startPx,
                  top: (rowIndex + 1) * GANTT_SCHEDULE_ROW_HEIGHT_PX - 1,
                  height: "1px",
                  bgcolor: "divider",
                  pointerEvents: "none",
                  zIndex: 20,
                }}
              />
            ))}
        </Box>
      </Box>
    </Box>
  );
}
