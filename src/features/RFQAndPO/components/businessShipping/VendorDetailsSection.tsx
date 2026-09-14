import AddVendorIcon from "@/assets/icons/add-vendor-icon";
import TaxIcon from "@/assets/icons/tax-icon";
import { Box, Button, Typography } from "@mui/material";
import {
  EstimateEmailIcon,
  LocationIcon,
  OrganizationIcon,
  PhoneIcon,
} from "intoaec-react-icons";
import { useTranslation } from "react-i18next";

type VendorDetailsSectionProps = {
  isPo?: boolean;
  isMobile?: boolean;
  pdf?: boolean;
  isPreview?: boolean;
  hasVendorSelected: boolean;
  displayVendor?: any;
  vendorRfqId?: string | string[];
  onOpenAddVendor: () => void;
};

const VendorDetailsSection = ({
  isPo,
  isMobile,
  pdf,
  isPreview,
  hasVendorSelected,
  displayVendor,
  vendorRfqId,
  onOpenAddVendor,
}: VendorDetailsSectionProps) => {
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
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          borderRadius: "6px",
          border: "2px solid #E4E4E4",
          boxShadow: " 4px 4px 10px 0px rgb(0 0 0 / 5%);",
          height: "100%",
          minHeight: "100%",
          flex: 1,
        }}
        className="bg-white p-2"
      >
        <Box
          className="d-flex justify-content-between align-items-center mb-1"
          sx={{
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
            gap: {
              xs: "0.5rem",
              sm: "0",
            },
          }}
        >
          <Typography
            className="fw-500"
            sx={{
              textAlign: {
                xs: "left",
                sm: "left",
                md: "left",
              },
            }}
          >
            {pdf ? "Billed To" : t("common.billedTo")}{" "}
          </Typography>
          {isPreview ||
            (pdf ? (
              <></>
            ) : (
              hasVendorSelected && (
                <Button
                  onClick={onOpenAddVendor}
                  sx={{
                    color: "#192A3E",
                    svg: {
                      fill: "#192A3E",
                    },
                    "&:hover": {
                      backgroundColor: "transparent",
                      color: "primary.main",
                      svg: {
                        fill: "#3CA2FF",
                      },
                    },
                    fontSize: {
                      xs: "0.75rem",
                      sm: "0.875rem",
                    },
                  }}
                  startIcon={<AddVendorIcon width={"13px"} height={"13px"} />}
                  disableRipple={true}
                >
                  {pdf ? "Change Vendor" : t("common.changeVendor")}
                </Button>
              )
            ))}
        </Box>
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
                  color: displayVendor?.vendorName ? "inherit" : "#969696",
                }}
                className="ml-1 fs-7 fw-500"
                sx={{
                  minHeight: "1.2em",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {displayVendor?.vendorName ??
                  (pdf ? "Name" : t("common.name"))}
              </Typography>
            </Box>
            <Box className="d-flex align-items-center word-wrap w-100">
              <EstimateEmailIcon width="10px" />
              <Typography
                style={{
                  color: displayVendor?.vendorEmail ? "inherit" : "#969696",
                }}
                className="ml-1 fs-7 fw-500"
                sx={{
                  minHeight: "1.2em",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {displayVendor?.vendorEmail ??
                  (pdf ? "Email" : t("common.emailAddress"))}
              </Typography>
            </Box>
            <Box className="d-flex align-items-center word-wrap w-100">
              <PhoneIcon width="10px" />
              <Typography
                style={{
                  color: displayVendor?.vendorMobile ? "inherit" : "#969696",
                }}
                className="ml-1 fs-7 fw-500"
                sx={{
                  minHeight: "1.2em",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {displayVendor?.vendorMobile?.trim() ||
                  (pdf ? "Contact Number" : t("common.contactNumber"))}
              </Typography>
            </Box>

            <Box className="d-flex align-items-center word-wrap w-100">
              <LocationIcon width="10px" />
              <Typography
                style={{
                  color: displayVendor?.vendorLocation ? "inherit" : "#969696",
                }}
                className="ml-1 fs-7 fw-500"
                sx={{
                  minHeight: "1.2em",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {displayVendor?.vendorLocation
                  ? displayVendor.vendorLocation
                  : pdf
                    ? "Address"
                    : t("common.address")}
              </Typography>
            </Box>
            <Box className="d-flex align-items-center word-wrap w-100">
              <TaxIcon width="10px" />
              <Typography
                style={{
                  color: displayVendor?.vendorTaxName ? "inherit" : "#969696",
                }}
                className="ml-1 fs-7 fw-500"
                sx={{
                  minHeight: "1.2em",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {displayVendor?.vendorTaxName || displayVendor?.vendorTaxId ? (
                  <>
                    {`${displayVendor?.vendorTaxName}: ${displayVendor?.vendorTaxId}`}
                  </>
                ) : pdf ? (
                  "Tax ID"
                ) : (
                  t("myOrganization.professionalSummary.taxId")
                )}
              </Typography>
            </Box>
          </Box>
        </Box>
        {isPreview || pdf || vendorRfqId ? (
          <></>
        ) : (
          !hasVendorSelected && (
            <Box
              className="d-flex justify-content-end align-items-center"
              sx={{
                justifyContent: {
                  xs: "center",
                  sm: "flex-end",
                },
                mt: {
                  xs: "0.5rem",
                  sm: "0",
                },
              }}
            >
              <Button
                onClick={onOpenAddVendor}
                sx={{
                  color: "#192A3E",
                  svg: {
                    fill: "#192A3E",
                  },
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: "primary.main",
                    svg: {
                      fill: "#3CA2FF",
                    },
                  },
                  fontSize: {
                    xs: "0.75rem",
                    sm: "0.875rem",
                  },
                }}
                startIcon={<AddVendorIcon width={"13px"} height={"13px"} />}
                disableRipple={true}
              >
                {pdf ? "Add Vendor Details" : t("common.addVendorDetails")}
              </Button>
            </Box>
          )
        )}
      </Box>
    </Box>
  );
};

export default VendorDetailsSection;
