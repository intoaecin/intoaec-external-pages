import { OrganizationDetailsProvider } from "@/features/components/providers/OrganizationThemeProvider";
import { QuestionnairePageContent } from "@/pages/leadQuestionnaireCapture/[questionnaireId]";

export default function LeadQuestionnairePreviewPage() {
  return <OrganizationDetailsProvider><QuestionnairePageContent isPreview /></OrganizationDetailsProvider>;
}
