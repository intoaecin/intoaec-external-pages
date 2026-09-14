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
import { createTheme, ThemeProvider } from "@mui/material";
import { hexToRgb } from "@/lib/helpers";
import FallbackExternalPage from "@/components/FallbackExternalPage";
import { useTranslation } from "react-i18next";

const OrganizationDetailsWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { loading, mainColor, textColor } = useOrganization();

  // If loading, return loading state
  if (loading) {
    return <PageLoader />;
  }

  // Create theme using organization colors
  const theme = createTheme({
    palette: {
      primary: {
        main: `rgba(${hexToRgb(mainColor)}, 0.8)`, // Set primary color with transparency
        contrastText: textColor ?? "#FFFFFF", // Text color, default to white if not provided
        light: `rgba(${hexToRgb(mainColor)}, 0.1)`, // Lighter shade
        dark: `rgba(${hexToRgb(mainColor)}, 1)`, // Darker shade
      },
    },
  });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
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
