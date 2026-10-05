/** Visible width for tasks with 0 working duration (start === end) so the bar is not a full day column. */
export const GANTT_ZERO_DURATION_BAR_WIDTH_PX = 4;

export const DAY_VIEW_WIDTH = 58
export const WEEK_VIEW_WIDTH = 100
export const MONTH_VIEW_WIDTH = 100

/** Row height for Gantt schedule rows (list + timeline must match). */
export const GANTT_SCHEDULE_ROW_HEIGHT_PX = 40

/** Day view: month label strip height in timeline header. */
export const GANTT_DAY_HEADER_MONTH_ROW_HEIGHT_PX = 28

/** Day view: day label strip height in timeline header. */
export const GANTT_DAY_HEADER_DAY_ROW_HEIGHT_PX = 36

/** Total timeline header height in day view (month row + day row). */
export const GANTT_DAY_HEADER_TOTAL_HEIGHT_PX =
  GANTT_DAY_HEADER_MONTH_ROW_HEIGHT_PX + GANTT_DAY_HEADER_DAY_ROW_HEIGHT_PX

/** Week/month view timeline header height, matching the daily header height. */
export const GANTT_SUMMARY_TIMELINE_HEADER_HEIGHT_PX =
  GANTT_DAY_HEADER_TOTAL_HEIGHT_PX

/** Width for the today marker shared by timeline header and gantt body. */
export const GANTT_TODAY_INDICATOR_WIDTH_PX = 2

/** Timeline day/week/month column labels and schedule table header — same size. */
export const GANTT_TIMELINE_DATE_FONT_SIZE = "0.625rem"
export const GANTT_TIMELINE_DATE_LINE_HEIGHT = 1.15

/** Day view only: month name strip above the day row (slightly smaller). */
export const GANTT_TIMELINE_MONTH_STRIP_FONT_SIZE = "0.55rem"

/** Day view: per-column day labels (Wed 8, Thu 9, …) — compact for narrow columns. */
export const GANTT_TIMELINE_DAY_HEADER_FONT_SIZE = "0.5625rem"
export const GANTT_TIMELINE_DAY_HEADER_LINE_HEIGHT = 1.1

/** Pixel height of schedule bars in the Gantt (milestone diamond may extend past this). */
export const GANTT_SCHEDULE_BAR_HEIGHT_PX = 20

/** Side length of the square that is rotated 45° to draw the milestone diamond. */
export const GANTT_MILESTONE_DIAMOND_SIDE_PX = 17

/** Horizontal offset from bar center to milestone diamond tip (for dependency anchors). */
export const GANTT_MILESTONE_PIN_OFFSET_PX =
  (GANTT_MILESTONE_DIAMOND_SIDE_PX * Math.SQRT2) / 2

export const DEPENDENCY_TYPES = {
    START_TO_START: 'start-to-start',
    START_TO_END: 'start-to-end',
    END_TO_END: 'end-to-end',
    END_TO_START: 'end-to-start'
}
