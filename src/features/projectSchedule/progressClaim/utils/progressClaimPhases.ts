import type { ProgressClaimLine } from "../types";

export interface ProgressClaimPhase {
  id: string;
  name: string;
}

/**
 * Every top-level schedule gets its own tab — including one with no children,
 * since the read-only Summary is no longer a place to claim it.
 */
export const getProgressClaimPhases = (rows: ProgressClaimLine[]): ProgressClaimPhase[] =>
  rows
    .filter((row) => row.depth === 0)
    .map((row) => ({ id: row.scheduleId, name: row.name }));

/** The Summary tab lists only the top-level rows (phase subtotals). */
export const getSummaryRows = (rows: ProgressClaimLine[]): ProgressClaimLine[] =>
  rows.filter((row) => row.depth === 0);

/**
 * Everything nested under a phase, re-indented so the phase's direct children
 * sit at depth 0 inside its own tab. A childless top-level schedule is its own
 * only line.
 */
export const getPhaseRows = (
  rows: ProgressClaimLine[],
  phaseId: string,
): ProgressClaimLine[] => {
  const rowById = new Map(rows.map((row) => [row.id, row]));
  const getRootId = (row: ProgressClaimLine) => {
    let current = row;
    while (current.parentId && rowById.has(current.parentId)) {
      current = rowById.get(current.parentId)!;
    }
    return current.id;
  };

  const phaseRow = rowById.get(phaseId);
  if (phaseRow && !phaseRow.isGroup) return [phaseRow];

  return rows
    .filter((row) => row.depth > 0 && getRootId(row) === phaseId)
    .map((row) => ({ ...row, depth: row.depth - 1 }));
};
