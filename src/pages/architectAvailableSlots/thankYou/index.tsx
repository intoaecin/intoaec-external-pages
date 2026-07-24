import SlotConfirmed from "@/features/components/architectAvailabilityPreview/SlotConfirmed";
import PageLoader from "@/features/components/Loader/PageLoader";
import {
  OrganizationDetailsProvider,
  useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";

const ThankYouWrapper = () => {
  const { loading, organizationName, emailId, mobileNumber } = useOrganization();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <SlotConfirmed
      organizationDetails={{
        organizationName,
        emailId,
        mobileNumber,
      }}
    />
  );
};

export default function Home() {
  return (
    <OrganizationDetailsProvider blockTheme={false}>
      <ThankYouWrapper />
    </OrganizationDetailsProvider>
  );
}
