import { CLIENT_REPORT_COLORS } from "@/constants/colors";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import EstimateEmailIcon from "@/assets/icons/BoqLeadPreviewIcon/email-icon";
import LocationIcon from "@/assets/icons/BoqLeadPreviewIcon/localtion-icon";
import TaxIcon from "@/assets/icons/tax-icon";
import UserIcon from "@/assets/icons/user-icon";
import PhoneIcon from "@/assets/phoneNumber-icon";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, IconButton, Skeleton, Tooltip, Typography } from "@mui/material";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Ported from intoaec-UI `src/features/ClientReport/ClientReportBusinessAndClientInfo.tsx`.
 * Two things were dropped from the source as dead code:
 *  - `import PreviewIcon from "@/assets/icons/Preview-icon"` — imported but
 *    never referenced in the source file, and that icon file does not exist
 *    in this app.
 *  - `const router = useRouter();` (from `@/features/hooks/useRouter`, a
 *    custom hook distinct from the `next/router` compat shim used elsewhere
 *    in this app) — declared but never read anywhere in the source file, and
 *    that hook module does not exist in this app either.
 * Everything else is ported as-is; this component is next-auth-free (uses
 * this app's public `useAxios`).
 */

const ClientReportBusinessAndClientInfo = ({
  type,
  projectId,
  organizationId,
  withAuth,
  defaultClientDetails,
  defaultOrganizationDetails,
  pdf,
  reportTitle,
  onChangeIsTaxDisplay,
  vendor,
  defaultReceiverDetails,
  isTaxDisplay,
  isPreview = false,
  Display = true,
  onReady,
}: {
  type: "CLIENT" | "ADMIN";
  projectId: string;
  organizationId: string;
  withAuth: boolean;
  defaultOrganizationDetails?: {
    organizationName?: string;
    organizationWebsite?: string;
    organizationLocation?: string;
    mobileNumber?: string;
    emailId?: string;
    organizationLogo?: string;
    logoUrl?: string;
    taxId?: string;
    taxName?: string;
  };
  defaultReceiverDetails?: {
    organizationName?: string;

    organizationLocation?: string;
    mobileNumber?: string;
    emailId?: string;
  };
  defaultClientDetails?: {
    clientName?: string;
    clientEmailAddress?: string;
    clientContactNumber?: string;
    clientLocation?: string;
    profileImage?: string;
  };
  vendor?: boolean;
  pdf?: boolean;
  reportTitle?: string;
  isTaxDisplay?: boolean;
  onChangeIsTaxDisplay?: (value: boolean) => void;
  isPreview?: boolean;
  Display?: boolean;
  onReady?: () => void;
}) => {
  const { t } = useTranslation();
  const { NEXT_PUBLIC_USERHUB_ENDPOINT, NEXT_PUBLIC_LEADMANAGER_ENDPOINT } =
    useEnv();
  const [organizationDetails, setOrganizationDetails] = useState<{
    organizationName?: string;
    organizationWebsite?: string;
    organizationLocation?: string;
    mobileNumber?: string;
    emailId?: string;
    organizationLogo?: string;
    taxId?: string;
    taxName?: string;
  }>();
  const [loading, setLoading] = useState(false);
  const [clientDetails, setClientDetails] = useState<{
    clientName?: string;
    clientEmailAddress?: string;
    clientContactNumber?: string;
    clientLocation?: string;
    profileImage?: string;
  }>();

  const [receiverOrganizationDetails, setReceiverOrganizationDetails] =
    useState<{
      organizationName?: string;

      organizationLocation?: string;
      mobileNumber?: string;
      emailId?: string;
    }>();
  const [isDimmed, setIsDimmed] = useState(!isTaxDisplay);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    setIsDimmed(!isTaxDisplay);
  }, [isTaxDisplay]);

  const isVendor = vendor ? true : false;
  const { post: fetchOrganization } = useAxios(
    `${NEXT_PUBLIC_USERHUB_ENDPOINT}/organization`,
    withAuth,
  );
  const { post: fetchUserHub } = useAxios(
    `${NEXT_PUBLIC_USERHUB_ENDPOINT}/myorganization`,
    withAuth,
  );
  const { post: fetchUserHubOrg } = useAxios(
    `${NEXT_PUBLIC_USERHUB_ENDPOINT}/organization`,
    withAuth,
  );
  const { post: fetchOrganizationSuperAdmin } = useAxios(
    `${NEXT_PUBLIC_USERHUB_ENDPOINT}/session`,
    withAuth,
  );

  const { post } = useAxios<any>(
    NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/fetch",
    withAuth,
  );

  const resolvedTaxName =
    organizationDetails?.taxName?.trim() ||
    defaultOrganizationDetails?.taxName?.trim() ||
    "-";

  const resolvedTaxId =
    organizationDetails?.taxId?.trim() ||
    defaultOrganizationDetails?.taxId?.trim() ||
    "-";

  // Toggle on icon click
  const handleToggleTax = () => {
    setIsDimmed(!isDimmed);
    onChangeIsTaxDisplay?.(isDimmed);
  };

  const fetchReceiverOrganizationDetails = async (organizationId: string) => {
    setLoading(true);
    try {
      const response = await fetchOrganization({
        eventType: "GET_ORGANIZATION_DETAILS",
        organizationId: organizationId,
      });
      if (response?.code === "ORGANIZATION_DETAILS_RETRIEVED") {
        setReceiverOrganizationDetails({
          organizationName: response?.body?.organizationName,
          mobileNumber: response?.body?.superAdmin?.mobile,
          emailId: response?.body?.superAdmin?.email,
          organizationLocation: response?.body?.organizationAddressInfo?.city,
        });
      }
    } catch (error) {
      console.log("SADKJH::", error);
    }
  };

  const fetchOrganizationDetails = async (organizationId: string) => {
    try {
      const requestData: any = {
        eventType: "FETCH_ORGANIZATION_SOCIAL_MEDIA",
        senderId: organizationId,
      };
      const data: any = await fetchUserHub(requestData);
      if (data.code === "ORGANIZATION_SOCIAL_MEDIA_FETCH_SUCCESS") {
        setOrganizationDetails((prev) => ({
          ...(prev ?? {}),
          organizationName: data.body.organizationName,
          organizationWebsite: data.body.websiteOrBlog,
          organizationLogo:
            data.body?.Organizations_logoUrl ?? data.body?.org_logoUrl,
          taxId: data.body.taxId,
          taxName: data.body.taxName,
        }));
      }
    } catch (error: any) {
      console.log("SADKJH::", error);
    }
  };

  const fetchOrganizationAddressDetails = async (organizationId: string) => {
    try {
      const requestData: any = {
        eventType: "GET_ORGANIZATION_ADDRESS_INFO",
        senderId: organizationId,
      };
      const data: any = await fetchUserHubOrg(requestData);

      if (data.code === "ORGANIZATION_DETAILS_RETRIEVED") {
        setOrganizationDetails((prev) => ({
          ...(prev ?? {}),
          organizationLocation: data.body.city,
        }));
      }
    } catch (error: any) {
      console.log("SADKJH::", error);
    }
  };
  const fetchOrganizationSuperAdminDetails = async (organizationId: string) => {
    try {
      const requestData: any = {
        eventType: "GET_ORGANIZATION_SUPER_USER",
        organizationId,
      };
      const data: any = await fetchOrganizationSuperAdmin(requestData);

      if (data.code === "ORGANIZATION_SUPER_USER_DETAILS_RETRIEVED") {
        setOrganizationDetails((prev) => ({
          ...(prev ?? {}),
          emailId: data.body[0].emailId,
          mobileNumber: data.body[0].mobileNumber,
        }));
      }
    } catch (error: any) {
      console.log("SADKJH::", error);
    }
  };
  const fetchData = async (projectId: string) => {
    try {
      const data = await post({ eventType: "GET_LEAD_BY_ID", projectId });
      if (data.code === "LEAD_RETRIEVED") {
        setClientDetails((prev) => ({
          ...(prev || {}),
          clientName: data.body.lead.leadName,
          clientEmailAddress: data.body.lead.leadEmail,
          clientContactNumber: data.body.lead.leadMobile,
          clientLocation: data.body.lead.leadCity,
          profileImage: data.body.lead.profileImage,
        }));
      }
    } catch (error: any) {
      console.log("SADKJH::", error);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        await fetchOrganizationDetails(organizationId);
        await fetchOrganizationAddressDetails(organizationId);
        await fetchOrganizationSuperAdminDetails(organizationId);
        if (isVendor) {
          await fetchReceiverOrganizationDetails(projectId);
        } else {
          await fetchData(projectId);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
        onReadyRef.current?.();
      }
    };
    if (
      !defaultOrganizationDetails ||
      !defaultClientDetails ||
      !defaultReceiverDetails
    ) {
      fetchDetails();
    } else {
      setClientDetails(defaultClientDetails);
      setOrganizationDetails(defaultOrganizationDetails);
      setReceiverOrganizationDetails(defaultReceiverDetails);
      onReadyRef.current?.();
    }
  }, [
    organizationId,
    projectId,
    defaultOrganizationDetails,
    defaultClientDetails,
  ]);
  const logoUrl =
    organizationDetails?.organizationLogo ??
    defaultOrganizationDetails?.organizationLogo;

  return (
    <div>
      {(logoUrl || (pdf && reportTitle)) && (
        <Box
          className="report-pdf-logo-header"
          sx={{
            display: "flex",
            justifyContent: pdf ? "space-between" : "flex-start",
            alignItems: "center",
            gap: 2,
            px: pdf ? 1 : { xs: 0, sm: 1, md: 3 },
            pt: 2,
            pb: 0,
            width: "100%",
          }}
        >
          <Box
            sx={{
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              overflow: "hidden",
            }}
          >
            {logoUrl && (
              <img
                src={logoUrl}
                alt="Organization Logo"
                style={{
                  height: "100%",
                  width: "auto",
                  objectFit: "contain",
                }}
              />
            )}
          </Box>
          {pdf && reportTitle && (
            <Typography
              className="report-pdf-title"
              sx={{
                color: "text.primary",
                typography: "h6",
                textAlign: "right",
                overflowWrap: "anywhere",
              }}
            >
              {reportTitle}
            </Typography>
          )}
        </Box>
      )}
      <Box
        className="business-client-container"
        sx={{
          display: "flex",
          flexDirection: pdf ? "row" : { xs: "column", md: "row" },
          alignItems: "stretch",
          px: pdf ? 1 : { xs: 0, sm: 1, md: 3 },
          py: 2,
          gap: 3,
          width: "100%",
        }}
      >
        {/* Business Info Card */}
        <Box
          className="bg-white business-info-card"
          sx={{
            flex: 1,
            borderRadius: "12px",
            border: `1px solid ${CLIENT_REPORT_COLORS.cardBorder}`,
            boxShadow: CLIENT_REPORT_COLORS.cardShadow,
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            backgroundColor: "background.paper",
          }}
        >
          {/* Card Header */}
          <Box className="card-header-container" sx={{ width: "100%", mb: 2 }}>
            <Typography
              className="card-header-label"
              sx={{
                typography: "caption",
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {t("common.businessInfo", { defaultValue: "Business Info" }).toUpperCase()}
            </Typography>
            <Typography
              className="card-title-text"
              sx={{
                typography: "h6",
                color: "text.primary",
                mt: "4px",
                lineHeight: "1.3",
              }}
            >
              {loading && !defaultOrganizationDetails ? (
                <Skeleton variant="text" width="140px" />
              ) : (
                (organizationDetails?.organizationName ??
                defaultOrganizationDetails?.organizationName ??
                "-")
              )}
            </Typography>
          </Box>

          {/* Details Section */}
          <Box
            className="card-details-container"
            sx={{
              display: "grid",
              gridTemplateColumns: pdf ? "1fr" : { xs: "1fr", sm: "1fr 1fr" },
              gap: "12px 16px",
            }}
          >
            {/* Headquarters (Address) */}
            <Box
              className="detail-item"
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
            >
              <Box className="detail-item-icon" sx={{ mt: "2px", color: "text.secondary", display: "flex", alignItems: "center" }}>
                <LocationIcon width="14px" height="14px" />
              </Box>
              <Box className="detail-item-content">
                <Typography className="detail-item-label" variant="caption" sx={{ color: "text.secondary", mb: "2px" }}>
                  {t("common.headquarters", { defaultValue: "Headquarters" })}
                </Typography>
                <Typography className="detail-item-value" variant="body2" sx={{ color: "text.primary", wordBreak: "break-word" }}>
                  {loading && !defaultOrganizationDetails ? (
                    <Skeleton variant="text" width="120px" />
                  ) : (
                    (organizationDetails?.organizationLocation ??
                    defaultOrganizationDetails?.organizationLocation ??
                    "-")
                  )}
                </Typography>
              </Box>
            </Box>

            {/* Phone */}
            <Box
              className="detail-item"
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
            >
              <Box className="detail-item-icon" sx={{ mt: "2px", color: "text.secondary", display: "flex", alignItems: "center" }}>
                <PhoneIcon width="14px" height="14px" />
              </Box>
              <Box className="detail-item-content">
                <Typography className="detail-item-label" variant="caption" sx={{ color: "text.secondary", mb: "2px" }}>
                  {t("common.phone", { defaultValue: "Phone" })}
                </Typography>
                <Typography className="detail-item-value" variant="body2" sx={{ color: "text.primary", wordBreak: "break-word" }}>
                  {loading && !defaultOrganizationDetails ? (
                    <Skeleton variant="text" width="80px" />
                  ) : (
                    (organizationDetails?.mobileNumber ??
                    defaultOrganizationDetails?.mobileNumber ??
                    "-")
                  )}
                </Typography>
              </Box>
            </Box>

            {/* Email */}
            <Box
              className="detail-item"
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
            >
              <Box className="detail-item-icon" sx={{ mt: "2px", color: "text.secondary", display: "flex", alignItems: "center" }}>
                <EstimateEmailIcon width="14px" height="14px" />
              </Box>
              <Box className="detail-item-content">
                <Typography className="detail-item-label" variant="caption" sx={{ color: "text.secondary", mb: "2px" }}>
                  {t("common.email", { defaultValue: "Email" })}
                </Typography>
                <Typography className="detail-item-value" variant="body2" sx={{ color: "text.primary", wordBreak: "break-word" }}>
                  {loading && !defaultOrganizationDetails ? (
                    <Skeleton variant="text" width="120px" />
                  ) : (
                    (organizationDetails?.emailId ??
                    defaultOrganizationDetails?.emailId ??
                    "-")
                  )}
                </Typography>
              </Box>
            </Box>

            {/* Registry/Tax Info */}
            {Display && (isTaxDisplay || !isPreview || (pdf && isTaxDisplay)) && (
              <Box
                className="detail-item"
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <Box className="detail-item-icon" sx={{ mt: "2px", color: "text.secondary", display: "flex", alignItems: "center" }}>
                  <TaxIcon width="14px" height="14px" />
                </Box>
                <Box className="detail-item-content" sx={{ width: "100%" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <Typography className="detail-item-label" variant="caption" sx={{ color: "text.secondary", mb: "2px" }}>
                      {t("common.registry", { defaultValue: "Registry" })}
                    </Typography>
                    {!pdf && !isPreview && !(resolvedTaxName === "-" && resolvedTaxId === "-") && (
                      <Tooltip title={isDimmed ? t("common.show") : t("common.hide")}>
                        <IconButton onClick={handleToggleTax} sx={{ p: 0, ml: "auto" }}>
                          {isDimmed ? (
                            <VisibilityOff sx={{ color: "primary.main" }} />
                          ) : (
                            <Visibility sx={{ color: "primary.main" }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  <Typography
                    className="detail-item-value"
                    sx={{
                      typography: "body2",
                      color: isDimmed
                        ? CLIENT_REPORT_COLORS.dimmedText
                        : "text.primary",
                      display: "block",
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {loading && !defaultOrganizationDetails ? (
                      <Skeleton variant="text" width="100px" />
                    ) : (
                      <>
                        <span>
                          {organizationDetails?.taxName && organizationDetails.taxName.trim() !== ""
                            ? organizationDetails.taxName
                            : defaultOrganizationDetails?.taxName && defaultOrganizationDetails.taxName.trim() !== ""
                              ? defaultOrganizationDetails.taxName
                              : "-"}
                        </span>
                        {(organizationDetails?.taxName?.trim() || defaultOrganizationDetails?.taxName?.trim()) &&
                        (organizationDetails?.taxId?.trim() || defaultOrganizationDetails?.taxId?.trim())
                          ? ":"
                          : ""}
                        <span>
                          {organizationDetails?.taxId?.trim() || defaultOrganizationDetails?.taxId?.trim() || "-"}
                        </span>
                      </>
                    )}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Client Info Card */}
        <Box
          className="client-info-card"
          sx={{
            flex: 1,
            borderRadius: "12px",
            border: `1px solid ${CLIENT_REPORT_COLORS.cardBorder}`,
            boxShadow: CLIENT_REPORT_COLORS.cardShadow,
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            backgroundColor: CLIENT_REPORT_COLORS.cardSurface,
          }}
        >
          {/* Card Header */}
          <Box className="card-header-container" sx={{ width: "100%", mb: 2 }}>
            <Typography
              className="card-header-label"
              sx={{
                typography: "caption",
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {isVendor
                ? pdf
                  ? t("common.billedTo", { defaultValue: "Billed To" }).toUpperCase()
                  : t("common.billedTo").toUpperCase()
                : pdf
                  ? t("common.clientInfo", { defaultValue: "Client Info" }).toUpperCase()
                  : t("common.clientInfo").toUpperCase()}
            </Typography>
            <Typography
              className="card-title-text"
              sx={{
                typography: "h6",
                color: "text.primary",
                mt: "4px",
                lineHeight: "1.3",
              }}
            >
              {loading ? (
                <Skeleton variant="text" width="140px" />
              ) : (
                (receiverOrganizationDetails?.organizationName ??
                defaultReceiverDetails?.organizationName ??
                clientDetails?.clientName ??
                defaultClientDetails?.clientName ??
                "-")
              )}
            </Typography>
          </Box>

          {/* Details Section */}
          <Box
            className="card-details-container"
            sx={{
              display: "grid",
              gridTemplateColumns: pdf ? "1fr" : { xs: "1fr", sm: "1fr 1fr" },
              gap: "12px 16px",
            }}
          >
            {/* Primary Contact */}
            {isVendor ? (
              <Box
                className="detail-item"
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <Box className="detail-item-icon" sx={{ mt: "2px", color: "text.secondary", display: "flex", alignItems: "center" }}>
                  <UserIcon width="14px" height="14px" />
                </Box>
                <Box className="detail-item-content">
                  <Typography className="detail-item-label" variant="caption" sx={{ color: "text.secondary", mb: "2px" }}>
                    {t("common.primaryContact", {
                      defaultValue: "Primary Contact",
                    })}
                  </Typography>
                  <Typography className="detail-item-value" variant="body2" sx={{ color: "text.primary", wordBreak: "break-word" }}>
                    {loading ? (
                      <Skeleton variant="text" width="120px" />
                    ) : (
                      (clientDetails?.clientName ?? defaultClientDetails?.clientName ?? "-")
                    )}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box
                className="detail-item"
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <Box className="detail-item-icon" sx={{ mt: "2px", color: "text.secondary", display: "flex", alignItems: "center" }}>
                  <UserIcon width="14px" height="14px" />
                </Box>
                <Box className="detail-item-content">
                  <Typography className="detail-item-label" variant="caption" sx={{ color: "text.secondary", mb: "2px" }}>
                    {t("common.primaryContact", {
                      defaultValue: "Primary Contact",
                    })}
                  </Typography>
                  <Typography className="detail-item-value" variant="body2" sx={{ color: "text.primary", wordBreak: "break-word" }}>
                    {loading ? (
                      <Skeleton variant="text" width="120px" />
                    ) : (
                      (clientDetails?.clientName ?? defaultClientDetails?.clientName ?? "-")
                    )}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Mobile */}
            <Box
              className="detail-item"
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
            >
              <Box className="detail-item-icon" sx={{ mt: "2px", color: "text.secondary", display: "flex", alignItems: "center" }}>
                <PhoneIcon width="14px" height="14px" />
              </Box>
              <Box className="detail-item-content">
                <Typography className="detail-item-label" variant="caption" sx={{ color: "text.secondary", mb: "2px" }}>
                  {t("common.mobile", { defaultValue: "Mobile" })}
                </Typography>
                <Typography className="detail-item-value" variant="body2" sx={{ color: "text.primary", wordBreak: "break-word" }}>
                  {loading ? (
                    <Skeleton variant="text" width="80px" />
                  ) : (
                    (clientDetails?.clientContactNumber ??
                    defaultClientDetails?.clientContactNumber ??
                    receiverOrganizationDetails?.mobileNumber ??
                    defaultReceiverDetails?.mobileNumber ??
                    "-")
                  )}
                </Typography>
              </Box>
            </Box>

            {/* Direct Email */}
            <Box
              className="detail-item"
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
            >
              <Box className="detail-item-icon" sx={{ mt: "2px", color: "text.secondary", display: "flex", alignItems: "center" }}>
                <EstimateEmailIcon width="14px" height="14px" />
              </Box>
              <Box className="detail-item-content">
                <Typography className="detail-item-label" variant="caption" sx={{ color: "text.secondary", mb: "2px" }}>
                  {t("common.directEmail", { defaultValue: "Direct Email" })}
                </Typography>
                <Typography className="detail-item-value" variant="body2" sx={{ color: "text.primary", wordBreak: "break-word" }}>
                  {loading ? (
                    <Skeleton variant="text" width="120px" />
                  ) : (
                    (clientDetails?.clientEmailAddress ??
                    defaultClientDetails?.clientEmailAddress ??
                    receiverOrganizationDetails?.emailId ??
                    defaultReceiverDetails?.emailId ??
                    "-")
                  )}
                </Typography>
              </Box>
            </Box>

            {/* Billing Address */}
            <Box
              className="detail-item"
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
            >
              <Box className="detail-item-icon" sx={{ mt: "2px", color: "text.secondary", display: "flex", alignItems: "center" }}>
                <LocationIcon width="14px" height="14px" />
              </Box>
              <Box className="detail-item-content">
                <Typography className="detail-item-label" variant="caption" sx={{ color: "text.secondary", mb: "2px" }}>
                  {t("common.billingAddress", {
                    defaultValue: "Billing Address",
                  })}
                </Typography>
                <Typography className="detail-item-value" variant="body2" sx={{ color: "text.primary", wordBreak: "break-word" }}>
                  {loading ? (
                    <Skeleton variant="text" width="120px" />
                  ) : (
                    (clientDetails?.clientLocation ??
                    defaultClientDetails?.clientLocation ??
                    receiverOrganizationDetails?.organizationLocation ??
                    defaultReceiverDetails?.organizationLocation ??
                    "-")
                  )}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default ClientReportBusinessAndClientInfo;
