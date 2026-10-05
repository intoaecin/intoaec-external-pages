import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Box, CircularProgress, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { roundNumber } from "@/utils/numbers";
import type {
  DailyQuantityRowData,
  DailyQuantityUpdateInput,
} from "../types/workload";
import {
  buildDateKey,
  buildVisibleDayCells,
  buildVisibleMonthCells,
  buildVisibleWeekCells,
} from "../utils/workloadDateKeys";

// Same bounds as the Planned Quantity field: 9 integer digits, 2 decimals.
const isValidQuantityInput = (value: string): boolean =>
  /^\d{0,9}(\.\d{0,2})?$/.test(value);

interface QuantityCellProps {
  left: number;
  width: number;
  quantity: number;
  isOverridden: boolean;
  /** Most this day can take without the plan exceeding the planned quantity. */
  max: number;
  editable: boolean;
  onCommit?: (quantity: number | null) => Promise<void>;
}

function QuantityCell({
  left,
  width,
  quantity,
  isOverridden,
  max,
  editable,
  onCommit,
}: QuantityCellProps) {
  const { t } = useTranslation();
  const displayQuantity = roundNumber(quantity, 2);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [inputValue, setInputValue] = useState(String(displayQuantity));
  const commitInFlightRef = useRef(false);

  useEffect(() => {
    if (!isEditing) setInputValue(String(displayQuantity));
  }, [displayQuantity, isEditing]);

  const handleCommit = async () => {
    if (commitInFlightRef.current) return;

    // An empty cell clears the override; an unparseable one is discarded.
    const parsed = inputValue === "" ? null : Number(inputValue);
    const isInvalid = parsed !== null && !Number.isFinite(parsed);
    const nextQuantity =
      parsed === null ? null : roundNumber(Math.min(parsed, max), 2);
    const isUnchanged =
      nextQuantity === null ? !isOverridden : nextQuantity === displayQuantity;

    if (!onCommit || isInvalid || isUnchanged) {
      setInputValue(String(displayQuantity));
      setIsEditing(false);
      return;
    }

    commitInFlightRef.current = true;
    setIsSaving(true);
    try {
      await onCommit(nextQuantity);
      setIsEditing(false);
    } finally {
      commitInFlightRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <Box
      onClick={(event) => {
        if (!editable) return;
        event.stopPropagation();
        setIsEditing(true);
      }}
      onMouseDown={(event) => {
        if (editable) event.stopPropagation();
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
        pointerEvents: editable ? "auto" : "none",
        cursor: editable ? "text" : "default",
      }}
    >
      {isEditing ? (
        <TextField
          autoFocus
          value={inputValue}
          disabled={isSaving}
          inputProps={{
            inputMode: "decimal",
            "aria-label": t("schedule.quantityPlanDayInputAriaLabel"),
          }}
          onFocus={(event) => event.target.select()}
          onChange={(event) => {
            const nextValue = event.target.value.trim();
            if (isValidQuantityInput(nextValue)) setInputValue(nextValue);
          }}
          onBlur={handleCommit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleCommit();
            }
            if (event.key === "Escape") {
              // Keep Escape from also closing the surrounding dialog.
              event.stopPropagation();
              setInputValue(String(displayQuantity));
              setIsEditing(false);
            }
          }}
          sx={{
            width: Math.max(40, width - 8),
            "& .MuiInputBase-root": { height: 24, bgcolor: "background.paper" },
            "& .MuiInputBase-input": {
              typography: "caption",
              textAlign: "center",
              px: 0.5,
              py: 0,
            },
          }}
        />
      ) : (
        <Box
          sx={{
            typography: "caption",
            color: isOverridden ? "text.primary" : "text.secondary",
            fontWeight: isOverridden ? 500 : 400,
            px: 0.5,
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
        >
          {isSaving ? (
            <CircularProgress size={12} color="inherit" />
          ) : (
            displayQuantity
          )}
        </Box>
      )}
    </Box>
  );
}

interface QuantityDayCellsProps {
  dailyQuantity: DailyQuantityRowData;
  dates: Date[];
  viewMode: "day" | "week" | "month";
  pixelsPerUnit: number;
  visibleStartPx: number;
  visibleEndPx: number;
  organizationTimezone: string;
  readOnly?: boolean;
  onUpdateDailyQuantity?: (input: DailyQuantityUpdateInput) => Promise<void>;
}

/**
 * Planned quantity per day for one schedule. Day view is click-to-edit on
 * every working day of the schedule; week/month show read-only sums.
 */
export const QuantityDayCells = memo(function QuantityDayCells({
  dailyQuantity,
  dates,
  viewMode,
  pixelsPerUnit,
  visibleStartPx,
  visibleEndPx,
  organizationTimezone,
  readOnly = false,
  onUpdateDailyQuantity,
}: QuantityDayCellsProps) {
  const { scheduleId, plannedQuantity, values, overriddenKeys } = dailyQuantity;
  const enteredTotal = useMemo(() => {
    let total = 0;
    overriddenKeys.forEach((key) => {
      total += values.get(key) ?? 0;
    });
    return total;
  }, [overriddenKeys, values]);

  const cells = useMemo(() => {
    const getHours = (date: Date) => values.get(buildDateKey(date)) ?? 0;
    const range = { dates, pixelsPerUnit, visibleStartPx, visibleEndPx, getHours };

    if (viewMode === "day") {
      return buildVisibleDayCells(range).filter(
        (cell) => cell.date && values.has(buildDateKey(cell.date)),
      );
    }
    const summaryCells =
      viewMode === "week"
        ? buildVisibleWeekCells(range)
        : buildVisibleMonthCells({ ...range, organizationTimezone });
    return summaryCells.filter((cell) => cell.hours > 0);
  }, [
    dates,
    organizationTimezone,
    pixelsPerUnit,
    values,
    viewMode,
    visibleEndPx,
    visibleStartPx,
  ]);

  return (
    <>
      {cells.map((cell) => {
        const date = viewMode === "day" ? cell.date : undefined;
        const editable = Boolean(date && onUpdateDailyQuantity && !readOnly);
        const isOverridden = Boolean(
          date && overriddenKeys.has(buildDateKey(date)),
        );
        const enteredElsewhere = enteredTotal - (isOverridden ? cell.hours : 0);

        return (
          <QuantityCell
            key={cell.key}
            left={cell.left}
            width={cell.width}
            quantity={cell.hours}
            isOverridden={isOverridden}
            max={Math.max(0, roundNumber(plannedQuantity - enteredElsewhere, 2))}
            editable={editable}
            onCommit={
              date && onUpdateDailyQuantity
                ? (quantity) =>
                    onUpdateDailyQuantity({ scheduleId, date, quantity })
                : undefined
            }
          />
        );
      })}
    </>
  );
});
