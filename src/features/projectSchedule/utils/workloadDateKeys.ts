import { getDateKeyInTimezone } from "../helpers/dateUtil";
import type { DaySlice } from "../types/workload";

export interface WorkloadHourCell {
  key: string;
  left: number;
  width: number;
  hours: number;
  date?: Date;
  startDate?: Date;
  endDate?: Date;
}

export function buildDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function buildDailyHoursMap(slices: DaySlice[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const slice of slices) {
    const key = buildDateKey(slice.date);
    map.set(key, (map.get(key) ?? 0) + slice.hours);
  }
  return map;
}

export function buildVisibleDayCells({
  dates,
  pixelsPerUnit,
  visibleStartPx,
  visibleEndPx,
  getHours,
}: {
  dates: Date[];
  pixelsPerUnit: number;
  visibleStartPx: number;
  visibleEndPx: number;
  getHours: (date: Date) => number;
}): WorkloadHourCell[] {
  const cells: WorkloadHourCell[] = [];

  dates.forEach((date, index) => {
    const left = index * pixelsPerUnit;
    if (left + pixelsPerUnit < visibleStartPx || left > visibleEndPx) return;
    cells.push({
      key: `d-${index}`,
      left,
      width: pixelsPerUnit,
      hours: getHours(date),
      date,
      startDate: date,
      endDate: date,
    });
  });

  return cells;
}

export function buildVisibleWeekCells({
  dates,
  pixelsPerUnit,
  visibleStartPx,
  visibleEndPx,
  getHours,
}: {
  dates: Date[];
  pixelsPerUnit: number;
  visibleStartPx: number;
  visibleEndPx: number;
  getHours: (date: Date) => number;
}): WorkloadHourCell[] {
  const cells: WorkloadHourCell[] = [];
  let weekIndex = 0;
  let dateIndex = 0;

  while (dateIndex < dates.length) {
    const end = Math.min(dateIndex + 7, dates.length);
    const left = weekIndex * pixelsPerUnit;
    if (left + pixelsPerUnit >= visibleStartPx && left <= visibleEndPx) {
      let hours = 0;
      for (let i = dateIndex; i < end; i += 1) hours += getHours(dates[i]);
      cells.push({
        key: `w-${weekIndex}`,
        left,
        width: pixelsPerUnit,
        hours,
        startDate: dates[dateIndex],
        endDate: dates[end - 1],
      });
    }
    dateIndex = end;
    weekIndex += 1;
  }

  return cells;
}

export function buildVisibleMonthCells({
  dates,
  pixelsPerUnit,
  visibleStartPx,
  visibleEndPx,
  getHours,
  organizationTimezone,
}: {
  dates: Date[];
  pixelsPerUnit: number;
  visibleStartPx: number;
  visibleEndPx: number;
  getHours: (date: Date) => number;
  /** Groups dates into months in this timezone (matching the timeline header) instead of the browser's. */
  organizationTimezone?: string;
}): WorkloadHourCell[] {
  const monthMap = new Map<
    string,
    { left: number; hours: number; startDate: Date; endDate: Date }
  >();
  let monthIndex = 0;
  let previousKey = "";

  dates.forEach((date) => {
    const monthKey = organizationTimezone
      ? getDateKeyInTimezone(date, organizationTimezone).slice(0, 7)
      : `${date.getFullYear()}-${date.getMonth()}`;
    if (monthKey !== previousKey) {
      monthMap.set(monthKey, {
        left: monthIndex * pixelsPerUnit,
        hours: 0,
        startDate: date,
        endDate: date,
      });
      monthIndex += 1;
      previousKey = monthKey;
    }
    const month = monthMap.get(monthKey);
    if (month) {
      month.hours += getHours(date);
      month.endDate = date;
    }
  });

  return Array.from(monthMap.entries()).reduce<WorkloadHourCell[]>(
    (cells, [key, { left, hours, startDate, endDate }]) => {
      if (left + pixelsPerUnit >= visibleStartPx && left <= visibleEndPx) {
        cells.push({ key, left, width: pixelsPerUnit, hours, startDate, endDate });
      }
      return cells;
    },
    [],
  );
}
