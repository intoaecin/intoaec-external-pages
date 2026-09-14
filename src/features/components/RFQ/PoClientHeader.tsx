import {
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  CircularProgress,
  useMediaQuery,
  Skeleton,
} from "@mui/material";
import { useState } from "react";
import { useAxios, useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import DownloadIcon from "@/assets/icons/download-icon";
import ViewCommentIcon from "@/assets/icons/view-comment-icon";
import DislikeIcon from "@/assets/icons/dislike-icon";
import { CircularProgressWithLabel } from "../CircularProgressWIthLabel";
import LanguageSwitcher from "../LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { usePdfDownload } from "@/features/hooks/usePdfDownload";

interface PoClientHeaderProps {
  poId: string;
  poData?: any; // PO data from the provider
  onStatusUpdate?: (vendorStatus: "ACCEPTED" | "REJECTED") => void;
  commentMode?: boolean;
  setCommentMode?: React.Dispatch<React.SetStateAction<boolean>>;
  vendorDetails?: {
    vendorName: string;
    vendorEmail: string;
    vendorMobile: string;
    vendorLocation?: string;
    vendorId?: string;
    vendorTaxName?: string;
    vendorTaxId?: string;
  };
  refetchPo?: () => Promise<void>;
}

const PoClientHeader: React.FC<PoClientHeaderProps> = ({
  poId,
  poData,
  onStatusUpdate,
  commentMode,
  setCommentMode,
  vendorDetails,
  refetchPo,
}) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string | null>(
    poData?.vendorStatus || null
  );
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { downloading, downloadPdf, progress } = usePdfDownload();

  const {
    VITE_PROCUREMENT_ENDPOINT,
    VITE_USERHUB_ENDPOINT,
  } = useEnv();
  const { post: updatePo } = useAxios(
    `${VITE_PROCUREMENT_ENDPOINT}/session`
  );
  const { post: fetchUserDomain } = useAxiosWithAuth(
    VITE_USERHUB_ENDPOINT + "/userhub"
  );
  const { organizationId, organizationType } = useOrganization();
  const { t } = useTranslation();
  const allowComments = poData?.allowComments ?? true;

  const handleStatusUpdate = async (vendorStatus: "ACCEPTED" | "REJECTED") => {
    if (vendorStatus === "ACCEPTED") {
      setIsAccepting(true);
    } else {
      setIsRejecting(true);
    }

    try {
      const requestData = {
        eventType: "UPDATE_PURCHASE_ORDER",
        isLeadManagerProfile: !poData?.clientId,
        vendorStatus: vendorStatus,
        senderId: poData?.senderId,
        senderType: poData?.senderType,
        projectId: poData?.projectId,
        poId: poId,
        poTitle: poData?.poTitle,
        poSerial: poData?.poSerial,
        receiverId: poData?.receiverId,
        receiverType: poData?.receiverType,
        aecStatus: poData?.aecStatus,
        projectName: poData?.projectName,
        isShippingDetailsSameAsOrganizationDetails:
          poData?.isShippingDetailsSameAsOrganizationDetails,
        issuedOn: poData?.issuedOn,
        dueDate: poData?.dueDate,
        isTaxDisplay: poData?.isTaxDisplay,
        isWorkOrder: poData?.isWorkOrder,
        poLineItems: poData?.poLineItems,
        organizationId: organizationId,
        organizationType: organizationType,
        requesterUserId: poData?.requesterUserId,
        requesterUserName: poData?.requesterUserName,
        receiverName: poData?.receiverName,
        allowComments,
        shippingAddress:
          poData?.shippingAddress === "" ? undefined : poData?.shippingAddress,
        shippingContact:
          poData?.shippingContact === "" ? undefined : poData?.shippingContact,
      };

      const response = await updatePo(requestData);

      if (response.code === "PURCHASE_ORDER_UPDATED") {
        setCurrentStatus(vendorStatus);
        onStatusUpdate?.(vendorStatus);
        // Refetch PO data after successful update
        if (refetchPo) {
          await refetchPo();
        }
      } else {
        console.error("Failed to update purchase order status");
      }
    } catch (error) {
      console.error("Error updating purchase order status:", error);
    } finally {
      if (vendorStatus === "ACCEPTED") {
        setIsAccepting(false);
      } else {
        setIsRejecting(false);
      }
    }
  };

  const handleAccept = () => {
    handleStatusUpdate("ACCEPTED");
  };

  const handleReject = () => {
    handleStatusUpdate("REJECTED");
  };

  const handlePrintAsPDF = async () => {
    const fileName = `${poData?.isWorkOrder ? "WorkOrder" : "PurchaseOrder"}.pdf`;
    await downloadPdf(fileName, "rfq-preview-pdf");
  };

  return (
    <Box
      className="bg-white py-sm-1 py-md-2 py-3 px-sm-2 px-md-3 px-4 position-sticky t-0 l-0 r-0"
      sx={{
        boxShadow: " 4px 4px 10px 0px rgb(0 0 0 / 5%);",
        zIndex: 50,
      }}
    >
      <Box className="d-flex justify-content-between align-items-center flex-wrap gap-1">
        <Box className="d-flex justify-content-center align-items-center">
          <Box className="fs-5 fw-600">
            <Typography className="fs-5 fw-600">
              {!poData ? (
                <Skeleton variant="text" width={120} />
              ) : (
                <>{poData?.isWorkOrder ? t("common.workOrder") : t("procurement.po")}</>
              )}
            </Typography>
            {!isMobile && (
              <Typography component={"div"}>
                {!poData ? (
                  <Skeleton variant="text" width={200} />
                ) : (
                  <>{poData?.poTitle ? poData?.poTitle : ""}</>
                )}
                {(poData?.aecStatus == "ACCEPTED" ||
                  poData?.vendorStatus == "ACCEPTED" ||
                  currentStatus == "ACCEPTED") && (
                    <span
                      className="px-1 fs-8 mx-1"
                      style={{
                        background: theme.palette.success.main,
                        color: theme.palette.success.contrastText,
                      }}
                    >
                      {t("common.accepted")}
                    </span>
                  )}

                {(poData?.aecStatus == "REJECTED" ||
                  poData?.vendorStatus == "REJECTED" ||
                  currentStatus == "REJECTED") && (
                    <span
                      className="px-1 fs-8 mx-1"
                      style={{
                        background: theme.palette.error.main,
                        color: theme.palette.error.contrastText,
                      }}
                    >
                      {t("common.rejected")}
                    </span>
                  )}
              </Typography>
            )}
          </Box>
        </Box>

        <Box
          className={`d-flex justify-content-between align-items-center ${!isMobile ? "px-3" : "w-100"
            }`}
          sx={{
            paddingBlock: "1px",
            borderLeft: "1px solid #E3E7E9",
          }}
        >
          {/* Download Button */}
          <Box className="d-flex align-items-center">
            <Box className="mr-1 d-flex align-items-center">
              {downloading ? (
                <CircularProgressWithLabel size={40} value={progress} />
              ) : (
                <Tooltip title={t("tooltips.downloadAsPdf")} arrow>
                  <IconButton
                    onClick={handlePrintAsPDF}
                  >
                    <DownloadIcon
                      style={{ width: isMobile ? "20px" : "25px" }}
                    />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {allowComments !== false && (
              <Box className="mr-1 d-flex align-items-center">
                <Tooltip title={t("tooltips.showComments")} arrow>
                  <IconButton
                    onClick={() => {
                      setCommentMode?.(true);
                    }}
                  >
                    <ViewCommentIcon
                      style={{ width: isMobile ? "20px" : "25px" }}
                    />
                  </IconButton>
                </Tooltip>
              </Box>
            )}

            {/* Reject Button - Thumbs Down Icon */}
            {currentStatus == "RECEIVED" && poData.aecStatus != "REJECTED" && (
              <Box className="mr-1 d-flex align-items-center">
                <Tooltip
                  title={isRejecting ? "Rejecting..." : t("common.reject")}
                  arrow
                >
                  <IconButton
                    onClick={handleReject}
                    disabled={isRejecting || isAccepting}
                    sx={{
                      color: theme.palette.error.main,
                    }}
                  >
                    {isRejecting ? (
                      <CircularProgress
                        size={24}
                        sx={{ color: theme.palette.error.main }}
                      />
                    ) : (
                      <DislikeIcon width={isMobile ? "20px" : "24px"} />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
            )}

            <LanguageSwitcher />
          </Box>
          {/* Accept Button - Green Button */}
          <Box className="d-flex align-items-center">
            {currentStatus == "RECEIVED" && poData.aecStatus === "SENT" ? (
              <Box className="mr-2 d-flex align-items-center">
                <Button
                  onClick={handleAccept}
                  disabled={isAccepting || isRejecting}
                  className="color-white"
                  sx={{
                    color: "white",
                    bgcolor: "success.main",
                    ":hover": {
                      bgcolor: "darkgreen",
                      color: "white",
                    },
                  }}
                  variant="contained"
                  startIcon={
                    isAccepting ? (
                      <CircularProgress size={16} sx={{ color: "white" }} />
                    ) : undefined
                  }
                >
                  {isAccepting ? "Accepting..." : t("common.accept")}
                </Button>
              </Box>
            ) : (
              isMobile && (
                <Typography component={"div"}>
                  {!poData ? (
                    <Skeleton variant="text" width={150} />
                  ) : (
                    <>{poData?.poTitle ? poData?.poTitle : ""}</>
                  )}
                  {(poData?.aecStatus == "ACCEPTED" ||
                    poData?.vendorStatus == "ACCEPTED" ||
                    currentStatus == "ACCEPTED") && (
                      <span
                        className="px-1 fs-8 mx-1"
                        style={{
                          background: theme.palette.success.main,
                          color: theme.palette.success.contrastText,
                        }}
                      >
                        {t("common.accepted")}
                      </span>
                    )}

                  {(poData?.aecStatus == "REJECTED" ||
                    poData?.vendorStatus == "REJECTED" ||
                    currentStatus == "REJECTED") && (
                      <span
                        className="px-1 fs-8 mx-1"
                        style={{
                          background: theme.palette.error.main,
                          color: theme.palette.error.contrastText,
                        }}
                      >
                        {t("common.rejected")}
                      </span>
                    )}
                </Typography>
              )
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PoClientHeader;
