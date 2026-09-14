import { PlateContentStatic } from "@/components/PlateContentStatic";
import BusinessAndClientInfo from "@/features/components/boq/BuisinessAndClientInfo";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import { useReceiptTerms } from "@/features/clientReceipt/api/useReceiptTerms";
import type { ClientReceiptResult } from "@/features/clientReceipt/types";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { formatDateBasedOnOrganizationLocalization, formatNumberITL, formatSeedValues, getLocalizationValue } from "@/lib/helpers";
import { Box, Button, Chip, Divider, GlobalStyles, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { Printer } from "lucide-react";
import { useTranslation } from "react-i18next";

export const ReceiptDocument = ({ data, vendor = false }: { data: ClientReceiptResult; vendor?: boolean }) => {
  const { t } = useTranslation();
  const { localizationValue } = useOrganizationLocalization();
  const { data: terms } = useReceiptTerms(data.receipt.senderId);
  const { receipt, paymentRows, invoicePayments, refunds } = data;
  const currency = getLocalizationValue(localizationValue, "CURRENCY", "SYMBOL") ?? "";
  const amount = (value?: number) => `${currency}${formatNumberITL(localizationValue, Number(value) || 0)}`;
  const date = (value?: number) => value ? formatDateBasedOnOrganizationLocalization(localizationValue, value, true) : "-";
  const paymentMethod = (value?: string) => value
    ? t(`paymentType.${formatSeedValues(value)}`, { defaultValue: formatSeedValues(value) })
    : "-";
  const status = (value?: string) => value
    ? t(`paymentStatus.${formatSeedValues(value)}`, { defaultValue: formatSeedValues(value) })
    : "-";
  const receiptStatus = String(receipt.paymentStatus ?? "").toUpperCase();
  const totalPaid = invoicePayments.reduce((sum, payment) => sum + (Number(payment.amountPaid) || 0), 0)
    + (Number(receipt.unAppliedAmount) || 0);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <GlobalStyles styles={{ "@media print": { ".receipt-screen-actions": { display: "none !important" }, ".receipt-sheet": { boxShadow: "none !important", margin: "0 !important", maxWidth: "none !important" } } }} />
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ px: { xs: 2, sm: 3 }, py: 2, bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
        <Box>
          <Typography variant="body1" fontWeight={500}>{t("common.receiptDetails")}</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">{receipt.receiptSerial}</Typography>
            {(receiptStatus === "REFUNDED" || receiptStatus === "VOIDED") && <Chip size="small" variant="outlined" label={status(receiptStatus)} />}
          </Stack>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" className="receipt-screen-actions">
          <Button variant="outlined" startIcon={<Printer size={16} />} onClick={() => window.print()}>{t("clientInvoice.printOrSavePdf")}</Button>
          <LanguageSwitcher />
        </Stack>
      </Stack>

      <Box className="receipt-sheet" sx={{ maxWidth: 1100, mx: "auto", my: { xs: 0, sm: 3 }, bgcolor: "background.paper", boxShadow: { sm: 1 }, p: { xs: 2, sm: 4 } }}>
        <Stack spacing={3}>
          <BusinessAndClientInfo type="CLIENT" projectId={receipt.receiverId} organizationId={receipt.senderId} withAuth={false} vendor={vendor} Display={false} isPreview />
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="body1" fontWeight={500}>{receipt.receiptSerial}{receipt.thirdPartyReceiptSerial ? ` (${receipt.thirdPartyReceiptSerial})` : ""}</Typography>
              <Typography variant="body2">{t("common.paidVia")}: {paymentMethod(receipt.modeOfPayment)}</Typography>
            </Box>
            <Box sx={{ textAlign: { sm: "right" } }}>
              <Typography variant="body2">{t("common.issuedDate")}: {date(receipt.paidOn)}</Typography>
              <Typography variant="h6" color="success.main">{t("common.totalPaid")}: {amount(totalPaid)}</Typography>
            </Box>
          </Stack>

          <Box>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
              {paymentRows.length > 0 && <Typography variant="body1" fontWeight={600}>{t("common.paymentDetails")}</Typography>}
              <Typography variant="body2" fontWeight={600}>{t("common.unAppliedAmount")}: {amount(receipt.unAppliedAmount)}</Typography>
            </Stack>
            {paymentRows.length > 0 && <TableContainer>
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell>{t("reports.invoiceSerial")}</TableCell>
                  <TableCell>{t("common.paymentType")}</TableCell>
                  <TableCell>{t("common.paidOn")}</TableCell>
                  <TableCell align="right">{t("common.amount")}</TableCell>
                  <TableCell>{t("common.paymentTerms")}</TableCell>
                  <TableCell>{t("common.dueDate")}</TableCell>
                  {receiptStatus !== "REFUNDED" && receiptStatus !== "VOIDED" && <TableCell>{t("common.status")}</TableCell>}
                </TableRow></TableHead>
                <TableBody>{paymentRows.map((row, index) => <TableRow key={`${row.invoiceSerial ?? "invoice"}-${index}`}>
                  <TableCell>{row.invoiceSerial ?? "-"}{row.thirdPartyInvoiceSerial ? ` (${row.thirdPartyInvoiceSerial})` : ""}</TableCell>
                  <TableCell>{row.paymentName === "MANUALLY ADDED PAYMENT" ? t("common.MANUALLY ADDED PAYMENT") : row.paymentName}</TableCell>
                  <TableCell>{date(row.paidOn)}</TableCell>
                  <TableCell align="right">{amount(row.amount)}</TableCell>
                  <TableCell>{formatSeedValues(row.paymentTerms)}</TableCell>
                  <TableCell>{date(row.dueDate)}</TableCell>
                  {receiptStatus !== "REFUNDED" && receiptStatus !== "VOIDED" && <TableCell>{status(row.paymentStatus)}</TableCell>}
                </TableRow>)}</TableBody>
              </Table>
            </TableContainer>}
          </Box>

          {invoicePayments.length > 0 && <Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>{t("common.linkedInvoices")}</Typography>
            <TableContainer><Table size="small">
              <TableHead><TableRow>
                <TableCell>{t("common.invoiceNumber")}</TableCell>
                <TableCell align="right">{t("common.amountApplied")}</TableCell>
                <TableCell align="right">{t("common.balanceAmount")}</TableCell>
                <TableCell>{t("common.sentBy")}</TableCell>
                <TableCell>{t("common.paidOn")}</TableCell>
              </TableRow></TableHead>
              <TableBody>{invoicePayments.map((payment, index) => <TableRow key={`${payment.invoiceSerial ?? "invoice"}-${index}`}>
                <TableCell>{payment.invoiceSerial ?? "-"}{payment.thirdPartyInvoiceSerial || payment.invoicePaymentSchedules?.[0]?.thirdPartyInvoiceSerial ? ` (${payment.thirdPartyInvoiceSerial || payment.invoicePaymentSchedules?.[0]?.thirdPartyInvoiceSerial})` : ""}</TableCell>
                <TableCell align="right">{amount(payment.amountPaid)}</TableCell>
                <TableCell align="right">{amount(payment.invoiceBalanceAmount)}</TableCell>
                <TableCell>{payment.createdBy ?? "-"}</TableCell>
                <TableCell>{date(payment.paidOn)}</TableCell>
              </TableRow>)}</TableBody>
            </Table></TableContainer>
          </Box>}

          {refunds.length > 0 && <Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>{t("common.refundDetails")}</Typography>
            <TableContainer><Table size="small">
              <TableHead><TableRow>
                <TableCell>{t("common.refundSerial")}</TableCell>
                <TableCell align="right">{t("common.refundAmount")}</TableCell>
                <TableCell>{t("common.paymentMethod")}</TableCell>
                <TableCell>{t("common.refundStatus")}</TableCell>
                <TableCell>{t("common.refundedDate")}</TableCell>
              </TableRow></TableHead>
              <TableBody>{refunds.map((refund, index) => <TableRow key={`${refund.refundSerial ?? "refund"}-${index}`}>
                <TableCell>{refund.refundSerial ?? "-"}{refund.thirdPartyRefundSerial ? ` (${refund.thirdPartyRefundSerial})` : ""}</TableCell>
                <TableCell align="right">{amount(refund.refundAmount)}</TableCell>
                <TableCell>{paymentMethod(refund.paymentMethod)}</TableCell>
                <TableCell>{status(refund.refundStatus)}</TableCell>
                <TableCell>{date(refund.createdAt)}</TableCell>
              </TableRow>)}</TableBody>
            </Table></TableContainer>
          </Box>}

          {terms && terms.length > 0 && <Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>{t("common.termsAndConditions")}</Typography>
            <PlateContentStatic value={terms} />
          </Box>}
        </Stack>
      </Box>
    </Box>
  );
};
