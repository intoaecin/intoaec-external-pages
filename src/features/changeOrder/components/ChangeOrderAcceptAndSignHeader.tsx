"use client";

/**
 * Ported from intoaec-UI
 * `src/features/changeOrder/components/ChangeOrderAcceptAndSignHeader.tsx`.
 *
 * The source component made raw `axios.post` calls with an
 * `apiKey: process.env.APIKEY || process.env.NEXT_PUBLIC_APIKEY` header on
 * each request. `process.env` isn't populated at runtime in this Vite SPA
 * (env values are hydrated at boot into `EnvProvider`/`useEnv`), so those
 * calls are ported using this app's `useAxios` hook instead — it already
 * attaches `VITE_APIKEY` to every request, matching the pattern used by the
 * already-ported `BoqAcceptAndSignInHeader`.
 */

import DislikeIcon from "@/assets/icons/dislike-icon";
import DownloadIcon from "@/assets/icons/download-icon";
import UISignatureUploader from "@/features/components/HelperComponents/UISignatureUploader";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import type { ChangeOrderPreviewData } from "./ChangeOrderPreview";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  CHANGE_ORDER_MODE_SETTING_REQUEST,
  isIndependentChangeOrderMode,
} from "../utils";

export interface ChangeOrderAcceptAndSignHeaderProps {
  changeOrder: ChangeOrderPreviewData;
  onAcceptSuccess?: (updatedData?: ChangeOrderPreviewData) => void;
  onDeclineSuccess?: (updatedData?: ChangeOrderPreviewData) => void;
  onDownloadPdf?: () => void;
  downloading?: boolean;
}

export default function ChangeOrderAcceptAndSignHeader({
  changeOrder,
  onAcceptSuccess,
  onDeclineSuccess,
  onDownloadPdf,
  downloading = false,
}: ChangeOrderAcceptAndSignHeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { VITE_PROPOSAL_ENDPOINT, VITE_USERHUB_ENDPOINT } = useEnv();
  const signatureUploadRef = useRef<any>();

  const requireCameraCapture = changeOrder.captureImage === true;
  const [eSignUrl, setEsignUrl] = useState<string>("");
  const [cameraVerificationUrl, setCameraVerificationUrl] =
    useState<string>("");
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);

  const isAccepted =
    changeOrder.status === "ACCEPTED" || Boolean(changeOrder.acceptedAt);
  const isDeclined =
    changeOrder.status === "REJECTED" ||
    changeOrder.status === "DECLINED" ||
    Boolean(changeOrder.declinedAt) ||
    Boolean(changeOrder.rejectedAt);

  const isActionable = !isAccepted && !isDeclined;
  const leadName = changeOrder.leadName || changeOrder.clientName || "";

  const { post: postSettings } = useAxios<any>(
    `${VITE_USERHUB_ENDPOINT}/settings`,
  );
  const { post: postChangeOrder } = useAxios<any>(
    `${VITE_PROPOSAL_ENDPOINT}/change-order`,
  );

  const fetchIsIndependentCo = async () => {
    const response = await postSettings(CHANGE_ORDER_MODE_SETTING_REQUEST);
    return isIndependentChangeOrderMode(response);
  };

  const acceptChangeOrderApi = async (signatureUrl: string) => {
    if (!changeOrder.changeOrderId) return;
    setAccepting(true);
    try {
      const isIndependentCo = await fetchIsIndependentCo();
      const response = await postChangeOrder({
        eventType: "ACCEPT_CHANGE_ORDER",
        changeOrderId: changeOrder.changeOrderId,
        leadSignature: signatureUrl,
        leadSignatureName: leadName,
        leadSignedDate: new Date().toISOString(),
        cameraVerificationUrl,
        isIndependentCo,
      });

      if (
        response?.code === "CHANGE_ORDER_ACCEPTED_SUCCESSFULLY" ||
        response?.body
      ) {
        toast.success(
          t("toast.changeOrderAccepted", {
            defaultValue: "Change Order accepted successfully.",
          }),
        );
        onAcceptSuccess?.(response?.body);
      } else {
        toast.error(
          response?.message ||
            t("toast.somethingWentWrong", {
              defaultValue: "Something went wrong.",
            }),
        );
      }
    } catch {
      toast.error(
        t("toast.somethingWentWrong", {
          defaultValue: "Failed to accept change order.",
        }),
      );
    } finally {
      setAccepting(false);
    }
  };

  const declineChangeOrderApi = async () => {
    if (!changeOrder.changeOrderId) return;
    setDeclining(true);
    try {
      const isIndependentCo = await fetchIsIndependentCo();
      const response = await postChangeOrder({
        eventType: "REJECT_CHANGE_ORDER",
        changeOrderId: changeOrder.changeOrderId,
        reason: "",
        declineReason: "",
        isIndependentCo,
      });

      if (
        response?.code === "CHANGE_ORDER_REJECTED_SUCCESSFULLY" ||
        response?.body
      ) {
        toast.success(
          t("toast.changeOrderDeclined", {
            defaultValue: "Change Order declined successfully.",
          }),
        );
        onDeclineSuccess?.(response?.body);
      } else {
        toast.error(
          response?.message ||
            t("toast.somethingWentWrong", {
              defaultValue: "Something went wrong.",
            }),
        );
      }
    } catch {
      toast.error(
        t("toast.somethingWentWrong", {
          defaultValue: "Failed to decline change order.",
        }),
      );
    } finally {
      setDeclining(false);
    }
  };

  const handleSignatureChangeAndAccept = async (signatureUrl: string) => {
    setEsignUrl(signatureUrl);
    await acceptChangeOrderApi(signatureUrl);
  };

  const handleDeclineClick = () => void declineChangeOrderApi();

  const redirectQuery = router.query.redirect as string | undefined;
  const s3FilePath = `${changeOrder.organizationId || "org"}/${changeOrder.organizationType || "MANUAL"}/CHANGE_ORDER/${changeOrder.changeOrderId || "id"}/SIGNATURE`;

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        py: { xs: 1.5, md: 2 },
        px: { xs: 2, md: 3 },
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        boxShadow: "4px 4px 10px 0px rgba(0,0,0,0.05)",
        zIndex: 50,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="h6" fontWeight={600}>
            {changeOrder.changeOrderTitle ||
              t("changeOrder.title", { defaultValue: "Change Order" })}
          </Typography>
          {changeOrder.changeOrderSerial ? (
            <Typography variant="body2" color="text.secondary">
              ({changeOrder.changeOrderSerial})
            </Typography>
          ) : null}
          {isAccepted && (
            <Button
              sx={(theme) => ({
                bgcolor: "success.main",
                boxShadow: "none",
                pointerEvents: "none",
                "&:hover": {
                  bgcolor: theme.palette.success.main,
                },
              })}
              variant="contained"
            >
              {t("userStatus.accepted", { defaultValue: "Accepted" })}
            </Button>
          )}
          {isDeclined && (
            <Button
              sx={(theme) => ({
                bgcolor: "error.main",
                boxShadow: "none",
                pointerEvents: "none",
                "&:hover": {
                  bgcolor: theme.palette.error.main,
                },
              })}
              variant="contained"
            >
              {t("leadDashboard.proposalStatusTypes.declined", {
                defaultValue: "Declined",
              })}
            </Button>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            pl: { xs: 0, sm: 2 },
            borderLeft: { xs: "none", sm: "1px solid #E3E7E9" },
          }}
        >
          {onDownloadPdf ? (
            <Tooltip
              title={t("tooltips.downloadAsPdf", {
                defaultValue: "Download as PDF",
              })}
              arrow
            >
              <span>
                <IconButton onClick={onDownloadPdf} disabled={downloading}>
                  {downloading ? (
                    <CircularProgress size={22} />
                  ) : (
                    <DownloadIcon style={{ width: 25, height: 25 }} />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          ) : null}

          {isActionable && (
            <Tooltip
              title={t("tooltips.declineChangeOrder", {
                defaultValue: "Decline Change Order",
              })}
              arrow
            >
              <span>
                <IconButton onClick={handleDeclineClick} disabled={declining}>
                  {declining ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    <DislikeIcon width="24px" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          )}

          {isActionable && (
            <Button
              disabled={accepting}
              onClick={() => {
                if (eSignUrl || changeOrder.leadSignature) {
                  void acceptChangeOrderApi(
                    eSignUrl || changeOrder.leadSignature || "",
                  );
                } else {
                  signatureUploadRef.current?.handleOpen();
                }
              }}
              sx={{ bgcolor: "primary.main" }}
              variant="contained"
              startIcon={
                accepting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : undefined
              }
            >
              {t("common.signAndAccept", { defaultValue: "Sign and Accept" })}
            </Button>
          )}

          <LanguageSwitcher />
        </Box>

        {redirectQuery ? (
          <Button
            sx={{
              position: "absolute",
              top: "30px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
            onClick={() => void router.push(redirectQuery)}
            variant="contained"
          >
            {t("common.backToPortal", { defaultValue: "Back to Portal" })}
          </Button>
        ) : null}
      </Box>

      <UISignatureUploader
        ref={signatureUploadRef}
        s3FilePath={s3FilePath}
        requireCameraCaptureBeforeOpen={requireCameraCapture}
        displayButtonName={t("changeOrder.title", {
          defaultValue: "Change Order",
        })}
        submitButtonLabel={t("common.signAndAccept", {
          defaultValue: "Sign and Accept",
        })}
        onCameraVerificationChange={setCameraVerificationUrl}
        onChange={handleSignatureChangeAndAccept}
      />
    </Box>
  );
}
