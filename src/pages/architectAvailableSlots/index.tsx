import ArchitectAvailabilityPreview from "@/features/components/architectAvailabilityPreview/ArchitectAvailabilityPreview";
import PageLoader from "@/features/components/Loader/PageLoader";
import {
  OrganizationDetailsProvider,
  useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";

const OrganizationDetailsWrapper = () => {
  const {
    loading,
    organizationId,
    organizationType,
  } = useOrganization();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <OrganizationLocalizationProvider
      organizationId={organizationId}
      organizationType={organizationType}
      block={false}
    >
      <ArchitectAvailabilityPreview />
    </OrganizationLocalizationProvider>
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
