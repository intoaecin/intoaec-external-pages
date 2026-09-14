import { useMemo } from "react";
import { useOrganizationAddressQuery } from "@/features/hooks/api/organization/useOrganizationAddressQuery";
import { useOrganizationSocialMediaQuery } from "@/features/hooks/api/organization/useOrganizationSocialMediaQuery";
import { useOrganizationSuperAdminQuery } from "@/features/hooks/api/organization/useOrganizationSuperAdminQuery";

export type BusinessOrganizationDetails = {
  organizationName?: string;
  organizationWebsite?: string;
  organizationLocation?: string;
  mobileNumber?: string;
  emailId?: string;
  organizationLogo?: string;
  taxId?: string;
  taxName?: string;
};

type DefaultOrganizationDetails = BusinessOrganizationDetails & {
  logoUrl?: string;
};

type Options = {
  organizationId?: string;
  withAuth?: boolean;
  /** When defaults are already available (e.g. preview), skip network fetches. */
  defaultOrganizationDetails?: DefaultOrganizationDetails;
  enabled?: boolean;
};

export function useBusinessOrganizationInfoQuery({
  organizationId,
  withAuth = true,
  defaultOrganizationDetails,
  enabled = true,
}: Options) {
  const shouldFetch =
    enabled && Boolean(organizationId) && !defaultOrganizationDetails;

  const socialMediaQuery = useOrganizationSocialMediaQuery({
    organizationId,
    withAuth,
    enabled: shouldFetch,
  });

  const addressQuery = useOrganizationAddressQuery({
    organizationId,
    withAuth,
    enabled: shouldFetch,
  });

  const superAdminQuery = useOrganizationSuperAdminQuery({
    organizationId,
    withAuth,
    enabled: shouldFetch,
  });

  const organizationDetails = useMemo<BusinessOrganizationDetails | undefined>(() => {
    if (defaultOrganizationDetails) {
      return {
        ...defaultOrganizationDetails,
        organizationLogo:
          defaultOrganizationDetails.organizationLogo ??
          defaultOrganizationDetails.logoUrl,
      };
    }

    if (
      !socialMediaQuery.data &&
      !addressQuery.data &&
      !superAdminQuery.data
    ) {
      return undefined;
    }

    return {
      organizationName: socialMediaQuery.data?.organizationName,
      organizationWebsite: socialMediaQuery.data?.organizationWebsite,
      organizationLogo: socialMediaQuery.data?.organizationLogo,
      taxId: socialMediaQuery.data?.taxId,
      taxName: socialMediaQuery.data?.taxName,
      organizationLocation: addressQuery.data?.organizationLocation,
      emailId: superAdminQuery.data?.emailId,
      mobileNumber: superAdminQuery.data?.mobileNumber,
    };
  }, [
    defaultOrganizationDetails,
    socialMediaQuery.data,
    addressQuery.data,
    superAdminQuery.data,
  ]);

  const isLoading =
    shouldFetch &&
    (socialMediaQuery.isPending ||
      addressQuery.isPending ||
      superAdminQuery.isPending);

  return {
    organizationDetails,
    isLoading,
    socialMediaQuery,
    addressQuery,
    superAdminQuery,
  };
}
