import { useRef, useState } from "react";
import {
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import DislikeIcon from "@/assets/icons/dislike-icon";
import StatusLabel from "@/components/StatusLabel";
import UISignatureUploader from "@/features/components/HelperComponents/UISignatureUploader";
import { useRespondToSharedDrawing } from "../api/useRespondToSharedDrawing";
import type { SharedDrawing } from "../types";
import { RejectDrawingDialog } from "./RejectDrawingDialog";

interface SignatureUploaderHandle {
  handleOpen: () => void;
}

/**
 * Accept / reject controls for the client, laid out like the progress claim page:
 * a reject icon with a reason dialog and a "Sign & Accept" button, replaced by a
 * status label once the client has decided.
 */
export function DrawingDecisionActions({ drawing }: { drawing: SharedDrawing }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const respondMutation = useRespondToSharedDrawing(drawing.leadFileId);
  const signatureUploadRef = useRef<SignatureUploaderHandle | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [pendingResponse, setPendingResponse] = useState<"ACCEPTED" | "REJECTED">();
  const status = drawing.approvalStatus;

  const respond = async (payload: Parameters<typeof respondMutation.mutateAsync>[0]) => {
    setPendingResponse(payload.response);
    try {
      await respondMutation.mutateAsync(payload);
      toast.success(
        t(payload.response === "ACCEPTED" ? "drawingPreview.acceptSuccess" : "drawingPreview.rejectSuccess"),
      );
      return true;
    } catch {
      toast.error(t("drawingPreview.respondFailed"));
      return false;
    } finally {
      setPendingResponse(undefined);
    }
  };

  if (status === "ACCEPTED" || status === "REJECTED") {
    const isAccepted = status === "ACCEPTED";
    return (
      <Tooltip title={drawing.rejectionReason ?? ""} arrow>
        <span>
          <StatusLabel
            status={status}
            labelOverride={t(isAccepted ? "drawingPreview.statusAccepted" : "drawingPreview.statusRejected")}
            customBackground={isAccepted ? theme.palette.success.main : theme.palette.error.main}
            customColor={theme.palette.common.white}
          />
        </span>
      </Tooltip>
    );
  }
  // A newer version replaced this request: read-only, no decision can be made.
  if (status === "SENT" && drawing.isSuperseded) {
    return (
      <StatusLabel
        status="SUPERSEDED"
        labelOverride={t("drawingPreview.statusSuperseded")}
        customBackground={theme.palette.grey[500]}
        customColor={theme.palette.common.white}
      />
    );
  }
  // Drawings shared before approvals existed have no status and are view-only.
  if (status !== "SENT") return null;

  const isBusy = Boolean(pendingResponse);
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Tooltip title={t("drawingPreview.reject")} arrow>
        <span>
          <IconButton
            disabled={isBusy}
            onClick={() => setRejectDialogOpen(true)}
            aria-label={t("drawingPreview.reject")}
          >
            {pendingResponse === "REJECTED" ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              <DislikeIcon width="24px" />
            )}
          </IconButton>
        </span>
      </Tooltip>
      <Button
        variant="contained"
        disabled={isBusy}
        startIcon={pendingResponse === "ACCEPTED" ? <CircularProgress size={16} color="inherit" /> : undefined}
        onClick={() => signatureUploadRef.current?.handleOpen()}
        sx={{ textTransform: "none", fontWeight: 500, whiteSpace: "nowrap" }}
      >
        {t("drawingPreview.signAndAccept")}
      </Button>
      <UISignatureUploader
        ref={signatureUploadRef}
        s3FilePath={`${drawing.organizationId}/${drawing.organizationType}/DRAWINGS/${drawing.leadFileId}/SIGNATURE`}
        eventSource="MEETANDNOTE"
        displayButtonName={t("drawingPreview.accept")}
        submitButtonLabel={t("drawingPreview.signAndAccept")}
        // The "drawing accepted" toast follows once the response is saved.
        suppressUploadSuccessToast
        onChange={(signatureUrl: string) =>
          void respond({ response: "ACCEPTED", signatureUrl })
        }
      />
      <RejectDrawingDialog
        open={rejectDialogOpen}
        loading={pendingResponse === "REJECTED"}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={async (rejectionReason) => {
          if (await respond({ response: "REJECTED", rejectionReason })) {
            setRejectDialogOpen(false);
          }
        }}
      />
    </Stack>
  );
}
