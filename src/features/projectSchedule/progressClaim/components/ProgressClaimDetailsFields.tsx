import { Box, FormLabel, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { formatDateBasedOnOrganizationLocalization } from "@/lib/helpers";
import type { ProgressClaimDetailsInput } from "../hooks/api/create-progress-claim";

interface ProgressClaimDetailsFieldsProps {
  claimNumber?: string;
  details: ProgressClaimDetailsInput;
}

/**
 * Claim header: claim number and the period the claim covers. Read-only here:
 * the editable period picker belongs to intoaec-UI's claim form.
 */
const ProgressClaimDetailsFields = ({
  claimNumber,
  details,
}: ProgressClaimDetailsFieldsProps) => {
  const { t } = useTranslation();
  const { localizationValue } = useOrganizationLocalization();
  const periodLabel = t("progressClaim.statement.claimPeriod");
  const formatDate = (value: number) =>
    formatDateBasedOnOrganizationLocalization(localizationValue, value, true);
  const periodText =
    details.periodFrom && details.periodTo
      ? `${formatDate(details.periodFrom)} - ${formatDate(details.periodTo)}`
      : "-";

  return (
    <Box display="flex" flexWrap="wrap" alignItems="flex-end" gap={2}>
      <Box display="flex" flexDirection="column" gap={0.5} width={{ xs: "100%", sm: 140 }}>
        <FormLabel htmlFor="progress-claim-number">{t("common.serialNumber")}</FormLabel>
        <TextField id="progress-claim-number" size="small" value={claimNumber || "-"} disabled />
      </Box>
      <Box display="flex" flexDirection="column" gap={0.5} width={{ xs: "100%", sm: 280 }}>
        <FormLabel htmlFor="progress-claim-period">{periodLabel}</FormLabel>
        <TextField id="progress-claim-period" size="small" value={periodText} disabled />
      </Box>
    </Box>
  );
};

export default ProgressClaimDetailsFields;
