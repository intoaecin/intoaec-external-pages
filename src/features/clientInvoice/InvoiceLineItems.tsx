import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { invoiceAmount } from "./formatInvoice";
import type { PublicInvoice } from "./types";

export const InvoiceLineItems = ({ invoice }: { invoice: PublicInvoice }) => {
  const { t } = useTranslation();
  const { localizationValue } = useOrganizationLocalization();
  return (
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table size="small" sx={{ minWidth: 620 }}>
        <TableHead><TableRow>
          <TableCell>{t("common.description")}</TableCell>
          <TableCell align="right">{t("common.quantity")}</TableCell>
          <TableCell align="right">{t("common.rate")}</TableCell>
          <TableCell align="right">{t("common.tax")}</TableCell>
          <TableCell align="right">{t("common.amount")}</TableCell>
        </TableRow></TableHead>
        <TableBody>
          {(invoice.invoiceLineItems ?? []).map((item, index) => (
            <TableRow key={item.invoiceLineItemId ?? index}>
              <TableCell><Typography variant="body2" fontWeight={500}>{item.itemName}</Typography>{item.itemDescription && <Typography variant="caption" color="text.secondary">{item.itemDescription}</Typography>}</TableCell>
              <TableCell align="right">{item.quantity ?? 0}</TableCell>
              <TableCell align="right">{invoiceAmount(invoice, item.price, localizationValue)}</TableCell>
              <TableCell align="right">{item.taxPercentage ?? 0}%</TableCell>
              <TableCell align="right">{invoiceAmount(invoice, item.TotalAmount, localizationValue)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {(invoice.invoiceLineItems?.length ?? 0) === 0 && <Box sx={{ p: 2 }}><Typography variant="body2" color="text.secondary">{t("clientInvoice.noLineItems")}</Typography></Box>}
    </TableContainer>
  );
};
