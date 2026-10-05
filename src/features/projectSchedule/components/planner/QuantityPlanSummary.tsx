import { Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { roundNumber } from "@/utils/numbers";
import type { QuantityPlanDays } from "../../utils/quantityPlan";

interface QuantityPlanSummaryProps {
  plan: QuantityPlanDays;
  unit?: string | null;
}

/** "allocated / planned unit", flagged when the day values don't add up to the total. */
export function QuantityPlanSummary({ plan, unit }: QuantityPlanSummaryProps) {
  const { t } = useTranslation();
  const values = {
    allocated: roundNumber(plan.allocated, 2),
    planned: roundNumber(plan.planned, 2),
    unit: unit ?? "",
  };

  return (
    <Tooltip
      title={
        plan.isMismatch ? t("schedule.quantityPlanMismatchTooltip", values) : ""
      }
      placement="top"
      disableInteractive
    >
      <Typography
        variant="caption"
        sx={{
          color: plan.isMismatch ? "warning.main" : "text.secondary",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        {t("schedule.quantityPlanAllocated", values).trim()}
      </Typography>
    </Tooltip>
  );
}
