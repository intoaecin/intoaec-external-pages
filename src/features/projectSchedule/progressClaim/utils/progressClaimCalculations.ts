import { roundNumber } from "@/utils/numbers";

/**
 * This-period amount = (current claim % − previous accepted %) × claim value.
 * The client's acceptance, not the last claimed %, is always the baseline for the next claim.
 */
export const calculatePeriodAmount = (
  claimPct: number,
  previousAcceptedPct: number,
  claimValue: number,
): number => roundNumber(((claimPct - previousAcceptedPct) / 100) * claimValue);

export const calculateCumulativeAmount = (
  claimPct: number,
  claimValue: number,
): number => roundNumber((claimPct / 100) * claimValue);

/**
 * A parent row's percentage is value-weighted across its children, never a
 * simple average — a $1 line item at 100% shouldn't move the needle as much
 * as a $1M line item at 10%.
 */
export const calculateWeightedPct = (
  children: Array<{ claimValue: number; pct: number }>,
): number => {
  const totalValue = children.reduce((sum, child) => sum + child.claimValue, 0);
  if (totalValue <= 0) return 0;

  const weightedValue = children.reduce(
    (sum, child) => sum + child.claimValue * (child.pct / 100),
    0,
  );

  return roundNumber((weightedValue / totalValue) * 100);
};

export const calculateWeightedSchedulePct = (
  children: Array<{ claimValue: number; scheduleSuggestedPct: number }>,
): number =>
  calculateWeightedPct(
    children.map((child) => ({ claimValue: child.claimValue, pct: child.scheduleSuggestedPct })),
  );

export const clampClaimPct = (
  value: number,
  previousAcceptedPct: number,
  maxPct: number = 100,
): number => Math.min(maxPct, Math.max(previousAcceptedPct, value));
