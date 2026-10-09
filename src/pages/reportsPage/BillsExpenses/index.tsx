import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import {
  OrganizationDetailsProvider,
  useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import BillsExpensesPublicHome from "@/features/billsExpensesReport/BillsExpensesPublicHome";

const OrganizationDetailsWrapper = () => {
  const {
    loading,
    organizationId,
    organizationType,
  } = useOrganization();

  if (loading) {
    return <p>Loading....</p>;
  }

  return (
    <OrganizationLocalizationProvider
      organizationId={organizationId}
      organizationType={organizationType}
    >
      <BillsExpensesPublicHome />
    </OrganizationLocalizationProvider>
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

