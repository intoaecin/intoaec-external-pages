import type { ClientReportLogSection } from "./ClientReportSideBar";

/**
 * Ported from intoaec-UI `src/features/ClientReport/types.ts`. The source file
 * imports `ClientReportNotePayload` from `./hooks/useCreateClientReport` — that
 * hook is the admin "create" mutation (pulls in `next-auth`'s `useSession`) and
 * is intentionally NOT ported here (it's only reachable from the "Create"
 * button inside `PageLayout`, which is unreachable when `isExternalPreview` is
 * true — see `ClientReportCreate.tsx`). The note payload shape itself has
 * nothing to do with auth, so it's redefined locally instead.
 */
export type ClientReportNotePayload = {
  id: string;
  title: string;
  content: string;
};

export type ClientReportOrganizationDetails = {
  organizationName?: string;
  organizationWebsite?: string;
  organizationLocation?: string;
  mobileNumber?: string;
  emailId?: string;
  organizationLogo?: string;
  logoUrl?: string;
  taxId?: string;
  taxName?: string;
};

export type ClientReportClientDetails = {
  clientName?: string;
  clientEmailAddress?: string;
  clientContactNumber?: string;
  clientLocation?: string;
};

export type ClientReportAttachment = {
  fileUrl: string;
  fileName: string;
  fileExtension?: string;
};

export type ClientReportRecord = {
  id: string;
  projectId?: string;
  organizationId?: string;
  organizationDetails?: ClientReportOrganizationDetails;
  clientDetails?: ClientReportClientDetails;
  date: string;
  createdAt?: number;
  createdBy?: string;
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
  includedInLog?: ClientReportLogSection[];
  noteSections?: ClientReportNotePayload[];
  attachments?: string[];
  attachmentDetails?: ClientReportAttachment[];
  weatherCondition?: Record<string, unknown> | null;
  scheduleProgress?: Record<string, unknown>[];
  taskProgress?: Record<string, unknown>[];
  workersProgress?: Record<string, unknown>[];
  inventoryStatus?: Record<string, unknown>[];
};
