import type {
  LeadCaptureV2ServiceTypeApiItem,
  LeadCaptureV2ServiceTypeApiResponse,
  LeadCaptureV2ServiceTypeMutationResult,
} from "./leadCaptureV2ServiceTypesTypes";

const LEAD_CAPTURE_V2_SERVICE_TYPE_SUCCESS_CODES = new Set([
  "LEAD_CAPTURE_V2_SERVICE_TYPE_CREATED",
  "LEAD_CAPTURE_V2_SERVICE_TYPE_UPDATED",
  "LEAD_CAPTURE_V2_SERVICE_TYPE_DELETED",
  "LEAD_CAPTURE_V2_SERVICE_TYPES_RETRIEVED",
]);

export const LEAD_CAPTURE_V2_SERVICE_TYPE_ALREADY_EXISTS_CODE =
  "LEAD_CAPTURE_V2_SERVICE_TYPE_ALREADY_EXISTS";

export const getLeadCaptureV2ServiceTypesBody = <T,>(
  response: LeadCaptureV2ServiceTypeApiResponse | undefined
): T | undefined => response?.body as T | undefined;

export const isLeadCaptureV2ServiceTypesSuccessResponse = (
  response: LeadCaptureV2ServiceTypeApiResponse | undefined
) => {
  if (!response || response.error) return false;
  const code = response.code?.toUpperCase() ?? "";
  return LEAD_CAPTURE_V2_SERVICE_TYPE_SUCCESS_CODES.has(code);
};

export const toLeadCaptureV2ServiceTypeMutationResult = (
  response: LeadCaptureV2ServiceTypeApiResponse | undefined
): LeadCaptureV2ServiceTypeMutationResult => ({
  success: isLeadCaptureV2ServiceTypesSuccessResponse(response),
  code: response?.code,
  message:
    typeof response?.message === "string" ? response.message : undefined,
  data: getLeadCaptureV2ServiceTypesBody<LeadCaptureV2ServiceTypeApiItem>(
    response
  ),
});
