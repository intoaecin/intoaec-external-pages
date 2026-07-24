import { getLeadCaptureV2Body } from "./leadCaptureV2Response";
import type {
  LeadCaptureV2ApiItem,
  LeadCaptureV2Context,
  LeadCaptureV2Post,
} from "./leadCaptureV2Types";

export const fetchLeadCaptureV2s = async (
  post: LeadCaptureV2Post,
  context: LeadCaptureV2Context
) => {
  const response = await post({
    eventType: "GET_LEAD_CAPTURE_V2S",
    organizationId: context.organizationId,
    organizationType: context.organizationType,
    entityType: "LEAD_CAPTURE_V2",
    isGetAll: false,
  });

  return getLeadCaptureV2Body<LeadCaptureV2ApiItem[]>(response) ?? [];
};
