import { useEnv } from "@/features/hooks/useEnv";
import CloseIcon from "@/assets/icons/close-icon";
import ResetIcon from "@/assets/icons/reset-icon";
import UploadImg from "@/assets/icons/upload-img";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Typography,
  useMediaQuery,
  useTheme,
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
import SignatureCanvas from "react-signature-canvas";
import { toast } from "react-toastify";
import UICameraVerification, {
  UICameraVerificationRef,
} from "./UICameraVerification";

const UISignatureUploader = forwardRef(
  (
    props: {
      onChange: any;
      s3FilePath: string;
      displayButtonName: string;
      submitButtonLabel?: string;
      requireCameraCaptureBeforeOpen?: boolean;
      onCameraVerificationChange?: (s3Url: string) => void;
      eventSource?: string;
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const isSmallScreen = useMediaQuery("(max-width: 600px)");
    const { VITE_MEETANDNOTE_ENDPOINT, VITE_APIKEY } = useEnv();
    const [isSigning, setIsSigning] = useState<boolean>(false);
    const [signatureImageUrl, setSignatureImageUrl] = useState<any>();
    const [selectedValue, setSelectedValue] = useState("upload");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const signatureCanvasRef = useRef<SignatureCanvas | null>(null);
    const cameraVerificationRef = useRef<UICameraVerificationRef | null>(null);
    const [image, setImage] = useState<any>(null);
    const theme = useTheme();
    const [canvasWidth, setCanvasWidth] = useState<number>(
      isSmallScreen ? 300 : 700,
    );
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    const containerRef = useCallback((node: HTMLDivElement | null) => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }

      if (node !== null) {
        const updateWidth = () => {
          const width = node.clientWidth;
          if (width > 0) {
            setCanvasWidth(width);
          }
        };

        updateWidth();

        if (typeof ResizeObserver !== "undefined") {
          const observer = new ResizeObserver(() => {
            updateWidth();
          });
          observer.observe(node);
          resizeObserverRef.current = observer;
        }
      }
    }, []);

    useEffect(() => {
      return () => {
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }
      };
    }, []);
    // const { post: update } = useAxiosWithAuth(
    //   VITE_MEETANDNOTE_ENDPOINT + "/organization"
    // );
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSelectedValue(value);
      if (value === "draw") {
        setImage(null);
      }

      if (value === "upload" && signatureCanvasRef.current) {
        signatureCanvasRef.current.clear();
      }
    };

    const uploadSignatureToS3 = async (file: File) => {
      // const filePath: any = `${session?.["custom:organization_type"]}/${session?.["custom:organization_id"]}/PROPOSAL/${router.query}/SIGNATURE`;
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileExtension", "jpg");
        formData.append("filePath", props?.s3FilePath);
        formData.append("eventType", "ADD_MEDIA");
        formData.append("eventSource", props?.eventSource ?? "PROPOSAL");

        const { data }: any = await axios.post(
          VITE_MEETANDNOTE_ENDPOINT + "/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              ...(VITE_APIKEY ? { apikey: VITE_APIKEY } : {}),
            },
          },
        );

        if (data) {
          toast.success(
            `${props.displayButtonName} ${t("toast.signeSuccessfully")}`,
          );
          setImage(null);
          signatureCanvasRef.current?.clear();
          setIsSigning(false);
          setIsOpen(false);
          return data.body[0]?.uri;
        }
      } catch (error) {
        console.error("Error uploading signature to S3:", error);

        toast.error(t("toast.errorUploadingSignature"));
        setIsSigning(false);
        return null;
      }
    };
    const saveSignature = async () => {
      let signatureUrl;
      setIsLoading(true);
      if (signatureCanvasRef.current) {
        const canvas =
          signatureCanvasRef.current.getCanvas() as HTMLCanvasElement;

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.fillStyle = "white";
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          tempCtx.drawImage(canvas, 0, 0);
        }

        (tempCtx ? tempCanvas : canvas).toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], "signature.jpg", {
              type: "image/jpeg",
            });
            signatureUrl = await uploadSignatureToS3(file);
            if (signatureUrl) {
              props.onChange(signatureUrl);
              setSignatureImageUrl(signatureUrl);
              console.log("Uploaded signature to S3:", signatureUrl);
            } else {
              console.log("Failed to upload signature to S3.");
            }
          }
        }, "image/jpeg");
      } else if (image) {
        //  const base64Signature = image.split(",")[1];
        // const blob = await fetch(base64Signature).then((res) => res.blob());
        // const file = new File([blob], "signature.jpg", {
        //   type: "image/jpeg",
        // });
        signatureUrl = await uploadSignatureToS3(image[0]);
        if (signatureUrl) {
          props.onChange(signatureUrl);
          setSignatureImageUrl(signatureUrl);
          console.log("Uploaded signature to S3:", signatureUrl);
        } else {
          console.log("Failed to upload signature to S3.");
        }
      }
    };
    const clearSignature = () => {
      if (signatureCanvasRef.current) {
        signatureCanvasRef.current.clear();
      }
    };
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setImage(e.target.files);
      setIsSigning(true);
      // const file = e.target?.files?.[0];

      // if (file) {
      //   const reader = new FileReader();

      //   reader.onload = (event) => {
      //     const result = event.target?.result;
      //     if (typeof result === "string") {
      //       setImage(result);
      //     }
      //   };

      //   reader.readAsDataURL(file);
      // }
    };
    const cancelSigning = () => {
      setIsOpen(false);
      setImage(null);
      signatureCanvasRef.current?.clear();
    };
    const handleClick = () => {
      const fileInput = document.getElementById("fileInput");
      if (fileInput) {
        fileInput.click();
      }
    };
    const handleUploadSignature = async () => {
      if (isSigning) {
        await saveSignature();
      }
    };
    const handleCameraVerificationChange = (cameraVerificationUrl: string) => {
      props.onCameraVerificationChange?.(cameraVerificationUrl);
      setIsOpen(true);
    };
    const handleOpen = () => {
      if (props.requireCameraCaptureBeforeOpen) {
        cameraVerificationRef.current?.handleOpen();
        return;
      }

      setIsOpen(true);
    };

    useImperativeHandle(ref, () => ({ handleOpen }));
    const { t } = useTranslation();

    return (
      <div>
        <UICameraVerification
          ref={cameraVerificationRef}
          s3FilePath={props.s3FilePath}
          onChange={handleCameraVerificationChange}
        />
        <Box>
          <Dialog
            fullWidth={true}
            maxWidth="md"
            open={isOpen}
            onClose={() => setIsOpen(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle
              id="alert-dialog-title"
              sx={{
                fontSize: "20px",
                textAlign: "center",
                padding: {
                  xs: "8px",
                  sm: "16px 24px",
                },
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "56px",
              }}
            >
              <div style={{ fontWeight: 500 }}>{t("common.signature")}</div>
              <IconButton
                onClick={cancelSigning}
                sx={{
                  position: "absolute",
                  right: {
                    xs: "8px",
                    sm: "16px",
                  },
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <CloseIcon
                  style={{ width: "20px", height: "20px", fill: "#ccc" }}
                />
              </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent
              sx={{
                padding: {
                  xs: "10px",
                  sm: "20px 24px",
                },
              }}
            >
              <div>
                <Box
                  style={{
                    // textAlign: "center",
                    fontWeight: 500,
                  }}
                  sx={{
                    margin: {
                      xs: "4px",
                      sm: "20px",
                    },
                    textAlign: {
                      xs: "justify",
                      sm: "center",
                    },
                    fontSize: {
                      xs: "11px",
                      sm: "14px",
                    },
                  }}
                >
                  {t("signature.signatureDisclaimer")}
                </Box>
                <div className="d-flex justify-content-center">
                  <FormControl>
                    <RadioGroup
                      row
                      aria-labelledby="demo-row-radio-buttons-group-label"
                      name="row-radio-buttons-group"
                      value={selectedValue}
                      onChange={handleChange}
                      sx={{
                        "& .MuiFormControlLabel-label": {
                          fontSize: {
                            xs: "0.75rem",
                            sm: "1rem",
                          },
                        },
                      }}
                    >
                      <FormControlLabel
                        value="upload"
                        control={
                          <Radio
                            sx={{
                              transform: {
                                xs: "scale(0.6)",
                                sm: "scale(1)",
                              },
                            }}
                          />
                        }
                        label={t("common.uploadSignature")}
                      />
                      <FormControlLabel
                        value="draw"
                        control={
                          <Radio
                            sx={{
                              transform: {
                                xs: "scale(0.6)",
                                sm: "scale(1)",
                              },
                            }}
                          />
                        }
                        label={t("signature.drawSignature")}
                      />
                    </RadioGroup>
                  </FormControl>
                </div>
                {selectedValue === "upload" ? (
                  <Box
                    style={{
                      display: "flex",
                      flexDirection: "column",

                      padding: "20px",
                      alignItems: "center",
                      border: `2px dashed ${theme?.palette?.primary?.main} `,
                      backgroundColor: "#EEF5FF",
                      borderRadius: "5px",
                    }}
                    sx={{
                      margin: {
                        xs: "2px",
                        sm: "20px 50px",
                      },
                      height: {
                        xs: "auto",
                        sm: "220px",
                      },
                    }}
                    onClick={handleClick}
                  >
                    {image ? (
                      <>
                        <div className="mb-2">
                          <img
                            src={URL.createObjectURL(image[0])}
                            alt="Uploaded Signature"
                            style={{ maxWidth: "100%", maxHeight: "150px" }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <input
                          type="file"
                          id="fileInput"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleImageChange}
                        />
                        <div className="mb-2">
                          <Typography style={{ fontWeight: 500 }}>
                            {image
                              ? t("signature.yourUploadedSignature")
                              : t("signature.uploadSignatureBelow")}
                          </Typography>
                        </div>
                        <div className="mb-2">
                          <UploadImg />
                        </div>
                        <div className="mb-2">
                          {image
                            ? t("signature.clickHereToChangeSignature")
                            : t("signature.clickHereToUploadESignature")}
                        </div>
                        <div
                          className="mb-2"
                          style={{ textAlign: "center", color: "#B3B3B3" }}
                        >
                          {t("common.uploadLimit")}: 1 {t("common.image")}
                          <br /> {t("common.maxFileSize")}: 5 mb{" "}
                        </div>
                      </>
                    )}
                  </Box>
                ) : (
                  <Box
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      // height: "250px",
                      // margin: "20px 50px",
                      padding: "20px",
                      alignItems: "center",
                      border: `2px dashed ${theme?.palette?.primary?.main} `,
                      backgroundColor: "#EEF5FF",
                      borderRadius: "5px",
                      position: "relative",
                    }}
                    sx={{
                      margin: {
                        xs: "2px",
                        sm: "20px 50px",
                      },
                      height: {
                        xs: "auto",
                        sm: "220px",
                      },
                    }}
                  >
                    <div
                      className="mb-2"
                      ref={containerRef}
                      style={{ width: "100%" }}
                    >
                      <Typography
                        style={{ fontWeight: 500, textAlign: "center" }}
                      >
                        {t("signature.drawYourSignatureBelow")}
                      </Typography>
                      <SignatureCanvas
                        ref={signatureCanvasRef}
                        backgroundColor="#EEF5FF"
                        penColor="black"
                        onBegin={() => {
                          setIsSigning(true);
                        }}
                        canvasProps={{
                          width: canvasWidth,
                          height: 170,
                        }}
                      />
                    </div>

                    <div
                      className="mb-2"
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "30px",
                      }}
                    >
                      <IconButton onClick={clearSignature}>
                        <ResetIcon />
                      </IconButton>
                    </div>
                  </Box>
                )}
              </div>
            </DialogContent>
            <DialogActions
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  style={{
                    color: "red",
                  }}
                  sx={{
                    "&.MuiButton-outlined": {
                      borderColor: "red",
                      boxShadow: "none",
                      width: {
                        xs: "80px",
                        sm: "200px",
                      },
                      fontSize: {
                        xs: "0.7rem",
                        sm: "0.875rem",
                      },
                      height: "50px",
                    },
                  }}
                >
                  {t("common.cancel")}
                </Button>
                <LoadingButton
                  loading={isLoading}
                  variant="contained"
                  onClick={async () => {
                    setIsLoading(true);
                    await handleUploadSignature().finally(() => {
                      setIsLoading(false);
                    });
                  }}
                  style={{
                    backgroundColor: theme?.palette?.primary?.main,
                    marginLeft: "20px",
                  }}
                  sx={{
                    "&.MuiButton-contained": {
                      boxShadow: "none",
                      // width: "200px",
                      width: {
                        xs: "80px",
                        sm: "200px",
                      },
                      fontSize: {
                        xs: "0.7rem",
                        sm: "0.875rem",
                      },
                      height: "50px",
                    },
                  }}
                >
                  {props.submitButtonLabel ??
                    `${t("common.sign")} ${props.displayButtonName}`}
                </LoadingButton>
              </div>
            </DialogActions>
          </Dialog>
        </Box>
      </div>
    );
  },
);
UISignatureUploader.displayName = "UISignatureUploader";
export default UISignatureUploader;
