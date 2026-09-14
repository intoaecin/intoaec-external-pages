import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  Typography,
} from "@mui/material";
import { EditIcon } from "intoaec-react-icons";
import { useTranslation } from "react-i18next";
import type {
  DefaultOrganizationDetails,
  DefaultShippingDetails,
} from "../../utils/businessShipping";
import ShipToDisplayFields from "./ShipToDisplayFields";

type ShippingAddressSectionProps = {
  pdf?: boolean;
  isMobile?: boolean;
  isPreview?: boolean;
  loading: boolean;
  shipToBusiness: boolean;
  shipToDetails?: DefaultShippingDetails;
  organizationDetails?: DefaultOrganizationDetails | null;
  defaultOrganizationDetails?: DefaultOrganizationDetails;
  onEditClick: () => void;
  onShipToBusinessChange: (checked: boolean) => void;
};

const ShippingAddressSection = ({
  pdf,
  isMobile,
  isPreview,
  loading,
  shipToBusiness,
  shipToDetails,
  organizationDetails,
  defaultOrganizationDetails,
  onEditClick,
  onShipToBusinessChange,
}: ShippingAddressSectionProps) => {
  const { t } = useTranslation();

  if (pdf) {
    return null;
  }

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
          md: "32.5%",
        },
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          minHeight: "100%",
          height: "100%",
          flex: 1,
          borderRadius: "6px",
          border: "2px solid #E4E4E4",
          boxShadow: " 4px 4px 10px 0px rgb(0 0 0 / 5%);",
        }}
        className="bg-white p-2"
      >
        <Box
          className="d-flex justify-content-between align-items-center mb-2"
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
            {pdf ? "Ship To" : t("common.shipTo")}:
          </Typography>
          {isPreview || pdf ? (
            <></>
          ) : (
            <IconButton
              onClick={onEditClick}
              sx={{
                padding: {
                  xs: "4px",
                  sm: "8px",
                },
              }}
            >
              <EditIcon style={{ width: "12px", height: "12px" }} />
            </IconButton>
          )}
        </Box>
        <ShipToDisplayFields
          pdf={pdf}
          loading={loading}
          shipToBusiness={shipToBusiness}
          shipToDetails={shipToDetails}
          organizationDetails={organizationDetails}
          defaultOrganizationDetails={defaultOrganizationDetails}
        />

        <Box
          className="d-flex justify-content-end"
          sx={{
            "& .MuiCheckbox-root": {
              padding: "0 10px",
            },
          }}
        >
          {isPreview || pdf ? (
            <></>
          ) : (
            <FormControlLabel
              control={<Checkbox />}
              checked={shipToBusiness}
              onChange={(e, c) => {
                onShipToBusinessChange(c);
              }}
              label={
                <div className="d-flex row align-items-center fs-8 fw-500">
                  <span style={{ color: "#444" }}>
                    <span>
                      {pdf
                        ? "Ship To Business Address"
                        : t("common.shipToBusinessAddress")}
                    </span>
                  </span>
                </div>
              }
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ShippingAddressSection;
