import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import {
  OrganizationDetailsProvider,
  useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import ClaimRetentionPublicHome from "@/features/reportsPage/claimAndRetention/ClaimRetentionPublicHome";

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
      <ClaimRetentionPublicHome />
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

