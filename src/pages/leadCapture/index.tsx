import PageLoader from "@/features/components/Loader/PageLoader";
import {
  OrganizationDetailsProvider,
  useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import CustomLeadCapture from "@/features/CustomLeadCapture/Answer/CustomLeadCapture";
import { CreateLeadCaptureTemplateProvider } from "@/features/CustomLeadCapture/CustomLeadCaptureProvider";
import LeadCaptureForm from "@/features/leadCapture/leadCaptureForm";
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
  } = useOrganization();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <ToastContainer />
      {/* {organizationId && organizationName ? <LeadCaptureForm /> : <></>} */}
      {/* {organizationId && organizationName ? <CustomLeadCapture /> : <></>} */}
      <CreateLeadCaptureTemplateProvider withAuth={false}>

      <CustomLeadCapture />
      </CreateLeadCaptureTemplateProvider>
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
