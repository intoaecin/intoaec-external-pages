import { roundNumber } from "@/utils/numbers";
import type { NumberInputBoxValue } from "@/components_v2/NumberInputBox";
import type { ProgressClaimLine } from "../types";

const QTY_PRECISION = 3;
// Enough precision that a quantity typed with 3 decimals round-trips exactly.
const PCT_PRECISION = 6;

export interface ProgressClaimLineFigures {
  rate: number | null;
  previousQty: number | null;
  previousPct: number;
  previousAmount: number;
  currentQty: number | null;
  currentPct: number;
  currentAmount: number;
  toDateQty: number | null;
  toDatePct: number;
  toDateAmount: number;
}

const pctOf = (pct: number, total: number) => (pct / 100) * total;

/** A line with no planned quantity is a lump sum: one unit, claimed in fractions of it. */
export const LUMP_SUM_QUANTITY = 1;

export const isLumpSum = (line: ProgressClaimLine) => !line.isGroup && line.plannedQuantity === null;

/** The quantity a line is claimed against; null for group rows, which have no quantity. */
export const getLineQuantity = (line: ProgressClaimLine): number | null =>
  line.isGroup ? null : (line.plannedQuantity ?? LUMP_SUM_QUANTITY);

/** A quantity with its unit ("120 m²"); blank for group rows, which have no quantity. */
export const formatLineQuantity = (qty: number | null, unit?: string | null): string =>
  qty === null
    ? ""
    : [qty.toLocaleString(undefined, { maximumFractionDigits: 3 }), unit].filter(Boolean).join(" ");

/** A progress percentage as shown beside a quantity ("12.5%"). */
export const formatLinePct = (pct: number): string => `${roundNumber(pct, 2)}%`;

const toQty = (pct: number, quantity: number | null) =>
  quantity ? roundNumber(pctOf(pct, quantity), QTY_PRECISION) : null;

const numericClaimPct = (line: ProgressClaimLine) =>
  line.claimPct === "" ? line.previousAcceptedPct : line.claimPct;

/** Quantity and amount figures for one line, derived from its cumulative claim %. */
export const getLineFigures = (line: ProgressClaimLine): ProgressClaimLineFigures => {
  const claimPct = numericClaimPct(line);
  const currentPct = claimPct - line.previousAcceptedPct;
  const quantity = getLineQuantity(line);

  return {
    rate: quantity ? roundNumber(line.claimValue / quantity) : null,
    previousQty: toQty(line.previousAcceptedPct, quantity),
    previousPct: line.previousAcceptedPct,
    previousAmount: roundNumber(pctOf(line.previousAcceptedPct, line.claimValue)),
    currentQty: toQty(currentPct, quantity),
    currentPct,
    currentAmount: line.periodAmount,
    toDateQty: toQty(claimPct, quantity),
    toDatePct: claimPct,
    toDateAmount: roundNumber(pctOf(claimPct, line.claimValue)),
  };
};

/** What the "Current" Qty input shows: this period's quantity. */
export const getCurrentInputValue = (line: ProgressClaimLine): NumberInputBoxValue => {
  if (line.claimPct === "") return "";
  return toQty(line.claimPct - line.previousAcceptedPct, getLineQuantity(line)) ?? "";
};

/** The most the "Current" Qty input can take: whatever quantity is left to claim. */
export const getCurrentInputMax = (line: ProgressClaimLine): number =>
  toQty(100 - line.previousAcceptedPct, getLineQuantity(line)) ?? 0;

/** Converts a "Current" Qty back into the cumulative claim % the draft stores. */
export const currentInputToClaimPct = (
  line: ProgressClaimLine,
  value: NumberInputBoxValue,
): NumberInputBoxValue => {
  const quantity = getLineQuantity(line);
  if (value === "" || !quantity) return "";
  const currentPct = (value / quantity) * 100;
  return Math.min(100, roundNumber(line.previousAcceptedPct + currentPct, PCT_PRECISION));
};

const PCT_INPUT_PRECISION = 2;

/** What the "Current" % input shows: this period's share of the line. */
export const getCurrentPctInputValue = (line: ProgressClaimLine): NumberInputBoxValue =>
  line.claimPct === ""
    ? ""
    : roundNumber(line.claimPct - line.previousAcceptedPct, PCT_INPUT_PRECISION);

/** The most the "Current" % input can take, as it is displayed. */
export const getCurrentPctInputMax = (
  line: ProgressClaimLine,
  maxCurrentPct: number = 100 - line.previousAcceptedPct,
): number => roundNumber(maxCurrentPct, PCT_INPUT_PRECISION);

/**
 * Converts a "Current" % back into the cumulative claim % the draft stores.
 * Typing the displayed maximum means all of `maxCurrentPct`, which may carry
 * more decimals than the input shows.
 */
export const currentPctInputToClaimPct = (
  line: ProgressClaimLine,
  value: NumberInputBoxValue,
  maxCurrentPct: number = 100 - line.previousAcceptedPct,
): NumberInputBoxValue => {
  if (value === "") return "";
  const currentPct = value >= getCurrentPctInputMax(line, maxCurrentPct) ? maxCurrentPct : value;
  return Math.min(100, roundNumber(line.previousAcceptedPct + currentPct, PCT_PRECISION));
};

export interface ProgressClaimLineTotals {
  totalAmount: number;
  previousAmount: number;
  currentAmount: number;
  toDateAmount: number;
}

/** Footer totals: only lines checked into the claim count, like the group subtotals. */
export const getLineTotals = (rows: ProgressClaimLine[]): ProgressClaimLineTotals =>
  rows
    .filter((row) => !row.isGroup && row.selected)
    .reduce<ProgressClaimLineTotals>(
      (totals, row) => {
        const figures = getLineFigures(row);
        return {
          totalAmount: roundNumber(totals.totalAmount + row.claimValue),
          previousAmount: roundNumber(totals.previousAmount + figures.previousAmount),
          currentAmount: roundNumber(totals.currentAmount + figures.currentAmount),
          toDateAmount: roundNumber(totals.toDateAmount + figures.toDateAmount),
        };
      },
      { totalAmount: 0, previousAmount: 0, currentAmount: 0, toDateAmount: 0 },
    );

const toLetter = (index: number): string =>
  index < 26 ? String.fromCharCode(65 + index) : `${toLetter(Math.floor(index / 26) - 1)}${toLetter(index % 26)}`;

/**
 * Item numbers like a BoQ: top-level groups get letters (A, B, …), their lines
 * 1, 2, …, and deeper lines extend their parent's number (1.1, 1.2, …).
 */
export const buildItemLabels = (rows: ProgressClaimLine[]): Map<string, string> => {
  const labels = new Map<string, string>();
  const childCountByParent = new Map<string, number>();
  let topGroupCount = 0;
  let topLineCount = 0;

  rows.forEach((row) => {
    const parentLabel = row.parentId ? labels.get(row.parentId) : undefined;

    if (parentLabel === undefined) {
      labels.set(row.id, row.isGroup ? toLetter(topGroupCount++) : String(++topLineCount));
      return;
    }

    const position = (childCountByParent.get(row.parentId!) ?? 0) + 1;
    childCountByParent.set(row.parentId!, position);
    const parentIsLetter = /^[A-Z]+$/.test(parentLabel);
    labels.set(row.id, parentIsLetter ? String(position) : `${parentLabel}.${position}`);
  });

  return labels;
};
