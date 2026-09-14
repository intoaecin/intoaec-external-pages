import FallbackExternalPage from "@/components/FallbackExternalPage";
import PageLoader from "@/features/components/Loader/PageLoader";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import AnswerQuestionnaire from "./AnswerQuestionnaire";
import { QuestionnaireStatus } from "./QuestionnaireStatus";

type Props = { questionnaireId?: string; organizationId: string; isPreview?: boolean };

export default function QuestionnaireCapture({ questionnaireId, organizationId, isPreview = false }: Props) {
  const { t } = useTranslation();
  const { NEXT_PUBLIC_PROPOSAL_ENDPOINT } = useEnv();
  const { post } = useAxios(NEXT_PUBLIC_PROPOSAL_ENDPOINT + "/answer", false);
  const { data, isLoading } = useQuery({
    queryKey: ["public-questionnaire", organizationId, questionnaireId],
    queryFn: () => post({ eventType: "GET_QUESTIONNAIRE_BY_ID", questionnaireId, organizationId }),
    enabled: !!questionnaireId && !!organizationId,
    retry: false,
  });
  if (!questionnaireId || isLoading) return <PageLoader />;
  if (!isPreview && data?.code === "QUESTIONNAIRE_EXPIRED") return <QuestionnaireStatus status="expired" />;
  if (!isPreview && data?.code === "QUESTIONNAIRE_ALREADY_SUBMITTED") return <QuestionnaireStatus status="submitted" />;
  if (data?.body?.content?.length && (isPreview || data?.code === "QUESTIONNAIRE_RETRIEVED")) return <AnswerQuestionnaire answeredQuestionnaire={data.body} isPreview={isPreview} />;
  return <FallbackExternalPage title={t("questionnaire.invalidLinkTitle")} description={t("questionnaire.invalidLinkDescription")} />;
}
