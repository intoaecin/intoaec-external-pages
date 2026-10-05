export interface ScheduleBaselineItem {
  scheduledItemGanttId: string;
  startDate: string;
  endDate: string;
}

export interface ScheduleBaseline {
  id: number;
  name: string;
  items: ScheduleBaselineItem[];
  /** Capture instant from the API (epoch ms or numeric string parsed by localization helper) */
  createdAt?: number;
}
