import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { invoiceAmount, invoiceDate } from "./formatInvoice";
import type { InvoiceCreditNote, InvoicePayment, PublicInvoice } from "./types";

export const InvoicePaymentHistory = ({ invoice, payments, credits }: { invoice: PublicInvoice; payments: InvoicePayment[]; credits: InvoiceCreditNote[] }) => {
  const { t } = useTranslation();
  const { localizationValue } = useOrganizationLocalization();
  if (!payments.length && !credits.length) return null;
  return (
    <Box>
      {credits.length > 0 && <Box sx={{ mb: 3 }}>
        <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>{t("moneyMatters.appliedCreditNotes")}</Typography>
        <TableContainer><Table size="small"><TableHead><TableRow><TableCell>{t("moneyMatters.creditNoteSerial")}</TableCell><TableCell align="right">{t("common.amount")}</TableCell></TableRow></TableHead>
          <TableBody>{credits.map((credit, index) => <TableRow key={credit.invoiceCreditNoteId ?? index}><TableCell>{credit.creditNoteSerial ?? "–"}</TableCell><TableCell align="right">{invoiceAmount(invoice, credit.appliedAmount ?? credit.amount, localizationValue)}</TableCell></TableRow>)}</TableBody>
        </Table></TableContainer>
      </Box>}
      {payments.length > 0 && <Box>
        <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>{t("moneyMatters.paymentsMade")}</Typography>
        <TableContainer><Table size="small"><TableHead><TableRow><TableCell>{t("moneyMatters.receiptSerial")}</TableCell><TableCell align="right">{t("moneyMatters.amountPaid")}</TableCell><TableCell align="right">{t("common.paidOn")}</TableCell></TableRow></TableHead>
          <TableBody>{payments.map((payment, index) => <TableRow key={`${payment.receiptSerial ?? "payment"}-${index}`}><TableCell>{payment.receiptSerial ?? "–"}{payment.thirdPartyReceiptSerial ? ` (${payment.thirdPartyReceiptSerial})` : ""}</TableCell><TableCell align="right">{invoiceAmount(invoice, payment.amountPaid, localizationValue)}</TableCell><TableCell align="right">{invoiceDate(payment.paidOn ?? payment.createdAt ?? payment.updatedAt, localizationValue)}</TableCell></TableRow>)}</TableBody>
        </Table></TableContainer>
      </Box>}
    </Box>
  );
};
