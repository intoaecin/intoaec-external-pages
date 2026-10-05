import {
  Checkbox,
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
import { NumberInputBox } from "@/components_v2/NumberInputBox";
import { roundNumber } from "@/utils/numbers";
import type { ChangeOrderClaimLine } from "../hooks/useChangeOrderClaimDraft";
import {
  LINE_TABLE_CELL_SX,
  LINE_TABLE_GROUP_HEADER_SX,
  LINE_TABLE_SUB_HEADER_SX,
} from "./progressClaimLineTableStyles";

interface ProgressClaimChangeOrderTableProps {
  lines: ChangeOrderClaimLine[];
  allSelected?: boolean;
  someSelected?: boolean;
  readOnly?: boolean;
  formatMoney: (amount: number) => string;
  onAmountChange?: (changeOrderId: string, amount: number | "") => void;
  onToggleSelection?: (changeOrderId: string, selected: boolean) => void;
  onToggleAllSelection?: (selected: boolean) => void;
}

const EDITABLE_CO_COL_WIDTHS = [48, 56, 300, 160, 160, 160, 160];
const READONLY_CO_COL_WIDTHS = [56, 300, 160, 160, 160, 160];

const cell = (value: string, fontWeight?: number) => (
  <TableCell align="right">
    <Typography variant="body2" fontWeight={fontWeight} sx={{ whiteSpace: "nowrap" }}>
      {value}
    </Typography>
  </TableCell>
);

/**
 * The Change Order tab — lets the user enter a "This Period" amount for each
 * accepted variation order, mirroring the General tab's schedule line table.
 */
const ProgressClaimChangeOrderTable = ({
  lines,
  allSelected = false,
  someSelected = false,
  readOnly = false,
  formatMoney,
  onAmountChange,
  onToggleSelection,
  onToggleAllSelection,
}: ProgressClaimChangeOrderTableProps) => {
  const { t } = useTranslation();
  const colWidths = readOnly ? READONLY_CO_COL_WIDTHS : EDITABLE_CO_COL_WIDTHS;
  const tableMinWidth = colWidths.reduce((s, w) => s + w, 0);

  const totals = lines
    .filter((l) => l.selected)
    .reduce(
      (acc, l) => ({
        variationAmount: roundNumber(acc.variationAmount + l.variationAmount),
        previous: roundNumber(acc.previous + l.previousClaimedAmount),
        thisPeriod: roundNumber(
          acc.thisPeriod + (l.claimedThisPeriod === "" ? 0 : l.claimedThisPeriod),
        ),
        toDate: roundNumber(acc.toDate + l.totalToDateAmount),
      }),
      { variationAmount: 0, previous: 0, thisPeriod: 0, toDate: 0 },
    );

  const totalCell = (amount: number) => (
    <TableCell align="right">
      <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ whiteSpace: "nowrap" }}>
        {formatMoney(amount)}
      </Typography>
    </TableCell>
  );

  return (
    <TableContainer
      component={Paper}
      sx={{ border: "1px solid", borderColor: "divider", boxShadow: "none" }}
    >
      <Table size="small" sx={{ tableLayout: "fixed", minWidth: tableMinWidth }}>
        <colgroup>
          {colWidths.map((w, i) => (
            <col key={i} style={{ width: w }} />
          ))}
        </colgroup>

        {/* Header */}
        <TableHead>
          <TableRow sx={LINE_TABLE_GROUP_HEADER_SX}>
            {!readOnly && (
              <TableCell rowSpan={2} padding="none" align="center">
                <Checkbox
                  size="small"
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  disabled={lines.length === 0}
                  onChange={(e) => onToggleAllSelection?.(e.target.checked)}
                  inputProps={{ "aria-label": t("common.selectAll") }}
                  sx={{
                    color: "common.white",
                    "& .MuiSvgIcon-root": { color: "common.white" },
                    "&.Mui-disabled": { opacity: 0.5 },
                  }}
                />
              </TableCell>
            )}
            <TableCell rowSpan={2}>{t("common.item")}</TableCell>
            <TableCell rowSpan={2}>
              {t("progressClaim.statement.variationOrder", { defaultValue: "Variation Order" })}
            </TableCell>
            <TableCell align="center">
              {t("progressClaim.table.totalValue", { defaultValue: "Total Value" })}
            </TableCell>
            <TableCell align="center">
              {t("common.previous", { defaultValue: "Previous" })}
            </TableCell>
            <TableCell align="center">
              {t("progressClaim.table.current", { defaultValue: "Current" })}
            </TableCell>
            <TableCell align="center">
              {t("progressClaim.table.totalToDate", { defaultValue: "Total up to Date" })}
            </TableCell>
          </TableRow>
          <TableRow sx={LINE_TABLE_SUB_HEADER_SX}>
            {[
              t("common.amount"),
              t("common.amount"),
              t("common.amount"),
              t("common.amount"),
            ].map((label, i) => (
              <TableCell key={i} align="center">
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        {/* Body */}
        <TableBody>
          {lines.map((line, index) => {
            const remaining = roundNumber(line.variationAmount - line.previousClaimedAmount);
            return (
              <TableRow
                key={line.changeOrderId}
                sx={{
                  ...LINE_TABLE_CELL_SX,
                  opacity: line.selected ? 1 : 0.5,
                }}
              >
                {/* Select */}
                {!readOnly && (
                  <TableCell padding="none" align="center">
                    <Checkbox
                      size="small"
                      checked={line.selected}
                      onChange={(e) => onToggleSelection?.(line.changeOrderId, e.target.checked)}
                      inputProps={{
                        "aria-label": t("progressClaim.selectLineAria", { name: line.name }),
                      }}
                    />
                  </TableCell>
                )}

                {/* Item # */}
                {cell(String(index + 1), undefined)}

                {/* Name */}
                <TableCell>
                  <Typography variant="body2" sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                    {line.name}
                  </Typography>
                </TableCell>

                {/* Total variation value */}
                {cell(formatMoney(line.variationAmount))}

                {/* Previous */}
                {cell(formatMoney(line.previousClaimedAmount))}

                {/* This period */}
                {readOnly ? (
                  cell(formatMoney(line.claimedThisPeriod === "" ? 0 : line.claimedThisPeriod))
                ) : (
                  <TableCell>
                    <NumberInputBox
                      value={line.claimedThisPeriod}
                      onChange={(val) => onAmountChange?.(line.changeOrderId, val as number | "")}
                      max={remaining < 0 ? 0 : remaining}
                      maxFractionDigits={2}
                      allowEmpty
                      fullWidth
                      aria-label={t("progressClaim.table.currentQtyAria", { name: line.name })}
                    />
                  </TableCell>
                )}

                {/* Total to date */}
                {cell(formatMoney(line.totalToDateAmount))}
              </TableRow>
            );
          })}
        </TableBody>

        {/* Footer totals */}
        <TableFooter>
          <TableRow
            sx={{
              ...LINE_TABLE_CELL_SX,
              bgcolor: "primary.light",
            }}
          >
            <TableCell colSpan={readOnly ? 2 : 3} align="right">
              <Typography variant="body2" fontWeight={500} color="text.primary">
                {t("common.total")}
              </Typography>
            </TableCell>
            {totalCell(totals.variationAmount)}
            {totalCell(totals.previous)}
            {totalCell(totals.thisPeriod)}
            {totalCell(totals.toDate)}
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
};

export default ProgressClaimChangeOrderTable;
