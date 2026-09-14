import TaxIcon from "@/assets/icons/tax-icon";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Box, IconButton, Skeleton, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { DefaultOrganizationDetails } from "../../utils/businessShipping";

type TaxDisplayRowProps = {
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
  /** Desktop tax name span includes minWidth: 45px */
  taxNameMinWidth?: string;
};

const TaxDisplayRow = ({
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
  taxNameMinWidth,
}: TaxDisplayRowProps) => {
  const { t } = useTranslation();

  if (!(isTaxDisplay || !isPreview || (pdf && isTaxDisplay))) {
    return null;
  }

  return (
    <Box className="d-flex justify-content-between gap-5 align-items-center word-wrap w-100">
      <Box className="d-flex align-items-center">
        <TaxIcon width="10px" />

        <Typography
          className="ml-1 fs-7 fw-500"
          style={{ color: isDimmed ? "#969696" : "" }}
          sx={{
            display: "flex",
            alignItems: "center",
            lineHeight: 1.3,
          }}
        >
          {loading && !defaultOrganizationDetails ? (
            <Skeleton variant="text" width={"100px"} />
          ) : (
            <Tooltip
              title={
                organizationDetails?.taxName?.trim() ||
                defaultOrganizationDetails?.taxName?.trim()
              }
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "default",
                }}
              >
                <span
                  style={{
                    maxWidth:
                      (organizationDetails?.taxName?.trim() ||
                        defaultOrganizationDetails?.taxName?.trim()) &&
                      (organizationDetails?.taxId?.trim() ||
                        defaultOrganizationDetails?.taxId?.trim())
                        ? "150px"
                        : "auto",
                    ...(taxNameMinWidth
                      ? { minWidth: taxNameMinWidth }
                      : {}),
                    display: "inline-block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {organizationDetails?.taxName &&
                  organizationDetails.taxName.trim() !== ""
                    ? organizationDetails.taxName
                    : defaultOrganizationDetails?.taxName &&
                        defaultOrganizationDetails.taxName.trim() !== ""
                      ? defaultOrganizationDetails.taxName
                      : "-"}
                </span>

                {(organizationDetails?.taxName?.trim() ||
                  defaultOrganizationDetails?.taxName?.trim()) &&
                (organizationDetails?.taxId?.trim() ||
                  defaultOrganizationDetails?.taxId?.trim())
                  ? ":"
                  : ""}

                <span
                  style={{
                    maxWidth:
                      organizationDetails?.taxId?.trim() ||
                      defaultOrganizationDetails?.taxId?.trim()
                        ? "180px"
                        : "auto",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    lineHeight: "1.3",
                    display: "inline-block",
                  }}
                >
                  {organizationDetails?.taxId?.trim() ||
                    defaultOrganizationDetails?.taxId?.trim() ||
                    "-"}
                </span>
              </Box>
            </Tooltip>
          )}
        </Typography>
      </Box>

      {!pdf &&
        !isPreview &&
        !(resolvedTaxName === "-" && resolvedTaxId === "-") && (
          <Tooltip title={isDimmed ? t("common.show") : t("common.hide")}>
            <Box className="d-flex align-items-center">
              <IconButton
                onClick={onToggleTax}
                sx={{ padding: 0, marginLeft: "auto" }}
              >
                {isDimmed ? (
                  <VisibilityOff sx={{ fontSize: 15, color: "#34AFF9" }} />
                ) : (
                  <Visibility sx={{ fontSize: 15, color: "#34AFF9" }} />
                )}
              </IconButton>
            </Box>
          </Tooltip>
        )}
    </Box>
  );
};

export default TaxDisplayRow;
