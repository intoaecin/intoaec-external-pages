import { memo } from "react";
import { Box, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { PlannerDayTotal } from "../types/workload";
import {
  buildDateKey,
  buildVisibleMonthCells,
  buildVisibleWeekCells,
} from "../utils/workloadDateKeys";
import { getDateKeyInTimezone, isDateKeyInFuture } from "../helpers/dateUtil";
import { SHIFT_STATUS_STYLES } from "./createScheduleModal/ScheduleShiftGridCell";
import { getShiftGridCellStatus } from "./createScheduleModal/scheduleShiftGridUtils";

const FUTURE_STYLES = { color: "success.dark", bgcolor: "success.light" };

interface PlannerTotalsCellsProps {
  dayTotals: Map<string, PlannerDayTotal>;
  dates: Date[];
  viewMode: "day" | "week" | "month";
  pixelsPerUnit: number;
  visibleStartPx: number;
  visibleEndPx: number;
  organizationTimezone: string;
}

const startOfLocalDay = (value: Date | number): number => {
  const date = value instanceof Date ? value : new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

const formatCount = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

function PlannerTotalBadge({
  planned,
  actual,
  isFuture,
}: PlannerDayTotal & { isFuture: boolean }) {
  const { t } = useTranslation();
  const styles = isFuture
    ? FUTURE_STYLES
    : SHIFT_STATUS_STYLES[getShiftGridCellStatus(actual, planned)];

  return (
    <Tooltip
      title={t("schedule.plannerTotalsTooltip", {
        planned: formatCount(planned),
        actual: formatCount(actual),
      })}
      placement="top"
      disableInteractive
    >
      <Box
        sx={{
          minWidth: 44,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 1,
          color: styles.color,
          bgcolor: styles.bgcolor,
          typography: "caption",
          fontWeight: 500,
          userSelect: "none",
        }}
      >
        {formatCount(planned)}/{formatCount(actual)}
      </Box>
    </Tooltip>
  );
}

interface TotalsCellFrameProps extends PlannerDayTotal {
  left: number;
  width: number;
  isFuture: boolean;
}

function TotalsCellFrame({ left, width, planned, actual, isFuture }: TotalsCellFrameProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        left,
        width,
        top: 0,
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <PlannerTotalBadge planned={planned} actual={actual} isFuture={isFuture} />
    </Box>
  );
}

/**
 * First-row totals for the planner: planned vs actual headcount per column.
 * Day view shows each date's totals; week/month sums every day in the column.
 */
export const PlannerTotalsCells = memo(function PlannerTotalsCells({
  dayTotals,
  dates,
  viewMode,
  pixelsPerUnit,
  visibleStartPx,
  visibleEndPx,
  organizationTimezone,
}: PlannerTotalsCellsProps) {
  if (viewMode === "day") {
    return (
      <>
        {dates.map((date, index) => {
          const left = index * pixelsPerUnit;
          if (left + pixelsPerUnit < visibleStartPx || left > visibleEndPx) return null;

          const total = dayTotals.get(buildDateKey(date));
          if (!total) return null;

          return (
            <TotalsCellFrame
              key={`totals-cell-${buildDateKey(date)}`}
              left={left}
              width={pixelsPerUnit}
              planned={total.planned}
              actual={total.actual}
              isFuture={isDateKeyInFuture(
                getDateKeyInTimezone(date, organizationTimezone),
                organizationTimezone,
              )}
            />
          );
        })}
      </>
    );
  }

  const cells =
    viewMode === "week"
      ? buildVisibleWeekCells({ dates, pixelsPerUnit, visibleStartPx, visibleEndPx, getHours: () => 0 })
      : buildVisibleMonthCells({
          dates,
          pixelsPerUnit,
          visibleStartPx,
          visibleEndPx,
          getHours: () => 0,
          organizationTimezone,
        });

  return (
    <>
      {cells.map((cell) => {
        if (!cell.startDate || !cell.endDate) return null;

        const rangeStart = startOfLocalDay(cell.startDate);
        const rangeEnd = startOfLocalDay(cell.endDate);
        const summary = dates.reduce(
          (sum, date) => {
            const time = startOfLocalDay(date);
            const total = dayTotals.get(buildDateKey(date));
            if (!total || time < rangeStart || time > rangeEnd) return sum;
            return {
              planned: sum.planned + total.planned,
              actual: sum.actual + total.actual,
            };
          },
          { planned: 0, actual: 0 },
        );

        if (summary.planned === 0) return null;

        return (
          <TotalsCellFrame
            key={cell.key}
            left={cell.left}
            width={cell.width}
            planned={summary.planned}
            actual={summary.actual}
            isFuture={isDateKeyInFuture(
              getDateKeyInTimezone(cell.startDate, organizationTimezone),
              organizationTimezone,
            )}
          />
        );
      })}
    </>
  );
});
