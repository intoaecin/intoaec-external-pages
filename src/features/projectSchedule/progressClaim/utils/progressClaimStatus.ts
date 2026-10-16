import type { TFunction } from "i18next";
import type { ProgressClaim } from "../hooks/api/create-progress-claim";

export type ProgressClaimDisplayStatus =
  | ProgressClaim["status"]
  | "APPROVED_INTERNAL"
  | "REJECTED_BY_APPROVER"
  | "REJECTED_BY_CLIENT";

const STATUS_LABEL_KEY: Partial<Record<ProgressClaimDisplayStatus, string>> = {
  PENDING_APPROVAL: "claimAndRetention.statusPendingApproval",
  APPROVED_INTERNAL: "claimAndRetention.statusApprovedInternal",
  SENT: "claimAndRetention.statusSent",
  ACCEPTED: "claimAndRetention.statusAccepted",
  REJECTED_BY_APPROVER: "claimAndRetention.statusRejectedByApprover",
  REJECTED_BY_CLIENT: "claimAndRetention.statusRejectedByClient",
  CANCELLED: "claimAndRetention.statusCancelled",
};

const STATUS_LABEL_DEFAULT: Partial<Record<ProgressClaimDisplayStatus, string>> = {
  PENDING_APPROVAL: "Pending Approval",
  APPROVED_INTERNAL: "Approved",
  SENT: "Sent",
  ACCEPTED: "Accepted",
  REJECTED_BY_APPROVER: "Rejected by Approver",
  REJECTED_BY_CLIENT: "Rejected by Client",
  CANCELLED: "Cancelled",
};

// A rejected claim stays PENDING_APPROVAL (kicked back for revision) but is
// still displayed/colored as "Rejected" until the creator edits/resubmits it
// (which clears rejectedBy/rejectedAt/rejectionReason). A client reject is a
// real terminal REJECTED status.
export const isSoftRejectedProgressClaim = (
  status: ProgressClaim["status"],
  rejectionReason?: string | null,
): boolean => status === "PENDING_APPROVAL" && Boolean(rejectionReason);

export const getProgressClaimDisplayStatus = (
  status: ProgressClaim["status"],
  rejectionReason?: string | null,
): ProgressClaimDisplayStatus => {
  if (isSoftRejectedProgressClaim(status, rejectionReason)) {
    return "REJECTED_BY_APPROVER";
  }
  if (status === "REJECTED") {
    return "REJECTED_BY_CLIENT";
  }
  if (status === "APPROVED") {
    return "APPROVED_INTERNAL";
  }
  return status;
};

export const getProgressClaimStatusLabel = (
  status: ProgressClaim["status"],
  rejectionReason: string | null | undefined,
  t: TFunction,
): string => {
  const displayStatus = getProgressClaimDisplayStatus(status, rejectionReason);
  return t(STATUS_LABEL_KEY[displayStatus] ?? "common.status", {
    defaultValue: STATUS_LABEL_DEFAULT[displayStatus] ?? String(displayStatus ?? ""),
  });
};
