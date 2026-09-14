import FallbackExternalPage from "@/components/FallbackExternalPage";
import PageLoader from "@/features/components/Loader/PageLoader";
import BusinessAndClientInfo from "@/features/components/boq/BuisinessAndClientInfo";
import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import { useClientInvoice } from "@/features/clientInvoice/api/useClientInvoice";
import { useInvoicePaymentLinks } from "@/features/clientInvoice/api/useInvoicePaymentLinks";
import { invoiceDate } from "@/features/clientInvoice/formatInvoice";
import { InvoiceExtras } from "@/features/clientInvoice/InvoiceExtras";
import { InvoiceHeader } from "@/features/clientInvoice/InvoiceHeader";
import { InvoiceLineItems } from "@/features/clientInvoice/InvoiceLineItems";
import { InvoicePaymentHistory } from "@/features/clientInvoice/InvoicePaymentHistory";
import { InvoicePaymentTerms } from "@/features/clientInvoice/InvoicePaymentTerms";
import { InvoiceTotals } from "@/features/clientInvoice/InvoiceTotals";
import type { InvoiceResult } from "@/features/clientInvoice/types";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { Box, Divider, GlobalStyles, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

const InvoiceDocument = ({ result }: { result: InvoiceResult }) => {
  const { t } = useTranslation();
  const { localizationValue } = useOrganizationLocalization();
  const { invoice, payments, credits } = result;
  const { data: paymentLinks } = useInvoicePaymentLinks(invoice);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <GlobalStyles styles={{ "@media print": { ".invoice-screen-actions": { display: "none !important" }, ".invoice-sheet": { boxShadow: "none !important", margin: "0 !important", maxWidth: "none !important" } } }} />
      <InvoiceHeader invoice={invoice} paymentLink={paymentLinks?.overall} />
      <Box className="invoice-sheet" sx={{ maxWidth: 1100, mx: "auto", my: { xs: 0, sm: 3 }, bgcolor: "background.paper", boxShadow: { sm: 1 }, p: { xs: 2, sm: 4 } }}>
        <Stack spacing={3}>
          <BusinessAndClientInfo
            type="CLIENT"
            projectId={invoice.receiverId}
            organizationId={invoice.senderId}
            withAuth={false}
            isPreview
            isTaxDisplay={invoice.isTaxDisplay ?? true}
          />
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="body1" fontWeight={500}>{invoice.invoiceSerial}{invoice.thirdPartyInvoiceSerial ? ` (${invoice.thirdPartyInvoiceSerial})` : ""}</Typography>
              {invoice.invoiceMode && <Typography variant="body2" color="text.secondary">{invoice.invoiceMode.replaceAll("_", " ")}</Typography>}
            </Box>
            <Box>
              <Typography variant="body2">{t("common.issuedDate")}: {invoiceDate(invoice.invoiceIssuedDate, localizationValue)}</Typography>
              <Typography variant="body2">{t("common.dueDate")}: {invoiceDate(invoice.invoiceDueDate, localizationValue)}</Typography>
            </Box>
          </Stack>
          <InvoiceLineItems invoice={invoice} />
          <InvoiceTotals invoice={invoice} />
          <Divider />
          <InvoicePaymentTerms invoice={invoice} payments={payments} />
          <InvoicePaymentHistory invoice={invoice} payments={payments} credits={credits} />
          <InvoiceExtras invoice={invoice} />
        </Stack>
      </Box>
    </Box>
  );
};

export default function ClientInvoicePage() {
  const { clientInvoiceId } = useParams<{ clientInvoiceId: string }>();
  const { t } = useTranslation();
  const { data, isLoading } = useClientInvoice(clientInvoiceId);
  if (isLoading) return <PageLoader />;
  if (!data || !clientInvoiceId || !data.invoice.senderId) return <FallbackExternalPage title={t("externalFallback.clientInvoice.title")} description={t("externalFallback.clientInvoice.description")} />;
  return (
    <OrganizationLocalizationProvider organizationId={data.invoice.senderId} organizationType={data.invoice.senderType} isAuth={false}>
      <InvoiceDocument result={data} />
    </OrganizationLocalizationProvider>
  );
}
