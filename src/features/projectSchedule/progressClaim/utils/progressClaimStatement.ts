import { roundNumber } from "@/utils/numbers";
import type { ProgressClaimLine, ProgressClaimTotals } from "../types";
import { calculateCumulativeAmount } from "./progressClaimCalculations";

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

// Group amounts already count only selected lines; a childless row must be
// selected to be part of the claim at all.
const getCumulativeAmount = (row: ProgressClaimLine): number =>
  row.isGroup || row.selected
    ? calculateCumulativeAmount(row.claimPct === "" ? 0 : row.claimPct, row.claimValue)
    : 0;

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
