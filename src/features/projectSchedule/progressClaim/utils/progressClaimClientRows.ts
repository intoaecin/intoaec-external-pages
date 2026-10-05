import { roundNumber } from "@/utils/numbers";
import type { Schedule } from "../../types/schedule";
import {
  buildHierarchicalScheduleList,
  getAllDescendants,
  getScheduleDepth,
} from "../../helpers/scheduleHierarchy";
import type { ProgressClaim } from "../hooks/api/create-progress-claim";
import type { ProgressClaimLine, ProgressClaimTotals } from "../types";
import { calculatePeriodAmount, calculateWeightedPct } from "./progressClaimCalculations";

type ClaimLine = ProgressClaim["lines"][number];

interface LeafFigures {
  claimValue: number;
  previousAcceptedPct: number;
  claimPct: number;
  periodAmount: number;
}

const toLeafFigures = (line: ClaimLine, claimPct: number): LeafFigures => {
  const claimValue = Number(line.claimValueSnapshot) || 0;
  const previousAcceptedPct = Number(line.previousAcceptedPct) || 0;
  return {
    claimValue,
    previousAcceptedPct,
    claimPct,
    periodAmount: calculatePeriodAmount(claimPct, previousAcceptedPct, claimValue),
  };
};

const collectAncestorIds = (scheduleId: string, scheduleById: Map<string, Schedule>) => {
  const ids: string[] = [];
  let parentId = scheduleById.get(scheduleId)?.parentId;
  while (parentId && scheduleById.has(parentId)) {
    ids.push(parentId);
    parentId = scheduleById.get(parentId)?.parentId;
  }
  return ids;
};

/**
 * Rows for a saved claim, shaped like the claim form's rows: only the claim's
 * own lines (from their snapshots) plus the phases/groups that contain them.
 * `claimPctByScheduleId` overrides a line's cumulative % — e.g. what the
 * client is accepting instead of what was claimed.
 */
export const buildClaimRows = (
  schedules: Schedule[],
  lines: ClaimLine[],
  claimPctByScheduleId: Map<string, number> = new Map(),
): ProgressClaimLine[] => {
  const scheduleById = new Map(schedules.map((schedule) => [schedule.scheduleId, schedule]));
  const leafById = new Map(
    lines.map((line) => [
      line.scheduleId,
      toLeafFigures(
        line,
        claimPctByScheduleId.get(line.scheduleId) ?? (Number(line.claimedCumulativePct) || 0),
      ),
    ]),
  );
  const visibleIds = new Set(lines.flatMap((line) => [
    line.scheduleId,
    ...collectAncestorIds(line.scheduleId, scheduleById),
  ]));

  const toLeafRow = (line: ClaimLine, schedule?: Schedule): ProgressClaimLine => {
    const leaf = leafById.get(line.scheduleId)!;
    return {
      id: line.scheduleId,
      scheduleId: line.scheduleId,
      parentId: schedule?.parentId ?? null,
      name: schedule?.scheduleName ?? line.descriptionSnapshot,
      depth: schedule ? getScheduleDepth(line.scheduleId, schedules) : 0,
      isGroup: false,
      claimValue: leaf.claimValue,
      plannedQuantity: Number(schedule?.plannedQuantity) || null,
      unit: schedule?.quantityUnit ?? null,
      previousAcceptedPct: leaf.previousAcceptedPct,
      scheduleSuggestedPct: Number(line.scheduleSuggestedPct) || 0,
      claimPct: leaf.claimPct,
      periodAmount: leaf.periodAmount,
      selected: true,
    };
  };

  const toGroupRow = (schedule: Schedule): ProgressClaimLine => {
    const leaves = getAllDescendants(schedules, schedule.scheduleId)
      .map((id) => leafById.get(id))
      .filter((leaf): leaf is LeafFigures => Boolean(leaf));
    const weighted = (pctOf: (leaf: LeafFigures) => number) =>
      calculateWeightedPct(leaves.map((leaf) => ({ claimValue: leaf.claimValue, pct: pctOf(leaf) })));

    return {
      id: schedule.scheduleId,
      scheduleId: schedule.scheduleId,
      parentId: schedule.parentId ?? null,
      name: schedule.scheduleName,
      depth: getScheduleDepth(schedule.scheduleId, schedules),
      isGroup: true,
      claimValue: roundNumber(leaves.reduce((sum, leaf) => sum + leaf.claimValue, 0)),
      plannedQuantity: null,
      unit: null,
      previousAcceptedPct: weighted((leaf) => leaf.previousAcceptedPct),
      scheduleSuggestedPct: 0,
      claimPct: weighted((leaf) => leaf.claimPct),
      periodAmount: roundNumber(leaves.reduce((sum, leaf) => sum + leaf.periodAmount, 0)),
      selected: false,
    };
  };

  const lineByScheduleId = new Map(lines.map((line) => [line.scheduleId, line]));
  const hierarchyRows = buildHierarchicalScheduleList(schedules)
    .filter((schedule) => visibleIds.has(schedule.scheduleId))
    .map((schedule) => {
      const line = lineByScheduleId.get(schedule.scheduleId);
      return line ? toLeafRow(line, schedule) : toGroupRow(schedule);
    });

  // A line whose schedule has since been deleted still belongs to the claim.
  const orphanRows = lines
    .filter((line) => !scheduleById.has(line.scheduleId))
    .map((line) => toLeafRow(line));

  return [...hierarchyRows, ...orphanRows];
};

/** Claim-wide totals over the leaf lines, in the shape the statement expects. */
export const getClaimRowTotals = (rows: ProgressClaimLine[]): ProgressClaimTotals => {
  const leaves = rows.filter((row) => !row.isGroup);
  return {
    claimValue: roundNumber(leaves.reduce((sum, row) => sum + row.claimValue, 0)),
    previousAcceptedAmount: roundNumber(
      leaves.reduce((sum, row) => sum + (row.previousAcceptedPct / 100) * row.claimValue, 0),
    ),
    periodAmount: roundNumber(leaves.reduce((sum, row) => sum + row.periodAmount, 0)),
  };
};
