import FallbackExternalPage from "@/components/FallbackExternalPage";
import PageLoader from "@/features/components/Loader/PageLoader";
import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import { useClientReceipt } from "@/features/clientReceipt/api/useClientReceipt";
import { ReceiptDocument } from "@/features/clientReceipt/ReceiptDocument";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export default function ClientReceiptPage() {
  const { clientReceiptId } = useParams<{ clientReceiptId: string }>();
  const { t } = useTranslation();
  const { data, isLoading } = useClientReceipt(clientReceiptId);
  if (isLoading) return <PageLoader />;
  if (!data || !clientReceiptId || !data.receipt.senderId || !data.receipt.receiverId) return <FallbackExternalPage title={t("externalFallback.clientReceipt.title")} description={t("externalFallback.clientReceipt.description")} />;
  return <OrganizationLocalizationProvider organizationId={data.receipt.senderId} organizationType="AEC" isAuth={false}>
    <ReceiptDocument data={data} />
  </OrganizationLocalizationProvider>;
}
