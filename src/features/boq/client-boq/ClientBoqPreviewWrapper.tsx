import BoqAcceptAndSignInHeader from "@/features/components/boq/BoqPreviewHeader/BoqAcceptAndSignInHeader";
import BoqCommentHeader from "@/features/components/boq/BoqPreviewHeader/BoqCommentModeHeader";
import PageLoader from "@/features/components/Loader/PageLoader";
import { useEstimationData } from "@/features/components/providers/BoqProvider/BoqClientEstimateDataProvider";
import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import BoqPreview from "./BoqPreview";
import { BoqClientEstimateResponseType } from "@/types";

type EstimateCameraData = BoqClientEstimateResponseType & {
  cameraVerification?: string;
  cameraVerificationImageUrl?: string;
  clientCameraVerificationImageUrl?: string;
  clientCameraVerificationUrl?: string;
  clientSelfieImageUrl?: string;
  clientSelfieUrl?: string;
  selfieImageUrl?: string;
  selfieUrl?: string;
};

const getEstimateCameraVerificationUrl = (
  clientEstimationData?: BoqClientEstimateResponseType,
  capturedCameraVerificationUrl?: string,
) => {
  const cameraData = clientEstimationData as EstimateCameraData | undefined;

  return (
    cameraData?.cameraVerificationUrl ||
    cameraData?.cameraVerification ||
    cameraData?.clientCameraVerificationUrl ||
    cameraData?.cameraVerificationImageUrl ||
    cameraData?.clientCameraVerificationImageUrl ||
    cameraData?.selfieUrl ||
    cameraData?.selfieImageUrl ||
    cameraData?.clientSelfieUrl ||
    cameraData?.clientSelfieImageUrl ||
    capturedCameraVerificationUrl
  );
};

const ClientBoqPreviewWrapper = ({
  entityType = "ESTIMATE",
}: {
  entityType?: "ESTIMATE" | "SALES_ORDER";
}) => {
  const [commentMode, setCommentMode] = useState(false);
  const [signedClientSignature, setSignedClientSignature] = useState<string>();
  const [signedCameraVerificationUrl, setSignedCameraVerificationUrl] =
    useState<string>();
  const {
    clientEstimateSectionData: data,
    loading,
    clientEstimationData,
  } = useEstimationData();
  const previewClientEstimateData = clientEstimationData
    ? {
        ...clientEstimationData,
        cameraVerificationUrl: getEstimateCameraVerificationUrl(
          clientEstimationData,
          signedCameraVerificationUrl,
        ),
        clientSignature:
          signedClientSignature ?? clientEstimationData.clientSignature,
      }
    : clientEstimationData;

  useEffect(() => {
    setSignedClientSignature(undefined);
    setSignedCameraVerificationUrl(undefined);
  }, [clientEstimationData?.estimateId]);

  useEffect(() => {
    const storedCameraVerificationUrl = localStorage.getItem(
      `${clientEstimationData?.estimateId}-CameraVerification`,
    );

    if (storedCameraVerificationUrl) {
      setSignedCameraVerificationUrl(storedCameraVerificationUrl);
    }
  }, [clientEstimationData?.estimateId]);

  return (
    <OrganizationLocalizationProvider
      organizationId={clientEstimationData?.organizationId}
      organizationType={clientEstimationData?.organizationType}
    >
      <Box
        sx={{
          background: "#F5F6F8",
          minHeight: "100vh",
        }}
      >
        {loading ? (
          <>
            <PageLoader />
          </>
        ) : (
          <>
            {commentMode ? (
              <BoqCommentHeader
                estimateTitle={clientEstimationData?.estimateTitle ?? ""}
                setCommentMode={setCommentMode}
              />
            ) : (
              <BoqAcceptAndSignInHeader
                setCommentMode={setCommentMode}
                onSignatureChange={setSignedClientSignature}
                onCameraVerificationChange={setSignedCameraVerificationUrl}
                trackAnalytics={
                  !clientEstimationData?.acceptedAt &&
                  !clientEstimationData?.declinedAt
                    ? true
                    : false
                }
              />
            )}

            <BoqPreview
              commentMode={commentMode}
              allowComments={clientEstimationData?.allowComments}
              data={data || []}
              setCommentMode={setCommentMode}
              type="CLIENT"
              clientEstimateId={clientEstimationData?.estimateId}
              columns={clientEstimationData?.columns}
              validTill={clientEstimationData?.estimateValidTill || 0}
              projectId={clientEstimationData?.projectId || ""}
              clientEstimateData={previewClientEstimateData}
              withAuth={false}
              organizationId={clientEstimationData?.organizationId || ""}
              grandTotal={clientEstimationData?.grandTotal || 0}
              trackAnalytics={
                !clientEstimationData?.acceptedAt &&
                !clientEstimationData?.declinedAt
                  ? true
                  : false
              }
              entityType={entityType}
            />
          </>
        )}
      </Box>
    </OrganizationLocalizationProvider>
  );
};

export default ClientBoqPreviewWrapper;
