import { useAxios, useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import CloseIcon from "@/assets/icons/close-icon";
import DeclineProposalIcon from "@/assets/icons/decline-proposal-icon";
import DislikeIcon from "@/assets/icons/dislike-icon";
import DownloadIcon from "@/assets/icons/download-icon";
import ReSignIcon from "@/assets/icons/re-sign-icon";
import TickIcon from "@/assets/icons/tick-icon";
import ViewCommentIcon from "@/assets/icons/view-comment-icon";
import { downloadProposalPdf } from "../utils/downloadProposalPdf";
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
import axios from "axios";
import { useRouter } from "next/router";
import { useQueryParams } from "@/hooks/useQueryParams";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import UISignatureUploader from "../../HelperComponents/UISignatureUploader";
import { useDialog } from "../../providers/DialogProvider";
import { useLeadProposalData } from "../../providers/LeadProposalProvider";
import { useLeadData } from "../../providers/LeadProfileProvider";
import { CircularProgressWithLabel } from "../../CircularProgressWIthLabel";
import moment from "moment";
import { LoadingButton } from "@mui/lab";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../LanguageSwitcher";
import { useUsersData } from "@/features/hooks/useUsersData";

type ProposalSignedEmailUser = {
  userId?: string;
  emailId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
};

type ProposalSignedEmailAssignee = {
  id?: string;
  name?: string;
  emailId?: string;
};

type ProposalSignedEmailLeadData = {
  assignees?: ProposalSignedEmailAssignee[];
  projectOwnerId?: string;
  lead?: {
    leadName?: string;
  };
};

type ProposalSignedEmailRecipient = {
  email: string;
  name: string;
};

const getTrimmedEmail = (email?: string) => email?.trim() ?? "";

const getUserDisplayName = (user?: ProposalSignedEmailUser) =>
  user?.name ||
  [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
  user?.username ||
  "";

const getUserFromResponseBody = (
  body: unknown,
): ProposalSignedEmailUser | undefined => {
  if (Array.isArray(body)) {
    return body[0] as ProposalSignedEmailUser | undefined;
  }

  if (body && typeof body === "object") {
    return body as ProposalSignedEmailUser;
  }

  return undefined;
};

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
  const [selectedReasons, setSelectedReasons] = useState<Array<string>>([]);
  const [otherReason, setOtherReason] = useState<string>("");

  useEffect(() => {
    selectedReasonRef.current = selectedReasons;
    if (selectedReasons.length == 0) {
      setCustomButton?.((prev) => ({
        ...prev,
        no: {
          ...(prev?.no ?? {}),
          text: t("common.cancel"),
        },
        yes: {
          ...(prev?.yes ?? {}),
          disable: true,
          text: t("common.confirm"),
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
            text: t("common.cancel"),
          },
          yes: {
            // ...(prev?.yes ?? {}),
            disable: otherReason ? false : true,
            text: t("common.confirm"),
            // color: "primary.light",
          },
        }));
        // }
      } else {
        setCustomButton?.((prev) => ({
          ...prev,
          no: {
            ...(prev?.no ?? {}),
            text: t("common.cancel"),
          },
          yes: {
            ...(prev?.yes ?? {}),
            disable: false,
            text: t("common.confirm"),
            color: "primary.main",
          },
        }));
      }
    }
  }, [selectedReasons, otherReason]);
  useEffect(() => {
    otherReasonRef.current = otherReason;
  }, [otherReason]);
  const { t } = useTranslation();
  const reasons = [
    t("reasons.budget"),
    t("reasons.scope"),
    t("reasons.terms"),
    t("reasons.communication"),
    t("reasons.costs"),
    t("reasons.vendor"),
    t("reasons.other"),
  ];
  return (
    <>
      <DialogTitle id="alert-dialog-title" className="d-inline-block mb-2 mt-1">
        <span className="">{t("common.reasonForDeclining")}</span>
      </DialogTitle>
      <Divider />

      <DialogContent className="d-flex">
        <div style={{ borderRight: "1px solid #E7E7E7" }}>
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
                placeholder={t("common.enterOtherReason")}
                value={otherReason}
                onChange={(e) => {
                  setOtherReason(e.target.value);
                }}
              />
            )}
          </FormGroup>
        </div>
        <div className="d-flex align-items-center p-1">
          <DeclineProposalIcon width={"250px"} />
        </div>
      </DialogContent>
    </>
  );
};

export const ProposalAcceptAndSignHeader = ({
  title,
  setCommentMode,
  setLeadSignatureUrl,
  setLeadCameraVerificationUrl,
  onCommentModeActivate,
  trackAnalytics,
}: {
  title: string;
  setCommentMode?: Dispatch<SetStateAction<boolean>>;
  setLeadSignatureUrl: any;
  setLeadCameraVerificationUrl?: Dispatch<SetStateAction<string | undefined>>;
  onCommentModeActivate?: () => void;
  trackAnalytics?: boolean;
}) => {
  const selectedReasonRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { proposalData, fetchData } = useLeadProposalData();
  const { leadData } = useLeadData();
  const { usersData } = useUsersData();
  const otherReasonRef = useRef("");
  const signatureUploadRef = useRef<any>();
  const router = useRouter();
  const { isLeadManagerProfile } = useQueryParams();
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const s3FilePath: any = `${proposalData?.organizationId}/${proposalData?.organizationType}/PROPOSAL/${proposalData?.leadProposalId}/SIGNATURE`;
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [eSignUrl, setEsignUrl] = useState<string>("");
  const [cameraVerificationUrl, setCameraVerificationUrl] =
    useState<string>("");

  const { t } = useTranslation();
  const allowComments = proposalData?.allowComments !== false;
  const requireCameraCapture = proposalData?.captureImage === true;

  const {
    VITE_PROPOSAL_ENDPOINT,
    VITE_AECPOSTMAN_ENDPOINT,
    VITE_LEADMANAGER_ENDPOINT,
    VITE_USERHUB_ENDPOINT,
  } = useEnv();
  const { post: update } = useAxios<any>(
    VITE_PROPOSAL_ENDPOINT + "/lead-proposals",
  );
  const { post: sendPost } = useAxiosWithAuth<any>(
    VITE_AECPOSTMAN_ENDPOINT + "/validate-request",
  );
  const { post: fetchLeadForSignedEmail } = useAxiosWithAuth<any>(
    VITE_LEADMANAGER_ENDPOINT + "/fetch",
  );
  const { post: fetchUserForSignedEmail } = useAxiosWithAuth<any>(
    VITE_USERHUB_ENDPOINT + "/userhub",
  );
  const projectAssignee = useMemo(() => {
    const assignees =
      (leadData as ProposalSignedEmailLeadData | undefined)?.assignees ?? [];

    for (const assignee of assignees) {
      const emailId = getTrimmedEmail(assignee.emailId);

      if (emailId) {
        return {
          emailId,
          name: assignee.name,
          userId: assignee.id,
        };
      }

      const matchedUser = usersData?.find((user) => user.userId === assignee.id);
      const matchedEmailId = getTrimmedEmail(matchedUser?.emailId);

      if (matchedEmailId) {
        return matchedUser;
      }
    }

    return undefined;
  }, [leadData?.assignees, usersData]);
  const projectAssigneeEmail = getTrimmedEmail(projectAssignee?.emailId);
  const projectAssigneeName = [projectAssignee?.name].filter(Boolean).join(" ");
  const reporterUser = useMemo(() => {
    const reporterId = leadData?.projectOwnerId;

    if (!reporterId) {
      return undefined;
    }

    return usersData?.find((user) => user.userId === reporterId);
  }, [leadData?.projectOwnerId, usersData]);
  const reporterEmail = getTrimmedEmail(reporterUser?.emailId);
  const reporterName = getUserDisplayName(reporterUser);
  const resolveUserById = useCallback(
    async (userId?: string): Promise<ProposalSignedEmailRecipient | undefined> => {
      if (!userId) {
        return undefined;
      }

      const matchedUser = usersData?.find((user) => user.userId === userId);
      const matchedEmail = getTrimmedEmail(matchedUser?.emailId);

      if (matchedEmail) {
        return {
          email: matchedEmail,
          name: getUserDisplayName(matchedUser),
        };
      }

      const data = await fetchUserForSignedEmail({
        eventType: "GET_USER_BY_ID",
        userId,
      });

      if (data?.code !== "USERS_RETRIEVED") {
        return undefined;
      }

      const user = getUserFromResponseBody(data.body);
      const email = getTrimmedEmail(user?.emailId);

      if (!email) {
        return undefined;
      }

      return {
        email,
        name: getUserDisplayName(user),
      };
    },
    [fetchUserForSignedEmail, usersData],
  );
  const resolveAssigneeRecipient = useCallback(
    async (
      assignees?: ProposalSignedEmailAssignee[],
    ): Promise<ProposalSignedEmailRecipient | undefined> => {
      for (const assignee of assignees ?? []) {
        const email = getTrimmedEmail(assignee.emailId);

        if (email) {
          return {
            email,
            name: assignee.name ?? "",
          };
        }

        const userRecipient = await resolveUserById(assignee.id);

        if (userRecipient) {
          return {
            email: userRecipient.email,
            name: userRecipient.name || assignee.name || "",
          };
        }
      }

      return undefined;
    },
    [resolveUserById],
  );
  const resolveSignedEmailRecipient = useCallback(async () => {
    const localLeadData = leadData as ProposalSignedEmailLeadData | undefined;

    const existingRecipient =
      projectAssigneeEmail || reporterEmail
        ? {
            email: projectAssigneeEmail || reporterEmail,
            name: projectAssigneeName || reporterName,
          }
        : undefined;

    if (existingRecipient) {
      return {
        ccEmailIds:
          reporterEmail && reporterEmail !== existingRecipient.email
            ? [reporterEmail]
            : [],
        companyName: localLeadData?.lead?.leadName,
        recipient: existingRecipient,
      };
    }

    const localAssigneeRecipient = await resolveAssigneeRecipient(
      localLeadData?.assignees,
    );

    if (localAssigneeRecipient) {
      return {
        ccEmailIds: [],
        companyName: localLeadData?.lead?.leadName,
        recipient: localAssigneeRecipient,
      };
    }

    const fetchedLead =
      proposalData?.projectId &&
      (await fetchLeadForSignedEmail({
        eventType: "GET_LEAD_BY_ID",
        projectId: proposalData.projectId,
      }));
    const fetchedLeadData =
      fetchedLead?.code === "LEAD_RETRIEVED"
        ? (fetchedLead.body as ProposalSignedEmailLeadData)
        : undefined;
    const fetchedAssigneeRecipient = await resolveAssigneeRecipient(
      fetchedLeadData?.assignees,
    );
    const ownerRecipient = await resolveUserById(
      fetchedLeadData?.projectOwnerId || localLeadData?.projectOwnerId,
    );
    const fallbackRecipient = await resolveUserById(
      proposalData?.requesterUserId,
    );
    const recipient =
      fetchedAssigneeRecipient || ownerRecipient || fallbackRecipient;

    if (!recipient) {
      return undefined;
    }

    return {
      ccEmailIds:
        ownerRecipient?.email && ownerRecipient.email !== recipient.email
          ? [ownerRecipient.email]
          : [],
      companyName: fetchedLeadData?.lead?.leadName || localLeadData?.lead?.leadName,
      recipient,
    };
  }, [
    fetchLeadForSignedEmail,
    leadData,
    projectAssigneeEmail,
    projectAssigneeName,
    proposalData?.projectId,
    proposalData?.requesterUserId,
    reporterEmail,
    reporterName,
    resolveAssigneeRecipient,
    resolveUserById,
  ]);
  const sendProposalSignedEmail = useCallback(async () => {
    const proposalLink = `${window.location.origin}/proposal/${proposalData?.leadProposalId}?proposalRevision=${proposalData?.proposalRevision}`;
    const signedDate = moment().format("DD/MM/YYYY hh:mm:ss A");

    try {
      const emailRecipient = await resolveSignedEmailRecipient();

      if (!emailRecipient?.recipient.email) {
        console.error("Failed to send proposal signed email: recipient missing");
        return;
      }

      await sendPost({
        eventType: "SEND_POST",
        communicationMode: "EMAIL",
        sourceType: "INTOAEC",
        destinationType: "ORGANIZATION",
        destinationId: proposalData?.organizationId,
        destinationContactId: emailRecipient.recipient.email,
        leadId: proposalData?.leadId,
        emailRequirements: {
          organizationId: proposalData?.organizationId,
          organizationType: proposalData?.organizationType,
          notificationTemplateName: "LEAD_SIGNED_PROPOSAL",
          leadId: proposalData?.leadId,
          projectId: proposalData?.projectId,
          ccEmailIds: emailRecipient.ccEmailIds,
          "{RECIPIENT_NAME}": emailRecipient.recipient.name,
          "{PROPOSAL_TITLE}": proposalData?.proposalTitle,
          "{PROPOSAL_LINK}": proposalLink,
          "{SIGNED_DATE}": signedDate,
          "{COMPANY_NAME}": emailRecipient.companyName,
          isCommunication: true,
        },
      });
    } catch (emailError) {
      console.error("Failed to send proposal signed email:", emailError);
    }
  }, [
    proposalData?.leadId,
    proposalData?.leadProposalId,
    proposalData?.organizationId,
    proposalData?.organizationType,
    proposalData?.projectId,
    proposalData?.proposalRevision,
    proposalData?.proposalTitle,
    resolveSignedEmailRecipient,
    sendPost,
  ]);
  const {
    popup: rejectProposalDialog,
    setPrimaryButton: setShowHidePopupPrimaryButton,
    closeModal: closeShowHidePopup,
    setCustomButton,
  } = useDialog();
  useEffect(() => {
    localStorage.setItem(`${proposalData?.leadProposalId}-Signature`, eSignUrl);
  }, [eSignUrl]);
  useEffect(() => {
    const storedEsignUrl = localStorage.getItem(
      `${proposalData?.leadProposalId}-Signature`,
    );
    if (storedEsignUrl !== null) {
      setLeadSignatureUrl(storedEsignUrl);
      setEsignUrl(storedEsignUrl);
    }
  }, []);
  const handlePrintAsPDF = async () => {
    const pages = proposalData?.pages;
    if (pages) {
      if (proposalData?.leadProposalId && trackAnalytics) {
        axios.post("/api/add-to-queue", {
          eventType: "REGISTER_PROPOSAL_ANALYTICS",
          leadProposalId: proposalData?.leadProposalId,
          proposalRevision: proposalData?.proposalRevision,
          downloaded: true,
        });
      }

      try {
        await downloadProposalPdf({
          pageIds: pages.map((page: any) => page?.pageId),
          fileName: "proposal.pdf",
          onProgress: setProgress,
        });
      } catch (error) {
        console.error("Error generating PDF:", error);
      } finally {
        setProgress(0);
      }
    }
  };
  const rejectProposal = async () => {
    try {
      const requestData = {
        eventType: "DECLINE_PROPOSAL",
        leadProposalId: proposalData?.leadProposalId,
        proposalRevision: proposalData?.proposalRevision,
        projectName: proposalData?.projectName,
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
  const acceptProposal = async (signatureUrl: string = eSignUrl) => {
    try {
      const requestData = {
        eventType: "ACCEPT_PROPOSAL",
        leadProposalId: proposalData?.leadProposalId,
        proposalRevision: proposalData?.proposalRevision,
        projectName: proposalData?.projectName,
        leadSignature: signatureUrl,
        cameraVerificationUrl,
        isLeadManagerProfile: router.query.isLeadManagerProfile,
      };

      const data = await update(requestData);
      if (data.code === "ACCEPTED_PROPOSAL") {
        window.location.reload();
        router.push(router.asPath);
        toast.success("Proposal Accepted");

        console.log("profile", data.body);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleRejectProposal = () => {
    setCustomButton((prev) => ({
      ...prev,
      no: {
        ...(prev?.no ?? {}),
        text: t("common.cancel", {
          defaultValue: "Cancel",
        }),
      },
      yes: {
        ...(prev?.yes ?? {}),
        text: t("common.confirm", {
          defaultValue: "Confirm",
        }),
        color: "primary.main",
      },
    }));
    setShowHidePopupPrimaryButton("No");
    rejectProposalDialog({
      content: (
        <ReasonForDeclineDialogContent
          setCustomButton={setCustomButton}
          otherReasonRef={otherReasonRef}
          selectedReasonRef={selectedReasonRef}
        />
      ),
      onYes: async () => {
        await rejectProposal().finally(() => {
          fetchData?.();
        });
      },
      onNo: async () => {
        console.log("No button clicked");
      },
    });
  };
  const handleAcceptProposal = async () => {
    if (eSignUrl) {
      setIsLoading(true);
      await acceptProposal().finally(() => {
        setIsLoading(false);
        fetchData?.();
      });
    } else {
      toast.error(
        t("toast.pleaseUploadYourSignature", {
          defaultValue: "Please upload your signature",
        }),
      );
    }
  };
  const handleSignatureChangeAndAccept = async (value: string) => {
    setEsignUrl(value);
    setLeadSignatureUrl(value);
    // await sendProposalSignedEmail();
    await acceptProposal(value).finally(() => {
      fetchData?.();
    });
  };

  // const handleChange = (event: any) => {
  //   const { value, checked } = event.target;
  //   selectedReasonRef.current = checked
  //     ? [...selectedReasonRef.current, value]
  //     : selectedReasonRef.current.filter((reason) => reason !== value);
  // };

  // const handleOtherChange = (event: any) => {
  //   const { checked } = event.target;
  //   if (!checked) {
  //     selectedReasonRef.current = selectedReasonRef.current.filter(
  //       (reason) => reason !== "Other"
  //     );
  //     otherReasonRef.current = "";
  //   }
  // };
  const getRedirectQuery = router.query.redirect;
  return (
    <Box
      className="d-flex justify-content-between align-items-center row py-2 px-2"
      sx={{
        backgroundColor: "background.paper",
      }}
    >
      {getRedirectQuery && getRedirectQuery !== "" && (
        <Button
          sx={{ position: "absolute", top: "25px", left: "47%" }}
          onClick={() => {
            router.push(getRedirectQuery as string);
          }}
          className="btnSuccessUI"
        >
          {t("common.backToPortal")}
        </Button>
      )}
      <div>
        <Typography variant="h6">{title}</Typography>
        <div>
          {proposalData?.leadSignature && proposalData?.acceptedAt && (
            <Typography sx={{ color: "success.main" }}>
              {t("estimateStatus.ACCEPTED")}
            </Typography>
          )}
          {proposalData?.declinedAt && (
            <Typography sx={{ color: "error.main" }}>
              {t("common.declinedAt")}{" "}
              {moment(
                new Date(parseInt(proposalData?.declinedAt?.toString())),
              ).format("DD/MM/YYYY hh:mm:ss A")}
            </Typography>
          )}
        </div>
      </div>
      <div className="d-flex">
        <div className="mr-2 d-flex align-items-center">
          {proposalData?.isAllowDownload &&
            (downloading ? (
              <CircularProgressWithLabel size={40} value={progress} />
            ) : (
              <Tooltip title={t("tooltips.downloadAsPdf")} arrow>
                <IconButton
                  onClick={() => {
                    setDownloading(true);
                    handlePrintAsPDF().finally(() => {
                      setDownloading(false);
                      setProgress(0);
                    });
                  }}
                >
                  <DownloadIcon style={{ width: "25px" }} />
                </IconButton>
              </Tooltip>
            ))}
        </div>
        {!proposalData?.acceptedAt && allowComments && (
          <div className="mr-2 d-flex align-items-center">
            <Tooltip title={t("tooltips.showComments")} arrow>
              <IconButton
                onClick={() => {
                  setCommentMode?.(true);
                  onCommentModeActivate?.();
                }}
              >
                <ViewCommentIcon style={{ width: "25px" }} />
              </IconButton>
            </Tooltip>
          </div>
        )}
        {!proposalData?.leadSignature &&
          !proposalData?.acceptedAt &&
          !proposalData?.declinedAt && (
            <div className="mr-2 d-flex align-items-center">
              <Tooltip title={t("common.declineProposal")} arrow>
                <IconButton onClick={handleRejectProposal}>
                  <DislikeIcon width={"24px"} />
                </IconButton>
              </Tooltip>
            </div>
          )}
        {eSignUrl && (
          <div className="mr-2 d-flex align-items-center">
            <Tooltip title={t("common.resignProposal")} arrow>
              <IconButton
                onClick={() => signatureUploadRef?.current?.handleOpen()}
              >
                <ReSignIcon width={"20px"} />
              </IconButton>
            </Tooltip>
          </div>
        )}
        <Box sx={{}}>
          <>
            {eSignUrl &&
              !proposalData?.acceptedAt &&
              !proposalData?.declinedAt && (
                <LoadingButton
                  loading={isLoading}
                  onClick={handleAcceptProposal}
                  sx={{
                    bgcolor: "success.main",
                    ":hover": {
                      bgcolor: "darkgreen",
                    },
                  }}
                  variant="contained"
                >
                  {t("common.signAndAccept", {
                    defaultValue: "Sign and Accept",
                  })}
                </LoadingButton>
              )}
          </>
          {!proposalData?.leadSignature &&
            !proposalData?.acceptedAt &&
            !proposalData?.declinedAt &&
            !eSignUrl && (
              <Button
                onClick={() => signatureUploadRef?.current?.handleOpen()}
                sx={{
                  bgcolor: "primary.main",
                  ":hover": {
                    bgcolor: "primary",
                  },
                }}
                variant="contained"
              >
                {t("common.signAndAccept", {
                  defaultValue: "Sign and Accept",
                })}
              </Button>
            )}
          <LanguageSwitcher />
        </Box>
        <UISignatureUploader
          s3FilePath={s3FilePath}
          ref={signatureUploadRef}
          requireCameraCaptureBeforeOpen={requireCameraCapture}
          onCameraVerificationChange={(value) => {
            setCameraVerificationUrl(value);
            setLeadCameraVerificationUrl?.(value);
            localStorage.setItem(
              `${proposalData?.leadProposalId}-CameraVerification`,
              value,
            );
          }}
          onChange={handleSignatureChangeAndAccept}
          displayButtonName={t("module.Proposal")}
          submitButtonLabel={t("common.signAndAccept", {
            defaultValue: "Sign and Accept",
          })}
        />
      </div>
    </Box>
  );
};
