import dayjs from "dayjs";
import type { ProgressClaim, ProgressClaimDetailsInput } from "../hooks/api/create-progress-claim";
import type { Schedule } from "../../types/schedule";
import type { ProgressClaimPeriod } from "../types";

/** The claim period when both ends are set; otherwise null (no filtering). */
export const toClaimPeriod = (
  periodFrom?: number | string | null,
  periodTo?: number | string | null,
): ProgressClaimPeriod | null =>
  periodFrom && periodTo ? { from: Number(periodFrom), to: Number(periodTo) } : null;

/**
 * The instants a claim period spans. Both ends are saved as the start of
 * their day in the organization's timezone, so the last day runs for a full
 * day from `to`. Re-deriving day edges here would use the viewer's timezone
 * and can cut a one-day period short of the schedules on that day.
 */
export const getClaimPeriodBounds = (period: ProgressClaimPeriod) => ({
  start: dayjs(period.from),
  end: dayjs(period.to).add(1, "day").subtract(1, "millisecond"),
});

/** Whether a schedule runs on any day of the claim period; no period means no filtering. */
export const isScheduleInClaimPeriod = (
  schedule: Pick<Schedule, "scheduleStartDate" | "scheduleEndDate">,
  period?: ProgressClaimPeriod | null,
): boolean => {
  if (!period) return true;
  const { start, end } = getClaimPeriodBounds(period);

  return (
    !dayjs(schedule.scheduleStartDate).isAfter(end) &&
    !dayjs(schedule.scheduleEndDate).isBefore(start)
  );
};

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
