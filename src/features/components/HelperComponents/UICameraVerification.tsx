import { useEnv } from "@/features/hooks/useEnv";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export type UICameraVerificationRef = {
  handleOpen: () => void;
};

type UICameraVerificationProps = {
  s3FilePath: string;
  onChange: (s3Url: string) => void;
};

const UICameraVerification = forwardRef<
  UICameraVerificationRef,
  UICameraVerificationProps
>(({ s3FilePath, onChange }, ref) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const { VITE_MEETANDNOTE_ENDPOINT } = useEnv();
  const { t } = useTranslation();

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const closeCamera = useCallback(() => {
    stopCamera();
    setIsOpen(false);
    setCameraError("");
  }, [stopCamera]);

  const attachStreamToVideo = useCallback(async (stream: MediaStream) => {
    if (!videoRef.current) {
      return;
    }

    videoRef.current.srcObject = stream;
    await videoRef.current.play();
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        t("signature.cameraNotSupported", {
          defaultValue: "Camera is not supported on this device or browser.",
        }),
      );
      return;
    }

    setIsCameraLoading(true);
    setCameraError("");

    try {
      const stream = await navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: { ideal: "user" } },
          audio: false,
        })
        .catch(() =>
          navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          }),
        );

      streamRef.current = stream;
      await attachStreamToVideo(stream);
    } catch (error) {
      console.error("Error opening camera:", error);
      setCameraError(
        t("signature.cameraPermissionError", {
          defaultValue:
            "Unable to open camera. Please allow camera access and try again.",
        }),
      );
    } finally {
      setIsCameraLoading(false);
    }
  }, [attachStreamToVideo, t]);

  useEffect(() => {
    if (!isOpen || streamRef.current || isCameraLoading) {
      return;
    }

    startCamera();
  }, [isCameraLoading, isOpen, startCamera]);

  useEffect(() => stopCamera, [stopCamera]);

  const uploadCameraCaptureToS3 = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileExtension", "jpg");
      formData.append("filePath", `${s3FilePath}/CAMERA`);
      formData.append("eventType", "ADD_MEDIA");
      formData.append("eventSource", "PROPOSAL");

      const { data }: any = await axios.post(
        VITE_MEETANDNOTE_ENDPOINT + "/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return data?.body?.[0]?.uri ?? null;
    } catch (error) {
      console.error("Error uploading camera capture to S3:", error);
      toast.error(t("toast.pleaseUploadValidFile"));
      return null;
    }
  };

  const captureCameraImage = async () => {
    const video = videoRef.current;

    if (!video || isUploading) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setIsUploading(true);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsUploading(false);
        toast.error(t("toast.pleaseUploadValidFile"));
        return;
      }

      const file = new File([blob], "camera-verification.jpg", {
        type: "image/jpeg",
      });
      const cameraCaptureUrl = await uploadCameraCaptureToS3(file);
      setIsUploading(false);

      if (cameraCaptureUrl) {
        onChange(cameraCaptureUrl);
        closeCamera();
      }
    }, "image/jpeg");
  };

  useImperativeHandle(ref, () => ({
    handleOpen: () => {
      if (isUploading || isCameraLoading) {
        return;
      }

      setIsOpen(true);
    },
  }), [isCameraLoading, isUploading]);

  return (
    <Dialog
      open={isOpen}
      onClose={closeCamera}
      maxWidth="sm"
      fullWidth
      aria-labelledby="camera-verification-title"
    >
      <DialogTitle id="camera-verification-title">
        {t("signature.cameraVerificationTitle", {
          defaultValue: "Camera Verification",
        })}
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            bgcolor: "common.black",
            borderRadius: 1,
            minHeight: 280,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              display: cameraError ? "none" : "block",
              width: "100%",
              maxHeight: "60vh",
              objectFit: "cover",
            }}
          />
          {(isCameraLoading || cameraError) && (
            <Box
              sx={{
                alignItems: "center",
                color: "common.white",
                display: "flex",
                inset: 0,
                justifyContent: "center",
                p: 2,
                position: "absolute",
                textAlign: "center",
              }}
            >
              {isCameraLoading ? (
                <CircularProgress color="inherit" />
              ) : (
                <Typography variant="body2">{cameraError}</Typography>
              )}
            </Box>
          )}
        </Box>
        <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
          {t("signature.cameraVerificationDescription", {
            defaultValue:
              "Capture a verification image before continuing to signature.",
          })}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeCamera} disabled={isUploading}>
          {t("common.cancel")}
        </Button>
        {cameraError && (
          <Button onClick={startCamera} disabled={isCameraLoading}>
            {t("common.retry", {
              defaultValue: "Retry",
            })}
          </Button>
        )}
        <Button
          variant="contained"
          onClick={captureCameraImage}
          disabled={isCameraLoading || isUploading || Boolean(cameraError)}
          startIcon={
            isUploading ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {t("signature.captureImage", {
            defaultValue: "Capture Image",
          })}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

UICameraVerification.displayName = "UICameraVerification";

export default UICameraVerification;
