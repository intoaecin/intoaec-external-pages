import { getLeadCaptureV2ServiceTypesBody } from "./leadCaptureV2ServiceTypesResponse";
import type {
  LeadCaptureV2ServiceTypeApiItem,
  LeadCaptureV2ServiceTypeContext,
  LeadmanagerPost,
} from "./leadCaptureV2ServiceTypesTypes";

export const fetchLeadCaptureV2ServiceTypes = async (
  post: LeadmanagerPost,
  context: LeadCaptureV2ServiceTypeContext,
  leadCaptureV2Id: string,
) => {
  const response = await post({
    eventType: "GET_LEAD_CAPTURE_V2_SERVICE_TYPES",
    organizationId: context.organizationId,
    organizationType: context.organizationType,
    leadCaptureV2Id,
  });

  return (
    getLeadCaptureV2ServiceTypesBody<LeadCaptureV2ServiceTypeApiItem[]>(
      response
    ) ?? []
  );
};
