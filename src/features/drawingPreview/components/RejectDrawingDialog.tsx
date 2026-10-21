import { useState } from "react";
import { TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { UIDialog } from "@/components_v2/DialogModal";

interface RejectDrawingDialogProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
}

/** Same reject-with-reason dialog as the progress claim page. */
export function RejectDrawingDialog({ open, loading, onClose, onConfirm }: RejectDrawingDialogProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleClose = () => {
    if (loading) return;
    setReason("");
    setSubmitAttempted(false);
    onClose();
  };

  const handleConfirm = async () => {
    setSubmitAttempted(true);
    if (!reason.trim()) return;
    await onConfirm(reason.trim());
    setReason("");
    setSubmitAttempted(false);
  };

  const hasError = submitAttempted && !reason.trim();

  return (
    <UIDialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      dividerAfterTitle
      title={t("drawingPreview.reject")}
      secondaryAction={{ label: t("common.cancel"), onClick: handleClose, disabled: loading }}
      primaryAction={{ label: t("drawingPreview.reject"), onClick: handleConfirm, color: "error", loading }}
    >
      <TextField
        autoFocus
        fullWidth
        required
        multiline
        rows={4}
        label={t("drawingPreview.rejectionReason")}
        placeholder={t("drawingPreview.rejectionReasonPlaceholder")}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        error={hasError}
        helperText={hasError ? t("common.requiredField") : undefined}
        disabled={loading}
      />
    </UIDialog>
  );
}
