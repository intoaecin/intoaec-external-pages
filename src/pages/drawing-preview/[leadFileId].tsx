import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import FallbackExternalPage from "@/components/FallbackExternalPage";
import PageLoader from "@/features/components/Loader/PageLoader";
import {
  OrganizationDetailsProvider,
  useOrganization,
} from "@/features/components/providers/OrganizationThemeProvider";
import { useSharedDrawing } from "@/features/drawingPreview/api/useSharedDrawing";
import { DrawingPreview } from "@/features/drawingPreview/DrawingPreview";

/** `/drawing-preview/:leadFileId` — the link emailed to the client when a drawing is shared. */
const SharedDrawingPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { loading: organizationLoading } = useOrganization();
  const leadFileId = router.query?.leadFileId as string | undefined;
  const { data: drawing, isLoading, isError } = useSharedDrawing(leadFileId);

  if (organizationLoading || isLoading) return <PageLoader />;
  if (isError || !drawing) {
    return (
      <FallbackExternalPage
        title={t("drawingPreview.notFoundTitle")}
        description={t("drawingPreview.notFoundDescription")}
      />
    );
  }
  return <DrawingPreview drawing={drawing} />;
};

const DrawingPreviewExternalPage = () => (
  <OrganizationDetailsProvider>
    <SharedDrawingPage />
  </OrganizationDetailsProvider>
);

export default DrawingPreviewExternalPage;
