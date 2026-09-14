import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { invoiceAmount, invoiceDate, paymentTermKey } from "./formatInvoice";
import type { InvoicePayment, PublicInvoice } from "./types";

export const InvoicePaymentTerms = ({
  invoice,
  payments,
}: {
  invoice: PublicInvoice;
  payments: InvoicePayment[];
}) => {
  const { t } = useTranslation();
  const { localizationValue } = useOrganizationLocalization();
  if (invoice.invoiceMode === "CASH" || invoice.showPaymentTerms === false || !invoice.invoicePaymentTerms?.length) return null;

  let remainingPaid = payments
    .filter((payment) => ["PAID", "SUCCESS"].includes(String(payment.paymentStatus ?? "").toUpperCase()))
    .reduce((sum, payment) => sum + Number(payment.amountPaid ?? 0), 0);

  const rows = invoice.invoicePaymentTerms.map((term, index) => {
    const amount = Number(term.amount ?? 0);
    const allocatedPaid = Math.min(amount, remainingPaid);
    remainingPaid = Math.max(0, remainingPaid - allocatedPaid);
    const explicitStatus = String(term.paymentTermStatus ?? term.paymentSchedulestatus ?? "").toUpperCase();
    const status = term.isPaid || explicitStatus === "PAID" || (amount > 0 && allocatedPaid >= amount)
      ? "paid"
      : explicitStatus === "PARTIALLY_PAID" || explicitStatus === "PARTIALLY PAID" || (allocatedPaid > 0 && allocatedPaid < amount)
        ? "partial"
        : "awaiting";
    return { term, index, status };
  });

  return (
    <Box>
      <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>{t("common.paymentTerms")}</Typography>
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 650 }}>
          <TableHead><TableRow>
            <TableCell>{t("common.paymentName")}</TableCell>
            <TableCell align="right">{t("common.amount")}</TableCell>
            <TableCell>{t("common.paymentTerms")}</TableCell>
            <TableCell>{t("common.dueDate")}</TableCell>
            <TableCell>{t("common.status")}</TableCell>
          </TableRow></TableHead>
          <TableBody>{rows.map(({ term, index, status }) => (
            <TableRow key={paymentTermKey(term, index)}>
              <TableCell>{term.paymentName}</TableCell>
              <TableCell align="right">{invoiceAmount(invoice, term.amount, localizationValue)}</TableCell>
              <TableCell>{term.paymentTerms?.replaceAll("_", " ") ?? "–"}</TableCell>
              <TableCell>{invoiceDate(term.paymentScheduleDueDate, localizationValue)}</TableCell>
              <TableCell><Chip size="small" variant="outlined" color={status === "paid" ? "success" : status === "partial" ? "warning" : "primary"} label={t(status === "paid" ? "common.paid" : status === "partial" ? "common.partiallyPaid" : "common.awaitingPayment")} /></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
