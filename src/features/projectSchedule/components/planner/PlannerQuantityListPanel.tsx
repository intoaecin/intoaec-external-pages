import type { RefObject } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { roundNumber } from "@/utils/numbers";
import { GANTT_SCHEDULE_ROW_HEIGHT_PX } from "../../helpers/constants";
import type { PlannerQuantityEntry } from "../../hooks/usePlannerQuantityEntries";
import { PlannerListPanelShell } from "../PlannerListPanelShell";
import { QuantityPlanSummary } from "./QuantityPlanSummary";

interface PlannerQuantityListPanelProps {
  entries: PlannerQuantityEntry[];
  bodyHeightPx: string;
  headerHeightPx: number;
  scrollTopPx: number;
  scrollRef: RefObject<HTMLDivElement>;
  onWheelScroll: (deltaY: number) => void;
}

export function PlannerQuantityListPanel({
  entries,
  bodyHeightPx,
  headerHeightPx,
  scrollTopPx,
  scrollRef,
  onWheelScroll,
}: PlannerQuantityListPanelProps) {
  const { t } = useTranslation();

  return (
    <PlannerListPanelShell
      header={
        <Typography
          variant="body2"
          sx={{ color: "text.primary", fontWeight: 500, px: 1, pb: 1 }}
        >
          {t("schedule.plannerScheduleColumn")}
        </Typography>
      }
      bodyHeightPx={bodyHeightPx}
      headerHeightPx={headerHeightPx}
      scrollTopPx={scrollTopPx}
      scrollRef={scrollRef}
      onWheelScroll={onWheelScroll}
    >
      {entries.map(({ schedule, plan }) => (
        <Box
          key={schedule.scheduleId}
          role="row"
          sx={{
            height: GANTT_SCHEDULE_ROW_HEIGHT_PX,
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            px: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: schedule.scheduleColor || "grey.400",
              flexShrink: 0,
            }}
          />
          <Tooltip title={schedule.scheduleName} placement="right" disableInteractive>
            <Typography
              variant="body2"
              sx={{
                color: "text.primary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontWeight: 500,
                flex: 1,
              }}
            >
              {schedule.scheduleName}
            </Typography>
          </Tooltip>
          <QuantityPlanSummary plan={plan} unit={schedule.quantityUnit} />
          <Tooltip title={t("schedule.completion")} placement="top" disableInteractive>
            <Typography
              variant="caption"
              sx={{ color: "text.primary", fontWeight: 500, flexShrink: 0, whiteSpace: "nowrap" }}
            >
              {roundNumber(Number(schedule.scheduleCompletionPercentage) || 0, 2)}%
            </Typography>
          </Tooltip>
        </Box>
      ))}
    </PlannerListPanelShell>
  );
}
