import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Box, CircularProgress, TextField, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { roundNumber } from "@/utils/numbers";
import {
  buildDateKey,
  buildVisibleDayCells,
  buildVisibleMonthCells,
  buildVisibleWeekCells,
} from "../utils/workloadDateKeys";
import {
  FUTURE_SHIFT_STYLES,
  ScheduleShiftGridCell,
  SHIFT_STATUS_STYLES,
} from "./createScheduleModal/ScheduleShiftGridCell";
import {
  getShiftGridCellStatus,
  getShiftPresentSummary,
} from "./createScheduleModal/scheduleShiftGridUtils";
import type { ScheduleLinkedShiftRow } from "./createScheduleModal/scheduleShiftLinkUtils";
import { getDateKeyInTimezone, isDateKeyInFuture } from "../helpers/dateUtil";

type WorkloadViewMode = "day" | "week" | "month";

const startOfLocalDay = (value: Date | number): number => {
  const date = value instanceof Date ? value : new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

const addLocalDays = (date: Date, days: number): Date => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const isValidHoursInput = (value: string): boolean => {
  if (value === "") return true;
  if (!/^\d{0,2}(\.\d{0,2})?$/.test(value)) return false;
  const parsed = Number(value);
  return !Number.isFinite(parsed) || parsed <= 24;
};

const sumCapacityForRange = (
  startDate: Date | undefined,
  endDate: Date | undefined,
  getCapacity: (date: Date) => number,
): number => {
  if (!startDate || !endDate) return 0;

  let capacity = 0;
  const endTime = startOfLocalDay(endDate);
  for (
    let cursor = new Date(startOfLocalDay(startDate));
    startOfLocalDay(cursor) <= endTime;
    cursor = addLocalDays(cursor, 1)
  ) {
    capacity += getCapacity(cursor);
  }
  return capacity;
};

interface SharedCellProps {
  dates: Date[];
  viewMode: WorkloadViewMode;
  pixelsPerUnit: number;
  visibleStartPx: number;
  visibleEndPx: number;
  isDateOffDay?: (date: Date) => boolean;
}

function WorkloadHourCell({
  left,
  width,
  hours,
  color,
  showBackground = false,
  backgroundColor = "transparent",
  editable = false,
  onCommit,
  tooltipTitle = "",
}: {
  left: number;
  width: number;
  hours: number;
  color?: string;
  showBackground?: boolean;
  backgroundColor?: string;
  editable?: boolean;
  onCommit?: (hours: number) => Promise<void>;
  tooltipTitle?: ReactNode;
}) {
  const { t } = useTranslation();
  const displayHours = roundNumber(hours, 2);
  const valueColor = color ?? (hours > 0 ? "text.primary" : "text.disabled");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [inputValue, setInputValue] = useState(String(displayHours));
  const commitInFlightRef = useRef(false);

  useEffect(() => {
    if (!isEditing) setInputValue(String(displayHours));
  }, [displayHours, isEditing]);

  const handleCommit = async () => {
    if (commitInFlightRef.current) return;

    if (!editable || !onCommit) {
      setIsEditing(false);
      return;
    }

    const parsed = Number(inputValue);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setInputValue(String(displayHours));
      setIsEditing(false);
      return;
    }

    const nextHours = roundNumber(Math.min(24, parsed), 2);

    commitInFlightRef.current = true;
    setIsSaving(true);
    try {
      if (nextHours !== hours) {
        await onCommit(nextHours);
      }
      setInputValue(String(nextHours));
      setIsEditing(false);
    } finally {
      commitInFlightRef.current = false;
      setIsSaving(false);
    }
  };

  const hasTooltip = Boolean(tooltipTitle);

  return (
    <Tooltip
      title={tooltipTitle}
      disableHoverListener={!hasTooltip}
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: 2,
            color: "text.primary",
            px: 1.5,
            py: 1,
          },
        },
      }}
    >
      <Box
        onDoubleClick={(event) => {
          if (!editable) return;
          event.stopPropagation();
          setIsEditing(true);
        }}
        onClick={(event) => {
          if (!editable) return;
          event.stopPropagation();
          setIsEditing(true);
        }}
        onMouseDown={(event) => {
          if (editable || hasTooltip) event.stopPropagation();
        }}
        sx={{
          position: "absolute",
          left,
          width,
          top: 0,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: editable || hasTooltip ? "auto" : "none",
          cursor: editable ? "text" : "default",
        }}
      >
        {isEditing ? (
          <Box
            onClick={(event) => event.stopPropagation()}
            sx={{
              width: Math.max(40, Math.min(width - 8, 56)),
            }}
          >
            <TextField
              autoFocus
              value={inputValue}
              disabled={isSaving}
              aria-label={t("schedule.workloadDailyHoursInputAriaLabel")}
              onChange={(event) => {
                const nextValue = event.target.value.trim();
                if (isValidHoursInput(nextValue)) {
                  setInputValue(nextValue);
                }
              }}
              onBlur={handleCommit}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleCommit();
                }
                if (event.key === "Escape") {
                  setInputValue(String(displayHours));
                  setIsEditing(false);
                }
              }}
              sx={{
                "& .MuiInputBase-root": {
                  height: 24,
                  bgcolor: "background.paper",
                },
                "& .MuiInputBase-input": {
                  typography: "caption",
                  textAlign: "center",
                  px: 0.5,
                  py: 0,
                },
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              typography: "caption",
              color: valueColor,
              bgcolor:
                showBackground && hours > 0 ? backgroundColor : "transparent",
              px: 0.5,
              minWidth: 20,
              textAlign: "center",
              lineHeight: "20px",
              userSelect: "none",
              fontWeight: hours > 0 ? 500 : 400,
            }}
          >
            {isSaving ? (
              <CircularProgress size={12} color="inherit" />
            ) : hours > 0 ? (
              displayHours
            ) : (
              "0"
            )}
          </Box>
        )}
      </Box>
    </Tooltip>
  );
}

export const CollapsedRowCells = memo(function CollapsedRowCells({
  assigneeId,
  dates,
  viewMode,
  pixelsPerUnit,
  visibleStartPx,
  visibleEndPx,
  getTotalHours,
  getAssignedTaskCount,
  getCapacity,
  isDateOffDay,
}: SharedCellProps & {
  assigneeId: string;
  getTotalHours: (assigneeId: string, date: Date) => number;
  getAssignedTaskCount?: (
    assigneeId: string,
    startDate: Date,
    endDate: Date,
  ) => number;
  getCapacity: (assigneeId: string, date: Date) => number;
}) {
  const { t } = useTranslation();
  const cells = useMemo(() => {
    const getHours = (date: Date) => getTotalHours(assigneeId, date);
    if (viewMode === "day") {
      return buildVisibleDayCells({ dates, pixelsPerUnit, visibleStartPx, visibleEndPx, getHours })
        .filter((cell) => !cell.date || !isDateOffDay?.(cell.date));
    }
    if (viewMode === "week") {
      return buildVisibleWeekCells({ dates, pixelsPerUnit, visibleStartPx, visibleEndPx, getHours });
    }
    return buildVisibleMonthCells({ dates, pixelsPerUnit, visibleStartPx, visibleEndPx, getHours });
  }, [
    assigneeId,
    dates,
    getCapacity,
    getTotalHours,
    isDateOffDay,
    pixelsPerUnit,
    viewMode,
    visibleEndPx,
    visibleStartPx,
  ]);

  return (
    <>
      {cells.map((cell) => (
        (() => {
          const capacity = sumCapacityForRange(
            cell.startDate,
            cell.endDate,
            (date) => getCapacity(assigneeId, date),
          );
          const isOverCapacity = capacity > 0 && cell.hours > capacity;
          const assignedTaskCount =
            cell.startDate && cell.endDate
              ? getAssignedTaskCount?.(assigneeId, cell.startDate, cell.endDate) ??
                0
              : 0;
          const tooltipTitle =
            cell.hours > 0 ? (
              <Box sx={{ minWidth: 150 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "center",
                    gap: 0.75,
                    mb: 0.75,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {t("schedule.workloadLoaded")}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: isOverCapacity ? "error.dark" : "text.primary", fontWeight: 600 }}
                  >
                    {roundNumber(cell.hours, 2)}/{roundNumber(capacity, 2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("common.available")}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "center",
                    gap: 0.75,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {t("schedule.workloadTasksAssigned")}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {assignedTaskCount}
                  </Typography>
                </Box>
              </Box>
            ) : (
              ""
            );
          return (
            <WorkloadHourCell
              key={cell.key}
              left={cell.left}
              width={cell.width}
              hours={cell.hours}
              color={
                isOverCapacity
                  ? "error.dark"
                  : cell.hours > 0
                    ? "success.dark"
                    : "text.disabled"
              }
              backgroundColor={isOverCapacity ? "error.light" : "success.light"}
              showBackground
              tooltipTitle={tooltipTitle}
            />
          );
        })()
      ))}
    </>
  );
});

export const DailyMapCells = memo(function DailyMapCells({
  dailyHoursMap,
  editableDailyHours,
  dates,
  viewMode,
  pixelsPerUnit,
  visibleStartPx,
  visibleEndPx,
  barColor,
  onUpdateDailyHours,
  isDateOffDay,
}: SharedCellProps & {
  dailyHoursMap: Map<string, number>;
  editableDailyHours?: {
    assigneeId: string;
    scheduleId: string;
    scheduleStartDate?: number | null;
    scheduleEndDate?: number | null;
  };
  barColor?: string;
  onUpdateDailyHours?: (input: {
    assigneeId: string;
    scheduleId: string;
    date: Date;
    hours: number;
  }) => Promise<void>;
}) {
  const cells = useMemo(() => {
    const getHours = (date: Date) => dailyHoursMap.get(buildDateKey(date)) ?? 0;
    if (viewMode === "day") {
      return buildVisibleDayCells({ dates, pixelsPerUnit, visibleStartPx, visibleEndPx, getHours })
        .filter((cell) => !cell.date || !isDateOffDay?.(cell.date));
    }
    if (viewMode === "week") {
      return buildVisibleWeekCells({ dates, pixelsPerUnit, visibleStartPx, visibleEndPx, getHours });
    }
    return buildVisibleMonthCells({ dates, pixelsPerUnit, visibleStartPx, visibleEndPx, getHours });
  }, [
    dailyHoursMap,
    dates,
    isDateOffDay,
    pixelsPerUnit,
    viewMode,
    visibleEndPx,
    visibleStartPx,
  ]);

  return (
    <>
      {cells.map((cell) => {
        const scheduleStartDate = editableDailyHours?.scheduleStartDate;
        const scheduleEndDate = editableDailyHours?.scheduleEndDate;
        const scheduleStartDay =
          scheduleStartDate == null ? null : startOfLocalDay(scheduleStartDate);
        const scheduleEndDay =
          scheduleEndDate == null ? null : startOfLocalDay(scheduleEndDate);
        const rangeStartDate = cell.startDate;
        const rangeEndDate = cell.endDate;
        const isWithinSchedule = (date: Date) => {
          const cellTime = startOfLocalDay(date);
          return (
            (scheduleStartDay == null || cellTime >= scheduleStartDay) &&
            (scheduleEndDay == null || cellTime <= scheduleEndDay)
          );
        };
        const hasAllocatedHours = (date: Date) =>
          (dailyHoursMap.get(buildDateKey(date)) ?? 0) > 0;
        const allocatedDatesInRange =
          rangeStartDate && rangeEndDate
            ? dates.filter((date) => {
                const dateTime = startOfLocalDay(date);
                return (
                  dateTime >= startOfLocalDay(rangeStartDate) &&
                  dateTime <= startOfLocalDay(rangeEndDate) &&
                  !isDateOffDay?.(date) &&
                  hasAllocatedHours(date)
                );
              })
            : [];
        const commitDate =
          cell.date && hasAllocatedHours(cell.date)
            ? cell.date
            : allocatedDatesInRange.length === 1
              ? allocatedDatesInRange[0]
              : undefined;
        const isEditable = Boolean(
          commitDate && editableDailyHours && onUpdateDailyHours,
        );
        const commitDailyHours =
          commitDate && editableDailyHours && onUpdateDailyHours
            ? (hours: number) =>
                onUpdateDailyHours({
                  assigneeId: editableDailyHours.assigneeId,
                  scheduleId: editableDailyHours.scheduleId,
                  date: commitDate,
                  hours,
                })
            : undefined;

        return (
          <WorkloadHourCell
            key={cell.key}
            left={cell.left}
            width={cell.width}
            hours={cell.hours}
            editable={isEditable}
            onCommit={isEditable ? commitDailyHours : undefined}
          />
        );
      })}
    </>
  );
});

/**
 * A read-only aggregate badge for a week/month cell that spans more than
 * one linked-shift day — present/total summed across every shift day in
 * that period. Not click-to-edit: there's no single day to attribute an
 * edit to once several days are folded into one column.
 */
function AggregateShiftBadge({
  present,
  total,
  isFuture,
}: {
  present: number;
  total: number;
  isFuture: boolean;
}) {
  const status = getShiftGridCellStatus(present, total);
  const styles = isFuture ? FUTURE_SHIFT_STYLES : SHIFT_STATUS_STYLES[status];

  return (
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
        fontWeight: 600,
        userSelect: "none",
      }}
    >
      {present}/{total}
    </Box>
  );
}

/**
 * Renders each linked shift's actual/planned attendance directly on the
 * timeline. In day view this is one click-to-edit badge per date, reusing
 * `ScheduleShiftGridCell` as-is (same popover as the Create Schedule
 * modal's shift grid, so editing here updates the same attendance record).
 * In week/month view, every shift day folded into a column is summed into
 * one read-only badge — there's no single date to edit at that zoom level.
 */
export const ShiftAttendanceCells = memo(function ShiftAttendanceCells({
  shiftDayRows,
  dates,
  viewMode,
  pixelsPerUnit,
  visibleStartPx,
  visibleEndPx,
  focusWorkerId,
  organizationTimezone,
  readOnly = false,
}: Pick<SharedCellProps, "dates" | "viewMode" | "pixelsPerUnit" | "visibleStartPx" | "visibleEndPx"> & {
  shiftDayRows: Map<string, ScheduleLinkedShiftRow>;
  focusWorkerId?: string;
  organizationTimezone: string;
  readOnly?: boolean;
}) {
  if (viewMode === "day") {
    return (
      <>
        {dates.map((date, index) => {
          const left = index * pixelsPerUnit;
          if (left + pixelsPerUnit < visibleStartPx || left > visibleEndPx) return null;

          const row = shiftDayRows.get(buildDateKey(date));
          if (!row) return null;

          return (
            <Box
              key={`shift-cell-${buildDateKey(date)}`}
              sx={{
                position: "absolute",
                left,
                width: pixelsPerUnit,
                top: 0,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ScheduleShiftGridCell
                row={row}
                focusWorkerId={focusWorkerId}
                organizationTimezone={organizationTimezone}
                readOnly={readOnly}
              />
            </Box>
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
        const matchedRows = dates
          .filter((date) => {
            const time = startOfLocalDay(date);
            return time >= rangeStart && time <= rangeEnd;
          })
          .map((date) => shiftDayRows.get(buildDateKey(date)))
          .filter((row): row is ScheduleLinkedShiftRow => Boolean(row));

        if (matchedRows.length === 0) return null;

        const summary = matchedRows.reduce(
          (totals, row) => {
            const rowSummary = getShiftPresentSummary(row.shift, focusWorkerId);
            return {
              present: totals.present + rowSummary.present,
              total: totals.total + rowSummary.total,
            };
          },
          { present: 0, total: 0 },
        );

        return (
          <Box
            key={cell.key}
            sx={{
              position: "absolute",
              left: cell.left,
              width: cell.width,
              top: 0,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AggregateShiftBadge
              present={summary.present}
              total={summary.total}
              isFuture={isDateKeyInFuture(
                getDateKeyInTimezone(cell.startDate, organizationTimezone),
                organizationTimezone,
              )}
            />
          </Box>
        );
      })}
    </>
  );
});
