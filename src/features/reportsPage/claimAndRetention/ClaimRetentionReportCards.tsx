import { Grid } from "@mui/material";
import { CircleCheck, FileClock, HandCoins, ReceiptText } from "lucide-react";
import { useTranslation } from "react-i18next";
import ReportCard from "../ReportsDashboard";
import type { ClaimRetentionReportTab } from "./types";

interface ClaimRetentionReportTotals {
  claimCount: number;
  claimedAmount: string;
  acceptedAmount: string;
  retentionHeld: string;
}

interface ClaimRetentionReportCardsProps {
  tab: ClaimRetentionReportTab;
  totals: ClaimRetentionReportTotals;
}

const ICON_SIZE = 25;
// Same muted icon tone the other report cards use.
const ICON_COLOR = "#636566";
const LABEL_COLOR = "#e0f7fa";

const ClaimRetentionReportCards = ({
  tab,
  totals,
}: ClaimRetentionReportCardsProps) => {
  const { t } = useTranslation();

  const cards =
    tab === "RETENTION"
      ? [
          {
            key: "retentionHeld",
            title: t("reports.totalRetentionHeld"),
            icon: <HandCoins size={ICON_SIZE} color={ICON_COLOR} />,
            value: totals.retentionHeld,
            label: t("claimAndRetention.retentionHeld"),
          },
          {
            key: "acceptedAmount",
            title: t("reports.totalAcceptedAmount"),
            icon: <CircleCheck size={ICON_SIZE} color={ICON_COLOR} />,
            value: totals.acceptedAmount,
            label: t("claimAndRetention.acceptedAmount"),
          },
          {
            key: "claimCount",
            title: t("reports.claimsHoldingRetention"),
            icon: <FileClock size={ICON_SIZE} color={ICON_COLOR} />,
            value: totals.claimCount,
            label: t("claimAndRetention.claims"),
          },
        ]
      : [
          {
            key: "claimedAmount",
            title: t("reports.totalClaimedAmount"),
            icon: <ReceiptText size={ICON_SIZE} color={ICON_COLOR} />,
            value: totals.claimedAmount,
            label: t("claimAndRetention.claimedAmount"),
          },
          {
            key: "acceptedAmount",
            title: t("reports.totalAcceptedAmount"),
            icon: <CircleCheck size={ICON_SIZE} color={ICON_COLOR} />,
            value: totals.acceptedAmount,
            label: t("claimAndRetention.acceptedAmount"),
          },
          {
            key: "retentionHeld",
            title: t("reports.totalRetentionHeld"),
            icon: <HandCoins size={ICON_SIZE} color={ICON_COLOR} />,
            value: totals.retentionHeld,
            label: t("claimAndRetention.retentionHeld"),
          },
        ];

  return (
    <Grid container spacing={2} sx={{ mb: 1 }}>
      {cards.map((card) => (
        <Grid item xs={12} lg={4} key={card.key}>
          <ReportCard
            title={card.title}
            titleIcon={card.icon}
            value={card.value}
            label={card.label}
            labelColor={LABEL_COLOR}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ClaimRetentionReportCards;
