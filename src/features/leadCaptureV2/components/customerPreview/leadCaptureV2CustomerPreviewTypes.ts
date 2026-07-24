import type { LeadCaptureV2StepFlowConfig } from "../../leadCaptureV2StepFlowConfig";
import type { LeadCaptureV2FormType } from "../../api/leadCaptureV2Types";
import type {
  LeadCaptureV2FormField,
  LeadCaptureV2Service,
} from "../leadCaptureV2LayoutConfig";

export type LeadCaptureV2PreviewAnswer = string | string[];

export type LeadCaptureV2PreviewServiceSubView = "list" | "questions";

export type LeadCaptureV2SubmitContext = {
  selectedServiceId: string | null;
  selectedServiceIds: string[];
  selectedServiceType?: string | null;
  dimensionUnitsByFieldId?: Record<string, string>;
};

export type LeadCaptureV2PreviewServiceFieldGroup = {
  service: LeadCaptureV2Service;
  fields: LeadCaptureV2FormField[];
};

export type LeadCaptureV2PreviewPage =
  | { type: "welcome" }
  | {
      type: "configurable";
      stepId: "serviceTypes" | "leadCapture" | "slotSetup";
      serviceSubView?: LeadCaptureV2PreviewServiceSubView;
    }
  | { type: "thankYou" };

export type LeadCaptureV2CustomerPreviewProps = {
  fields: LeadCaptureV2FormField[];
  formDescription: string;
  formName?: string;
  formType?: LeadCaptureV2FormType;
  formTitle: string;
  services: LeadCaptureV2Service[];
  serviceFieldsByServiceId: Record<string, LeadCaptureV2FormField[]>;
  stepFlowConfig: LeadCaptureV2StepFlowConfig;
  organizationId?: string;
  organizationType?: string;
  leadCaptureV2Id?: string;
  onBeforeThankYou?: (
    answers: Record<string, LeadCaptureV2PreviewAnswer>,
    submitContext: LeadCaptureV2SubmitContext,
  ) => boolean | void | Promise<boolean | void>;
  isContinueLoading?: boolean;
  isExternalPage?: boolean;
};

export const LEAD_CAPTURE_V2_PREVIEW_CONTENT_MAX_WIDTH = 760;
export const LEAD_CAPTURE_V2_PREVIEW_SHELL_MAX_WIDTH = 1120;
