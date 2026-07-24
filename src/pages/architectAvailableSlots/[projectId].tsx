import ArchitectAvailabilityPreview from "@/features/components/architectAvailabilityPreview/ArchitectAvailabilityPreview";
import FallbackExternalPage from "@/components/FallbackExternalPage";
import {
  OrganizationDetailsProvider,
  useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import PageLoader from "@/features/components/Loader/PageLoader";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { hexToRgb } from "@/lib/helpers";
import { ThemeProvider, createTheme } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const OrganizationDetailsWrapper = () => {
  const {
    loading,
    organizationId,
    organizationType,
    mainColor,
    textColor,
  } = useOrganization();
  const router = useRouter();
  const { t } = useTranslation();
  const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
  const { post: fetchLeadByProjectId, response } = useAxios<{
    code?: string;
  }>(`${NEXT_PUBLIC_LEADMANAGER_ENDPOINT}/session`);
  const [leadValidated, setLeadValidated] = useState<boolean | null>(null);
  const [leadData, setLeadData] = useState<any>(null);

  useEffect(
    () => {
      if (loading || !router.isReady || !organizationId || !organizationType) {
        return;
      }
      const raw = router.query.projectId;
      const projectId =
        typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
      if (!projectId) {
        setLeadValidated(false);
        return;
      }
      setLeadValidated(null);
      let cancelled = false;
      (async () => {
        try {
          const data = await fetchLeadByProjectId({
            eventType: "GET_LEAD_BY_ID",
            projectId,
            organizationId,
            organizationType,
          });
          const ok =
            response()?.ok === true && data?.code === "LEAD_RETRIEVED";
          if (!cancelled) {
            setLeadValidated(ok);
            if (ok) {
              setLeadData(data?.body);
            }
          }
        } catch {
          if (!cancelled) {
            setLeadValidated(false);
          }
        }
      })();
      return () => {
        cancelled = true;
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- useAxios post/response are unstable refs; omit to avoid re-fetch loops
    [
      loading,
      router.isReady,
      router.query.projectId,
      organizationId,
      organizationType,
    ],
  );

  if (loading) {
    return <PageLoader />;
  }

  if (!router.isReady || leadValidated === null) {
    return <PageLoader />;
  }

  if (!leadValidated) {
    return (
      <FallbackExternalPage
        title={t("architectSlotBooking.leadNotFoundTitle")}
        description={t("architectSlotBooking.leadNotFoundDescription")}
      />
    );
  }

  const theme = createTheme({
    palette: {
      primary: {
        main: `rgba(${hexToRgb(mainColor)}, 0.8)`,
        contrastText: textColor ?? "#FFFFFF",
        light: `rgba(${hexToRgb(mainColor)}, 0.1)`,
        dark: `rgba(${hexToRgb(mainColor)}, 1)`,
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <OrganizationLocalizationProvider
        organizationId={organizationId}
        organizationType={organizationType}
        block={false}
      >
        <ArchitectAvailabilityPreview initialLeadData={leadData} />
      </OrganizationLocalizationProvider>
    </ThemeProvider>
  );
};

export const Home = () => {
  return (
    <OrganizationDetailsProvider blockTheme={false}>
      <OrganizationDetailsWrapper />
    </OrganizationDetailsProvider>
  );
};

export default Home;
