import type { ProgressClaimSettings } from "../../types";

export interface CreateProgressClaimLineInput {
  scheduleId: string;
  descriptionSnapshot: string;
  claimValueSnapshot: number;
  previousAcceptedPct: number;
  scheduleSuggestedPct: number;
  claimedCumulativePct: number;
  claimedPeriodAmount: number;
}

/** Header details the user picks on the claim form. */
export interface ProgressClaimDetailsInput {
  periodFrom: number | null;
  periodTo: number | null;
}

export interface ProgressClaimCOLine {
  changeOrderId: string;
  name: string;
  variationAmount: number;
  previousClaimedAmount: number;
  claimedAmount: number;
}

export type ProgressClaimStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED";

export interface ProgressClaim {
  id: string;
  organizationId: string;
  organizationType: string;
  projectId: string;
  claimNumber: string;
  periodFrom: number | null;
  periodTo: number | null;
  attachments?: string[] | null;
  coLines?: ProgressClaimCOLine[] | null;
  status: ProgressClaimStatus;
  grossClaimedAmount: number;
  grossAcceptedAmount: number | null;
  /** Project retention % snapshotted when the claim was created. */
  retentionPct: number;
  retentionAmount: number;
  netClaimedAmount: number;
  acceptedRetentionAmount: number | null;
  netAcceptedAmount: number | null;
  submittedBy: string;
  submittedByUserId: string | null;
  submittedAt: number;
  approvedBy: string | null;
  approvedAt: number | null;
  sentBy: string | null;
  sentAt: number | null;
  acceptedBy: string | null;
  acceptedAt: number | null;
  cancelledBy: string | null;
  cancelledAt: number | null;
  rejectedBy: string | null;
  rejectedAt: number | null;
  rejectionReason: string | null;
  clientSignature: string | null;
  /** The project's tab settings, sent along for the session-less client page. */
  progressClaimSettings?: ProgressClaimSettings | null;
  lines: Array<
    CreateProgressClaimLineInput & {
      id: string;
      progressClaimId: string;
      acceptedCumulativePct: number | null;
      acceptedPeriodAmount: number | null;
      varianceAmount: number | null;
      varianceReason: string | null;
    }
  >;
}
