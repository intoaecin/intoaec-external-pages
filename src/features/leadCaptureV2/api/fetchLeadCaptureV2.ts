import { getLeadCaptureV2Body } from "./leadCaptureV2Response";
import type {
  LeadCaptureV2ApiItem,
  LeadCaptureV2Context,
  LeadCaptureV2Post,
} from "./leadCaptureV2Types";

export const fetchLeadCaptureV2 = async (
  post: LeadCaptureV2Post,
  context: LeadCaptureV2Context,
  leadCaptureV2Id: string
) => {
  const response = await post({
    eventType: "GET_LEAD_CAPTURE_V2",
    leadCaptureV2Id,
    organizationId: context.organizationId,
    organizationType: context.organizationType,
  });

  return getLeadCaptureV2Body<LeadCaptureV2ApiItem>(response);
};
