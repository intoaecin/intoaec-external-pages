import { useTranslation } from "react-i18next";
import { CardLayout } from "@/components/layout/CardLayout";
import AttachmentPreviewTiles from "@/features/attachments/AttachmentPreviewTiles";

interface ProgressClaimAttachmentsViewProps {
  attachments: string[];
}

/** Read-only attachments of a saved claim, shown with this app's preview tiles. */
const ProgressClaimAttachmentsView = ({ attachments }: ProgressClaimAttachmentsViewProps) => {
  const { t } = useTranslation();

  return (
    <CardLayout isClickable={false}>
      <AttachmentPreviewTiles
        attachments={attachments}
        title={`${t("common.attachments")} (${attachments.length})`}
        flushLeft
      />
    </CardLayout>
  );
};

export default ProgressClaimAttachmentsView;
