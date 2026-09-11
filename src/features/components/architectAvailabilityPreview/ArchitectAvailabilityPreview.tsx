import React, { useEffect, useState } from "react";
import PreferredMode from "./PreferredMode";
import AvailabilityPreviewFooter from "./AvailabilityPreviewFooter";
import { useRouter } from "next/router";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganization } from "../providers/OrganizationThemeProvider";
import { Box, Button, Typography, useTheme } from "@mui/material";
import LanguageSwitcher from "../LanguageSwitcher";
import { useTranslation } from "react-i18next";

const ArchitectAvailabilityPreview = ({
  initialLeadData,
}: {
  initialLeadData?: any;
}) => {
  const router = useRouter();

  const [architectData, setArchitectData] = useState<any>();
  const { organizationId, organizationName, organizationType } =
    useOrganization();
  const {
    VITE_USERHUB_ENDPOINT,
    VITE_DEFAULT_ORGANIZATION_TYPE,
  } = useEnv();
  const { post: fetchId } = useAxios<any>(
    VITE_USERHUB_ENDPOINT + "/session"
  );
  const fetchData = async (organizationId: string) => {
    try {
      const requestData = {
        eventType: "GET_ORGANIZATION_USER_ADMIN_INFORMATION",
        organizationId: organizationId,
        organizationType: VITE_DEFAULT_ORGANIZATION_TYPE,
      };
      const data = await fetchId(requestData);
      if (data.code === "ORGANIZATION_DETAILS_RETRIEVED") {
        setArchitectData((prev: any) => ({
          ...data.body,
          ...(prev ?? {}),
          organizationType: VITE_DEFAULT_ORGANIZATION_TYPE,
        }));
      }
    } catch {
      // Organization details are optional for this public preview.
    }
  };
  useEffect(() => {
    fetchData(organizationId as string);
  }, []);
  const getRedirectQuery = router.query.redirect;

  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Box
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          alignItems: "center",
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          gap: 2,
          justifyContent: "space-between",
          minHeight: 64,
          px: { xs: 2, md: 8 },
        }}
      >
        <Box sx={{ alignItems: "center", display: "flex" }}>
          <Box>
            <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
              {organizationName ?? "IntoAEC"}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: "11px" }}>
              {t("architectSlotBooking.powerUpBusiness")}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ alignItems: "center", display: "flex", gap: 1 }}>
          <Typography
            sx={{
              color: "text.secondary",
              display: { xs: "none", sm: "block" },
              fontSize: "11px",
            }}
          >
            {t("architectSlotBooking.consultationBooking")}
          </Typography>
          {getRedirectQuery && getRedirectQuery !== "" && (
            <Button
              onClick={() => {
                router.push(getRedirectQuery as string);
              }}
              size="small"
              variant="contained"
            >
              {t("common.backToPortal")}
            </Button>
          )}
          <LanguageSwitcher />
        </Box>
      </Box>

      <Box component="main" sx={{ flex: 1, px: { xs: 2, md: 8 }, py: 5 }}>
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            component="h1"
            sx={{ color: "text.primary", fontSize: { xs: "24px", md: "30px" }, fontWeight: 600 }}
          >
            {t("architectSlotBooking.consultationBookingTitle")}
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: { xs: "12px", md: "14px" },
              mt: 1,
            }}
          >
            {t("architectSlotBooking.consultationBookingDescription")}
          </Typography>
        </Box>
        <Box
          sx={{
            maxWidth: 1300,
            mx: "auto",
          }}
        >
          <PreferredMode
            architectData={{
              ...architectData,
              organizationId,
              organizationType,
            }}
            initialLeadData={initialLeadData}
          />
        </Box>
      </Box>

      <Box
        component="footer"
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          px: { xs: 2, md: 8 },
        }}
      >
        <AvailabilityPreviewFooter />
      </Box>
    </Box>
  );
};

export default ArchitectAvailabilityPreview;
