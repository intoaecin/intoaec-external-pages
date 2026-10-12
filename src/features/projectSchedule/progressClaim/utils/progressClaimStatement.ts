import { roundNumber } from "@/utils/numbers";
import type { ProgressClaimLine, ProgressClaimTotals } from "../types";

export interface ProgressClaimStatementLine {
  id: string;
  name: string;
  amount: number;
}

/**
 * A resolved variation order entry ready for the statement.
 * The caller decides which amount to pass (full variationAmount or
 * the user's this-period claim from the CO tab).
 */
export interface VariationOrderStatementInput {
  id: string;
  name: string;
  amount: number;
}

/**
 * Cumulative claim statement, laid out like a traditional progress claim
 * sheet: work done to date, less retention, less what was accepted before,
 * leaves the amount payable for this claim.
 */
export interface ProgressClaimStatement {
  workDoneLines: ProgressClaimStatementLine[];
  workDoneTotal: number;
  variationOrderLines: ProgressClaimStatementLine[];
  variationOrderTotal: number;
  total: number;
  retentionAmount: number;
  netOfRetention: number;
  previousAcceptedNet: number;
  thisPeriodNet: number;
}

/** The project's retention is always a percentage; anything unusable means none. */
export const resolveRetentionPct = (retentionValue?: number | string | null): number => {
  const pct = Number(retentionValue);
  return Number.isFinite(pct) && pct > 0 && pct <= 100 ? pct : 0;
};

// Work done to date is what was accepted before plus what this claim adds, so
// a row with nothing new this period still shows its earlier accepted work.
const getCumulativeAmount = (row: ProgressClaimLine): number =>
  roundNumber(row.previousAcceptedAmount + row.periodAmount);

export const buildProgressClaimStatement = (
  summaryRows: ProgressClaimLine[],
  totals: ProgressClaimTotals,
  retentionPct: number,
  variationOrders: VariationOrderStatementInput[] = [],
): ProgressClaimStatement => {
  const workDoneLines = summaryRows.map((row) => ({
    id: row.id,
    name: row.name,
    amount: getCumulativeAmount(row),
  }));
  const workDoneTotal = roundNumber(workDoneLines.reduce((sum, line) => sum + line.amount, 0));

  const variationOrderLines: ProgressClaimStatementLine[] = variationOrders.map((vo) => ({
    id: vo.id,
    name: vo.name,
    amount: vo.amount,
  }));
  const variationOrderTotal = roundNumber(
    variationOrderLines.reduce((sum, line) => sum + line.amount, 0),
  );

  const total = roundNumber(workDoneTotal + variationOrderTotal);
  const retentionAmount = roundNumber((total * retentionPct) / 100);
  const netOfRetention = roundNumber(total - retentionAmount);
  // Earlier claims were paid net of retention too, so that's what gets deducted.
  const previousAcceptedNet = roundNumber(
    totals.previousAcceptedAmount * (1 - retentionPct / 100),
  );

  return {
    workDoneLines,
    workDoneTotal,
    variationOrderLines,
    variationOrderTotal,
    total,
    retentionAmount,
    netOfRetention,
    previousAcceptedNet,
    thisPeriodNet: roundNumber(netOfRetention - previousAcceptedNet),
  };
};
