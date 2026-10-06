import { useMemo, useRef, useState } from "react";
import {
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import DislikeIcon from "@/assets/icons/dislike-icon";
import { PageLayout } from "@/components/layout/PageLayout";
import StatusLabel from "@/components/StatusLabel";
import UISignatureUploader from "@/features/components/HelperComponents/UISignatureUploader";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { formatNumberITL, getLocalizationValue } from "@/lib/helpers";
import type { ProgressClaim } from "../hooks/api/create-progress-claim";
import { useAcceptProgressClaim } from "../hooks/api/accept-progress-claim";
import { useRejectProgressClaimByClient } from "../hooks/api/reject-progress-claim-by-client";
import RejectClaimDialog from "./RejectClaimDialog";
import { useProgressClaimAcceptance } from "./useProgressClaimAcceptance";
import ProgressClaimDownloadButton from "../ProgressClaimDownloadButton";
import ProgressClaimDocumentContent from "../components/ProgressClaimDocumentContent";
import { useProgressClaimTabs } from "../hooks/useProgressClaimTabs";
import { resolveProgressClaimSettings } from "../utils/progressClaimSettings";

interface ProgressClaimAcceptPageProps {
  claim: ProgressClaim;
}

const ProgressClaimAcceptPage = ({ claim: initialClaim }: ProgressClaimAcceptPageProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { localizationValue } = useOrganizationLocalization();
  const { acceptProgressClaim, loading } = useAcceptProgressClaim();
  const { rejectProgressClaimByClient, loading: rejecting } = useRejectProgressClaimByClient();
  const signatureUploadRef = useRef<any>(null);

  const [claim, setClaim] = useState(initialClaim);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const acceptance = useProgressClaimAcceptance(claim);
  const claimSettings = useMemo(
    () => resolveProgressClaimSettings(initialClaim.progressClaimSettings),
    [initialClaim.progressClaimSettings],
  );
  const hasChangeOrders = Boolean(claim.coLines && claim.coLines.length > 0);
  const { activeTab, tabItems, tabValue, handleTabChange } = useProgressClaimTabs(
    acceptance.phases,
    claimSettings,
    hasChangeOrders,
  );

  const currency = useMemo(
    () =>
      localizationValue
        ? (getLocalizationValue(localizationValue, "CURRENCY", "SYMBOL") ?? "")
        : "",
    [localizationValue],
  );
  const formatMoney = (amount: number) =>
    `${currency}${formatNumberITL(localizationValue, amount || 0)}`;

  const isAccepted = claim.status === "ACCEPTED";
  const isRejected = claim.status === "REJECTED";
  const { isDecided } = acceptance;

  const handleAcceptClick = () => {
    setSubmitAttempted(true);

    if (acceptance.hasMissingReasons) {
      toast.error(
        t("progressClaimExternal.varianceReasonRequired", {
          defaultValue:
            "Enter a reason for every line accepted below the claimed amount.",
        }),
      );
      return;
    }

    signatureUploadRef.current?.handleOpen();
  };

  const handleSignatureChangeAndAccept = async (signatureUrl: string) => {
    try {
      const accepted = await acceptProgressClaim({
        progressClaimId: claim.id,
        clientSignature: signatureUrl,
        lines: acceptance.buildLinesPayload(),
      });
      setClaim(accepted);
    } catch {
      toast.error(
        t("progressClaimExternal.acceptFailed", {
          defaultValue: "Failed to accept the claim. Please try again.",
        }),
      );
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    try {
      const rejected = await rejectProgressClaimByClient(claim.id, reason);
      setClaim(rejected);
      setRejectDialogOpen(false);
    } catch {
      toast.error(
        t("progressClaimExternal.rejectFailed", {
          defaultValue: "Failed to reject the claim. Please try again.",
        }),
      );
    }
  };

  const statusLabelProps = isAccepted
    ? {
        status: "ACCEPTED",
        label: t("progressClaimExternal.statusAccepted", { defaultValue: "Accepted" }),
        color: theme.palette.success.main,
      }
    : isRejected
      ? {
          status: "REJECTED",
          label: t("progressClaimExternal.statusRejected", { defaultValue: "Rejected" }),
          color: theme.palette.error.main,
        }
      : {
          status: "SENT",
          label: t("progressClaimExternal.statusPendingAcceptance", {
            defaultValue: "Pending Acceptance",
          }),
          color: theme.palette.warning.main,
        };

  const pageTitle = (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Typography
        variant="h6"
        sx={{ fontSize: "18px", fontWeight: 500, color: "text.primary" }}
      >
        {t("progressClaimExternal.pageTitle", {
          defaultValue: "Progress Claim / {{claimNumber}}",
          claimNumber: claim.claimNumber,
        })}
      </Typography>
      <StatusLabel
        status={statusLabelProps.status}
        labelOverride={statusLabelProps.label}
        customBackground={statusLabelProps.color}
        customColor="#FFFFFF"
      />
    </Stack>
  );

  const headerActions = (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <ProgressClaimDownloadButton claim={claim} acceptance={acceptance} withAuth={false} />
      {/* Accept/reject belong where the claimed numbers are reviewed, not on the planner tabs. */}
      {!isDecided && activeTab.kind !== "PLANNER" ? (
        <>
          <Tooltip title={t("progressClaimExternal.rejectClaim", { defaultValue: "Reject" })} arrow>
            <span>
              <IconButton
                disabled={loading || rejecting}
                onClick={() => setRejectDialogOpen(true)}
                aria-label={t("progressClaimExternal.rejectClaim", { defaultValue: "Reject" })}
              >
                {rejecting ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  <DislikeIcon width="24px" />
                )}
              </IconButton>
            </span>
          </Tooltip>
          <Button
            variant="contained"
            disabled={loading || rejecting}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
            onClick={handleAcceptClick}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              px: 3,
              bgcolor: "primary.main",
              "&.Mui-disabled": {
                bgcolor: "action.disabledBackground",
                color: "action.disabled",
              },
            }}
          >
            {t("progressClaimExternal.signAndAccept", { defaultValue: "Sign & Accept" })}
          </Button>
        </>
      ) : null}
    </Stack>
  );

  const s3FilePath = `${claim.organizationId}/${claim.organizationType}/PROGRESS_CLAIM/${claim.id}/SIGNATURE`;

  const summaryNotice = (
    <>
      <Typography variant="body2" color="text.secondary">
        {isAccepted
          ? t("progressClaimExternal.alreadyAcceptedDescription", {
              defaultValue: "Thank you — this claim has already been accepted.",
            })
          : isRejected
            ? t("progressClaimExternal.alreadyRejectedDescription", {
                defaultValue: "You have rejected this claim.",
              })
            : t("progressClaimExternal.pageSubtitle", {
                defaultValue: "Review the claimed amounts below and accept this claim.",
              })}
      </Typography>

      {isRejected && claim.rejectionReason ? (
        <Typography variant="body2" color="error.main">
          {t("progressClaimExternal.rejectionReasonLabel", {
            defaultValue: "Reason: {{reason}}",
            reason: claim.rejectionReason,
          })}
        </Typography>
      ) : null}
    </>
  );

  return (
    <>
      <PageLayout
        title={pageTitle}
        actions={headerActions}
        sx={{ height: "100vh" }}
        tabs
        tabItems={tabItems}
        tabValue={tabValue}
        onTabChange={handleTabChange}
        tabAriaLabel={t("progressClaim.tabsAriaLabel")}
      >
        <ProgressClaimDocumentContent
          claim={claim}
          activeTab={activeTab}
          acceptance={acceptance}
          withAuth={false}
          readOnly={isDecided}
          submitAttempted={submitAttempted}
          formatMoney={formatMoney}
          summaryNotice={summaryNotice}
        />
      </PageLayout>

      <UISignatureUploader
        ref={signatureUploadRef}
        s3FilePath={s3FilePath}
        eventSource="LEADMANAGER"
        displayButtonName={t("progressClaimExternal.acceptClaim", { defaultValue: "Accept" })}
        submitButtonLabel={t("progressClaimExternal.signAndAccept", {
          defaultValue: "Sign & Accept",
        })}
        onChange={handleSignatureChangeAndAccept}
      />

      <RejectClaimDialog
        open={rejectDialogOpen}
        loading={rejecting}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleRejectConfirm}
      />
    </>
  );
};

export default ProgressClaimAcceptPage;
