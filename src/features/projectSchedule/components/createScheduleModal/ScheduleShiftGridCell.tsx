import { Box } from "@mui/material";

import {
  getShiftGridCellStatus,
  getShiftPresentSummary,
  isShiftInFuture,
} from "./scheduleShiftGridUtils";
import type { ScheduleLinkedShiftRow } from "./scheduleShiftLinkUtils";
import type { ScheduleShiftGridCellStatus } from "./scheduleShiftGridUtils";

export const SHIFT_STATUS_STYLES: Record<
  ScheduleShiftGridCellStatus,
  { color: string; bgcolor: string }
> = {
  empty: { color: "text.disabled", bgcolor: "transparent" },
  none: { color: "error.dark", bgcolor: "error.light" },
  short: { color: "warning.dark", bgcolor: "warning.light" },
  full: { color: "common.white", bgcolor: "success.dark" },
};

/** Attendance can't be recorded yet for a future shift, so it gets its own (non-alarming) color. */
export const FUTURE_SHIFT_STYLES = { color: "success.dark", bgcolor: "success.light" };

type ScheduleShiftGridCellProps = {
  row: ScheduleLinkedShiftRow;
  /** Count only this worker in the badge. */
  focusWorkerId?: string;
  organizationTimezone: string;
  /** Kept for call-site parity with intoaec-UI; the cell is always read-only here. */
  readOnly?: boolean;
};

/**
 * Trimmed port: the attendance badge only. intoaec-UI opens the
 * `ShiftDayQuickEditor` popover on click, an authenticated admin editor that
 * is not part of this app.
 */
export function ScheduleShiftGridCell({
  row,
  focusWorkerId,
  organizationTimezone,
}: ScheduleShiftGridCellProps) {
  const summary = getShiftPresentSummary(row.shift, focusWorkerId);
  const status = getShiftGridCellStatus(summary.present, summary.total);
  const styles = isShiftInFuture(row.shift, organizationTimezone)
    ? FUTURE_SHIFT_STYLES
    : SHIFT_STATUS_STYLES[status];

  return (
    <Box
      sx={{
        minWidth: 44,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 1,
        cursor: "default",
        color: styles.color,
        bgcolor: styles.bgcolor,
        typography: "caption",
        fontWeight: 600,
        userSelect: "none",
      }}
    >
      {summary.present}/{summary.total}
    </Box>
  );
}
