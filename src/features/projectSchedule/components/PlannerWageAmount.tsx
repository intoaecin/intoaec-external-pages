import { Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { formatNumberITL, getLocalizationValue } from "@/lib/helpers";

interface PlannerWageAmountProps {
  amount: number;
  /** The planner-wide total rather than one schedule's or shift's wage. */
  isTotal?: boolean;
}

/** A wage figure at the end of a planner list row, in the organization's currency. */
export function PlannerWageAmount({ amount, isTotal = false }: PlannerWageAmountProps) {
  const { t } = useTranslation();
  const { localizationValue } = useOrganizationLocalization();
  const currency = localizationValue
    ? (getLocalizationValue(localizationValue, "CURRENCY", "SYMBOL") ?? "")
    : "";

  return (
    <Tooltip
      title={t(isTotal ? "timeTracking.totalWage" : "timeTracking.wage")}
      placement="top"
      disableInteractive
    >
      <Typography
        variant="caption"
        sx={{
          color: isTotal ? "text.primary" : "text.secondary",
          fontWeight: isTotal ? 500 : undefined,
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        {currency}
        {formatNumberITL(localizationValue, amount)}
      </Typography>
    </Tooltip>
  );
}
