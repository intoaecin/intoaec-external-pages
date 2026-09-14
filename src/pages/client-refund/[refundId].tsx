import FallbackExternalPage from "@/components/FallbackExternalPage";
import PageLoader from "@/features/components/Loader/PageLoader";
import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import { useClientRefund } from "@/features/clientRefund/api/useClientRefund";
import { ClientRefundDocument } from "@/features/clientRefund/ClientRefundDocument";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export default function ClientRefundPage() {
  const { refundId } = useParams<{ refundId: string }>();
  const { t } = useTranslation();
  const { data, isLoading } = useClientRefund(refundId);
  if (isLoading) return <PageLoader />;
  if (!data || !refundId || !data.senderId || !data.receiverId) return <FallbackExternalPage title={t("externalFallback.clientRefund.title")} description={t("externalFallback.clientRefund.description")} />;
  return <OrganizationLocalizationProvider organizationId={data.senderId} organizationType={data.senderType || "AEC"} isAuth={false}>
    <ClientRefundDocument refund={data} />
  </OrganizationLocalizationProvider>;
}
