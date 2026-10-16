import type {
  ClaimRetentionReportFilters,
  ClaimRetentionReportTab,
} from "./types";

export const CLAIM_RETENTION_REPORT_TABS: ClaimRetentionReportTab[] = [
  "CLAIMS",
  "RETENTION",
];

export const EMPTY_CLAIM_RETENTION_REPORT_FILTERS: ClaimRetentionReportFilters = {
  projectIds: [],
  status: "",
  startDate: undefined,
  endDate: undefined,
};
