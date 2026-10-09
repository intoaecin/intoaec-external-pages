import PageLoader from "@/features/components/Loader/PageLoader";
import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import {
  OrganizationDetailsProvider,
  useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import LeadCaptureV2ExternalCapture from "@/features/leadCaptureV2/LeadCaptureV2ExternalCapture";
import { ToastContainer } from "react-toastify";

const LeadCaptureV2ExternalWrapper = () => {
  const { loading, organizationId, organizationType } =
    useOrganization();

  if (loading || !organizationId) {
    return <PageLoader />;
  }

  return (
    <OrganizationLocalizationProvider
      organizationId={organizationId}
      organizationType={organizationType}
    >
      <ToastContainer />
      <LeadCaptureV2ExternalCapture />
    </OrganizationLocalizationProvider>
  );
};

const LeadCaptureV2ExternalPage = () => (
  <OrganizationDetailsProvider>
    <LeadCaptureV2ExternalWrapper />
  </OrganizationDetailsProvider>
);

export default LeadCaptureV2ExternalPage;
