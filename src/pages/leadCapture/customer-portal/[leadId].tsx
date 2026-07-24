import PageLoader from "@/features/components/Loader/PageLoader";
import {
  OrganizationDetailsProvider,
  useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import { organiationTypes } from "@/features/constants/constant";
import { useAxios, useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import LeadCaptureForm from "@/features/leadCapture/leadCaptureForm";
import { setCreateLeadFormData } from "@/features/leadCapture/setCreateFormData";
import { hexToRgb } from "@/lib/helpers";
import { ThemeProvider, createTheme } from "@mui/material";
import FallbackExternalPage from "@/components/FallbackExternalPage";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ToastContainer } from "react-toastify";

const OrganizationDetailsWrapper = () => {
  // const [organizationId, setOrganizationId] = useState<string>();
  // const [organizationName, setOrganizationName] = useState<string>();
  // const [organizationData, setOrganizationData] = useState<any>();
  const {
    loading,
    organizationId,
    organizationName,
    organizationType,
    mainColor,
    textColor,
  } = useOrganization();
  const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
  const { post } = useAxios(NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/fetch");

  const { t } = useTranslation();
  const router = useRouter();
  const leadId = router.query?.leadId as string | undefined;
  const [leadLoading, setLeadLoading] = useState(true);
  const [leadError, setLeadError] = useState<string | null>(null);

  const fetchLeadDetails = async () => {
    if (!leadId) {
      setLeadError("LEAD_ID_MISSING");
      return;
    }
    setLeadLoading(true);
    setLeadError(null);
    const requestData = {
      eventType: "GET_LEAD_DETAILS_BY_ID",
      leadId: leadId,
    };
    try {
      const data = await post(requestData);
      if (data.code === "LEAD_RETRIEVED") {
        setCreateLeadFormData({
          leadName: data?.body?.[0].leadName,
          leadEmail: data?.body?.[0].leadEmail,
          leadMobile: data?.body?.[0].leadMobile,
        });
      } else {
        setLeadError("LEAD_NOT_FOUND");
      }
    } catch (e: any) {
      setLeadError(e?.message ?? "LEAD_FETCH_FAILED");
    } finally {
      setLeadLoading(false);
    }
  };

  useEffect(() => {
    if (!router.isReady || !leadId) return;
    fetchLeadDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, leadId]);

  if (loading) return <PageLoader />;
  if (!router.isReady) return <PageLoader />;
  if (!leadId)
    return (
      <FallbackExternalPage
        title={t("externalFallback.leadCapture.title")}
        description={t("externalFallback.leadCapture.description")}
      />
    );
  if (leadLoading) return <PageLoader />;
  if (leadError)
    return (
      <FallbackExternalPage
        title={t("externalFallback.leadCapture.title")}
        description={t("externalFallback.leadCapture.description")}
      />
    );


 
 
  const theme = createTheme({
    palette: {
      primary: {
        main: `rgba(${hexToRgb(mainColor)}, 0.8)`, // Red
        contrastText: textColor ?? "#FFFFFF", // White,
        light: `rgba(${hexToRgb(mainColor)}, 0.1)`,
        dark: `rgba(${hexToRgb(mainColor)}, 1)`,
      },
    },
  });

  return (
    <>
      <ThemeProvider theme={theme}>
        <ToastContainer />
        {/* {organizationId && organizationName ? <LeadCaptureForm isCustomerPortal={true}/> : <></>} */}
        <LeadCaptureForm isCustomerPortal={true} />
      </ThemeProvider>
    </>
  );
};

export const Home = () => {
  return (
    <OrganizationDetailsProvider>
      <OrganizationDetailsWrapper />
    </OrganizationDetailsProvider>
  );
};

export default Home;
