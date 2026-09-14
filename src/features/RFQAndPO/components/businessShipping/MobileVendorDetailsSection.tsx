import AddVendorIcon from "@/assets/icons/add-vendor-icon";
import TaxIcon from "@/assets/icons/tax-icon";
import { Box, Button, Skeleton, Typography } from "@mui/material";
import {
  EstimateEmailIcon,
  LocationIcon,
  OrganizationIcon,
  PhoneIcon,
} from "intoaec-react-icons";
import { useTranslation } from "react-i18next";

type MobileVendorDetailsSectionProps = {
  loading: boolean;
  pdf?: boolean;
  isPreview?: boolean;
  vendor?: any;
  isVendorDetailsAdded: boolean;
  vendorRfqId?: string | string[];
  onOpenAddVendor: () => void;
};

const MobileVendorDetailsSection = ({
  loading,
  pdf,
  isPreview,
  vendor = {},
  isVendorDetailsAdded,
  vendorRfqId,
  onOpenAddVendor,
}: MobileVendorDetailsSectionProps) => {
  const { t } = useTranslation();

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
        position: "relative",
        flexWrap: "wrap",
      }}
    >
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
              fontWeight: 500,
              color: vendor?.vendorName ? "text.primary" : "#969696",
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={100} />
            ) : vendor?.vendorName ? (
              vendor.vendorName
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
            variant="body2"
            sx={{
              ml: 0.7,
              fontWeight: 500,
              color: vendor?.vendorEmail ? "text.primary" : "#969696",
              fontSize: "0.8rem",
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={100} />
            ) : vendor?.vendorEmail ? (
              vendor.vendorEmail
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
            variant="body2"
            sx={{
              ml: 0.7,
              fontWeight: 500,
              color: vendor?.vendorMobile ? "text.primary" : "#969696",
              fontSize: "0.8rem",
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={100} />
            ) : vendor?.vendorMobile ? (
              vendor.vendorMobile
            ) : pdf ? (
              "Phone Number"
            ) : (
              t("common.phoneNumber")
            )}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <LocationIcon width="12px" />
          <Typography
            sx={{
              ml: 0.7,
              fontWeight: 500,
              color: vendor?.vendorLocation ? "text.primary" : "#969696",
              fontSize: "0.8rem",
            }}
          >
            {loading ? (
              <Skeleton variant="text" width={100} />
            ) : vendor?.vendorLocation ? (
              vendor.vendorLocation
            ) : pdf ? (
              "Address"
            ) : (
              t("common.address")
            )}
          </Typography>
        </Box>
        <Box className="d-flex align-items-center word-wrap w-100">
          <TaxIcon width="10px" />
          <Typography
            style={{
              color: vendor?.vendorTaxName ? "inherit" : "#969696",
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
            ) : vendor?.vendorTaxName || vendor?.vendorTaxId ? (
              <>{`${vendor?.vendorTaxName}: ${vendor?.vendorTaxId}`}</>
            ) : pdf ? (
              "Tax ID"
            ) : (
              t("myOrganization.professionalSummary.taxId")
            )}
          </Typography>
        </Box>
      </Box>

      {!isPreview && !pdf && !vendorRfqId && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: isVendorDetailsAdded ? "flex-end" : "center",
            mt: 1,
          }}
        >
          <Button
            onClick={onOpenAddVendor}
            sx={{
              color: "#192A3E",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              "&:hover": {
                backgroundColor: "transparent",
                color: "primary.main",
                svg: { fill: "#3CA2FF" },
              },
            }}
            startIcon={<AddVendorIcon width={"13px"} height={"13px"} />}
            disableRipple
          >
            {isVendorDetailsAdded
              ? pdf
                ? "Change Vendor"
                : t("common.changeVendor")
              : pdf
                ? "Add Vendor Details"
                : t("common.addVendorDetails")}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default MobileVendorDetailsSection;
