import { Box } from "@mui/material";
import OrganizationDetailsSection from "./businessShipping/OrganizationDetailsSection";
import VendorDetailsSection from "./businessShipping/VendorDetailsSection";
import ShippingAddressSection from "./businessShipping/ShippingAddressSection";
import { useBusinessAndShippingInfoState } from "./businessShipping/useBusinessAndShippingInfoState";
import type { BusinessAndShippingInfoProps } from "../utils/businessShipping";

/**
 * Client-preview-only port of intoaec-UI's `BusinessAndShippingInfo`.
 *
 * The admin version also renders a `ShipToModal` and an `AddVendorModal` for
 * editing shipping/vendor details in place. Both are dropped here: this app
 * always calls this component with `isPreview={true}`, and
 * ShippingAddressSection/VendorDetailsSection never render the edit
 * icon/"change vendor" button that would open those modals in preview mode
 * (see their `isPreview` guards) — so the modals would be permanently
 * unreachable dead code. See useBusinessAndShippingInfoState.ts for the full
 * reasoning on what else was trimmed.
 */
const BusinessAndShippingInfo = ({
  isPo,
  organizationId,
  withAuth,
  defaultOrganizationDetails,
  defaultShippingDetails,
  pdf,
  isPreview,
  defaultVendorDetails,
  isMobile,
  isTaxDisplay,
}: BusinessAndShippingInfoProps) => {
  const {
    organizationDetails,
    loading,
    displayVendor,
    resolvedTaxName,
    resolvedTaxId,
    hasVendorSelected,
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
      <Box
        className="rfq-po-info-cards"
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: { xs: "wrap", md: "nowrap" },
          justifyContent: "space-between",
          alignItems: "stretch",
          gap: { xs: 2, md: 1.5 },
          px: 2,
          py: 1,
          mb: 1,
        }}
      >
        <OrganizationDetailsSection
          isPo={isPo}
          pdf={pdf}
          loading={loading}
          organizationDetails={organizationDetails}
          defaultOrganizationDetails={defaultOrganizationDetails}
          isDimmed={isDimmed}
          isTaxDisplay={isTaxDisplay}
          isPreview={isPreview}
          resolvedTaxName={resolvedTaxName}
          resolvedTaxId={resolvedTaxId}
          onToggleTax={onToggleTax}
        />

        <VendorDetailsSection
          isPo={isPo}
          isMobile={isMobile}
          pdf={pdf}
          isPreview={isPreview}
          hasVendorSelected={hasVendorSelected}
          displayVendor={displayVendor}
          onOpenAddVendor={() => {}}
        />

        {isPo ? (
          <ShippingAddressSection
            pdf={pdf}
            isMobile={isMobile}
            isPreview={isPreview}
            loading={loading}
            shipToBusiness={shipToBusiness}
            shipToDetails={shipToDetails}
            organizationDetails={organizationDetails}
            defaultOrganizationDetails={defaultOrganizationDetails}
            onEditClick={() => {}}
            onShipToBusinessChange={() => {}}
          />
        ) : null}
      </Box>
    </div>
  );
};

export default BusinessAndShippingInfo;
