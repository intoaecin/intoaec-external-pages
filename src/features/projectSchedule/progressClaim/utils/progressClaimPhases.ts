import type { ProgressClaimLine } from "../types";

export interface ProgressClaimPhase {
  id: string;
  name: string;
}

/** Tab id of the phase that collects every top-level schedule with no children. */
export const UNGROUPED_PHASE_ID = "UNGROUPED";

const isUngroupedRow = (row: ProgressClaimLine) => row.depth === 0 && !row.isGroup;

export const getProgressClaimPhases = (
  rows: ProgressClaimLine[],
  ungroupedName: string,
): ProgressClaimPhase[] => {
  const phases: ProgressClaimPhase[] = [];
  let hasUngroupedPhase = false;

  rows
    .filter((row) => row.depth === 0)
    .forEach((row) => {
      if (!isUngroupedRow(row)) {
        phases.push({ id: row.scheduleId, name: row.name });
        return;
      }
      if (hasUngroupedPhase) return;
      hasUngroupedPhase = true;
      phases.push({ id: UNGROUPED_PHASE_ID, name: ungroupedName });
    });

  return phases;
};

/** The Summary tab lists only the top-level rows (phase subtotals). */
export const getSummaryRows = (rows: ProgressClaimLine[]): ProgressClaimLine[] =>
  rows.filter((row) => row.depth === 0);

/**
 * Everything nested under a phase, re-indented so the phase's direct children
 * sit at depth 0 inside its own tab. The ungrouped phase lists the childless
 * top-level schedules themselves.
 */
export const getPhaseRows = (
  rows: ProgressClaimLine[],
  phaseId: string,
): ProgressClaimLine[] => {
  if (phaseId === UNGROUPED_PHASE_ID) return rows.filter(isUngroupedRow);

  const rowById = new Map(rows.map((row) => [row.id, row]));
  const getRootId = (row: ProgressClaimLine) => {
    let current = row;
    while (current.parentId && rowById.has(current.parentId)) {
      current = rowById.get(current.parentId)!;
    }
    return current.id;
  };

  return rows
    .filter((row) => row.depth > 0 && getRootId(row) === phaseId)
    .map((row) => ({ ...row, depth: row.depth - 1 }));
};
