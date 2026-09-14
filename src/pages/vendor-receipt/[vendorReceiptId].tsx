import FallbackExternalPage from "@/components/FallbackExternalPage";
import PageLoader from "@/features/components/Loader/PageLoader";
import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import { useVendorReceipt } from "@/features/clientReceipt/api/useVendorReceipt";
import { ReceiptDocument } from "@/features/clientReceipt/ReceiptDocument";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export default function VendorReceiptPage() {
  const { vendorReceiptId } = useParams<{ vendorReceiptId: string }>();
  const { t } = useTranslation();
  const { data, isLoading } = useVendorReceipt(vendorReceiptId);
  if (isLoading) return <PageLoader />;
  if (!data || !vendorReceiptId || !data.receipt.senderId || !data.receipt.receiverId) return <FallbackExternalPage title={t("externalFallback.vendorReceipt.title")} description={t("externalFallback.vendorReceipt.description")} />;
  return <OrganizationLocalizationProvider organizationId={data.receipt.receiverId} organizationType="AEC" isAuth={false}>
    <ReceiptDocument data={data} vendor />
  </OrganizationLocalizationProvider>;
}
