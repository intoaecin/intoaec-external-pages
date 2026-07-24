import { isLeadCaptureV2SuccessResponse } from "./leadCaptureV2Response";
import type {
  DeleteLeadCaptureV2Payload,
  LeadCaptureV2Context,
  LeadCaptureV2Post,
} from "./leadCaptureV2Types";

export const deleteLeadCaptureV2 = async (
  post: LeadCaptureV2Post,
  context: LeadCaptureV2Context,
  payload: DeleteLeadCaptureV2Payload
) => {
  if (payload.leadCaptureV2Ids.length === 0) {
    return { success: false };
  }

  const response = await post({
    eventType: "DELETE_LEAD_CAPTURE_V2S",
    leadCaptureV2Ids: payload.leadCaptureV2Ids,
    organizationId: context.organizationId,
    organizationType: context.organizationType,
  });

  return { success: isLeadCaptureV2SuccessResponse(response) };
};
