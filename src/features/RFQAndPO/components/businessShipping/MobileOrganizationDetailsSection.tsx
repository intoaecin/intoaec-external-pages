import {
  Box,
  Skeleton,
  Typography,
} from "@mui/material";
import {
  EstimateEmailIcon,
  LocationIcon,
  OrganizationIcon,
  PhoneIcon,
  WebsiteIcon,
} from "intoaec-react-icons";
import type { DefaultOrganizationDetails } from "../../utils/businessShipping";
import TaxDisplayRow from "./TaxDisplayRow";

type MobileOrganizationDetailsSectionProps = {
  loading: boolean;
  organizationDetails?: DefaultOrganizationDetails | null;
  defaultOrganizationDetails?: DefaultOrganizationDetails;
  isDimmed: boolean;
  isTaxDisplay?: boolean;
  isPreview?: boolean;
  pdf?: boolean;
  resolvedTaxName: string;
  resolvedTaxId: string;
  onToggleTax: () => void;
};

const MobileOrganizationDetailsSection = ({
  loading,
  organizationDetails,
  defaultOrganizationDetails,
  isDimmed,
  isTaxDisplay,
  isPreview,
  pdf,
  resolvedTaxName,
  resolvedTaxId,
  onToggleTax,
}: MobileOrganizationDetailsSectionProps) => {
  return (
    <Box
      sx={{
        backgroundColor: "#E9F5FF",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        p: 1.5,
        width: "100%",
        maxWidth: 380,
        minHeight: 80,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: 50,
          height: 50,
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mr: 2,
        }}
      >
        {loading ? (
          <Skeleton variant="circular" width={50} height={50} />
        ) : (
          <img
            src={
              organizationDetails?.organizationLogo ??
              defaultOrganizationDetails?.organizationLogo ??
              "/images/boqbusinessinfo.png"
            }
            alt="Organization Logo"
            width="50"
            height="50"
          />
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: 0.5,
          flexGrow: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <OrganizationIcon width="12px" />
          <Typography
            variant="body2"
            sx={{
              ml: 0.7,
              fontWeight: 600,
              color:
                organizationDetails?.organizationName ||
                defaultOrganizationDetails?.organizationName
                  ? "text.primary"
                  : "#969696",
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={100} />
            ) : (
              organizationDetails?.organizationName ??
              defaultOrganizationDetails?.organizationName ??
              "Organization Name"
            )}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <EstimateEmailIcon width="12px" />
          <Typography
            variant="body2"
            sx={{
              ml: 0.7,
              color:
                organizationDetails?.emailId ||
                defaultOrganizationDetails?.emailId
                  ? "text.primary"
                  : "#969696",
              fontSize: "0.8rem",
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={120} />
            ) : (
              organizationDetails?.emailId ??
              defaultOrganizationDetails?.emailId ??
              "Email"
            )}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <PhoneIcon width="12px" />
          <Typography
            variant="body2"
            sx={{
              ml: 0.7,
              color:
                organizationDetails?.mobileNumber ||
                defaultOrganizationDetails?.mobileNumber
                  ? "text.primary"
                  : "#969696",
              fontSize: "0.8rem",
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={100} />
            ) : (
              organizationDetails?.mobileNumber ??
              defaultOrganizationDetails?.mobileNumber ??
              "Phone Number"
            )}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <WebsiteIcon width="12px" />
          <Typography
            variant="body2"
            sx={{
              ml: 0.7,
              color: "#3CA2FF",
              fontSize: "0.8rem",
              textDecoration: "none",
              wordBreak: "break-word",
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={120} />
            ) : organizationDetails?.organizationWebsite ? (
              organizationDetails.organizationWebsite
            ) : defaultOrganizationDetails?.organizationWebsite ? (
              defaultOrganizationDetails.organizationWebsite
            ) : (
              "Website"
            )}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <LocationIcon width="12px" />
          <Typography
            variant="body2"
            sx={{
              ml: 0.7,
              color:
                organizationDetails?.organizationLocation ||
                defaultOrganizationDetails?.organizationLocation
                  ? "text.primary"
                  : "#969696",
              fontSize: "0.8rem",
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={80} />
            ) : (
              organizationDetails?.organizationLocation ??
              defaultOrganizationDetails?.organizationLocation ??
              "Location"
            )}
          </Typography>
        </Box>
        <TaxDisplayRow
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
      </Box>
    </Box>
  );
};

export default MobileOrganizationDetailsSection;
