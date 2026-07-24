import type { LeadCaptureV2StepFlowConfig } from "../leadCaptureV2StepFlowConfig";
import type { LeadmanagerPost } from "./leadCaptureV2ServiceTypesTypes";
import type { OrganizationLocalizationType } from "@/types";

export type LeadCaptureV2FieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "dropdown"
  | "multiselect"
  | "checkbox"
  | "radio"
  | "file"
  | "number"
  | "terms"
  | "esign";

export type LeadCaptureV2FormType =
  | "instant-proposal"
  | "lead-capture"
  | "feedback-form"
  | "complaint-form"
  | "custom";

export type LeadCaptureV2ApiFieldOption = {
  fieldOptionId?: string;
  label: string;
  orderIndex?: number;
};

export type LeadCaptureV2ApiPriceMatrixEntry = {
  priceMatrixEntryId?: string;
  fieldOptionId?: string | null;
  value: string | number;
};

export type LeadCaptureV2ApiPriceMatrix = {
  enabled: boolean;
  entries?: LeadCaptureV2ApiPriceMatrixEntry[];
};

export type LeadCaptureV2ApiField = {
  formFieldId?: string;
  leadCaptureV2Id?: string;
  serviceTypeId?: string | null;
  service_type_id?: string | null;
  fieldName: string;
  description?: string | null;
  type: LeadCaptureV2FieldType;
  unitType?: string | null;
  options?: LeadCaptureV2ApiFieldOption[] | null;
  priceMatrix?: LeadCaptureV2ApiPriceMatrix;
  required?: boolean;
  enabled?: boolean;
  verificationRequired?: boolean;
  locked?: boolean;
  orderIndex?: number;
};

export type LeadCaptureV2ApiItem = {
  leadCaptureV2Id: string;
  formName: string;
  title: string;
  description?: string | null;
  entityType: "LEAD_CAPTURE_V2";
  formType: LeadCaptureV2FormType;
  organizationId: string;
  organizationType: string;
  isActive: boolean;
  stepFlowConfig?: LeadCaptureV2StepFlowConfig | null;
  fields?: LeadCaptureV2ApiField[];
  createdAt: number;
  updatedAt: number;
};

export type LeadCaptureV2Context = {
  organizationId: string;
  organizationType: string;
  username?: string;
};

export type CreateLeadCaptureV2Payload = {
  formName: string;
  title: string;
  description?: string | null;
  formType?: LeadCaptureV2FormType;
  isAiGenerated?: boolean;
};

export type GenerateLeadCaptureV2Payload = {
  prompt: string;
  organizationDetails: string;
  serviceTypes: string[];
  location?: {
    country: string;
    city: string;
  };
  formType: LeadCaptureV2FormType;
  organizationLocalization?: OrganizationLocalizationType[];
};

export type SaveLeadCaptureV2Payload = {
  leadCaptureV2Id: string;
  formName?: string;
  title?: string;
  description?: string | null;
  formType?: LeadCaptureV2FormType;
  stepFlowConfig?: LeadCaptureV2StepFlowConfig;
  affectedFields?: LeadCaptureV2ApiField[];
  deletedFieldIds?: string[];
};

export type SaveLeadCaptureV2Result = Partial<LeadCaptureV2ApiItem> & {
  leadCaptureV2Id: string;
  affectedFields?: LeadCaptureV2ApiField[];
  deletedFieldIds?: string[];
};

export type DeleteLeadCaptureV2Payload = {
  leadCaptureV2Ids: string[];
};

export type LeadCaptureV2MutationResult = {
  success: boolean;
  data?: LeadCaptureV2ApiItem | SaveLeadCaptureV2Result;
  code?: string;
  message?: string;
};

export type LeadCaptureV2ApiResponse = {
  code?: string;
  message?: string;
  error?: unknown;
  body?: unknown;
};

export type LeadCaptureV2Post = LeadmanagerPost;

export type LeadCaptureV2SubmissionPayload = {
  identity?: {
    formType?: string | null;
    formId?: string | null;
    serviceTypeId?: string | null;
    serviceType?: string | null;
  };
  contact?: {
    leadName?: string | null;
    leadEmail?: string | null;
    leadMobile?: string | null;
  };
  project?: {
    projectName?: string | null;
    projectType?: string | null;
    projectArea?: number | null;
    projectBudget?: number | null;
    projectLocation?: string | null;
    projectSource?: string | null;
    isLeadCapture?: boolean | null;
  };
  system?: {
    sourceEvent?: string;
    submittedAt?: number;
    resultCode?: string;
  };
  answers?: Array<{
    fieldId?: string;
    fieldName?: string;
    answer?: unknown;
  }>;
  leadCaptureV2Responses?: Array<{
    fieldId?: string;
    formFieldId?: string | null;
    sourceItemId?: string | null;
    serviceTypeId?: string | null;
    serviceType?: string | null;
    fieldName?: string;
    description?: string;
    typeKey?: string;
    unitType?: string | null;
    selectedUnitType?: string | null;
    options?: Array<{
      fieldOptionId?: string | null;
      label?: string;
      orderIndex?: number;
    }>;
    priceMatrix?: {
      enabled?: boolean;
      unitType?: string;
      entries?: Array<{
        priceMatrixEntryId?: string | null;
        fieldOptionId?: string | null;
        value?: string | number;
      }>;
    };
    answer?: unknown;
  }>;
  rawRequest?: Record<string, unknown>;
};

export type LeadCaptureV2SubmissionRecord = {
  submissionId: string;
  organizationId: string;
  organizationType: string;
  formType?: string | null;
  entityType?: string | null;
  formId?: string | null;
  serviceTypeId?: string | null;
  sourceEvent: string;
  submittedAt: number;
  leadId?: string | null;
  projectId?: string | null;
  payloadJson?: LeadCaptureV2SubmissionPayload;
  metadataJson?: Record<string, unknown> | null;
  createdAt: number;
  updatedAt: number;
};

export type LeadCaptureV2SubmissionListResponse = {
  submissions: LeadCaptureV2SubmissionRecord[];
  totalCount: number;
  pageCount: number;
};
