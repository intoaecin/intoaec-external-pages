

import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import {
  OrganizationDetailsProvider,
  useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import AssetsHome from "@/features/reportsPage/assets/AssetsHome";

const OrganizationDetailsWrapper = () => {
  const {
    loading,
    organizationId,
    organizationName,
    organizationType,
  } = useOrganization();

  if (loading) {
    return <p>Loading....</p>;
  }

  return (
    <>
      <OrganizationLocalizationProvider
        organizationId={organizationId}
        organizationType={organizationType}
      >
        <AssetsHome />
      </OrganizationLocalizationProvider>
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

