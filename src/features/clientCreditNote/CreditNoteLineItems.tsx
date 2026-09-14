import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { Box, Divider, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { creditNoteAmount } from "./formatCreditNote";
import type { PublicCreditNote } from "./types";

export const CreditNoteLineItems = ({ creditNote }: { creditNote: PublicCreditNote }) => {
  const { t } = useTranslation();
  const { localizationValue } = useOrganizationLocalization();
  return (
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table size="small" sx={{ minWidth: 620 }}>
        <TableHead><TableRow>
          <TableCell>{t("common.name")}</TableCell>
          <TableCell align="right">{t("common.quantity")}</TableCell>
          <TableCell align="right">{t("common.rate")}</TableCell>
          <TableCell align="right">{t("common.tax")}</TableCell>
          <TableCell align="right">{t("common.amount")}</TableCell>
        </TableRow></TableHead>
        <TableBody>{(creditNote.creditNoteLineItems ?? []).map((item, index) => (
          <TableRow key={item.creditNoteLineItemId ?? index}>
            <TableCell>
              <Typography variant="body2" fontWeight={500}>{item.itemName}</Typography>
              {item.itemDescription && <Typography variant="caption" color="text.secondary">{item.itemDescription}</Typography>}
            </TableCell>
            <TableCell align="right">{item.quantity ?? 0}</TableCell>
            <TableCell align="right">{creditNoteAmount(creditNote, item.price, localizationValue)}</TableCell>
            <TableCell align="right">{item.taxPercentage ?? 0}%</TableCell>
            <TableCell align="right">{creditNoteAmount(creditNote, item.totalAmount, localizationValue)}</TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    </TableContainer>
  );
};

export const CreditNoteTotals = ({ creditNote }: { creditNote: PublicCreditNote }) => {
  const { t } = useTranslation();
  const { localizationValue } = useOrganizationLocalization();
  const refundedAmount = Number(creditNote.subTotal ?? 0) + Number(creditNote.taxAmount ?? 0) - Number(creditNote.totalAmount ?? 0);
  const rows = [
    { label: t("common.subTotal"), amount: creditNote.subTotal },
    { label: t("common.totalTax"), amount: creditNote.taxAmount },
    ...(creditNote.status === "REFUNDED" ? [{ label: t("common.totalRefund"), amount: refundedAmount }] : []),
  ];
  return (
    <Box sx={{ width: { xs: "100%", sm: 340 }, ml: "auto", bgcolor: "background.default", border: 1, borderColor: "divider", borderRadius: 1, p: 2 }}>
      <Stack spacing={1}>
        {rows.map((row) => <Stack key={row.label} direction="row" justifyContent="space-between"><Typography variant="body2">{row.label}</Typography><Typography variant="body2">{creditNoteAmount(creditNote, row.amount, localizationValue)}</Typography></Stack>)}
        <Divider />
        <Stack direction="row" justifyContent="space-between"><Typography variant="body2" fontWeight={500}>{t("common.totalAmount")}</Typography><Typography variant="body2" fontWeight={500}>{creditNoteAmount(creditNote, creditNote.totalAmount, localizationValue)}</Typography></Stack>
        <Stack direction="row" justifyContent="space-between"><Typography variant="body2" fontWeight={500}>{t("common.balanceAmount")}</Typography><Typography variant="body2" fontWeight={500}>{creditNoteAmount(creditNote, creditNote.unappliedAmount, localizationValue)}</Typography></Stack>
      </Stack>
    </Box>
  );
};
