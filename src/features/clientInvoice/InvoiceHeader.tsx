import DownloadIcon from "@/assets/icons/download-icon";
import { CircularProgressWithLabel } from "@/features/components/CircularProgressWIthLabel";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import { usePdfDownload } from "@/features/hooks/usePdfDownload";
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { PublicInvoice } from "./types";

export const INVOICE_PDF_ELEMENT_ID = "client-invoice-pdf";

export const InvoiceHeader = ({
  invoice,
  paymentLink,
  isStripeIntegrated,
  paymentLinkLoading,
}: {
  invoice: PublicInvoice;
  paymentLink?: string;
  isStripeIntegrated?: boolean;
  paymentLinkLoading?: boolean;
}) => {
  const { t } = useTranslation();
  const { downloading, downloadPdf, progress } = usePdfDownload();
  const isPaid = invoice.invoiceStatus === "PAID" ||
    (invoice.balanceAmount !== undefined && Number(invoice.balanceAmount) <= 0);
  const showPayNow = Boolean(paymentLink || isStripeIntegrated) && invoice.invoiceMode !== "CASH" && !isPaid;

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
        {showPayNow && (
          <Button
            variant="contained"
            disabled={!paymentLink || paymentLinkLoading}
            onClick={() => paymentLink && window.open(paymentLink, "_blank", "noopener,noreferrer")}
          >
            {t("common.payNow")}
          </Button>
        )}
        {downloading ? (
          <CircularProgressWithLabel size={40} value={progress} />
        ) : (
          <Tooltip title={t("tooltips.downloadAsPdf")} arrow>
            <IconButton onClick={() => downloadPdf(`${invoice.invoiceSerial ?? "Invoice"}.pdf`, INVOICE_PDF_ELEMENT_ID)}>
              <DownloadIcon style={{ width: "25px" }} />
            </IconButton>
          </Tooltip>
        )}
        <LanguageSwitcher />
      </Stack>
    </Stack>
  );
};
