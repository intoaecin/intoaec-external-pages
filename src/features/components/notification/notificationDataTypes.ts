export interface NotificationDataTypes {
  id: string;
  isRead: boolean;
  createdAt: number;
  module: string;
  subModule: string;
  notificationType: string;
  notificationMessage: string;
  projectId?: string;
  tagName: string;
  /** Firebase / push payload fields used for deep links (optional per notification). */
  entityId?: string;
  leadId?: string;
  questionnaireId?: string;
  proposalId?: string;
  filePath?: string;
  questionnaireType?: string;
  isDefault?: boolean;
  originalMessage?: string;
  requestJson?: { leadId: string; taskTemplateId?: string; scheduleTemplateId?: string };
  metaData?: {
    snoozedDate?: number;
    meetingDate?: number;
    onLineMeetTimeStamp?: number;
    offLineMeetTimeStamp?: number;
    editOnlineMeetTimeStamp?: number;
    editOfflineMeetTimeStamp?: number;
    startTime?: number;
    unAvailableTimeStamp?: number;
  };
}
