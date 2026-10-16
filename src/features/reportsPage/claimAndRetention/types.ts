import type {
  ProgressClaim,
  ProgressClaimStatus,
} from "@/features/projectSchedule/progressClaim/hooks/api/create-progress-claim";

export type ClaimRetentionReportTab = "CLAIMS" | "RETENTION";

export interface ClaimRetentionReportFilters {
  projectIds: string[];
  status: ProgressClaimStatus | "";
  startDate?: number;
  endDate?: number;
}

export type ClaimRetentionReportSortOrder = "ASC" | "DESC";

/** A claim as the report endpoint returns it: no lines, with its project's name. */
export type ClaimRetentionReportClaim = Omit<ProgressClaim, "lines"> & {
  projectName: string | null;
};

export interface ClaimRetentionReportPage {
  result: ClaimRetentionReportClaim[];
  pageCount: number;
  totalCount: number;
  totalClaimedAmount: number;
  totalAcceptedAmount: number;
  totalRetentionHeld: number;
}

/** A display-ready table/export row; every value is already formatted. */
export type ClaimRetentionReportRow = {
  id: string;
  projectName: string;
  claimNumber: string;
  status: string;
  submittedAt: string;
  acceptedAt: string;
  grossClaimedAmount: string;
  grossAcceptedAmount: string;
  retentionPct: string;
  retentionAmount: string;
  acceptedRetentionAmount: string;
};

export type ClaimRetentionReportColumn = {
  display: string;
  field: keyof ClaimRetentionReportRow;
  isSort?: boolean;
};
