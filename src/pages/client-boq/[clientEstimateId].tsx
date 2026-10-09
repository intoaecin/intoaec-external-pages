import { ClientEstimateDataProvider } from "@/features/components/providers/BoqProvider/BoqClientEstimateDataProvider";
import { useEstimationData } from "@/features/components/providers/BoqProvider/BoqClientEstimateDataProvider";
import { EstimateSuggestionProvider } from "@/features/components/providers/BoqProvider/BoqSuggestionProvider";
import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import {
  OrganizationDetailsProvider,
  useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import ClientBoqPreviewWrapper from "@/features/boq/client-boq/ClientBoqPreviewWrapper";
import PageLoader from "@/features/components/Loader/PageLoader";
import { useRouter } from "next/router";
import FallbackExternalPage from "@/components/FallbackExternalPage";
import { useTranslation } from "react-i18next";

const OrganizationDetailsWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { loading } = useOrganization();

  // If loading, return loading state
  if (loading) {
    return <PageLoader />;
  }

  return <>{children}</>;
};

const ClientBoqExternalGuard = () => {
  const { t } = useTranslation();
  const { loading, clientEstimationData } = useEstimationData();

  if (loading) return <PageLoader />;
  if (!clientEstimationData)
    return (
      <FallbackExternalPage
        title={t("externalFallback.estimate.title")}
        description={t("externalFallback.estimate.description")}
      />
    );

  return (
    <EstimateSuggestionProvider>
      <ClientBoqPreviewWrapper />
    </EstimateSuggestionProvider>
  );
};

const Home = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const estimateId = router.query?.clientEstimateId;
  const estimateRevision = router.query?.estimateRevision;

  if (!router.isReady) return <PageLoader />;
  if (!estimateId)
    return (
      <FallbackExternalPage
        title={t("externalFallback.estimate.title")}
        description={t("externalFallback.estimate.description")}
      />
    );

  return (
    <OrganizationDetailsProvider>
      <OrganizationLocalizationProvider>
        <OrganizationDetailsWrapper>
          <ClientEstimateDataProvider
            estimateId={estimateId as string}
            estimateRevision={estimateRevision as string}
          >
            <ClientBoqExternalGuard />
          </ClientEstimateDataProvider>
        </OrganizationDetailsWrapper>
      </OrganizationLocalizationProvider>
    </OrganizationDetailsProvider>
  );
};

export default Home;
