import {
  Box,
  Checkbox,
  FormControlLabel,
  Skeleton,
  Typography,
} from "@mui/material";
import {
  EstimateEmailIcon,
  LocationIcon,
  OrganizationIcon,
  PhoneIcon,
} from "intoaec-react-icons";
import { useTranslation } from "react-i18next";
import type {
  DefaultOrganizationDetails,
  DefaultShippingDetails,
} from "../../utils/businessShipping";

type MobileShippingAddressSectionProps = {
  loading: boolean;
  pdf?: boolean;
  isPreview?: boolean;
  shipToBusiness: boolean;
  shipToDetails?: DefaultShippingDetails;
  organizationDetails?: DefaultOrganizationDetails | null;
  defaultOrganizationDetails?: DefaultOrganizationDetails;
  onShipToBusinessChange: (checked: boolean) => void;
};

const MobileShippingAddressSection = ({
  loading,
  pdf,
  isPreview,
  shipToBusiness,
  shipToDetails,
  organizationDetails,
  defaultOrganizationDetails,
  onShipToBusinessChange,
}: MobileShippingAddressSectionProps) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        backgroundColor: "#E9F5FF",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 2,
        width: "100%",
        maxWidth: 400,
        minHeight: 120,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          rowGap: 0.6,
          flexGrow: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <OrganizationIcon width="12px" />
          <Typography
            sx={{
              ml: 0.7,
              fontWeight: 500,
              color:
                (shipToBusiness &&
                  (organizationDetails?.organizationName ||
                    defaultOrganizationDetails?.organizationName)) ||
                shipToDetails?.firstName
                  ? "text.primary"
                  : "#969696",
              fontSize: "0.9rem",
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={100} />
            ) : shipToBusiness ? (
              organizationDetails?.organizationName ??
              defaultOrganizationDetails?.organizationName ??
              "Name"
            ) : shipToDetails?.firstName ? (
              `${shipToDetails?.firstName}${
                shipToDetails?.lastName ? " " + shipToDetails?.lastName : ""
              }`
            ) : pdf ? (
              "Name"
            ) : (
              t("common.name")
            )}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <EstimateEmailIcon width="12px" />
          <Typography
            sx={{
              ml: 0.7,
              fontSize: "0.85rem",
              color:
                (shipToBusiness &&
                  (organizationDetails?.emailId ||
                    defaultOrganizationDetails?.emailId)) ||
                shipToDetails?.emailAddress
                  ? "text.primary"
                  : "#969696",
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={120} />
            ) : shipToBusiness ? (
              organizationDetails?.emailId ??
              defaultOrganizationDetails?.emailId ??
              "Email"
            ) : shipToDetails?.emailAddress ? (
              shipToDetails?.emailAddress
            ) : pdf ? (
              "Email"
            ) : (
              t("common.emailAddress")
            )}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <PhoneIcon width="12px" />
          <Typography
            sx={{
              ml: 0.7,
              fontSize: "0.85rem",
              color:
                (shipToBusiness &&
                  (organizationDetails?.mobileNumber ||
                    defaultOrganizationDetails?.mobileNumber)) ||
                shipToDetails?.mobileNumber
                  ? "text.primary"
                  : "#969696",
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={100} />
            ) : shipToBusiness ? (
              organizationDetails?.mobileNumber ??
              defaultOrganizationDetails?.mobileNumber ??
              "Phone"
            ) : shipToDetails?.mobileNumber ? (
              shipToDetails?.mobileNumber
            ) : pdf ? (
              "Phone"
            ) : (
              t("common.contactNumber")
            )}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <LocationIcon width="12px" />
          <Typography
            sx={{
              ml: 0.7,
              fontSize: "0.85rem",
              color:
                (shipToBusiness &&
                  (organizationDetails?.organizationLocation ||
                    defaultOrganizationDetails?.organizationLocation)) ||
                shipToDetails?.city
                  ? "text.primary"
                  : "#969696",
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={100} />
            ) : shipToBusiness ? (
              organizationDetails?.organizationLocation ??
              defaultOrganizationDetails?.organizationLocation ??
              "Location"
            ) : shipToDetails?.city ? (
              shipToDetails?.city
            ) : pdf ? (
              "Location"
            ) : (
              t("common.location")
            )}
          </Typography>
        </Box>
      </Box>

      {!isPreview && !pdf && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
          <FormControlLabel
            control={<Checkbox />}
            checked={shipToBusiness}
            onChange={(e, c) => {
              onShipToBusinessChange(c);
            }}
            label={
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, color: "#444", fontSize: "0.85rem" }}
              >
                {pdf
                  ? "Ship To Business Address"
                  : t("common.shipToBusinessAddress")}
              </Typography>
            }
          />
        </Box>
      )}
    </Box>
  );
};

export default MobileShippingAddressSection;
