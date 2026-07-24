import type { LeadCaptureV2FormType } from "./api/leadCaptureV2Types";

/**
 * Create-menu entries for lead capture.
 * Keep in sync with Leadmanager `LEAD_CAPTURE_V2_FORM_TYPE_REGISTRY` createMenu config
 * (labelKey + formType + order).
 */
export type LeadCaptureV2CreateMenuOption = {
  formType: LeadCaptureV2FormType;
  /** i18n key under leadCapture.proceed.* */
  labelKey: string;
  order: number;
};

const leadCaptureV2CreateMenuOptions: LeadCaptureV2CreateMenuOption[] = [
  { formType: "lead-capture", labelKey: "leadCapture", order: 0 },
  { formType: "instant-proposal", labelKey: "instantProposal", order: 10 },
  { formType: "feedback-form", labelKey: "feedbackForm", order: 20 },
  { formType: "complaint-form", labelKey: "complaintForm", order: 30 },
  { formType: "custom", labelKey: "customForm", order: 40 },
];

export const LEAD_CAPTURE_V2_CREATE_MENU_OPTIONS: LeadCaptureV2CreateMenuOption[] =
  [...leadCaptureV2CreateMenuOptions].sort(
    (first, second) => first.order - second.order,
  );

export const LEAD_CAPTURE_V2_FORM_TYPES =
  LEAD_CAPTURE_V2_CREATE_MENU_OPTIONS.map((option) => option.formType);
