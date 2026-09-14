export type DefaultOrganizationDetails = {
  organizationName?: string;
  organizationWebsite?: string;
  organizationLocation?: string;
  mobileNumber?: string;
  emailId?: string;
  organizationLogo?: string;
  logoUrl?: string;
  taxId?: string;
  taxName?: string;
};

export type DefaultClientDetails = {
  clientName?: string;
  clientEmailAddress?: string;
  clientContactNumber?: string;
  clientLocation?: string;
};

export type DefaultShippingDetails = {
  city?: string;
  mobileNumber?: string;
  emailAddress?: string;
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  addressLine2?: string;
  state?: string;
  country?: string;
  zipCode?: string;
};

export type DefaultVendorDetails = {
  vendorName: string;
  vendorEmail: string;
  vendorMobile: string;
  vendorLocation?: string;
  vendorTaxName?: string;
  vendorTaxId?: string;
  destinationOrganizationId?: string;
  destinationOrganizationType?: string;
};

export type BusinessAndShippingInfoProps = {
  type: "CLIENT" | "ADMIN";
  projectId: string;
  organizationId: string;
  withAuth: boolean;
  isPo?: boolean;
  defaultOrganizationDetails?: DefaultOrganizationDetails;
  defaultClientDetails?: DefaultClientDetails;
  defaultShippingDetails?: DefaultShippingDetails;
  defaultVendorDetails?: DefaultVendorDetails;
  isPreview?: boolean;
  pdf?: boolean;
  isCreatePo?: boolean;
  isMobile?: boolean;
  isTaxDisplay?: boolean;
  onChangeIsTaxDisplay?: (value: boolean) => void;
};

export type MobileBusinessAndShippingInfoProps = BusinessAndShippingInfoProps & {
  details?: any;
  defaultVendorDetails?: {
    vendorName: string;
    vendorEmail: string;
    vendorMobile: string;
    vendorLocation?: string;
    vendorTaxName?: string;
    vendorTaxId?: string;
  };
};
