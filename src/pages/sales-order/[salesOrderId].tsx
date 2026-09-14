import FallbackExternalPage from "@/components/FallbackExternalPage";
import ClientBoqPreviewWrapper from "@/features/boq/client-boq/ClientBoqPreviewWrapper";
import PageLoader from "@/features/components/Loader/PageLoader";
import { ClientEstimateDataProvider, useEstimationData } from "@/features/components/providers/BoqProvider/BoqClientEstimateDataProvider";
import { EstimateSuggestionProvider } from "@/features/components/providers/BoqProvider/BoqSuggestionProvider";
import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import { OrganizationDetailsProvider, useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { hexToRgb } from "@/lib/helpers";
import { createTheme, ThemeProvider } from "@mui/material";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

const SalesOrderTheme = ({ children }: { children: ReactNode }) => {
  const { loading, mainColor, textColor } = useOrganization();
  if (loading) return <PageLoader />;
  const theme = createTheme({
    palette: {
      primary: {
        main: `rgba(${hexToRgb(mainColor)}, 0.8)`,
        contrastText: textColor ?? "#FFFFFF",
      },
    },
  });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const SalesOrderGuard = () => {
  const { t } = useTranslation();
  const { loading, clientEstimationData } = useEstimationData();
  if (loading) return <PageLoader />;
  if (!clientEstimationData) return <FallbackExternalPage title={t("externalFallback.salesOrder.title")} description={t("externalFallback.salesOrder.description")} />;
  return <EstimateSuggestionProvider entityType="SALES_ORDER">
    <ClientBoqPreviewWrapper entityType="SALES_ORDER" />
  </EstimateSuggestionProvider>;
};

export default function SalesOrderExternalPage() {
  const { salesOrderId } = useParams<{ salesOrderId: string }>();
  const { t } = useTranslation();
  if (!salesOrderId) return <FallbackExternalPage title={t("externalFallback.salesOrder.title")} description={t("externalFallback.salesOrder.description")} />;
  return <OrganizationDetailsProvider>
    <OrganizationLocalizationProvider>
      <SalesOrderTheme>
        <ClientEstimateDataProvider entityType="SALES_ORDER" estimateId={salesOrderId} estimateRevision={undefined} withAuth={false}>
          <SalesOrderGuard />
        </ClientEstimateDataProvider>
      </SalesOrderTheme>
    </OrganizationLocalizationProvider>
  </OrganizationDetailsProvider>;
}
