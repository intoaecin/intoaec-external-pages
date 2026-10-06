import { CircularProgress, IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import DownloadIcon from "@/assets/icons/download-icon";
import { useExcelExport } from "@/features/hooks/api/useExcelExport";
import { useBusinessAndClientDetails } from "@/features/hooks/api/useBusinessAndClientDetails";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import {
  formatDateBasedOnOrganizationLocalization,
  formatTimeBasedOnOrganizationLocalization,
  getLocalizationValue,
} from "@/lib/helpers";
import type { ProgressClaim } from "./hooks/api/create-progress-claim";
import { useProgressClaimPlannerData } from "./hooks/useProgressClaimPlannerData";
import type { useProgressClaimAcceptance } from "./external/useProgressClaimAcceptance";
import { buildProgressClaimWorkbook } from "./utils/progressClaimExcel";

const ICON_SIZE = 24;

interface ProgressClaimDownloadButtonProps {
  claim: ProgressClaim;
  acceptance: ReturnType<typeof useProgressClaimAcceptance>;
  /** False on the client's page, which has no session. */
  withAuth: boolean;
}

/**
 * Downloads the claim as an Excel workbook rendered by aec-botsync: Summary,
 * one sheet per phase, Quantity, Materials / Resources / Assets when the claim
 * settings enable those tabs, and Attachments when there are any.
 */
const ProgressClaimDownloadButton = ({
  claim,
  acceptance,
  withAuth,
}: ProgressClaimDownloadButtonProps) => {
  const { t } = useTranslation();
  const { localizationValue } = useOrganizationLocalization();
  const { planner, loading: plannerLoading } = useProgressClaimPlannerData(claim, withAuth);
  const { exportExcel, exporting } = useExcelExport();
  const { business, client, loading: partiesLoading } = useBusinessAndClientDetails({
    organizationId: claim.organizationId,
    projectId: claim.projectId,
    withAuth,
  });
  const label = t("tooltips.downloadAsExcel");

  const handleDownload = async () => {
    try {
      const workbook = buildProgressClaimWorkbook({
        claim,
        statement: acceptance.statement,
        retentionPct: acceptance.retentionPct,
        phases: acceptance.phases,
        claimedRows: acceptance.claimedRows,
        acceptedRows: acceptance.acceptedRows,
        reasonByScheduleId: acceptance.reasonByScheduleId,
        planner,
        parties: { business, client },
        formatDate: (value) =>
          formatDateBasedOnOrganizationLocalization(localizationValue, value, true),
        formatTime: (value) =>
          formatTimeBasedOnOrganizationLocalization(localizationValue, value, false),
        timeZone:
          (localizationValue && getLocalizationValue(localizationValue, "TIMEZONE", "ID")) || "UTC",
        t,
      });
      await exportExcel(workbook);
    } catch {
      toast.error(t("progressClaim.downloadFailed"));
    }
  };

  return (
    <Tooltip title={label} arrow>
      <span>
        <IconButton
          onClick={() => void handleDownload()}
          aria-label={label}
          disabled={acceptance.loading || plannerLoading || partiesLoading || exporting}
        >
          {exporting ? (
            <CircularProgress size={ICON_SIZE - 4} />
          ) : (
            <DownloadIcon style={{ width: ICON_SIZE, height: ICON_SIZE }} />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default ProgressClaimDownloadButton;
