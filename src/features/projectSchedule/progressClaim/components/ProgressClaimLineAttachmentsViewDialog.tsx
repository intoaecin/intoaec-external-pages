import { useTranslation } from "react-i18next";
import { UIDialog } from "@/components_v2/DialogModal";
import AttachmentPreviewTiles from "@/features/attachments/AttachmentPreviewTiles";

interface ProgressClaimLineAttachmentsViewDialogProps {
  open: boolean;
  scheduleName: string;
  attachments: string[];
  onClose: () => void;
}

/** Read-only attachments of one line of a saved claim, shown with this app's preview tiles. */
const ProgressClaimLineAttachmentsViewDialog = ({
  open,
  scheduleName,
  attachments,
  onClose,
}: ProgressClaimLineAttachmentsViewDialogProps) => {
  const { t } = useTranslation();

  return (
    <UIDialog
      open={open}
      onClose={onClose}
      title={t("progressClaim.attachments.lineDialogTitle", { name: scheduleName })}
      maxWidth="md"
      fullWidth
      contentAlign="left"
      primaryAction={{ label: t("common.close"), onClick: onClose }}
    >
      <AttachmentPreviewTiles
        attachments={attachments}
        title={`${t("common.attachments")} (${attachments.length})`}
        flushLeft
      />
    </UIDialog>
  );
};

export default ProgressClaimLineAttachmentsViewDialog;
