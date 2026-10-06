import { Box, TableCell, TableRow, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { NumberInputBox } from "@/components_v2/NumberInputBox";
import type { NumberInputBoxValue } from "@/components_v2/NumberInputBox";
import { TruncatedText } from "@/components_v2/TruncatedText";
import type { ProgressClaimLine } from "../types";
import {
  currentInputToClaimPct,
  getCurrentInputValue,
  getLineFigures,
  formatLineQuantity,
  getLineQuantity,
  isLumpSum,
} from "../utils/progressClaimLineFigures";
import LineAttachmentsButton from "../components/LineAttachmentsButton";
import { LINE_TABLE_CELL_SX } from "../components/progressClaimLineTableStyles";

interface ProgressClaimAcceptSheetRowProps {
  /** The line as claimed. */
  claimedRow: ProgressClaimLine;
  /** The same line at the % the client is accepting. */
  acceptedRow: ProgressClaimLine;
  itemLabel?: string;
  readOnly: boolean;
  reason: string;
  showReasonError: boolean;
  attachmentCount: number;
  onViewAttachments: (row: ProgressClaimLine) => void;
  formatMoney: (amount: number) => string;
  onAcceptedPctChange: (scheduleId: string, pct: NumberInputBoxValue) => void;
  onReasonChange: (scheduleId: string, reason: string) => void;
}

const INDENT_PER_DEPTH_PX = 16;

const ProgressClaimAcceptSheetRow = ({
  claimedRow,
  acceptedRow,
  itemLabel,
  readOnly,
  reason,
  showReasonError,
  attachmentCount,
  onViewAttachments,
  formatMoney,
  onAcceptedPctChange,
  onReasonChange,
}: ProgressClaimAcceptSheetRowProps) => {
  const { t } = useTranslation();
  const claimed = getLineFigures(claimedRow);
  const accepted = getLineFigures(acceptedRow);
  const isGroup = claimedRow.isGroup;
  const fontWeight = isGroup ? 500 : undefined;
  const unit = claimedRow.unit ?? (isLumpSum(claimedRow) ? t("progressClaim.table.lumpSumUnit") : "");
  const formatQty = (qty: number | null) => formatLineQuantity(qty, unit);
  // Compare the cumulative % (same as the accept check), not amounts — a zero-value
  // line would otherwise never ask for the reason the accept check requires.
  const isBelowClaimed =
    !isGroup && Number(acceptedRow.claimPct || 0) < Number(claimedRow.claimPct || 0);

  const text = (value: string, align: "left" | "right" = "right") => (
    <TableCell align={align}>
      <Typography variant="body2" fontWeight={fontWeight} sx={{ whiteSpace: "nowrap" }}>
        {value}
      </Typography>
    </TableCell>
  );

  const renderReason = () => {
    if (isGroup) return null;
    if (readOnly) return <Typography variant="body2">{reason || "—"}</Typography>;
    if (!isBelowClaimed) return <Typography variant="body2">—</Typography>;
    const hasError = showReasonError && !reason.trim();
    return (
      <TextField
        size="small"
        fullWidth
        value={reason}
        onChange={(event) => onReasonChange(claimedRow.scheduleId, event.target.value)}
        placeholder={t("progressClaimExternal.varianceReasonPlaceholder")}
        error={hasError}
        helperText={hasError ? t("common.requiredField") : undefined}
      />
    );
  };

  return (
    <TableRow sx={[LINE_TABLE_CELL_SX, isGroup ? { bgcolor: "grey.50" } : {}]}>
      {text(itemLabel ?? "", "left")}
      <TableCell>
        <Box sx={{ pl: `${claimedRow.depth * INDENT_PER_DEPTH_PX}px`, fontWeight }}>
          <TruncatedText text={claimedRow.name} limit={40} />
        </Box>
      </TableCell>

      {text(formatQty(getLineQuantity(claimedRow)))}
      {text(claimed.rate === null ? "" : formatMoney(claimed.rate))}
      {text(formatMoney(claimedRow.claimValue))}

      {text(formatQty(claimed.previousQty))}
      {text(formatMoney(claimed.previousAmount))}

      {text(formatQty(claimed.currentQty))}
      {text(formatMoney(claimed.currentAmount))}

      {isGroup || readOnly ? (
        text(formatQty(accepted.currentQty))
      ) : (
        <TableCell>
          <NumberInputBox
            value={getCurrentInputValue(acceptedRow)}
            onChange={(value) =>
              onAcceptedPctChange(claimedRow.scheduleId, currentInputToClaimPct(acceptedRow, value))
            }
            max={claimed.currentQty ?? 0}
            maxFractionDigits={3}
            allowEmpty
            fullWidth
            endAdornment={unit ? <Typography variant="caption">{unit}</Typography> : undefined}
            aria-label={t("progressClaim.table.acceptedQtyAria", { name: claimedRow.name })}
          />
        </TableCell>
      )}
      {text(formatMoney(accepted.currentAmount))}

      <TableCell className="hide-in-pdf">{renderReason()}</TableCell>
      <TableCell padding="none" align="center" className="hide-in-pdf">
        {isGroup || attachmentCount === 0 ? null : (
          <LineAttachmentsButton
            count={attachmentCount}
            label={t("progressClaim.attachments.lineButtonAria", { name: claimedRow.name })}
            onClick={() => onViewAttachments(claimedRow)}
          />
        )}
      </TableCell>
    </TableRow>
  );
};

export default ProgressClaimAcceptSheetRow;
