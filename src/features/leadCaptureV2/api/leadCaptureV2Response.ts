import type { LeadCaptureV2ApiResponse } from "./leadCaptureV2Types";

export const getLeadCaptureV2Body = <T,>(
  response: LeadCaptureV2ApiResponse | undefined
): T | undefined => response?.body as T | undefined;

export const isLeadCaptureV2SuccessResponse = (
  response: LeadCaptureV2ApiResponse | undefined
) => {
  if (!response || response.error) return false;
  const code = response.code?.toUpperCase() ?? "";
  if (code.includes("ALREADY_EXISTS")) return false;
  return !code.includes("FAILED") && !code.includes("ERROR");
};
