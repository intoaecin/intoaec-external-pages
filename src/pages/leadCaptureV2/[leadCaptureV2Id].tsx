import PageLoader from "@/features/components/Loader/PageLoader";
import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import {
  OrganizationDetailsProvider,
  useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import LeadCaptureV2ExternalCapture from "@/features/leadCaptureV2/LeadCaptureV2ExternalCapture";
import { createOrganizationTheme } from "@/utils/createOrganizationTheme";
import { ThemeProvider } from "@mui/material";
import Head from "next/head";
import { ToastContainer } from "react-toastify";

const LeadCaptureV2ExternalWrapper = () => {
  const { loading, mainColor, textColor, organizationId, organizationType } =
    useOrganization();

  if (loading || !organizationId) {
    return <PageLoader />;
  }

  const theme = createOrganizationTheme(mainColor, textColor);

  return (
    <ThemeProvider theme={theme}>
      <OrganizationLocalizationProvider
        organizationId={organizationId}
        organizationType={organizationType}
      >
        <ToastContainer />
        <LeadCaptureV2ExternalCapture />
      </OrganizationLocalizationProvider>
    </ThemeProvider>
  );
};

const LeadCaptureV2ExternalPage = () => (
  <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <OrganizationDetailsProvider>
      <LeadCaptureV2ExternalWrapper />
    </OrganizationDetailsProvider>
  </>
);

export default LeadCaptureV2ExternalPage;
