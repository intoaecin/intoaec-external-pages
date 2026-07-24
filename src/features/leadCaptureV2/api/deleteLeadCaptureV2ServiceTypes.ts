import { isLeadCaptureV2ServiceTypesSuccessResponse } from "./leadCaptureV2ServiceTypesResponse";
import type {
  DeleteLeadCaptureV2ServiceTypesPayload,
  LeadCaptureV2ServiceTypeContext,
  LeadmanagerPost,
} from "./leadCaptureV2ServiceTypesTypes";

export const deleteLeadCaptureV2ServiceTypes = async (
  post: LeadmanagerPost,
  context: LeadCaptureV2ServiceTypeContext,
  payload: DeleteLeadCaptureV2ServiceTypesPayload
) => {
  if (payload.serviceTypeIds.length === 0) {
    return { success: false };
  }

  const response = await post({
    eventType: "DELETE_LEAD_CAPTURE_V2_SERVICE_TYPES",
    serviceTypeIds: payload.serviceTypeIds,
    organizationId: context.organizationId,
    organizationType: context.organizationType,
  });

  return { success: isLeadCaptureV2ServiceTypesSuccessResponse(response) };
};
