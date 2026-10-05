import { useMemo } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { NumberInputBoxValue } from "@/components_v2/NumberInputBox";
import type { ProgressClaimLine } from "../types";
import { buildItemLabels, getLineTotals } from "../utils/progressClaimLineFigures";
import {
  LINE_TABLE_CELL_SX,
  LINE_TABLE_GROUP_HEADER_SX,
  LINE_TABLE_SUB_HEADER_SX,
} from "../components/progressClaimLineTableStyles";
import ProgressClaimAcceptSheetRow from "./ProgressClaimAcceptSheetRow";

interface ProgressClaimAcceptSheetProps {
  claimedRows: ProgressClaimLine[];
  acceptedRows: ProgressClaimLine[];
  reasonByScheduleId: Record<string, string>;
  readOnly: boolean;
  submitAttempted: boolean;
  formatMoney: (amount: number) => string;
  onAcceptedPctChange: (scheduleId: string, pct: NumberInputBoxValue) => void;
  onReasonChange: (scheduleId: string, reason: string) => void;
}

/** Column widths in render order: item, name, unit, then the QTY/Rate/Amount groups, reason. */
const COLUMN_WIDTHS = [56, 220, 70, 80, 110, 120, 80, 120, 80, 120, 130, 120, 220];
const MIN_WIDTH = COLUMN_WIDTHS.reduce((sum, width) => sum + width, 0);

/** Client's phase tab: the claim sheet with an Accepted column the client can lower per line. */
const ProgressClaimAcceptSheet = ({
  claimedRows,
  acceptedRows,
  reasonByScheduleId,
  readOnly,
  submitAttempted,
  formatMoney,
  onAcceptedPctChange,
  onReasonChange,
}: ProgressClaimAcceptSheetProps) => {
  const { t } = useTranslation();
  const itemLabels = useMemo(() => buildItemLabels(claimedRows), [claimedRows]);
  const acceptedById = useMemo(
    () => new Map(acceptedRows.map((row) => [row.id, row])),
    [acceptedRows],
  );
  const claimedTotals = useMemo(() => getLineTotals(claimedRows), [claimedRows]);
  const acceptedTotals = useMemo(() => getLineTotals(acceptedRows), [acceptedRows]);
  const qty = t("common.qty");
  const amount = t("common.amount");
  const subHeaders = [qty, t("common.rate"), amount, qty, amount, qty, amount, qty, amount];

  const totalCell = (value: number) => (
    <TableCell align="right">
      <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ whiteSpace: "nowrap" }}>
        {formatMoney(value)}
      </Typography>
    </TableCell>
  );

  return (
    <TableContainer
      component={Paper}
      sx={{ border: "1px solid", borderColor: "divider", boxShadow: "none" }}
    >
      <Table size="small" sx={{ tableLayout: "fixed", minWidth: MIN_WIDTH }}>
        <colgroup>
          {COLUMN_WIDTHS.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <TableHead>
          <TableRow sx={LINE_TABLE_GROUP_HEADER_SX}>
            <TableCell rowSpan={2}>{t("common.item")}</TableCell>
            <TableCell rowSpan={2}>{t("schedule.scheduleName")}</TableCell>
            <TableCell rowSpan={2}>{t("common.unit")}</TableCell>
            <TableCell colSpan={3} align="center">{t("progressClaim.table.totalValue")}</TableCell>
            <TableCell colSpan={2} align="center">{t("common.previous")}</TableCell>
            <TableCell colSpan={2} align="center">{t("progressClaim.table.current")}</TableCell>
            <TableCell colSpan={2} align="center">{t("progressClaim.table.accepted")}</TableCell>
            <TableCell rowSpan={2} className="hide-in-pdf">
              {t("progressClaimExternal.varianceReason")}
            </TableCell>
          </TableRow>
          <TableRow sx={LINE_TABLE_SUB_HEADER_SX}>
            {subHeaders.map((label, index) => (
              <TableCell key={index} align="center">
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {claimedRows.map((row) => (
            <ProgressClaimAcceptSheetRow
              key={row.id}
              claimedRow={row}
              acceptedRow={acceptedById.get(row.id) ?? row}
              itemLabel={itemLabels.get(row.id)}
              readOnly={readOnly}
              reason={reasonByScheduleId[row.scheduleId] ?? ""}
              showReasonError={submitAttempted}
              formatMoney={formatMoney}
              onAcceptedPctChange={onAcceptedPctChange}
              onReasonChange={onReasonChange}
            />
          ))}
        </TableBody>
        <TableFooter>
          <TableRow sx={[LINE_TABLE_CELL_SX, { bgcolor: "primary.light" }]}>
            <TableCell colSpan={3} align="right">
              <Typography variant="body2" fontWeight={500} color="text.primary">
                {t("common.total")}
              </Typography>
            </TableCell>
            <TableCell colSpan={2} />
            {totalCell(claimedTotals.totalAmount)}
            <TableCell />
            {totalCell(claimedTotals.previousAmount)}
            <TableCell />
            {totalCell(claimedTotals.currentAmount)}
            <TableCell />
            {totalCell(acceptedTotals.currentAmount)}
            <TableCell className="hide-in-pdf" />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
};

export default ProgressClaimAcceptSheet;
