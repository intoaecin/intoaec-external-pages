import { PlateContentStatic } from "@/components/PlateContentStatic";
import FallbackExternalPage from "@/components/FallbackExternalPage";
import BusinessAndClientInfo from "@/features/components/boq/BuisinessAndClientInfo";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import PageLoader from "@/features/components/Loader/PageLoader";
import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import { useClientCreditNote } from "@/features/clientCreditNote/api/useClientCreditNote";
import { CreditNoteLineItems, CreditNoteTotals } from "@/features/clientCreditNote/CreditNoteLineItems";
import { CreditNoteReferences } from "@/features/clientCreditNote/CreditNoteReferences";
import { creditNoteDate } from "@/features/clientCreditNote/formatCreditNote";
import type { PublicCreditNote } from "@/features/clientCreditNote/types";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { Box, Button, Chip, Divider, GlobalStyles, Stack, Typography } from "@mui/material";
import { Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

const CreditNoteDocument = ({ creditNote }: { creditNote: PublicCreditNote }) => {
  const { t } = useTranslation();
  const { localizationValue } = useOrganizationLocalization();
  const status = String(creditNote.status ?? "").toUpperCase().replace(/\s+/g, "_");
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <GlobalStyles styles={{ "@media print": { ".credit-note-screen-actions": { display: "none !important" }, ".credit-note-sheet": { boxShadow: "none !important", margin: "0 !important", maxWidth: "none !important" } } }} />
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ px: { xs: 2, sm: 3 }, py: 2, bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
        <Box>
          <Typography variant="body1" fontWeight={500}>{creditNote.invoiceName ?? t("clientCreditNote.title")}</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">{creditNote.serial}</Typography>
            {status && <Chip size="small" variant="outlined" color={status === "REFUNDED" || status === "APPLIED" ? "success" : "default"} label={t(`clientCreditNote.status.${status}`, { defaultValue: status.replaceAll("_", " ") })} />}
          </Stack>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" className="credit-note-screen-actions">
          <Button variant="outlined" startIcon={<Printer size={16} />} onClick={() => window.print()}>{t("clientInvoice.printOrSavePdf")}</Button>
          <LanguageSwitcher />
        </Stack>
      </Stack>
      <Box className="credit-note-sheet" sx={{ maxWidth: 1100, mx: "auto", my: { xs: 0, sm: 3 }, bgcolor: "background.paper", boxShadow: { sm: 1 }, p: { xs: 2, sm: 4 } }}>
        <Stack spacing={3}>
          <BusinessAndClientInfo type="CLIENT" projectId={creditNote.receiverId} organizationId={creditNote.senderId} withAuth={false} Display={false} isPreview />
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
            <Typography variant="body1" fontWeight={500}>{creditNote.serial}{creditNote.thirdPartyCreditNoteSerial ? ` (${creditNote.thirdPartyCreditNoteSerial})` : ""}</Typography>
            <Typography variant="body2">{t("common.issuedDate")}: {creditNoteDate(creditNote.createdAt, localizationValue)}</Typography>
          </Stack>
          <CreditNoteLineItems creditNote={creditNote} />
          <CreditNoteTotals creditNote={creditNote} />
          <Divider />
          {Array.isArray(creditNote.termsAndConditionData) && creditNote.termsAndConditionData.length > 0 && <Box>
            <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>{t("common.termsAndConditions")}</Typography>
            <PlateContentStatic value={creditNote.termsAndConditionData} />
          </Box>}
          <CreditNoteReferences creditNote={creditNote} />
        </Stack>
      </Box>
    </Box>
  );
};

export default function ClientCreditNotePage() {
  const { creditNoteId } = useParams<{ creditNoteId: string }>();
  const { t } = useTranslation();
  const { data, isLoading } = useClientCreditNote(creditNoteId);
  if (isLoading) return <PageLoader />;
  if (!data || !creditNoteId || !data.senderId) return <FallbackExternalPage title={t("externalFallback.creditNote.title")} description={t("externalFallback.creditNote.description")} />;
  return (
    <OrganizationLocalizationProvider organizationId={data.senderId} organizationType={data.senderType} isAuth={false}>
      <CreditNoteDocument creditNote={data} />
    </OrganizationLocalizationProvider>
  );
}
