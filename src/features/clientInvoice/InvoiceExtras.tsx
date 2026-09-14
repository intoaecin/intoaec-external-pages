import { PlateContentStatic } from "@/components/PlateContentStatic";
import AttachmentPreviewTiles from "@/features/attachments/AttachmentPreviewTiles";
import { parseAttachments } from "@/lib/helpers";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { PublicInvoice } from "./types";

export const InvoiceExtras = ({ invoice }: { invoice: PublicInvoice }) => {
  const { t } = useTranslation();
  const attachments = parseAttachments(invoice.attachment ?? []);
  const terms = invoice.termsAndConditionData;
  return (
    <>
      {attachments.length > 0 && <AttachmentPreviewTiles attachments={attachments} />}
      {Array.isArray(terms) && terms.length > 0 && <Box>
        <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>{t("common.termsAndConditions")}</Typography>
        <PlateContentStatic value={terms} />
      </Box>}
      {invoice.notes && <Box><Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>{t("common.notes")}</Typography><Typography variant="body2">{invoice.notes}</Typography></Box>}
    </>
  );
};
