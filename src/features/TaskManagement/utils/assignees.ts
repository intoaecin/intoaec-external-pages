interface Assignee {
  id: string;
  name: string;
  type: "USER" | "VENDOR";
  email?: string;
}

export const normalizeTaskAssigneesFromTask = (task: {
  taskAssignees?: Assignee[];
  taskAssigneeUserId?: string | null;
  taskAssignee?: string | null;
}): Assignee[] => {
  if (Array.isArray(task.taskAssignees) && task.taskAssignees.length > 0) {
    return task.taskAssignees
      .filter((assignee) => assignee?.id && assignee?.name)
      .map((assignee) => ({
        id: assignee.id,
        name: assignee.name,
        type: assignee.type ?? "USER",
      }));
  }

  if (task.taskAssigneeUserId && task.taskAssignee) {
    return [
      {
        id: task.taskAssigneeUserId,
        name: task.taskAssignee,
        type: "USER",
      },
    ];
  }

  return [];
};

export const formatTaskAssigneeDisplayText = (
  task: Parameters<typeof normalizeTaskAssigneesFromTask>[0],
  unassignedLabel: string,
): string => {
  const names = normalizeTaskAssigneesFromTask(task).map((a) => a.name);
  return names.length ? names.join(", ") : unassignedLabel;
};

export const buildAssigneeFilterPayload = (assigneeIds: string[]) => {
  if (assigneeIds.length === 0) return {};
  if (assigneeIds.length === 1) return { assigneeUserId: assigneeIds[0] };
  return { assigneeUserIds: assigneeIds };
};

export const buildTaskAssigneeApiPayload = (assignees: Assignee[]) => {
  const firstUser = assignees.find((assignee) => assignee.type === "USER");
  const taskAssignees = assignees.map(({ id, name, type }) => ({ id, name, type }));

  if (!firstUser) {
    return { taskAssignees };
  }

  return {
    taskAssignees,
    taskAssignee: firstUser.name,
    taskAssigneeUserId: firstUser.id,
  };
};

export const normalizeReporterAssigneesFromTask = (task: {
  reporterAssignees?: Assignee[];
  reporterId?: string | null;
  reporterName?: string | null;
  reporter?: string | null;
}): Assignee[] => {
  if (Array.isArray(task.reporterAssignees) && task.reporterAssignees.length > 0) {
    return task.reporterAssignees
      .filter((assignee) => assignee?.id && assignee?.name)
      .map((assignee) => ({
        id: assignee.id,
        name: assignee.name,
        type: "USER" as const,
      }));
  }

  const reporterId = task.reporterId;
  const reporterName = task.reporterName ?? task.reporter;
  if (reporterId && reporterName) {
    return [
      {
        id: reporterId,
        name: reporterName,
        type: "USER",
      },
    ];
  }

  return [];
};

export const buildTaskAssigneeUpdateContext = (
  task: {
    priority?: string;
    endDateTimeStamp?: string;
  },
  sessionUsername?: string,
) => ({
  ...(task.priority
    ? { taskPriority: task.priority.toUpperCase() }
    : {}),
  ...(task.endDateTimeStamp
    ? { endDate: task.endDateTimeStamp }
    : {}),
  ...(sessionUsername
    ? { currentUserName: sessionUsername, updatedBy: sessionUsername }
    : {}),
});

export const buildReporterAssigneeApiPayload = (assignees: Assignee[]) => {
  const reporterAssignees = assignees
    .filter((assignee) => assignee?.id && assignee?.name)
    .map(({ id, name }) => ({
      id,
      name,
      type: "USER" as const,
    }));

  const first = reporterAssignees[0];

  return {
    reporterAssignees,
    ...(first ? { reporterId: first.id, reporterName: first.name } : {}),
  };
};
