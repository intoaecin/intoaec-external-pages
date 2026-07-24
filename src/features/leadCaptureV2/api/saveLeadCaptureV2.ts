import {
  getLeadCaptureV2Body,
  isLeadCaptureV2SuccessResponse,
} from "./leadCaptureV2Response";
import type {
  LeadCaptureV2Context,
  LeadCaptureV2MutationResult,
  LeadCaptureV2Post,
  SaveLeadCaptureV2Result,
  SaveLeadCaptureV2Payload,
} from "./leadCaptureV2Types";

export const saveLeadCaptureV2 = async (
  post: LeadCaptureV2Post,
  context: LeadCaptureV2Context,
  payload: SaveLeadCaptureV2Payload
): Promise<LeadCaptureV2MutationResult> => {
  if (!context.username || !payload.leadCaptureV2Id) {
    return { success: false };
  }

  const response = await post({
    eventType: "SAVE_LEAD_CAPTURE_V2",
    leadCaptureV2Id: payload.leadCaptureV2Id,
    organizationId: context.organizationId,
    organizationType: context.organizationType,
    entityType: "LEAD_CAPTURE_V2",
    formType: payload.formType,
    formName: payload.formName,
    title: payload.title,
    description: payload.description,
    stepFlowConfig: payload.stepFlowConfig,
    affectedFields: payload.affectedFields,
    deletedFieldIds: payload.deletedFieldIds,
    updatedBy: context.username,
  });

  return {
    success: isLeadCaptureV2SuccessResponse(response),
    data: getLeadCaptureV2Body<SaveLeadCaptureV2Result>(response),
    code: response?.code,
    message: response?.message,
  };
};
