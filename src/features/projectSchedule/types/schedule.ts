import type { AttachmentUploadValue } from "@/features/attachments/attachmentUploadHelpers";

export interface ScheduleChecklistItem {
  sclId: string;
  scheduleId?: string;
  checklistDescription: string;
  checklistAsignee?: string;
  checklistAsigneeUserId?: string;
  isCompleted?: boolean;
  orderIndex?: number;
  createdBy?: string;
  /** Comma-separated attachment URLs. */
  attachments?: string;
  /** Client-only: attachments edited in the modal (URLs and not-yet-uploaded files). */
  attachmentFiles?: AttachmentUploadValue[];
  /** Client-only: item added in the modal and not yet persisted on edit. */
  isNew?: boolean;
}

export interface ScheduleDependency {
  fromScheduleId: string;
  toScheduleId: string;
  type: string;
  delay: number; // working minutes
  dependencyId: string;
}

export interface ScheduleAssignee {
  id: string;
  name: string;
  type?: "USER" | "VENDOR";
  /** Organization working-hour capacity for this assignee. */
  hoursPerDay?: number;
  /** Entered allocation hours to apply to each generated workload custom day. */
  allocationHours?: number;
}

export interface Schedule {
  scheduleId: string;
  projectId: string;
  organizationId: string;
  organizationType: string;
  entityId?: string;
  entityType?: string;
  parentId?: string | null;
  /** Create-only: when true, the backend moves any shift(s) linked to `parentId` onto this new child schedule. */
  moveLinkedShiftsFromParent?: boolean;
  /** Ask the server to put the assignees on a shift for this new schedule (planner setting). */
  createAssigneeShift?: boolean;
  scheduleName: string;
  priority: string;
  description?: string;
  scheduleStartDate: number | Date;
  scheduleEndDate: number | Date;
  /** Optional fixed commitment day, stored as the organization-local start of day. */
  scheduleDeadlineDate?: number | Date | null;
  scheduleDuration: number; // working minutes
  scheduleAssigneeId?: string | null;
  scheduleAssigneeName?: string;
  scheduleAssignees?: ScheduleAssignee[];
  attachments?: string;
  scheduleCompletionPercentage: number | string;
  /** Cumulative % from the most recent ACCEPTED progress claim for this line, if any. */
  lastAcceptedCumulativePct?: number | string | null;
  plannedQuantity?: number | string | null;
  completedQuantity?: number | string | null;
  quantityUnit?: string | null;
  /** Per-day planned quantity overrides keyed by YYYY-MM-DD (org timezone). */
  dailyPlannedQuantities?: Record<string, number> | null;
  kanbanColumnId?: string | null;
  isPaused: boolean;
  isCompleted: boolean;
  isTemplateSchedule?: boolean;
  /** Zero-duration / single-day milestone (e.g. MS Project milestone). */
  isMilestone?: boolean;
  completedAt?: number | null;
  pausedAt?: number; // timestamp when schedule was paused
  scheduleColor?: string;
  createdBy?: string;
  orderIndex?: number;
  totalChildren?: number | string;
  numberOfCompleteChildren?: number | string;
  reminders?: Array<{
    scheduleReminderId: string;
    scheduleId?: string;
    reminderName?: string;
    reminderType: "DAYS" | "WEEKS";
    reminderValue: number;
    isReminderSent?: boolean;
    createdBy?: string;
  }>;
  checklist?: ScheduleChecklistItem[];
  linkedTasks?: Array<{
    scheduleTaskId: string;
    scheduleId?: string;
    taskId: string;
    taskName: string;
    isNewTask: boolean;
    taskStatus?: string;
    taskAssigneeId?: string;
    taskAssigneeName?: string;
    taskAssignees?: Array<{
      id: string;
      name: string;
      type: "USER" | "VENDOR";
    }>;
    startDate?: number | string;
    endDate?: number | string;
    isTaskCompleted?: boolean;
    projectName?: string;
    clientName?: string;
  }>;
  dependencies?: Array<{
    dependencyId?: string;
    fromScheduleId?: string;
    toScheduleId?: string;
    type?: string;
    delay?: number;
  }>;
  linkedEstimates?: Array<{
    estimateId: string;
    estimateTerms: string[];
  }>;
  actualBudget?: number;
  claimableAmount?: number;
  tax?: number;
  profit?: number;
  actualCost?: number;
  variance?: number;
  variancePercentage?: number;
  childrenIds?: Array<string>; // :TODO Remove this later
  createdAt?: string;
}

export interface TemplateSchedule extends Schedule {
  stliId: string;
  updatedBy?: string;
  updatedAt?: string | number;
}
export interface CreateScheduleRequest extends Schedule {
  eventType: "CREATE_SCHEDULE";
}

export interface DragState {
  scheduleId: string;
  startX: number;
  originalStartDate: Date;
  originalEndDate: Date;
  type: "move" | "resize-start" | "resize-end";
}

export enum ScheduleSubEvent {
  CREATE = "CREATE_SCHEDULE",
  DELETE = "DELETE_SCHEDULE",
  UPDATE = "UPDATE_SCHEDULE",
  EDIT = "EDIT_SCHEDULE",
  PAUSE = "PAUSE_SCHEDULE",
  RESUME = "RESUME_SCHEDULE",
  COMPLETE = "COMPLETE_SCHEDULE",
  INCOMPLETE = "INCOMPLETE_SCHEDULE",
  DELETE_DEPENDENCY = "DELETE_DEPENDENCY",
  CREATE_DEPENDENCY = "CREATE_DEPENDENCY",
}

export type DependencyPoint = {
  scheduleId: string;
  position: "start" | "end";
};
