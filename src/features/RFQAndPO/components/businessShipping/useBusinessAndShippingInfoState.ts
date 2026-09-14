import { useBusinessOrganizationInfoQuery } from "@/features/hooks/api/organization/useBusinessOrganizationInfoQuery";
import type { BusinessAndShippingInfoProps } from "../../utils/businessShipping";

/**
 * Client-preview-only version of intoaec-UI's `useBusinessAndShippingInfoState`.
 *
 * The admin app's hook also wires up: a GeoIP-driven country selector, a
 * "ship to business address" modal, an "add vendor" modal, and syncing the
 * resolved vendor/shipping details back into `CreateRfqProvider`/`CreatePoProvider`
 * (the admin create-RFQ/PO form state). None of that is reachable from this
 * public, read-only client preview page: every consumer below only renders
 * those edit affordances when `isPreview` is false, and this page always
 * renders with `isPreview={true}` — verified by reading
 * OrganizationDetailsSection/VendorDetailsSection/ShippingAddressSection (and
 * their Mobile* counterparts) in this repo, where `isPreview` gates the
 * "change vendor" button, the ship-to edit icon, and the
 * ship-to-business-address checkbox. `CreateRfqProvider`/`CreatePoProvider`
 * are also never mounted on this page, so this port drops them entirely
 * rather than porting ~800 lines of admin-only create-flow state that would
 * never run here.
 */
export const useBusinessAndShippingInfoState = ({
  organizationId,
  withAuth,
  defaultOrganizationDetails,
  defaultShippingDetails,
  defaultVendorDetails,
  isTaxDisplay,
}: Pick<
  BusinessAndShippingInfoProps,
  | "organizationId"
  | "withAuth"
  | "defaultOrganizationDetails"
  | "defaultShippingDetails"
  | "defaultVendorDetails"
  | "isTaxDisplay"
>) => {
  const { organizationDetails, isLoading: loading } =
    useBusinessOrganizationInfoQuery({
      organizationId,
      withAuth,
      defaultOrganizationDetails,
    });

  const resolvedTaxName =
    organizationDetails?.taxName?.trim() ||
    defaultOrganizationDetails?.taxName?.trim() ||
    "-";

  const resolvedTaxId =
    organizationDetails?.taxId?.trim() ||
    defaultOrganizationDetails?.taxId?.trim() ||
    "-";

  const hasVendorSelected = Boolean(
    (defaultVendorDetails as any)?.vendorName ||
      (defaultVendorDetails as any)?.destinationOrganizationId,
  );

  return {
    organizationDetails,
    loading,
    displayVendor: defaultVendorDetails,
    resolvedTaxName,
    resolvedTaxId,
    hasVendorSelected,
    // Tax visibility toggle is an admin-only affordance (hidden whenever
    // isPreview is true) — isDimmed only needs to reflect isTaxDisplay here.
    isDimmed: !isTaxDisplay,
    onToggleTax: () => {},
    // Ship-to-business-address toggle is likewise admin-only; the preview
    // always shows the shipping details exactly as fetched.
    shipToBusiness: false,
    shipToDetails: defaultShippingDetails,
  };
};
