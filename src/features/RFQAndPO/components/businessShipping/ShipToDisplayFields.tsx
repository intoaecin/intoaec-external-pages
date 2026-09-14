import { Box, Skeleton, Typography } from "@mui/material";
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

type ShipToDisplayFieldsProps = {
  pdf?: boolean;
  loading: boolean;
  shipToBusiness: boolean;
  shipToDetails?: DefaultShippingDetails;
  organizationDetails?: DefaultOrganizationDetails | null;
  defaultOrganizationDetails?: DefaultOrganizationDetails;
};

const ShipToDisplayFields = ({
  pdf,
  loading,
  shipToBusiness,
  shipToDetails,
  organizationDetails,
  defaultOrganizationDetails,
}: ShipToDisplayFieldsProps) => {
  const { t } = useTranslation();

  return (
    <Box
      className="d-flex align-items-center gap-1"
      sx={{
        flexDirection: {
          xs: "column",
          sm: "row",
        },
        alignItems: {
          xs: "flex-start",
          sm: "center",
        },
      }}
    >
      <Box
        className="d-flex justify-content-between align-items-start"
        sx={{
          flexDirection: "column",
          rowGap: ".3rem",
          width: "100%",
        }}
      >
        <Box className="d-flex align-items-center">
          <OrganizationIcon width={"10px"} />
          <Typography
            style={{
              color:
                (shipToBusiness &&
                  (organizationDetails?.organizationName ||
                    defaultOrganizationDetails?.organizationName)) ||
                shipToDetails?.firstName
                  ? "inherit"
                  : "#969696",
            }}
            className="ml-1 fs-7 fw-500"
            sx={{
              minHeight: "1.2em",
              display: "flex",
              alignItems: "center",
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={"100px"} />
            ) : shipToBusiness ? (
              organizationDetails?.organizationName ??
              defaultOrganizationDetails?.organizationName ??
              "Name"
            ) : shipToDetails?.firstName ? (
              `${shipToDetails?.firstName}${
                shipToDetails?.lastName ? shipToDetails?.lastName : ""
              }`
            ) : pdf ? (
              "Name"
            ) : (
              t("common.name")
            )}
          </Typography>
        </Box>
        <Box className="d-flex align-items-center word-wrap w-100">
          <EstimateEmailIcon width="10px" />
          <Typography
            style={{
              color:
                (shipToBusiness &&
                  (organizationDetails?.emailId ||
                    defaultOrganizationDetails?.emailId)) ||
                shipToDetails?.emailAddress
                  ? "inherit"
                  : "#969696",
            }}
            className="ml-1 fs-7 fw-500"
            sx={{
              minHeight: "1.2em",
              display: "flex",
              alignItems: "center",
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={"100px"} />
            ) : shipToBusiness ? (
              organizationDetails?.emailId ??
              defaultOrganizationDetails?.emailId ??
              "Organization Email"
            ) : shipToDetails?.emailAddress ? (
              shipToDetails?.emailAddress
            ) : pdf ? (
              "Email"
            ) : (
              t("common.emailAddress")
            )}
          </Typography>
        </Box>
        <Box className="d-flex align-items-center word-wrap w-100">
          <PhoneIcon width="10px" />
          <Typography
            style={{
              color:
                (shipToBusiness &&
                  (organizationDetails?.mobileNumber ||
                    defaultOrganizationDetails?.mobileNumber)) ||
                shipToDetails?.mobileNumber
                  ? "inherit"
                  : "#969696",
            }}
            className="ml-1 fs-7 fw-500"
            sx={{
              minHeight: "1.2em",
              display: "flex",
              alignItems: "center",
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={"100px"} />
            ) : shipToBusiness ? (
              organizationDetails?.mobileNumber ??
              defaultOrganizationDetails?.mobileNumber ??
              "Contact Number"
            ) : shipToDetails?.mobileNumber ? (
              shipToDetails?.mobileNumber
            ) : pdf ? (
              "Contact Number"
            ) : (
              t("common.contactNumber")
            )}
          </Typography>
        </Box>

        <Box className="d-flex align-items-center word-wrap w-100">
          <LocationIcon width="10px" />
          <Typography
            style={{
              color:
                (shipToBusiness &&
                  (organizationDetails?.organizationLocation ||
                    defaultOrganizationDetails?.organizationLocation)) ||
                shipToDetails?.city
                  ? "inherit"
                  : "#969696",
            }}
            className="ml-1 fs-7 fw-500"
            sx={{
              minHeight: "1.2em",
              display: "flex",
              alignItems: "center",
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={"100px"} />
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
    </Box>
  );
};

export default ShipToDisplayFields;
