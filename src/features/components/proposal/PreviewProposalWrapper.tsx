import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useLeadProposalData } from "../providers/LeadProposalProvider";
import { useProposalComments } from "../providers/ProposalProviders/ProposalSuggestionProvider";
import PreviewProposal from "./PreviewProposal";
import { ProposalAcceptAndSignHeader } from "./ProposalHeaders/AcceptAndSignHeader";
import { ProposalCommentModeHeader } from "./ProposalHeaders/ProposalCommentModeHeader";

import { useEffect } from "react";
import CloseIcon from "@/assets/icons/close-icon";
import { useTranslation } from "react-i18next";
import { LeadProposalDataType } from "@/types";

type LeadProposalCameraData = LeadProposalDataType & {
  cameraVerification?: string | null;
  cameraVerificationImageUrl?: string | null;
  leadCameraVerificationImageUrl?: string | null;
  leadCameraVerificationUrl?: string | null;
  leadSelfieImageUrl?: string | null;
  leadSelfieUrl?: string | null;
  selfieImageUrl?: string | null;
  selfieUrl?: string | null;
};

const getLeadCameraVerificationUrl = (
  proposalData?: LeadProposalDataType,
  capturedCameraVerificationUrl?: string,
) => {
  const cameraData = proposalData as LeadProposalCameraData | undefined;

  return (
    cameraData?.cameraVerificationUrl ||
    cameraData?.cameraVerification ||
    cameraData?.leadCameraVerificationUrl ||
    cameraData?.cameraVerificationImageUrl ||
    cameraData?.leadCameraVerificationImageUrl ||
    cameraData?.selfieUrl ||
    cameraData?.selfieImageUrl ||
    cameraData?.leadSelfieUrl ||
    cameraData?.leadSelfieImageUrl ||
    capturedCameraVerificationUrl ||
    ""
  );
};

export const HowitWorksComponent = forwardRef(
  (props: { leadProposalId: string }, ref) => {
    const [open, setOpen] = useState<boolean>(false);
    const { t } = useTranslation();
    const handleOpen = () => {
      if (
        !localStorage.getItem(
          `how-it-works-proposal-id-${props?.leadProposalId}`
        )
      ) {
        setOpen(true);
      }
    };
    const handleClose = () => {
      localStorage.setItem(
        `how-it-works-proposal-id-${props?.leadProposalId}`,
        "DONE"
      );
      setOpen(false);
    };

    useImperativeHandle(ref, () => ({
      handleClose,
      handleOpen,
    }));
    return (
      <Dialog open={open} disableScrollLock maxWidth={"md"}>
        <DialogTitle
          sx={{
            fontSize: "25px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1, textAlign: "center" }}>
              {t("common.howItWorks")}
            </div>
            <Button onClick={handleClose}>
              <CloseIcon
                style={{ width: "20px", height: "20px", fill: "#ccc" }}
              />
            </Button>
          </div>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <iframe
            src="https://scribehow.com/embed/How_to_Add_Suggestions_to_Proposal__pBa94moiSzGnakkd_0Mrmw?skipIntro=true"
            width="640"
            height="500"
          ></iframe>
        </DialogContent>
      </Dialog>
    );
  }
);

HowitWorksComponent.displayName = "HowitWorksComponent";

export const LeadProposalWrapper = () => {
  const { proposalData } = useLeadProposalData();
  const [commentMode, setCommentMode] = useState(false);

  const { controllerComments, setControllerComments } = useProposalComments();
  const openHowitWorksDialogRef = useRef<any>();

  const [leadSignatureUrl, setLeadSignatureUrl] = useState<string>();
  const [leadCameraVerificationUrl, setLeadCameraVerificationUrl] =
    useState<string>();
  const cameraVerificationUrl = getLeadCameraVerificationUrl(
    proposalData,
    leadCameraVerificationUrl,
  );

  useEffect(() => {
    if (proposalData?.leadSignature) {
      setLeadSignatureUrl(proposalData?.leadSignature);
    }
  }, [proposalData?.leadSignature]);

  useEffect(() => {
    const storedCameraVerificationUrl = localStorage.getItem(
      `${proposalData?.leadProposalId}-CameraVerification`,
    );

    if (storedCameraVerificationUrl) {
      setLeadCameraVerificationUrl(storedCameraVerificationUrl);
    }
  }, [proposalData?.leadProposalId]);
  return (
    <>
      {proposalData?.pages ? (
        <Box className="asdsd" sx={{ overflow: "hidden", height: "100dvh", display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1000,
              backgroundColor: "background.paper",
              borderBottom: "1px solid #ddd",
            }}
          >
            {commentMode ? (
              <ProposalCommentModeHeader
                proposalData={proposalData}
                setCommentMode={setCommentMode}
              />
            ) : (
              <ProposalAcceptAndSignHeader
                setCommentMode={setCommentMode}
                trackAnalytics={true}
                title={proposalData?.proposalTitle}
                setLeadSignatureUrl={setLeadSignatureUrl}
                setLeadCameraVerificationUrl={setLeadCameraVerificationUrl}
                onCommentModeActivate={() => {
                  openHowitWorksDialogRef?.current?.handleOpen();
                }}
              />
            )}
          </Box>
          <Box
            className="asdsd"
            sx={{ flex: 1, overflow: "hidden" }}
          >
            <HowitWorksComponent
              leadProposalId={proposalData?.leadProposalId ?? ""}
              ref={openHowitWorksDialogRef}
            />
            <PreviewProposal
              organizationId={proposalData?.organizationId || ""}
              organizationType={proposalData?.organizationType || ""}
              allowComments={proposalData?.allowComments}
              trackAnalytics={
                !proposalData?.acceptedAt && !proposalData?.declinedAt
                  ? true
                  : false
              }
              pageData={proposalData?.pages}
              commentMode={commentMode}
              leadProposalId={proposalData?.leadProposalId}
              proposalRevision={proposalData?.proposalRevision}
              setCommentMode={setCommentMode}
              setControllerComments={setControllerComments}
              controllerComments={controllerComments}
              leadSignatureUrl={leadSignatureUrl || ""}
              cameraVerificationUrl={cameraVerificationUrl}
              type="LEAD"
            />
          </Box>
        </Box>
      ) : (
        <></>
      )}
    </>
  );
};
