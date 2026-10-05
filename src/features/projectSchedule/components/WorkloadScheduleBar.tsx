import { memo, useMemo } from "react";
import { Box } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  DAY_VIEW_WIDTH,
  GANTT_MILESTONE_DIAMOND_SIDE_PX,
  GANTT_SCHEDULE_ROW_HEIGHT_PX,
  MONTH_VIEW_WIDTH,
  WEEK_VIEW_WIDTH,
} from "../helpers/constants";
import { useProjectSchedule } from "../context/ScheduleProvider";
import type { WorkingCalendarDurationFormatParams } from "../helpers/dateUtil";
import type { Schedule } from "../types/schedule";
import {
  CompletionBox,
  ScheduleName,
  TaskBarContainer,
  parseCompletionPercent,
} from "./WorkloadScheduleBarParts";

interface WorkloadScheduleBarProps {
  schedule: Schedule;
  startDiff: number;
  duration: number;
  visibleEndPx: number;
  visibleStartPx: number;
  workingCalendarForDuration?: WorkingCalendarDurationFormatParams | null;
  barColor?: string;
}

function getViewWidth(viewMode: "day" | "week" | "month") {
  if (viewMode === "month") return MONTH_VIEW_WIDTH;
  if (viewMode === "week") return WEEK_VIEW_WIDTH;
  return DAY_VIEW_WIDTH;
}

const CHILDREN_PATTERN =
  "repeating-linear-gradient(45deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 4px, transparent 4px, transparent 8px)";
const COMPACT_INTERNAL_NAME_WIDTH_PX = 48;

export const WorkloadScheduleBar = memo(function WorkloadScheduleBar({
  schedule,
  startDiff,
  duration,
  visibleEndPx,
  visibleStartPx,
  barColor,
}: WorkloadScheduleBarProps) {
  const { viewMode } = useProjectSchedule();
  const viewWidth = useMemo(() => getViewWidth(viewMode), [viewMode]);
  const metrics = useMemo(() => {
    const rawLeft = startDiff * viewWidth;
    const rawBarWidth = duration * viewWidth;
    const rawRight = rawLeft + rawBarWidth;
    const clippedLeft = Math.max(rawLeft, visibleStartPx);
    const clippedRight = Math.min(rawRight, visibleEndPx);
    const clippedBarWidth = Math.max(0, clippedRight - clippedLeft);
    const isMilestone = Boolean(schedule.isMilestone);

    return {
      clippedBarWidth,
      completionPercent: parseCompletionPercent(
        schedule.scheduleCompletionPercentage,
      ),
      hasChildren: Boolean(schedule.childrenIds?.length),
      isMilestone,
      barStyle: {
        left: `${clippedLeft}px`,
        width: `${clippedBarWidth}px`,
      },
      showInternalName: !isMilestone,
      compactInternalName: clippedBarWidth < COMPACT_INTERNAL_NAME_WIDTH_PX,
    };
  }, [
    duration,
    schedule,
    startDiff,
    viewWidth,
    visibleEndPx,
    visibleStartPx,
  ]);

  if (metrics.clippedBarWidth <= 0) return null;

  const resolvedColor = schedule.isPaused
    ? "grey.500"
    : barColor ?? schedule.scheduleColor ?? "primary.main";
  const renderBarContent = () =>
    metrics.isMilestone ? (
      <Box
        sx={{
          height: "100%",
          width: "100%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "visible",
        }}
      >
        <Box
          aria-hidden
          sx={(theme) => ({
            width: GANTT_MILESTONE_DIAMOND_SIDE_PX,
            height: GANTT_MILESTONE_DIAMOND_SIDE_PX,
            flexShrink: 0,
            transform: "rotate(45deg)",
            borderRadius: "1px",
            bgcolor: resolvedColor,
            border: "1px solid",
            borderColor: alpha(theme.palette.common.white, 0.45),
            boxShadow: theme.shadows[2],
          })}
        />
      </Box>
    ) : (
      <Box
        sx={{
          height: "100%",
          width: "100%",
          borderRadius: "4px",
          position: "relative",
          overflow: "hidden",
          bgcolor: resolvedColor,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          backgroundImage: metrics.hasChildren ? CHILDREN_PATTERN : "none",
        }}
      >
        {metrics.completionPercent > 0 && (
          <CompletionBox percentage={metrics.completionPercent} />
        )}
        {metrics.showInternalName && (
          <ScheduleName
            name={schedule.scheduleName}
            compact={metrics.compactInternalName}
            schedule={schedule}
          />
        )}
      </Box>
    );

  return (
    <Box
      sx={{
        position: "absolute",
        left: metrics.barStyle.left,
        width: metrics.barStyle.width,
        top: "50%",
        transform: "translateY(-50%)",
        height: `${GANTT_SCHEDULE_ROW_HEIGHT_PX}px`,
      }}
    >
      <TaskBarContainer
        className="WorkloadTaskBarContainer"
        sx={{ left: 0, width: "100%" }}
      >
        {renderBarContent()}
      </TaskBarContainer>
    </Box>
  );
});
