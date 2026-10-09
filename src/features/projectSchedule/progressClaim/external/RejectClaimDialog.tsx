import { useState } from "react";
import { TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { UIDialog } from "@/components_v2/DialogModal";

interface RejectClaimDialogProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
}

const RejectClaimDialog = ({ open, loading, onClose, onConfirm }: RejectClaimDialogProps) => {
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
      fullWidth
      dividerAfterTitle
      showActionsTopDivider={false}
      showBetweenActionDivider={false}
      title={t("progressClaimExternal.rejectClaim", { defaultValue: "Reject" })}
      secondaryAction={{
        label: t("common.cancel", { defaultValue: "Cancel" }),
        onClick: handleClose,
        variant: "outlined",
        disabled: loading,
      }}
      primaryAction={{
        label: t("progressClaimExternal.rejectClaim", { defaultValue: "Reject" }),
        onClick: handleConfirm,
        variant: "contained",
        color: "error",
        loading,
      }}
    >
      <TextField
        autoFocus
        fullWidth
        required
        multiline
        rows={4}
        label={t("progressClaimExternal.rejectionReason", { defaultValue: "Reason" })}
        placeholder={t("progressClaimExternal.rejectionReasonPlaceholder", {
          defaultValue: "Let us know why you're rejecting this claim.",
        })}
        InputLabelProps={{ shrink: true }}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        error={hasError}
        helperText={hasError ? t("common.requiredField") : undefined}
        disabled={loading}
      />
    </UIDialog>
  );
};

export default RejectClaimDialog;
