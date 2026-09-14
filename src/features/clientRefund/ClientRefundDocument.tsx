import BusinessAndClientInfo from "@/features/components/boq/BuisinessAndClientInfo";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { formatDateBasedOnOrganizationLocalization, formatNumberITL, formatSeedValues, formatToCamelCaseWithAmpersand, getLocalizationValue } from "@/lib/helpers";
import { roundNumber } from "@/utils/numbers";
import { Box, Button, Divider, GlobalStyles, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PublicClientRefund } from "./types";

export const ClientRefundDocument = ({ refund }: { refund: PublicClientRefund }) => {
  const { t } = useTranslation();
  const { localizationValue } = useOrganizationLocalization();
  const currency = getLocalizationValue(localizationValue, "CURRENCY", "SYMBOL") ?? "";
  const amount = (value?: number) => `${currency}${formatNumberITL(localizationValue, roundNumber(value ?? 0))}`;
  const date = (value?: number) => value ? formatDateBasedOnOrganizationLocalization(localizationValue, value, true) : "-";
  const method = (value?: string) => value ? t(`paymentType.${formatSeedValues(value)}`, { defaultValue: formatSeedValues(value) }) : "-";
  const status = (value?: string) => value ? t(`common.${formatSeedValues(value)}`, { defaultValue: formatSeedValues(value) }) : "-";
  const against = refund.refundAgainst ? formatSeedValues(refund.refundAgainst) : "";

  return <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
    <GlobalStyles styles={{ "@media print": { ".refund-screen-actions": { display: "none !important" }, ".refund-sheet": { boxShadow: "none !important", margin: "0 !important", maxWidth: "none !important" } } }} />
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ px: { xs: 2, sm: 3 }, py: 2, bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
      <Box>
        <Typography variant="body1" fontWeight={500}>{refund.invoiceName || t("common.refundDetails")}</Typography>
        <Typography variant="body2">{refund.refundSerial}</Typography>
      </Box>
      <Stack direction="row" spacing={1} alignItems="center" className="refund-screen-actions">
        <Button variant="outlined" startIcon={<Printer size={16} />} onClick={() => window.print()}>{t("clientInvoice.printOrSavePdf")}</Button>
        <LanguageSwitcher />
      </Stack>
    </Stack>

    <Box className="refund-sheet" sx={{ maxWidth: 1100, mx: "auto", my: { xs: 0, sm: 3 }, bgcolor: "background.paper", boxShadow: { sm: 1 }, p: { xs: 2, sm: 4 } }}>
      <Stack spacing={3}>
        <BusinessAndClientInfo type="CLIENT" projectId={refund.receiverId} organizationId={refund.senderId} withAuth={false} Display={false} isPreview />
        <Typography variant="body1" fontWeight={500}>{refund.refundSerial}{refund.thirdPartyRefundSerial ? ` (${refund.thirdPartyRefundSerial})` : ""}</Typography>
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>{t("common.refundDetails")}</Typography>
          <TableContainer><Table size="small">
            <TableHead><TableRow>
              <TableCell>{t("common.refundSerial")}</TableCell>
              <TableCell>{t("common.paymentMethod")}</TableCell>
              <TableCell>{t("common.refundAgainst")}</TableCell>
              <TableCell align="right">{t("common.refundAmount")}</TableCell>
              <TableCell>{t("common.refundStatus")}</TableCell>
            </TableRow></TableHead>
            <TableBody><TableRow>
              <TableCell>{refund.refundSerial ?? "-"}</TableCell>
              <TableCell>{method(refund.paymentMethod)}</TableCell>
              <TableCell>{against ? t(`moneyMatters.${formatToCamelCaseWithAmpersand(against)}`, { defaultValue: against }) : "-"}</TableCell>
              <TableCell align="right">{amount(refund.refundAmount)}</TableCell>
              <TableCell>{status(refund.refundStatus)}</TableCell>
            </TableRow></TableBody>
          </Table></TableContainer>
        </Box>

        {refund.refundReason && <Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>{t("common.refundReason")}</Typography>
          <Typography variant="body2">{refund.refundReason}</Typography>
        </Box>}

        {Array.isArray(refund.receiptDetails) && refund.receiptDetails.length > 0 && <Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>{t("common.receiptDetails")}</Typography>
          <TableContainer><Table size="small">
            <TableHead><TableRow>
              <TableCell>{t("common.serialNumber")}</TableCell>
              <TableCell>{t("common.paymentMethod")}</TableCell>
              <TableCell>{t("common.status")}</TableCell>
              <TableCell align="right">{t("common.refundAmount")}</TableCell>
              <TableCell>{t("common.date")}</TableCell>
            </TableRow></TableHead>
            <TableBody>{refund.receiptDetails.map((receipt, index) => <TableRow key={`${receipt.receiptSerial ?? "receipt"}-${index}`}>
              <TableCell>{receipt.receiptSerial ?? "-"}{receipt.thirdPartyReceiptSerial ? ` (${receipt.thirdPartyReceiptSerial})` : ""}</TableCell>
              <TableCell>{method(receipt.modeOfPayment)}</TableCell>
              <TableCell>{status(receipt.paymentStatus === "PAID" ? "REFUNDED" : receipt.paymentStatus)}</TableCell>
              <TableCell align="right">{amount(refund.refundAmount)}</TableCell>
              <TableCell>{date(receipt.paidOn)}</TableCell>
            </TableRow>)}</TableBody>
          </Table></TableContainer>
        </Box>}

        {Array.isArray(refund.creditNoteDetails) && refund.creditNoteDetails.length > 0 && <Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>{t("common.creditNoteDetails")}</Typography>
          <TableContainer><Table size="small">
            <TableHead><TableRow>
              <TableCell>{t("common.serialNumber")}</TableCell>
              <TableCell align="right">{t("common.amount")}</TableCell>
              <TableCell>{t("common.status")}</TableCell>
              <TableCell>{t("common.date")}</TableCell>
            </TableRow></TableHead>
            <TableBody>{refund.creditNoteDetails.map((creditNote, index) => <TableRow key={`${creditNote.serial ?? "credit-note"}-${index}`}>
              <TableCell>{creditNote.serial ?? "-"}{creditNote.thirdPartyCreditNoteSerial ? ` (${creditNote.thirdPartyCreditNoteSerial})` : ""}</TableCell>
              <TableCell align="right">{amount((Number(creditNote.subTotal) || 0) + (Number(creditNote.taxAmount) || 0))}</TableCell>
              <TableCell>{t("common.refunded")}</TableCell>
              <TableCell>{date(creditNote.createdAt)}</TableCell>
            </TableRow>)}</TableBody>
          </Table></TableContainer>
        </Box>}
      </Stack>
    </Box>
  </Box>;
};
