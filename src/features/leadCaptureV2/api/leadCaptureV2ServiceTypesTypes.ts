export type LeadCaptureV2ServiceTypeApiItem = {
  serviceTypeId: string;
  serviceName: string;
  tagLine?: string | null;
  tagline?: string | null;
  icon?: string | null;
  configured: boolean;
  isActive: boolean | string | number | null;
  organizationId: string;
  organizationType: string;
  leadCaptureV2Id?: string | null;
  createdAt: number;
  updatedAt: number;
};

export type LeadCaptureV2ServiceTypeMutationResult = {
  success: boolean;
  code?: string;
  message?: string;
  data?: LeadCaptureV2ServiceTypeApiItem;
};

export type LeadCaptureV2ServiceTypeContext = {
  organizationId: string;
  organizationType: string;
  username?: string;
};

export type CreateLeadCaptureV2ServiceTypePayload = {
  serviceName?: string;
  tagline?: string;
  icon?: string;
  leadCaptureV2Id?: string | null;
  configured?: boolean;
  isActive?: boolean;
};

export type UpdateLeadCaptureV2ServiceTypePayload = {
  serviceTypeId?: string;
  serviceName?: string;
  tagline?: string;
  icon?: string;
  leadCaptureV2Id?: string | null;
  configured?: boolean;
  isActive?: boolean;
};

export type DeleteLeadCaptureV2ServiceTypesPayload = {
  serviceTypeIds: string[];
};

export type LeadCaptureV2ServiceTypeApiResponse = {
  code?: string;
  message?: string;
  error?: unknown;
  body?: unknown;
};

export type LeadmanagerPost = (
  requestData: Record<string, unknown>
) => Promise<LeadCaptureV2ServiceTypeApiResponse>;
