import { useCallback, useMemo, useState } from "react";
import type { NumberInputBoxValue } from "@/components_v2/NumberInputBox";
import type { ProgressClaim } from "../hooks/api/create-progress-claim";
import { useFetchClaimSchedules } from "../hooks/api/fetch-claim-schedules";
import { buildClaimRows, getClaimRowTotals } from "../utils/progressClaimClientRows";
import { getProgressClaimPhases, getSummaryRows } from "../utils/progressClaimPhases";
import {
  buildProgressClaimStatement,
  resolveRetentionPct,
} from "../utils/progressClaimStatement";

type ClaimLine = ProgressClaim["lines"][number];

/**
 * The client's side of a claim: what they're accepting per line (and why, when
 * it's less than claimed), plus the claimed/accepted rows and the statement.
 * Read-only viewers (the internal preview) just see the claimed/saved figures.
 * `withAuth` is false on the client's page, which has no session.
 */
export const useProgressClaimAcceptance = (claim: ProgressClaim, withAuth: boolean = false) => {
  const { schedules, loading } = useFetchClaimSchedules({
    organizationId: claim.organizationId,
    organizationType: claim.organizationType,
    projectId: claim.projectId,
    withAuth,
  });
  const [acceptedPctInputs, setAcceptedPctInputs] = useState<Record<string, NumberInputBoxValue>>({});
  const [reasonInputs, setReasonInputs] = useState<Record<string, string>>({});

  const isAccepted = claim.status === "ACCEPTED";
  const isDecided = isAccepted || claim.status === "REJECTED";

  // Cumulative % the client accepts per line: the saved decision once made,
  // otherwise their input (cleared = nothing accepted this period), else as claimed.
  const acceptedPctByScheduleId = useMemo(() => {
    const acceptedPct = (line: ClaimLine) => {
      const claimed = Number(line.claimedCumulativePct) || 0;
      if (isAccepted) return Number(line.acceptedCumulativePct ?? claimed) || 0;
      const input = acceptedPctInputs[line.scheduleId];
      if (input === "") return Number(line.previousAcceptedPct) || 0;
      return input ?? claimed;
    };
    return new Map(claim.lines.map((line) => [line.scheduleId, acceptedPct(line)]));
  }, [acceptedPctInputs, claim.lines, isAccepted]);

  const reasonByScheduleId = useMemo(
    () =>
      isDecided
        ? Object.fromEntries(claim.lines.map((line) => [line.scheduleId, line.varianceReason ?? ""]))
        : reasonInputs,
    [claim.lines, isDecided, reasonInputs],
  );

  const claimedRows = useMemo(() => buildClaimRows(schedules, claim.lines), [schedules, claim.lines]);
  const acceptedRows = useMemo(
    () => buildClaimRows(schedules, claim.lines, acceptedPctByScheduleId),
    [schedules, claim.lines, acceptedPctByScheduleId],
  );
  const phases = useMemo(() => getProgressClaimPhases(claimedRows), [claimedRows]);

  const retentionPct = resolveRetentionPct(claim.retentionPct);
  // The client sees what they'd actually pay: the statement follows the accepted amounts.
  const statement = useMemo(
    () =>
      buildProgressClaimStatement(
        getSummaryRows(acceptedRows),
        getClaimRowTotals(acceptedRows),
        retentionPct,
        (claim.coLines ?? []).map((co) => ({
          id: co.changeOrderId,
          name: co.name,
          amount: Number(co.claimedAmount) || 0,
        })),
      ),
    [acceptedRows, retentionPct, claim.coLines],
  );

  const isBelowClaimed = (line: ClaimLine) =>
    (acceptedPctByScheduleId.get(line.scheduleId) ?? 0) < (Number(line.claimedCumulativePct) || 0);

  const hasMissingReasons = claim.lines.some(
    (line) => isBelowClaimed(line) && !reasonByScheduleId[line.scheduleId]?.trim(),
  );

  const buildLinesPayload = () =>
    claim.lines.map((line) => ({
      progressClaimLineId: line.id,
      acceptedCumulativePct: acceptedPctByScheduleId.get(line.scheduleId) ?? 0,
      varianceReason: isBelowClaimed(line) ? reasonByScheduleId[line.scheduleId]?.trim() : undefined,
    }));

  const updateAcceptedPct = useCallback((scheduleId: string, pct: NumberInputBoxValue) => {
    setAcceptedPctInputs((prev) => ({ ...prev, [scheduleId]: pct }));
  }, []);

  const updateReason = useCallback((scheduleId: string, reason: string) => {
    setReasonInputs((prev) => ({ ...prev, [scheduleId]: reason }));
  }, []);

  return {
    loading,
    isDecided,
    claimedRows,
    acceptedRows,
    phases,
    retentionPct,
    statement,
    coLines: claim.coLines ?? [],
    reasonByScheduleId,
    hasMissingReasons,
    buildLinesPayload,
    updateAcceptedPct,
    updateReason,
  };
};
