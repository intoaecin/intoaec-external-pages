import { toLeadCaptureV2ServiceTypeMutationResult } from "./leadCaptureV2ServiceTypesResponse";
import type {
  LeadCaptureV2ServiceTypeContext,
  LeadCaptureV2ServiceTypeMutationResult,
  LeadmanagerPost,
  UpdateLeadCaptureV2ServiceTypePayload,
} from "./leadCaptureV2ServiceTypesTypes";

export const updateLeadCaptureV2ServiceType = async (
  post: LeadmanagerPost,
  context: LeadCaptureV2ServiceTypeContext,
  payload: UpdateLeadCaptureV2ServiceTypePayload
): Promise<LeadCaptureV2ServiceTypeMutationResult> => {
  if (!payload.serviceTypeId || !context.username) {
    return { success: false };
  }

  const requestData: Record<string, unknown> = {
    eventType: "UPDATE_LEAD_CAPTURE_V2_SERVICE_TYPE",
    serviceTypeId: payload.serviceTypeId,
    organizationId: context.organizationId,
    organizationType: context.organizationType,
    updatedBy: context.username,
  };
  if (payload.serviceName !== undefined) {
    requestData.serviceName = payload.serviceName;
  }
  if (payload.tagline !== undefined) {
    requestData.tagline = payload.tagline;
  }
  if (payload.icon !== undefined) {
    requestData.icon = payload.icon;
  }
  if (payload.leadCaptureV2Id !== undefined) {
    requestData.leadCaptureV2Id = payload.leadCaptureV2Id;
  }
  if (payload.configured !== undefined) {
    requestData.configured = payload.configured;
  }
  if (payload.isActive !== undefined) {
    requestData.isActive = payload.isActive;
  }

  const response = await post(requestData);

  return toLeadCaptureV2ServiceTypeMutationResult(response);
};
