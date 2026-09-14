import type { DailyLogLogSection } from "./DailyLogSideBar";
import type { ClientReportAttachment } from "@/features/ClientReport/types";

/**
 * Ported from intoaec-UI `src/features/DailyLog/types.ts`. See
 * `ClientReport/types.ts` in this app for why `DailyLogNotePayload` is
 * redefined locally instead of imported from the (not-ported, next-auth
 * pulling) `./hooks/useCreateDailyLog`.
 */
export type DailyLogNotePayload = {
  id: string;
  title: string;
  content: string;
};

export type DailyLogRecord = {
  id: string;
  projectId?: string;
  date: string;
  createdAt?: number;
  reportStartDate?: number;
  reportEndDate?: number;
  title: string;
  startTime: string;
  endTime: string;
  totalHours: string;
  breakTime: string;
  weather: string;
  temperature: string;
  affectingWork: boolean;
  status: string;
  notes: string;
  includedInLog?: DailyLogLogSection[];
  noteSections?: DailyLogNotePayload[];
  attachments?: string[];
  attachmentDetails?: ClientReportAttachment[];
  weatherCondition?: Record<string, unknown> | null;
  scheduleProgress?: Record<string, unknown>[];
  taskProgress?: Record<string, unknown>[];
  workersProgress?: Record<string, unknown>[];
  inventoryStatus?: Record<string, unknown>[];
  reportType?: string;
  entityType?: string;
  userId?: string;
  username?: string;
  createdBy?: string;
  timesheets?: any[];
};
