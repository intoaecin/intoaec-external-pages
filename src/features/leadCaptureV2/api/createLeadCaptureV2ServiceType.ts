import { toLeadCaptureV2ServiceTypeMutationResult } from "./leadCaptureV2ServiceTypesResponse";
import type {
  CreateLeadCaptureV2ServiceTypePayload,
  LeadCaptureV2ServiceTypeContext,
  LeadCaptureV2ServiceTypeMutationResult,
  LeadmanagerPost,
} from "./leadCaptureV2ServiceTypesTypes";

export const createLeadCaptureV2ServiceType = async (
  post: LeadmanagerPost,
  context: LeadCaptureV2ServiceTypeContext,
  payload: CreateLeadCaptureV2ServiceTypePayload
): Promise<LeadCaptureV2ServiceTypeMutationResult> => {
  if (!payload.serviceName || !context.username) {
    return { success: false };
  }

  const response = await post({
    eventType: "ADD_LEAD_CAPTURE_V2_SERVICE_TYPE",
    organizationId: context.organizationId,
    organizationType: context.organizationType,
    serviceName: payload.serviceName,
    tagline: payload.tagline,
    icon: payload.icon,
    leadCaptureV2Id: payload.leadCaptureV2Id,
    configured: payload.configured ?? false,
    isActive: payload.isActive ?? false,
    createdBy: context.username,
  });

  return toLeadCaptureV2ServiceTypeMutationResult(response);
};
