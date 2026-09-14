import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { CircularProgressWithLabel } from "../../CircularProgressWIthLabel";
import DownloadIcon from "@/assets/icons/download-icon";
import DislikeIcon from "@/assets/icons/dislike-icon";
import DeclineProposalIcon from "@/assets/icons/decline-proposal-icon";
import { useDialog } from "../../providers/DialogProvider";
import UISignatureUploader from "../../HelperComponents/UISignatureUploader";
import ViewCommentIcon from "@/assets/icons/view-comment-icon";
import { toast } from "react-toastify";
import { useEstimationData } from "../../providers/BoqProvider/BoqClientEstimateDataProvider";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useRouter } from "next/router";
import { useQueryParams } from "@/hooks/useQueryParams";
import { fetchAndInlineResources } from "@/lib/helpers";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../LanguageSwitcher";
import EstimateLinkExpired from "../../EstimateLinkExpired";

const ReasonForDeclineDialogContent = ({
  selectedReasonRef,
  otherReasonRef,
  setCustomButton,
}: {
  selectedReasonRef: React.MutableRefObject<any[]>;
  otherReasonRef: React.MutableRefObject<string>;
  setCustomButton?: React.Dispatch<
    React.SetStateAction<
      | {
          yes?:
            | {
                text?: string | undefined;
                color?: string | undefined;
                disable?: boolean | undefined;
                visible?: boolean | undefined;
              }
            | undefined;
          no?:
            | {
                text?: string | undefined;
                color?: string | undefined;
                disable?: boolean | undefined;
                visible?: boolean | undefined;
              }
            | undefined;
        }
      | undefined
    >
  >;
}) => {
  const { t } = useTranslation();
  const [selectedReasons, setSelectedReasons] = useState<Array<string>>([]);
  const [otherReason, setOtherReason] = useState<string>("");

  const reasons = [
    t("reasons.budget"),
    t("reasons.scope"),
    t("reasons.terms"),
    t("reasons.communication"),
    t("reasons.costs"),
    t("reasons.vendor"),
    t("reasons.other"),
  ];

  useEffect(() => {
    selectedReasonRef.current = selectedReasons;
    if (selectedReasons.length == 0) {
      setCustomButton?.((prev) => ({
        ...prev,
        no: {
          ...(prev?.no ?? {}),
          text: t("common.cancel", {
            defaultValue: "Cancel",
          }),
        },
        yes: {
          ...(prev?.yes ?? {}),
          disable: true,
          text: t("common.confirm", {
            defaultValue: "Confirm",
          }),
          color: "",
        },
      }));
    } else {
      if (selectedReasons.includes("Other")) {
        // if (!!otherReason) {
        setCustomButton?.((prev) => ({
          ...prev,
          no: {
            ...(prev?.no ?? {}),
            text: t("common.cancel", {
              defaultValue: "Cancel",
            }),
          },
          yes: {
            // ...(prev?.yes ?? {}),
            disable: otherReason ? false : true,
            text: t("common.confirm", {
              defaultValue: "Confirm",
            }),
            // color: "primary.light",
          },
        }));
        // }
      } else {
        setCustomButton?.((prev) => ({
          ...prev,
          no: {
            ...(prev?.no ?? {}),
            text: t("common.cancel", {
              defaultValue: "Cancel",
            }),
          },
          yes: {
            ...(prev?.yes ?? {}),
            disable: false,
            text: t("common.confirm", {
              defaultValue: "Confirm",
            }),
            color: "primary.main",
          },
        }));
      }
    }
  }, [selectedReasons, otherReason]);
  useEffect(() => {
    otherReasonRef.current = otherReason;
  }, [otherReason]);

  return (
    <>
      <DialogTitle id="alert-dialog-title" className="d-inline-block mb-2 mt-1">
        <span className="">{t("common.reasonForDeclining")}</span>
      </DialogTitle>
      <Divider />

      <DialogContent className="d-flex">
        <Box
          sx={{
            borderRight: {
              xs: "0",
              sm: "1px solid #E7E7E7",
            },
          }}
        >
          <FormGroup>
            {reasons.map((reason) => (
              <FormControlLabel
                key={reason}
                checked={selectedReasons.includes(reason)}
                control={
                  <Checkbox
                    onChange={(e, c) => {
                      if (c) {
                        setSelectedReasons((prev) => [...prev, reason]);
                      } else {
                        setSelectedReasons((prev) =>
                          prev.filter((prevReas) => prevReas !== reason),
                        );
                      }
                    }}
                  />
                }
                label={
                  <Typography
                    style={{
                      fontSize: "12px",
                      textAlign: "left",
                      fontWeight: 500,
                    }}
                  >
                    {reason}
                  </Typography>
                }
                value={reason}
              />
            ))}

            {selectedReasons.includes("Other") && (
              <TextField
                placeholder="Enter other reason"
                value={otherReason}
                onChange={(e) => {
                  setOtherReason(e.target.value);
                }}
              />
            )}
          </FormGroup>
        </Box>
        <Box
          className=" align-items-center p-1"
          sx={{
            display: {
              xs: "none",
              sm: "flex",
            },
          }}
        >
          <DeclineProposalIcon width={"250px"} />
        </Box>
      </DialogContent>
    </>
  );
};
const BoqAcceptAndSignInHeader = ({
  setCommentMode,
  trackAnalytics,
  onSignatureChange,
  onCameraVerificationChange,
}: {
  setCommentMode?: Dispatch<SetStateAction<boolean>>;
  trackAnalytics: boolean;
  onSignatureChange?: (signatureUrl: string) => void;
  onCameraVerificationChange?: (cameraVerificationUrl: string) => void;
}) => {
  const { clientEstimationData, fetchEstimationData } = useEstimationData();
  const allowComments = clientEstimationData?.allowComments !== false;
  const requireCameraCapture = clientEstimationData?.captureImage === true;
  const [downloading, setDownloading] = useState<boolean>(false);
  const [acceptingEstimate, setAcceptingEstimate] = useState(false);
  const [decliningEstimate, setDecliningEstimate] = useState(false);
  const signatureUploadRef = useRef<any>();
  const [eSignUrl, setEsignUrl] = useState<string>("");
  const [cameraVerificationUrl, setCameraVerificationUrl] =
    useState<string>("");
  const [acceptedSignerName, setAcceptedSignerName] = useState<string>("");
  const { VITE_PROPOSAL_ENDPOINT, VITE_AEC_CHATBOT_ENDPOINT, VITE_AEC_PORTAL_URL } =
    useEnv();
  const router = useRouter();
  const { isLeadManagerProfile } = useQueryParams();
  const isSalesOrder =
    router.pathname.startsWith("/sales-order") ||
    router.query.entityType === "SALES_ORDER";
  const { post: update } = useAxios<any>(
    VITE_PROPOSAL_ENDPOINT +
      (isSalesOrder ? "/lead-sales-order" : "/lead-estimate"),
  );
  const { post: fetchTemplates, post: fetchRevision } = useAxios(
    VITE_PROPOSAL_ENDPOINT + "/lead-estimate",
  );
  const [isConvertedInvoice, setIsConvertedInvoice] = useState<boolean>(false);
  // path
  // const s3FilePath: any = "sfd";
  const s3FilePath: any = `${clientEstimationData?.organizationId}/${clientEstimationData?.organizationType}/ESTIMATE/${clientEstimationData?.estimateId}/SIGNATURE`;
  const { t } = useTranslation();
  const updateSign = async (signatureUrl: string = eSignUrl) => {
    const requestData = {
      eventType: isSalesOrder
        ? "UPDATE_SALES_ORDER_BY_ID"
        : "UPDATE_BOQ_ESTIMATE_BY_ID",
      ...(isSalesOrder
        ? { salesOrderId: clientEstimationData?.estimateId }
        : {}),
      estimateId: clientEstimationData?.estimateId,
      estimateTitle: clientEstimationData?.estimateTitle,
      estimateRevision: clientEstimationData?.estimateRevision,
      estimateCreatedOn: clientEstimationData?.estimateCreatedOn,
      organizationId: clientEstimationData?.organizationId,
      organizationType: clientEstimationData?.organizationType,
      leadId: clientEstimationData?.leadId,
      projectId: clientEstimationData?.projectId,
      clientSignature: signatureUrl,
    };
    const res = await update(requestData);
    console.log(res, "from send estimae");
    if (res?.code == "BOQ_ESTIMATION_CREATED_SUCCESSFULLY") {
      toast.success(t("toast.estimateSentSuccessfully"));
    }
  };
  const rejectEstimate = async () => {
    try {
      const requestData = {
        eventType: isSalesOrder ? "DECLINE_SALES_ORDER" : "DECLINE_ESTIMATE",
        ...(isSalesOrder
          ? { salesOrderId: clientEstimationData?.estimateId }
          : {}),
        estimateId: clientEstimationData?.estimateId,
        estimateRevision: clientEstimationData?.estimateRevision,
        reason: [
          ...selectedReasonRef.current.filter((reason) => reason !== "Other"),
          otherReasonRef.current,
        ].join(","),
        isLeadManagerProfile: router.query.isLeadManagerProfile,
      };

      const data = await update(requestData);
      if (data.code === "DECLINED_PROPOSAL") {
        console.log("profile", data.body);
      }
    } catch (error: any) {
      console.log(error);
    }
  };
  const acceptProposal = async (
    signatureUrl: string = eSignUrl,
    signerName?: string,
  ) => {
    try {
      const leadName =
        signerName ||
        acceptedSignerName ||
        clientEstimationData?.leadSignatureName ||
        clientEstimationData?.clientName ||
        clientEstimationData?.acceptedByName ||
        "";
      const requestData = {
        eventType: isSalesOrder ? "ACCEPT_SALES_ORDER" : "ACCEPT_ESTIMATE",
        ...(isSalesOrder
          ? { salesOrderId: clientEstimationData?.estimateId }
          : {}),
        estimateId: clientEstimationData?.estimateId,
        estimateRevision: clientEstimationData?.estimateRevision,
        // Client signature is optional (same as change order)
        ...(signatureUrl
          ? {
              client: signatureUrl,
              clientSignature: signatureUrl,
              leadSignature: signatureUrl,
              leadSignatureName: leadName,
              leadSignedDate: new Date().toISOString(),
            }
          : {}),
        cameraVerificationUrl,
        organizationId: clientEstimationData?.organizationId,
        organizationType: clientEstimationData?.organizationType,
        isLeadManagerProfile: router.query.isLeadManagerProfile,
      };

      const data = await update(requestData);
      if (
        data.code === "ESTIMATE_ACCEPTED" ||
        data.code === "SALES_ORDER_ACCEPTED"
      ) {
        window.location.reload();
        router.push(router.asPath);
        toast.success(t("toast.estimateAccepted"));
        setTimeout(() => {
          window.location.reload();
        }, 500);
        console.log("profile", data.body);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const handlePrintAsPDF = async (showFullDetails: boolean = true) => {
    try {
      if (!clientEstimationData?.estimateId) {
        throw new Error("Estimate ID is unavailable");
      }

      // This app has no server of its own — the preview page lives on the
      // real intoaec-UI app, so forward there for the SSR HTML used to build
      // the PDF (same pattern as the estimate-view analytics forwarding below).
      const myItemPdfLink = `${VITE_AEC_PORTAL_URL}/createEstimatePreview?estimateId=${encodeURIComponent(
        clientEstimationData.estimateId,
      )}&estimateRevision=${encodeURIComponent(
        clientEstimationData.estimateRevision ?? "LATEST",
      )}&showFullDetails=${showFullDetails}${
        isSalesOrder ? "&entityType=SALES_ORDER" : ""
      }`;

      const previewResponse = await fetch(myItemPdfLink);
      if (!previewResponse.ok) {
        throw new Error(
          `Estimate preview request failed with status ${previewResponse.status}`,
        );
      }

      const previewHtml = await previewResponse.text();
      if (!previewHtml.trim()) {
        throw new Error("Estimate preview returned empty HTML");
      }

      const htmlContent = (
        await fetchAndInlineResources(previewHtml, VITE_AEC_PORTAL_URL)
      ).replaceAll("h-100", "");

      const response = await axios.post(
        VITE_AEC_CHATBOT_ENDPOINT + "/download-pdf",
        { htmlContent: htmlContent, fileName: "items.pdf" },
        {
          responseType: "arraybuffer",
        },
      );

      const pdfBuffer = response.data;

      const blob = new Blob([pdfBuffer], { type: "application/pdf" });

      const link = document.createElement("a");
      const objectUrl = window.URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `${clientEstimationData?.estimateTitle}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
      await axios
        .post(`${VITE_AEC_PORTAL_URL}/api/add-to-queue`, {
          eventType: isSalesOrder
            ? "REGISTER_SALES_ORDER_ANALYTICS"
            : "REGISTER_ESTIMATE_ANALYTICS",
          ...(isSalesOrder
            ? { salesOrderId: clientEstimationData?.estimateId }
            : {
                estimateId: clientEstimationData?.estimateId,
                estimateRevision: clientEstimationData?.estimateRevision,
              }),
          downloaded: true,
        })
        .catch((error) => {
          console.error("Failed to register estimate download:", error);
        });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(t("toast.pdfDownloadFailed"));
    }
  };

  const handleAcceptEstimate = async () => {
    const existingSignature =
      eSignUrl ||
      clientEstimationData?.clientSignature ||
      clientEstimationData?.leadSignature ||
      "";

    // Match change order: accept with existing signature, otherwise open pad
    // (client signature remains optional — pad can be cancelled / left blank)
    if (existingSignature) {
      setAcceptingEstimate(true);
      try {
        await acceptProposal(existingSignature);
      } finally {
        setAcceptingEstimate(false);
      }
      return;
    }

    signatureUploadRef.current?.handleOpen();
  };

  const {
    popup: rejectBoqDialog,
    setPrimaryButton: setShowHidePopupPrimaryButton,
    closeModal: closeShowHidePopup,
    setCustomButton,
  } = useDialog();
  const otherReasonRef = useRef("");
  const selectedReasonRef = useRef<any[]>([]);
  const handleSignatureChangeAndAccept = async (
    value: string,
    signerName?: string,
  ) => {
    setEsignUrl(value);
    if (signerName) {
      setAcceptedSignerName(signerName);
    }
    onSignatureChange?.(value);
    await updateSign(value);
    await acceptProposal(value, signerName).finally(() => {
      fetchEstimationData?.();
    });
  };
  const handleRejectBoq = () => {
    setCustomButton((prev) => ({
      ...prev,
      no: {
        ...(prev?.no ?? {}),
        text: "Cancel",
      },
      yes: {
        ...(prev?.yes ?? {}),
        text: "Confirm",
        color: "primary.main",
      },
    }));
    setShowHidePopupPrimaryButton("No");
    rejectBoqDialog({
      content: (
        <ReasonForDeclineDialogContent
          setCustomButton={setCustomButton}
          otherReasonRef={otherReasonRef}
          selectedReasonRef={selectedReasonRef}
        />
      ),
      onYes: async () => {
        setDecliningEstimate(true);
        await rejectEstimate().finally(() => {
          setDecliningEstimate(false);
          toast.success(t("toast.estimateDeclined"));
          setTimeout(() => {
            window.location.reload();
          }, 500);
        });
      },
      onNo: async () => {
        console.log("No button clicked");
      },
    });
  };

  const fetchRevisions = async (estimateId: string) => {
    const response = await fetchRevision({
      eventType: "FETCH_ESTIMATION_REVISIONS_BY_PROJECT",
      organizationId: clientEstimationData?.organizationId,
      filters: {
        estimateId,
        projectId: clientEstimationData?.projectId,
      },
    });

    if (response?.body?.result) {
      const fetchedRevisions = response.body.result;

      // ✅ Check if any revision is converted to invoice
      const hasConvertedInvoice = fetchedRevisions.some(
        (rev: any) => rev.isConvertedInvoice === true,
      );
      setIsConvertedInvoice(hasConvertedInvoice);
    }
  };

  useEffect(() => {
    if (clientEstimationData?.estimateId) {
      fetchRevisions(clientEstimationData?.estimateId);
    }
  }, [clientEstimationData?.estimateId]);

  const getRedirectQuery = router.query.redirect;

  // Check if estimate has expired
  const isEstimateExpired =
    clientEstimationData?.estimateValidTill &&
    new Date(clientEstimationData.estimateValidTill).getTime() < Date.now();

  if (isEstimateExpired) {
    return <EstimateLinkExpired />;
  }

  return (
    <Box
      className="bg-white py-sm-1 py-md-2 py-3 px-sm-1 px-md-3 px-4 position-sticky t-0 l-0 r-0"
      sx={{
        boxShadow: " 4px 4px 10px 0px rgb(0 0 0 / 5%);",
        zIndex: 50,
      }}
    >
      <Box className="d-flex justify-content-between align-items-center flex-wrap gap-1">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flex: "1 1 0",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <Tooltip title={clientEstimationData?.estimateTitle ?? ""} arrow>
            <Typography
              className="fs-5 fw-600"
              noWrap
              sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {clientEstimationData?.estimateTitle}
            </Typography>
          </Tooltip>
          {clientEstimationData?.declinedAt && (
            <Button
              sx={(theme) => ({
                marginLeft: "10px",
                bgcolor: "error.main",
                boxShadow: "none",
                pointerEvents: "none",
                "&:hover": {
                  bgcolor: theme?.palette?.error?.main,
                },
              })}
              variant="contained"
            >
              {t("leadDashboard.proposalStatusTypes.declined")}
            </Button>
          )}
          {clientEstimationData?.acceptedAt && (
            <Button
              sx={(theme) => ({
                marginLeft: "10px",
                bgcolor: "success.main",
                boxShadow: "none",
                pointerEvents: "none",
                "&:hover": {
                  bgcolor: theme?.palette?.success?.main,
                },
              })}
              variant="contained"
            >
              {t("userStatus.accepted")}
            </Button>
          )}
        </Box>

        <Box
          className="px-sm-1 px-md-2 px-3  d-flex justify-content-evenly align-items-center"
          sx={{
            //   minWidth: {
            //     xs: "100%",
            //     sm: "10%",
            //   },
            //   maxWidth: {
            //     xs: "100%",
            //     sm: "10%",
            //   },
            paddingBlock: "1px",
            borderLeft: "1px solid #E3E7E9",
          }}
        >
          <Box className="mr-2 d-flex align-items-center">
            {downloading ? (
              <CircularProgressWithLabel size={40} value={20} />
            ) : (
              <>
                <Tooltip title={t("tooltips.downloadAsPdf")} arrow>
                  <IconButton
                    onClick={async () => {
                      setDownloading(true);
                      await handlePrintAsPDF(true).finally(() => {
                        setDownloading(false);
                      });
                    }}
                  >
                    <DownloadIcon style={{ width: "25px" }} />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
          {/* {boqData.leadSignature && */}
          {/* // boqData.acceptedAt && // boqData.declienedAt && ( */}
          {/* {!proposalData?.acceptedAt && ( */}
          {allowComments && (
            <Box className="mr-2 d-flex align-items-center">
              <Tooltip title={t("tooltips.showComments")} arrow>
                <IconButton
                  onClick={() => {
                    setCommentMode?.(true);
                    // toast.success(t("toast.switchedToCommentMode"));
                  }}
                >
                  <ViewCommentIcon style={{ width: "25px" }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          {/* )} */}

          {!clientEstimationData?.acceptedAt &&
            !clientEstimationData?.declinedAt && (
              <div className="mr-2 d-flex align-items-center">
                <Box className="mr-2 d-flex align-items-center">
                  <Tooltip title={t("tooltips.declineEstimate")} arrow>
                    <IconButton
                      onClick={handleRejectBoq}
                      disabled={decliningEstimate}
                    >
                      {decliningEstimate ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <DislikeIcon width={"24px"} />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </div>
            )}

          {!clientEstimationData?.acceptedAt &&
            !clientEstimationData?.declinedAt && (
              <Tooltip
                title={
                  isConvertedInvoice
                    ? t("tooltips.estimateConvertedInvoice")
                    : ""
                }
                arrow
              >
                <span>
                  <Button
                    disabled={isConvertedInvoice || acceptingEstimate}
                    onClick={handleAcceptEstimate}
                    sx={{
                      bgcolor: "primary.main",
                      paddingInline: {
                        sx: "20px",
                      },
                      "&.Mui-disabled": {
                        bgcolor: "action.disabledBackground",
                        color: "action.disabled",
                      },
                    }}
                    variant="contained"
                    startIcon={
                      acceptingEstimate ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : undefined
                    }
                  >
                    {t("common.signAndAccept", {
                      defaultValue: "Sign and Accept",
                    })}
                  </Button>
                </span>
              </Tooltip>
            )}
          <LanguageSwitcher />
        </Box>
        {getRedirectQuery && getRedirectQuery !== "" && (
          <Button
            sx={{
              position: "absolute",
              top: "30px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
            onClick={() => {
              router.push(getRedirectQuery as string);
            }}
            variant="contained"
          >
            {t("common.backToPortal")}
          </Button>
        )}
      </Box>
      <UISignatureUploader
        s3FilePath={s3FilePath}
        ref={signatureUploadRef}
        requireCameraCaptureBeforeOpen={requireCameraCapture}
        onCameraVerificationChange={(value) => {
          setCameraVerificationUrl(value);
          onCameraVerificationChange?.(value);
          localStorage.setItem(
            `${clientEstimationData?.estimateId}-CameraVerification`,
            value,
          );
        }}
        onChange={handleSignatureChangeAndAccept}
        displayButtonName={
          isSalesOrder
            ? t("salesOrderLabel")
            : t("common.estimate")
        }
        submitButtonLabel={t("common.signAndAccept", {
          defaultValue: "Sign and Accept",
        })}
      />
    </Box>
  );
};

export default BoqAcceptAndSignInHeader;
