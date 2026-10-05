import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { CardLayout } from "@/components/layout/CardLayout";
import BusinessAndClientInfo from "@/features/components/boq/BuisinessAndClientInfo";
import type { ProgressClaim } from "../hooks/api/create-progress-claim";
import type { ProgressClaimTab } from "../hooks/useProgressClaimTabs";
import ProgressClaimAcceptSheet from "../external/ProgressClaimAcceptSheet";
import type { useProgressClaimAcceptance } from "../external/useProgressClaimAcceptance";
import { toClaimPeriod } from "../utils/progressClaimPeriod";
import { getPhaseRows } from "../utils/progressClaimPhases";
import ProgressClaimAttachmentsView from "./ProgressClaimAttachmentsView";
import ProgressClaimChangeOrderTable from "./ProgressClaimChangeOrderTable";
import ProgressClaimDetailsFields from "./ProgressClaimDetailsFields";
import ProgressClaimPlannerTabContent from "./ProgressClaimPlannerTabContent";
import ProgressClaimStatement from "./ProgressClaimStatement";

interface ProgressClaimDocumentContentProps {
  claim: ProgressClaim;
  activeTab: ProgressClaimTab;
  acceptance: ReturnType<typeof useProgressClaimAcceptance>;
  /** False on the client's page, which has no session. */
  withAuth: boolean;
  readOnly: boolean;
  submitAttempted?: boolean;
  formatMoney: (amount: number) => string;
  /** Status messages shown above the statement on the Summary tab. */
  summaryNotice?: ReactNode;
}

/**
 * The body of a saved claim — Summary (details, parties, statement), one sheet
 * per phase, and the planner tabs. Shared by the client's page and the
 * internal preview so both show the same claim.
 */
const ProgressClaimDocumentContent = ({
  claim,
  activeTab,
  acceptance,
  withAuth,
  readOnly,
  submitAttempted = false,
  formatMoney,
  summaryNotice,
}: ProgressClaimDocumentContentProps) => {
  const { t } = useTranslation();

  if (activeTab.kind === "ATTACHMENTS") {
    return <ProgressClaimAttachmentsView attachments={claim.attachments ?? []} />;
  }

  if (activeTab.kind === "PLANNER") {
    return (
      <ProgressClaimPlannerTabContent
        tab={activeTab.tab}
        organizationId={claim.organizationId}
        organizationType={claim.organizationType}
        projectId={claim.projectId}
        withAuth={withAuth}
        period={toClaimPeriod(claim.periodFrom, claim.periodTo)}
      />
    );
  }

  if (activeTab.kind === "CHANGE_ORDER") {
    const coLinesForTable = (claim.coLines ?? []).map((co) => ({
      changeOrderId: co.changeOrderId,
      name: co.name,
      variationAmount: Number(co.variationAmount) || 0,
      previousClaimedAmount: Number(co.previousClaimedAmount) || 0,
      claimedThisPeriod: Number(co.claimedAmount) || 0,
      totalToDateAmount:
        (Number(co.previousClaimedAmount) || 0) + (Number(co.claimedAmount) || 0),
      selected: true,
    }));
    return (
      <ProgressClaimChangeOrderTable
        lines={coLinesForTable}
        formatMoney={formatMoney}
        readOnly
      />
    );
  }

  if (activeTab.kind === "PHASE") {
    return (
      <ProgressClaimAcceptSheet
        claimedRows={getPhaseRows(acceptance.claimedRows, activeTab.phaseId)}
        acceptedRows={getPhaseRows(acceptance.acceptedRows, activeTab.phaseId)}
        reasonByScheduleId={acceptance.reasonByScheduleId}
        readOnly={readOnly}
        submitAttempted={submitAttempted}
        formatMoney={formatMoney}
        onAcceptedPctChange={acceptance.updateAcceptedPct}
        onReasonChange={acceptance.updateReason}
      />
    );
  }

  const signatureLabel = t("progressClaimExternal.clientSignature", {
    defaultValue: "Client Signature",
  });

  return (
    <Stack gap={1}>
      <CardLayout isClickable={false}>
        <ProgressClaimDetailsFields
          claimNumber={claim.claimNumber}
          details={{
            periodFrom: claim.periodFrom != null ? Number(claim.periodFrom) : null,
            periodTo: claim.periodTo != null ? Number(claim.periodTo) : null,
          }}
        />
      </CardLayout>

      <BusinessAndClientInfo
        type="ADMIN"
        projectId={claim.projectId}
        organizationId={claim.organizationId}
        withAuth={withAuth}
        fullWidth
        singleRow
      />

      {summaryNotice}

      <ProgressClaimStatement
        statement={acceptance.statement}
        retentionPct={acceptance.retentionPct}
        loading={acceptance.loading}
        formatMoney={formatMoney}
      />

      {claim.status === "ACCEPTED" && claim.clientSignature ? (
        <Stack spacing={1} alignItems="flex-start">
          <Typography variant="body1" fontWeight={500}>
            {signatureLabel}
          </Typography>
          <Box
            component="img"
            src={claim.clientSignature}
            alt={signatureLabel}
            sx={{
              display: "block",
              maxWidth: 180,
              maxHeight: 64,
              objectFit: "contain",
              bgcolor: "common.white",
            }}
          />
        </Stack>
      ) : null}
    </Stack>
  );
};

export default ProgressClaimDocumentContent;
