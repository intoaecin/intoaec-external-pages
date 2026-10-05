import dayjs from "dayjs";
import type { ProgressClaim, ProgressClaimDetailsInput } from "../hooks/api/create-progress-claim";
import type { ProgressClaimPeriod } from "../types";

/** The claim period when both ends are set; otherwise null (no filtering). */
export const toClaimPeriod = (
  periodFrom?: number | string | null,
  periodTo?: number | string | null,
): ProgressClaimPeriod | null =>
  periodFrom && periodTo ? { from: Number(periodFrom), to: Number(periodTo) } : null;

type ClaimForPeriod = Pick<ProgressClaim, "status" | "submittedAt" | "periodTo">;

/**
 * A new claim picks up where the last one left off: the day after the previous
 * claim's period ended (or the day it was submitted, if it had no period),
 * through today. Claims arrive newest first; cancelled ones don't count.
 */
export const getDefaultClaimPeriod = (
  claims: ClaimForPeriod[],
): ProgressClaimDetailsInput | null => {
  const previousClaim = claims.find((claim) => claim.status !== "CANCELLED");
  if (!previousClaim) return null;

  const today = dayjs().startOf("day");
  const from = previousClaim.periodTo
    ? dayjs(Number(previousClaim.periodTo)).add(1, "day").startOf("day")
    : dayjs(Number(previousClaim.submittedAt)).startOf("day");

  return {
    periodFrom: (from.isAfter(today) ? today : from).valueOf(),
    periodTo: today.valueOf(),
  };
};
