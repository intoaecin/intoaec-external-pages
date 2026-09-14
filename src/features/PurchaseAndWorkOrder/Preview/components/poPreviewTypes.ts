export interface CreateRFQPOPreviewProps {
  data: any;
  defaultTermsAndConditionData?: any;
  pdf?: boolean;
  isPreview?: boolean;
  commentMode?: boolean;
  vendorDetails?:
    | {
        vendorName: string;
        vendorEmail: string;
        vendorMobile: string;
        vendorLocation?: string;
        vendorTaxId?: string;
        vendorTaxName?: string;
      }
    | undefined;
  createdOn?: number;
  defaultShippingDetails?: {
    city?: string;
    mobileNumber?: string;
    emailAddress?: string;
    firstName?: string;
  };
  defaultOrganizationDetails?: {
    organizationName?: string;
    organizationWebsite?: string;
    organizationLocation?: string;
    mobileNumber?: string;
    emailId?: string;
    organizationLogo?: string;
    taxId?: string;
    taxName?: string;
  };
  currency?: string | null;
  organizationId?: string;
  isWorkOrder?: boolean;
}
