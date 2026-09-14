import MobileOrganizationDetailsSection from "./businessShipping/MobileOrganizationDetailsSection";
import MobileVendorDetailsSection from "./businessShipping/MobileVendorDetailsSection";
import MobileShippingAddressSection from "./businessShipping/MobileShippingAddressSection";
import { useBusinessAndShippingInfoState } from "./businessShipping/useBusinessAndShippingInfoState";
import type { MobileBusinessAndShippingInfoProps } from "../utils/businessShipping";

/**
 * Client-preview-only port of intoaec-UI's `MobileBusinessAndShippingInfo`.
 * See BusinessAndShippingInfo.tsx / useBusinessAndShippingInfoState.ts for
 * what admin-only behavior (add-vendor, ship-to editing, GeoIP country
 * lookup, create-flow provider syncing) was dropped and why it is safe here.
 */
function MobileBusinessAndShippingInfo({
  organizationId,
  withAuth,
  defaultOrganizationDetails,
  defaultShippingDetails,
  pdf,
  isPreview,
  defaultVendorDetails,
  details,
  isTaxDisplay,
}: MobileBusinessAndShippingInfoProps) {
  const {
    organizationDetails,
    loading,
    displayVendor,
    resolvedTaxName,
    resolvedTaxId,
    isDimmed,
    onToggleTax,
    shipToBusiness,
    shipToDetails,
  } = useBusinessAndShippingInfoState({
    organizationId,
    withAuth,
    defaultOrganizationDetails,
    defaultShippingDetails,
    defaultVendorDetails,
    isTaxDisplay,
  });

  return (
    <div>
      {details === "Ship To" && (
        <MobileShippingAddressSection
          loading={loading}
          pdf={pdf}
          isPreview={isPreview}
          shipToBusiness={shipToBusiness}
          shipToDetails={shipToDetails}
          organizationDetails={organizationDetails}
          defaultOrganizationDetails={defaultOrganizationDetails}
          onShipToBusinessChange={() => {}}
        />
      )}
      {details === "Business Info" && (
        <MobileOrganizationDetailsSection
          loading={loading}
          organizationDetails={organizationDetails}
          defaultOrganizationDetails={defaultOrganizationDetails}
          isDimmed={isDimmed}
          isTaxDisplay={isTaxDisplay}
          isPreview={isPreview}
          pdf={pdf}
          resolvedTaxName={resolvedTaxName}
          resolvedTaxId={resolvedTaxId}
          onToggleTax={onToggleTax}
        />
      )}
      {details === "Billed To" && (
        <MobileVendorDetailsSection
          loading={loading}
          pdf={pdf}
          isPreview={isPreview}
          vendor={displayVendor || {}}
          isVendorDetailsAdded={Boolean(displayVendor)}
          onOpenAddVendor={() => {}}
        />
      )}
    </div>
  );
}

export default MobileBusinessAndShippingInfo;
