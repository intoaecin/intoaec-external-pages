import PageLoader from "@/features/components/Loader/PageLoader";
import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import { OrganizationDetailsProvider, useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import QuestionnaireCapture from "@/features/questionnaireCapture/QuestionnaireCapture";
import { useParams } from "react-router-dom";

export const QuestionnairePageContent = ({ isPreview = false }: { isPreview?: boolean }) => {
  const { questionnaireId } = useParams<{ questionnaireId: string }>();
  const { loading, organizationId, organizationType } = useOrganization();
  if (loading || !organizationId) return <PageLoader />;
  return (
    <OrganizationLocalizationProvider organizationId={organizationId} organizationType={organizationType}>
      <QuestionnaireCapture questionnaireId={questionnaireId} organizationId={organizationId} isPreview={isPreview} />
    </OrganizationLocalizationProvider>
  );
};

export default function LeadQuestionnaireCapturePage() {
  return <OrganizationDetailsProvider><QuestionnairePageContent /></OrganizationDetailsProvider>;
}
