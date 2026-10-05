import type { Schedule } from "../types/schedule";

/** Traverse the tree using a pre-built Map so every lookup is O(1). */
export function getAllDescendantsWithMap(
  byId: Map<string, Schedule>,
  scheduleId: string
): string[] {
  const schedule = byId.get(scheduleId);
  if (!schedule?.childrenIds?.length) return [];
  const descendants: string[] = [...schedule.childrenIds];
  schedule.childrenIds.forEach((childId) => {
    descendants.push(...getAllDescendantsWithMap(byId, childId));
  });
  return descendants;
}

export function getAllDescendants(
  allSchedule: Schedule[],
  ScheduleId: string
): string[] {
  // Build the Map once; recursive calls reuse it via the private helper
  const byId = new Map(allSchedule.map((s) => [s.scheduleId, s]));
  return getAllDescendantsWithMap(byId, ScheduleId);
}

export function getAncestorScheduleId(
  allschedules: Schedule[],
  scheduleId: string
): string[] {
  // Build a Map once for O(1) lookups instead of O(n) find per level
  const byId = new Map(allschedules.map((s) => [s.scheduleId, s]));
  const ancestors: string[] = [];
  let current = byId.get(scheduleId);
  while (current?.parentId) {
    const parentId = String(current.parentId);
    ancestors.push(parentId);
    current = byId.get(parentId);
  }
  return ancestors;
}

/** Returns the top-level ancestor ID of a schedule, or its own ID if it has no parent. */
export function getRootAncestorId(
  scheduleId: string,
  allSchedules: Schedule[]
): string {
  const ancestors = getAncestorScheduleId(allSchedules, scheduleId);
  return ancestors.length > 0 ? ancestors[ancestors.length - 1] : scheduleId;
}

export function isDescendantOf(
  potentialParentId: string,
  scheduleId: string,
  allSchedules: Schedule[]
): boolean {
  if (!scheduleId) return false;
  const descendants = getAllDescendants(allSchedules, scheduleId);
  return descendants.includes(potentialParentId);
}

export function getScheduleDepth(
  scheduleId: string,
  allSchedules: Schedule[]
): number {
  const schedule = allSchedules.find((s) => s.scheduleId === scheduleId);
  if (!schedule || !schedule.parentId) return 0;
  return 1 + getScheduleDepth(schedule.parentId, allSchedules);
}

export function buildHierarchicalScheduleList(
  schedules: Schedule[]
): Schedule[] {
  const result: Schedule[] = [];
  const scheduleMap = new Map(schedules.map((s) => [s.scheduleId, s]));
  const compareSchedules = (left: Schedule, right: Schedule) => {
    if ((left.orderIndex ?? 0) === (right.orderIndex ?? 0)) {
      return Number(left.createdAt ?? 0) - Number(right.createdAt ?? 0);
    }
    return (left.orderIndex ?? 0) - (right.orderIndex ?? 0);
  };

  // Treat filtered children whose parent is absent as roots so they still render.
  const rootSchedules = schedules
    .filter((s) => !s.parentId || !scheduleMap.has(String(s.parentId)))
    .sort(compareSchedules);

  function addScheduleAndChildren(schedule: Schedule) {
    result.push(schedule);

    const children = schedules
      .filter(
        (candidate) =>
          candidate.parentId != null &&
          String(candidate.parentId) === String(schedule.scheduleId)
      )
      .sort(compareSchedules);

    // Prefer actual sibling rows over possibly stale childrenIds ordering.
    if (children.length > 0) {
      children.forEach((child) => {
        addScheduleAndChildren(child);
      });
      return;
    }

    if (schedule.childrenIds?.length) {
      schedule.childrenIds.forEach((childId) => {
        const child = scheduleMap.get(childId);
        if (child) {
          addScheduleAndChildren(child);
        }
      });
    }
  }

  rootSchedules.forEach(addScheduleAndChildren);
  return result;
}

/** True if this schedule acts as a summary/parent (has sub-schedules in the hierarchy). */
export function scheduleHasSubtasks(
  schedule: Pick<Schedule, "scheduleId" | "childrenIds">,
  allSchedules: Schedule[]
): boolean {
  if ((schedule.childrenIds?.length ?? 0) > 0) {
    return true;
  }
  return allSchedules.some((s) => s.parentId === schedule.scheduleId);
}

/**
 * Computes the orderIndex a schedule should receive after a field change.
 *
 * Rules:
 * - edit + removing parentId  → place right after the old parent
 * - edit + assigning/switching parentId → place after existing siblings
 * - create / duplicate (any field) → place after existing siblings or top-level peers
 * - edit + non-parentId field → preserve current orderIndex (no change)
 */
export function computeOrderIndex(
  schedules: Schedule[],
  field: string,
  value: unknown,
  scheduleData: Pick<Schedule, "orderIndex" | "parentId" | "scheduleId">,
  type: "create" | "edit" | "duplicate",
  existingSchedule?: Schedule | null
): number {
  const currentOrderIndex = scheduleData.orderIndex ?? 0;

  if (
    type === "edit" &&
    existingSchedule &&
    field === "parentId" &&
    !value &&
    scheduleData.parentId
  ) {
    const oldParent = schedules.find(
      (s) => s.scheduleId === scheduleData.parentId
    );
    return oldParent ? (oldParent.orderIndex || 0) + 1 : currentOrderIndex;
  }

  if (
    type === "edit" &&
    existingSchedule &&
    field === "parentId" &&
    value &&
    String(value) !== String(scheduleData.parentId ?? "")
  ) {
    const existingChildren = schedules.filter(
      (s) =>
        s.parentId != null &&
        String(s.parentId) === String(value) &&
        s.scheduleId !== existingSchedule.scheduleId
    );
    return (
      existingChildren.reduce((max, s) => Math.max(max, s.orderIndex || 0), -1) + 1
    );
  }

  if (type === "create" || type === "duplicate" || !existingSchedule) {
    const parentId =
      field === "parentId"
        ? (value as string | null) || null
        : scheduleData.parentId;

    if (parentId) {
      const existingChildren = schedules.filter(
        (s) => s.parentId != null && String(s.parentId) === String(parentId)
      );
      return (
        existingChildren.reduce((max, s) => Math.max(max, s.orderIndex || 0), -1) + 1
      );
    }

    const topLevel = schedules.filter((s) => !s.parentId);
    return (
      topLevel.reduce((max, s) => Math.max(max, s.orderIndex || 0), -1) + 1
    );
  }

  // edit + non-parentId field: preserve existing orderIndex
  return currentOrderIndex;
}

/**
 * Checks if two schedules are in the same hierarchical group (same root ancestor).
 */
export function areInSameHierarchicalGroup(
  schedule1: Schedule,
  schedule2: Schedule,
  allSchedules: Schedule[]
): boolean {
  const root1 = getRootAncestorId(schedule1.scheduleId, allSchedules);
  const root2 = getRootAncestorId(schedule2.scheduleId, allSchedules);
  return root1 === root2;
}
