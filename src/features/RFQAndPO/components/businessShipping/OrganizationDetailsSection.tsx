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
import { useTranslation } from "react-i18next";
import type { DefaultOrganizationDetails } from "../../utils/businessShipping";
import TaxDisplayRow from "./TaxDisplayRow";

type OrganizationDetailsSectionProps = {
  isPo?: boolean;
  pdf?: boolean;
  loading: boolean;
  organizationDetails?: DefaultOrganizationDetails | null;
  defaultOrganizationDetails?: DefaultOrganizationDetails;
  isDimmed: boolean;
  isTaxDisplay?: boolean;
  isPreview?: boolean;
  resolvedTaxName: string;
  resolvedTaxId: string;
  onToggleTax: () => void;
};

const OrganizationDetailsSection = ({
  isPo,
  pdf,
  loading,
  organizationDetails,
  defaultOrganizationDetails,
  isDimmed,
  isTaxDisplay,
  isPreview,
  resolvedTaxName,
  resolvedTaxId,
  onToggleTax,
}: OrganizationDetailsSectionProps) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        flex: {
          xs: "1 1 100%",
          md: "1 1 0",
        },
        minWidth: {
          xs: "100%",
          md: 0,
        },
        maxWidth: {
          xs: "100%",
          md: isPo ? "32.5%" : "49%",
        },
        minHeight: "100%",
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "column",
        borderRadius: "6px",
        border: "2px solid #E4E4E4",
        boxShadow: " 4px 4px 10px 0px rgb(0 0 0 / 5%);",
        overflow: "hidden",
      }}
      className="bg-white p-2"
    >
      <Typography
        className="mb-2 fw-500"
        sx={{
          textAlign: {
            xs: "center",
            sm: "center",
            md: "left",
          },
        }}
      >
        {pdf ? "Business Info" : t("common.businessInfo")}
      </Typography>
      <Box
        className="d-flex align-items-center gap-1"
        sx={{
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          alignItems: "flex-start",
        }}
      >
        <Box
          className="rfq-po-org-logo"
          sx={{
            width: 64,
            height: 64,
            minWidth: 64,
            minHeight: 64,
            maxWidth: 64,
            maxHeight: 64,
            flexShrink: 0,
            alignSelf: "flex-start",
            overflow: "hidden",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <Skeleton variant="rectangular" width={64} height={64} />
          ) : (
            <img
              src={
                organizationDetails?.organizationLogo ??
                defaultOrganizationDetails?.organizationLogo ??
                "/images/boqbusinessinfo.png"
              }
              alt="logo"
              width={64}
              height={64}
              style={{
                width: "100%",
                height: "100%",
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          )}
        </Box>
        <Box
          className="d-flex justify-content-between align-items-start"
          sx={{
            flexDirection: "column",
            rowGap: ".3rem",
            minWidth: 0,
            flex: 1,
          }}
        >
          <Box className="d-flex align-items-center">
            <OrganizationIcon width={"10px"} />
            <Typography
              style={{
                color:
                  organizationDetails?.organizationName ||
                  defaultOrganizationDetails?.organizationName
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
              ) : (
                organizationDetails?.organizationName ??
                defaultOrganizationDetails?.organizationName ??
                "Organization Name"
              )}
            </Typography>
          </Box>
          <Box className="d-flex align-items-center word-wrap w-100">
            <EstimateEmailIcon width="10px" />
            <Typography
              style={{
                color:
                  organizationDetails?.emailId ||
                  defaultOrganizationDetails?.emailId
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
              ) : (
                organizationDetails?.emailId ??
                defaultOrganizationDetails?.emailId ??
                "Organization Email"
              )}
            </Typography>
          </Box>
          <Box className="d-flex align-items-center word-wrap w-100">
            <PhoneIcon width="10px" />
            <Typography
              style={{
                color:
                  organizationDetails?.mobileNumber ||
                  defaultOrganizationDetails?.mobileNumber
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
              ) : (
                organizationDetails?.mobileNumber ??
                defaultOrganizationDetails?.mobileNumber ??
                "Contact Number"
              )}
            </Typography>
          </Box>
          <Box className="d-flex align-items-center word-wrap w-100">
            <WebsiteIcon width="10px" />
            <Typography
              className="ml-1 fs-7 fw-500"
              sx={{
                color: "#3CA2FF",
                minHeight: "1.2em",
                display: "flex",
                alignItems: "center",
              }}
            >
              {loading && !defaultOrganizationDetails ? (
                <Skeleton variant="text" width={"100px"} />
              ) : organizationDetails?.organizationWebsite?.length ? (
                organizationDetails?.organizationWebsite
              ) : defaultOrganizationDetails?.organizationWebsite ? (
                defaultOrganizationDetails?.organizationWebsite
              ) : (
                "Website"
              )}
            </Typography>
          </Box>
          <Box className="d-flex align-items-center word-wrap w-100">
            <LocationIcon width="10px" />
            <Typography
              style={{
                color:
                  organizationDetails?.organizationLocation ||
                  defaultOrganizationDetails?.organizationLocation
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
              {loading && !defaultOrganizationDetails ? (
                <Skeleton variant="text" width={"100px"} />
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
            taxNameMinWidth="45px"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default OrganizationDetailsSection;
