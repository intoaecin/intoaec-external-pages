import { roundNumber } from "@/utils/numbers";

/**
 * What earlier claims actually had accepted for a line. A line's value can
 * change between claims, so the tracked amount wins; only claims saved before
 * it was tracked fall back to previous accepted % × claim value.
 */
export const calculatePreviousAcceptedAmount = (
  previousAcceptedPct: number,
  claimValue: number,
  trackedAmount?: number | string | null,
): number =>
  trackedAmount === null || trackedAmount === undefined
    ? roundNumber((previousAcceptedPct / 100) * claimValue)
    : roundNumber(Number(trackedAmount) || 0);

/**
 * This-period amount = value earned to date − amount already accepted.
 * The client's acceptance, not the last claimed %, is always the baseline for the next claim.
 */
export const calculatePeriodAmount = (
  claimPct: number,
  claimValue: number,
  previousAcceptedAmount: number,
): number => roundNumber((claimPct / 100) * claimValue - previousAcceptedAmount);

/**
 * A parent row's percentage is value-weighted across its children, never a
 * simple average — a $1 line item at 100% shouldn't move the needle as much
 * as a $1M line item at 10%. When none of the children carry a value there is
 * nothing to weight by, so they count equally.
 */
export const calculateWeightedPct = (
  children: Array<{ claimValue: number; pct: number }>,
): number => {
  if (children.length === 0) return 0;

  const totalValue = children.reduce((sum, child) => sum + child.claimValue, 0);
  if (totalValue <= 0) {
    return roundNumber(children.reduce((sum, child) => sum + child.pct, 0) / children.length);
  }

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
