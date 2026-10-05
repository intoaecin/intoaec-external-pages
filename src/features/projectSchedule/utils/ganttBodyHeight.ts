import { GANTT_SCHEDULE_ROW_HEIGHT_PX } from "../helpers/constants";

/**
 * Same sizing strategy as the main Gantt's `drawingSurfaceHeight`: fill the
 * available panel height when there are few rows (so the grid doesn't leave
 * a large blank gap below the last row), and grow past it — scrollable —
 * once there are enough rows to need it.
 *
 * Two variants because the gantt panel and the list panel nest their sticky
 * header differently:
 * - Gantt panel: header and body are siblings inside one scroll container,
 *   so `100%` there is the *whole* container (header + body) and the header
 *   height must be subtracted.
 * - List panel: the header sits outside the scrollable viewport, so `100%`
 *   inside it is already just the body's share — no subtraction needed.
 */
export function buildGanttPanelBodyHeight(
  rowCount: number,
  headerHeightPx: number,
): string {
  const rowsHeightPx = rowCount * GANTT_SCHEDULE_ROW_HEIGHT_PX;
  return `max(${rowsHeightPx}px, calc(100% - ${headerHeightPx}px))`;
}

export function buildListPanelBodyHeight(rowCount: number): string {
  const rowsHeightPx = rowCount * GANTT_SCHEDULE_ROW_HEIGHT_PX;
  return `max(${rowsHeightPx}px, 100%)`;
}
