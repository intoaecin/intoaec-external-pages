import {
  getLeadCaptureV2Body,
  isLeadCaptureV2SuccessResponse,
} from "./leadCaptureV2Response";
import type {
  CreateLeadCaptureV2Payload,
  LeadCaptureV2ApiItem,
  LeadCaptureV2Context,
  LeadCaptureV2MutationResult,
  LeadCaptureV2Post,
} from "./leadCaptureV2Types";

export const createLeadCaptureV2 = async (
  post: LeadCaptureV2Post,
  context: LeadCaptureV2Context,
  payload: CreateLeadCaptureV2Payload
): Promise<LeadCaptureV2MutationResult> => {
  if (!context.username || !payload.formName || !payload.title) {
    return { success: false };
  }

  const response = await post({
    eventType: "CREATE_LEAD_CAPTURE_V2",
    organizationId: context.organizationId,
    organizationType: context.organizationType,
    entityType: "LEAD_CAPTURE_V2",
    formType: payload.formType ?? "custom",
    formName: payload.formName,
    title: payload.title,
    description: payload.description,
    isAiGenerated: payload.isAiGenerated,
    createdBy: context.username,
  });

  return {
    success: isLeadCaptureV2SuccessResponse(response),
    data: getLeadCaptureV2Body<LeadCaptureV2ApiItem>(response),
    code: response?.code,
    message: response?.message,
  };
};
