import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { Box, Divider, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { invoiceAmount } from "./formatInvoice";
import type { PublicInvoice } from "./types";

export const InvoiceTotals = ({ invoice }: { invoice: PublicInvoice }) => {
  const { t } = useTranslation();
  const { localizationValue } = useOrganizationLocalization();
  const rows = [
    { label: t("common.subTotal"), value: invoice.subTotal },
    ...(invoice.isDiscountApplied && invoice.discountAmount ? [{ label: t("common.discount"), value: invoice.discountAmount }] : []),
    { label: t("common.totalTax"), value: invoice.taxAmount },
  ];
  return (
    <Box sx={{ width: { xs: "100%", sm: 340 }, ml: "auto", bgcolor: "background.default", border: 1, borderColor: "divider", borderRadius: 1, p: 2 }}>
      <Stack spacing={1}>
        {rows.map((row) => <Stack direction="row" justifyContent="space-between" key={row.label}><Typography variant="body2">{row.label}</Typography><Typography variant="body2">{invoiceAmount(invoice, row.value, localizationValue)}</Typography></Stack>)}
        <Divider />
        <Stack direction="row" justifyContent="space-between"><Typography variant="body2" fontWeight={500}>{t("common.totalAmount")}</Typography><Typography variant="body2" fontWeight={500}>{invoiceAmount(invoice, invoice.totalAmount, localizationValue)}</Typography></Stack>
        <Stack direction="row" justifyContent="space-between"><Typography variant="body2" fontWeight={500}>{t("common.balanceAmount")}</Typography><Typography variant="body2" fontWeight={500}>{invoiceAmount(invoice, invoice.balanceAmount, localizationValue)}</Typography></Stack>
      </Stack>
    </Box>
  );
};
