import { emailPattern, mobileNumberPattern } from "@/lib/regex";

export const LEAD_CAPTURE_V2_FORM_NAME_MAX_LENGTH = 50;
export const LEAD_CAPTURE_V2_FORM_TITLE_MAX_LENGTH = 100;
export const LEAD_CAPTURE_V2_FORM_DESCRIPTION_MAX_LENGTH = 200;

export type LeadCaptureV2ValidationError = "required" | "too_long" | null;

export const validateLeadCaptureV2FormName = (
  name: string,
): LeadCaptureV2ValidationError => {
  if (!name.trim()) {
    return "required";
  }
  if (name.length > LEAD_CAPTURE_V2_FORM_NAME_MAX_LENGTH) {
    return "too_long";
  }
  return null;
};

export const validateLeadCaptureV2FormTitle = (
  title: string,
): LeadCaptureV2ValidationError => {
  if (!title.trim()) {
    return "required";
  }
  if (title.length > LEAD_CAPTURE_V2_FORM_TITLE_MAX_LENGTH) {
    return "too_long";
  }
  return null;
};

export const validateLeadCaptureV2FormDescription = (
  description: string,
): LeadCaptureV2ValidationError => {
  if (description.length > LEAD_CAPTURE_V2_FORM_DESCRIPTION_MAX_LENGTH) {
    return "too_long";
  }
  return null;
};

export const isLeadCaptureV2FormSetupValid = (
  name: string,
  title: string,
  description: string,
): boolean => {
  return (
    validateLeadCaptureV2FormName(name) === null &&
    validateLeadCaptureV2FormTitle(title) === null &&
    validateLeadCaptureV2FormDescription(description) === null
  );
};

export const validateLeadCaptureV2Email = (email: string): boolean => {
  return emailPattern.test(email.trim());
};

export const validateLeadCaptureV2Phone = (phone: string): boolean => {
  const cleanPhone = phone.replaceAll(" ", "");
  if (!mobileNumberPattern.test(cleanPhone)) {
    return false;
  }
  const digitsOnly = cleanPhone.replace(/\D/g, "");
  // Reject if the number consists only of the same repeating digit (e.g. 0000000000)
  if (/^(.)\1+$/.test(digitsOnly)) {
    return false;
  }
  return true;
};
