import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { formatSeedValues } from "@/lib/helpers";
import { creditNoteAmount, creditNoteDate } from "./formatCreditNote";
import type { PublicCreditNote } from "./types";

export const CreditNoteReferences = ({ creditNote }: { creditNote: PublicCreditNote }) => {
  const { t } = useTranslation();
  const { localizationValue } = useOrganizationLocalization();
  const invoices = creditNote.invoiceCreditNotes ?? [];
  const refunds = creditNote.creditNoteRefunds ?? [];
  return (
    <>
      {invoices.length > 0 && <Box>
        <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>{t("common.linkedInvoices")}</Typography>
        <TableContainer sx={{ overflowX: "auto" }}><Table size="small" sx={{ minWidth: 480 }}>
          <TableHead><TableRow><TableCell>{t("common.invoiceNumber")}</TableCell><TableCell align="right">{t("common.amountApplied")}</TableCell><TableCell align="right">{t("common.linkedDate")}</TableCell></TableRow></TableHead>
          <TableBody>{invoices.map((invoice, index) => <TableRow key={invoice.invoiceCreditNoteId ?? index}>
            <TableCell>{invoice.invoiceSerial}{invoice.thirdPartyInvoiceSerial ? ` (${invoice.thirdPartyInvoiceSerial})` : ""}</TableCell>
            <TableCell align="right">{creditNoteAmount(creditNote, invoice.amountApplied, localizationValue)}</TableCell>
            <TableCell align="right">{creditNoteDate(invoice.createdAt, localizationValue)}</TableCell>
          </TableRow>)}</TableBody>
        </Table></TableContainer>
      </Box>}
      {refunds.length > 0 && <Box>
        <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>{t("common.refundDetails")}</Typography>
        <TableContainer sx={{ overflowX: "auto" }}><Table size="small" sx={{ minWidth: 720 }}>
          <TableHead><TableRow><TableCell>{t("common.refundSerial")}</TableCell><TableCell align="right">{t("common.refundAmount")}</TableCell><TableCell>{t("common.paymentMethod")}</TableCell><TableCell>{t("common.refundStatus")}</TableCell><TableCell align="right">{t("common.refundedDate")}</TableCell></TableRow></TableHead>
          <TableBody>{refunds.map((refund, index) => {
            const method = formatSeedValues(refund.paymentMethod ?? "");
            const status = String(refund.refundStatus ?? "").toUpperCase();
            return <TableRow key={refund.refundId ?? index}>
              <TableCell>{refund.refundSerial}{refund.thirdPartyRefundSerial ? ` (${refund.thirdPartyRefundSerial})` : ""}</TableCell>
              <TableCell align="right">{creditNoteAmount(creditNote, refund.refundAmount, localizationValue)}</TableCell>
              <TableCell>{method ? t(`paymentType.${method}`, { defaultValue: method }) : "–"}</TableCell>
              <TableCell>{status ? t(`clientCreditNote.status.${status}`, { defaultValue: status.replaceAll("_", " ") }) : "–"}</TableCell>
              <TableCell align="right">{creditNoteDate(refund.createdAt, localizationValue)}</TableCell>
            </TableRow>;
          })}</TableBody>
        </Table></TableContainer>
      </Box>}
    </>
  );
};
