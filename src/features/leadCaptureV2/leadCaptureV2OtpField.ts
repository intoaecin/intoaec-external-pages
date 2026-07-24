import type { LeadCaptureV2FieldTypeKey } from "./components/leadCaptureV2LayoutConfig";

const LEAD_CAPTURE_V2_OTP_FIELD_TYPE_KEYS = new Set<LeadCaptureV2FieldTypeKey>([
  "email",
  "phone",
]);

export const isLeadCaptureV2OtpEligibleField = (
  typeKey: LeadCaptureV2FieldTypeKey,
) => LEAD_CAPTURE_V2_OTP_FIELD_TYPE_KEYS.has(typeKey);
