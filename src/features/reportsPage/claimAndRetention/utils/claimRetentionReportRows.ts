import type { TFunction } from "i18next";
import { getProgressClaimStatusLabel } from "@/features/projectSchedule/progressClaim/utils/progressClaimStatus";
import {
  formatDateBasedOnOrganizationLocalization,
  formatNumberITL,
} from "@/lib/helpers";
import type { OrganizationLocalizationType } from "@/types";
import type {
  ClaimRetentionReportClaim,
  ClaimRetentionReportColumn,
  ClaimRetentionReportRow,
  ClaimRetentionReportTab,
} from "../types";

export interface ClaimRetentionReportFormatters {
  t: TFunction;
  currency: string;
  localizationValue?: OrganizationLocalizationType[];
}

export const formatClaimRetentionReportMoney = (
  amount: number | string | null | undefined,
  { currency, localizationValue }: Omit<ClaimRetentionReportFormatters, "t">,
): string =>
  `${currency} ${formatNumberITL(localizationValue, Number(amount) || 0)}`;

export const mapClaimRetentionReportRow = (
  claim: ClaimRetentionReportClaim,
  formatters: ClaimRetentionReportFormatters,
): ClaimRetentionReportRow => {
  const { t, localizationValue } = formatters;
  const formatDate = (value: number | null) =>
    value
      ? String(
          formatDateBasedOnOrganizationLocalization(localizationValue, value, true),
        )
      : "-";

  return {
    id: claim.id,
    projectName: claim.projectName || "-",
    claimNumber: claim.claimNumber,
    status: getProgressClaimStatusLabel(claim.status, claim.rejectionReason, t),
    submittedAt: formatDate(claim.submittedAt),
    acceptedAt: formatDate(claim.acceptedAt),
    grossClaimedAmount: formatClaimRetentionReportMoney(
      claim.grossClaimedAmount,
      formatters,
    ),
    // Nothing is accepted (or held) until the client accepts the claim.
    grossAcceptedAmount:
      claim.status === "ACCEPTED"
        ? formatClaimRetentionReportMoney(claim.grossAcceptedAmount, formatters)
        : "-",
    retentionPct: `${formatNumberITL(localizationValue, Number(claim.retentionPct) || 0)}%`,
    // Retention on what the client accepted once they have; until then, on
    // what was claimed.
    retentionAmount: formatClaimRetentionReportMoney(
      claim.status === "ACCEPTED"
        ? claim.acceptedRetentionAmount
        : claim.retentionAmount,
      formatters,
    ),
    acceptedRetentionAmount:
      claim.status === "ACCEPTED"
        ? formatClaimRetentionReportMoney(
            claim.acceptedRetentionAmount,
            formatters,
          )
        : "-",
  };
};

export const getClaimRetentionReportColumns = (
  tab: ClaimRetentionReportTab,
  t: TFunction,
): ClaimRetentionReportColumn[] => {
  const projectName: ClaimRetentionReportColumn = {
    display: t("common.projectName"),
    field: "projectName",
    isSort: true,
  };
  const claimNumber: ClaimRetentionReportColumn = {
    display: t("claimAndRetention.claimNumber"),
    field: "claimNumber",
    isSort: true,
  };
  const acceptedAmount: ClaimRetentionReportColumn = {
    display: t("claimAndRetention.acceptedAmount"),
    field: "grossAcceptedAmount",
    isSort: true,
  };

  const retentionRate: ClaimRetentionReportColumn = {
    display: t("claimAndRetention.retentionRate"),
    field: "retentionPct",
    isSort: true,
  };

  if (tab === "RETENTION") {
    return [
      projectName,
      claimNumber,
      { display: t("claimAndRetention.heldOn"), field: "acceptedAt", isSort: true },
      acceptedAmount,
      retentionRate,
      {
        display: t("claimAndRetention.retentionHeld"),
        field: "acceptedRetentionAmount",
        isSort: true,
      },
    ];
  }

  return [
    projectName,
    claimNumber,
    { display: t("common.status"), field: "status", isSort: true },
    {
      display: t("claimAndRetention.submittedOn"),
      field: "submittedAt",
      isSort: true,
    },
    {
      display: t("claimAndRetention.claimedAmount"),
      field: "grossClaimedAmount",
      isSort: true,
    },
    acceptedAmount,
    retentionRate,
    {
      display: t("reports.retentionAmount"),
      field: "retentionAmount",
      isSort: true,
    },
  ];
};

export const buildClaimRetentionExportMatrix = (
  rows: ClaimRetentionReportRow[],
  columns: ClaimRetentionReportColumn[],
): Array<Array<string | number>> =>
  rows.map((row, index) => [
    index + 1,
    ...columns.map((column) => row[column.field]),
  ]);
