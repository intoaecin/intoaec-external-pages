import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PublicInvoice } from "./types";

export const InvoiceHeader = ({
  invoice,
  paymentLink,
}: {
  invoice: PublicInvoice;
  paymentLink?: string;
}) => {
  const { t } = useTranslation();
  const isPaid = invoice.invoiceStatus === "PAID" ||
    (invoice.balanceAmount !== undefined && Number(invoice.balanceAmount) <= 0);
  const canPay = Boolean(paymentLink) && invoice.invoiceMode !== "CASH" && !isPaid;

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={2}
      sx={{ px: { xs: 2, sm: 3 }, py: 2, bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}
    >
      <Box>
        <Typography variant="body1" fontWeight={500}>{invoice.invoiceName ?? t("common.invoice")}</Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2">{invoice.invoiceSerial}</Typography>
          {invoice.invoiceStatus && <Chip size="small" variant="outlined" label={t(`clientInvoice.status.${invoice.invoiceStatus.toUpperCase().replace(/\s+/g, "_")}`, { defaultValue: invoice.invoiceStatus.replaceAll("_", " ") })} color={isPaid ? "success" : "default"} />}
        </Stack>
      </Box>
      <Stack direction="row" alignItems="center" spacing={1} className="invoice-screen-actions">
        {canPay && <Button variant="contained" href={paymentLink} target="_blank" rel="noopener noreferrer">{t("common.payNow")}</Button>}
        <Button variant="outlined" startIcon={<Printer size={16} />} onClick={() => window.print()}>{t("clientInvoice.printOrSavePdf")}</Button>
        <LanguageSwitcher />
      </Stack>
    </Stack>
  );
};
