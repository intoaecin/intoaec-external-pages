import {
  Box,
  Button,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAxios, useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import DownloadIcon from "@/assets/icons/download-icon";
import ViewCommentIcon from "@/assets/icons/view-comment-icon";
import DislikeIcon from "@/assets/icons/dislike-icon";
import { CircularProgressWithLabel } from "../CircularProgressWIthLabel";
import LanguageSwitcher from "../LanguageSwitcher";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  encryptAES,
  fetchAndInlineResources,
} from "@/lib/helpers";

interface RfqClientHeaderProps {
  rfqId: string;
  rfqData?: any; // RFQ data from the provider
  onStatusUpdate?: (vendorStatus: "DECLINED") => void;
  commentMode?: boolean;
  setCommentMode?: React.Dispatch<React.SetStateAction<boolean>>;
  vendorDetails?: {
    vendorName: string;
    vendorEmail: string;
    vendorMobile: string;
    vendorLocation?: string;
    vendorId?: string;
    vendorTaxId?: string;
    vendorTaxName?: string;
  };
  // New props for price editing in header
  isEditingPrices?: boolean;
  onToggleEditPrices?: () => void;
  onUpdatePricesClick?: () => void;
  // Loading state while saving updates
  isSaving?: boolean;
}

const RfqClientHeader: React.FC<RfqClientHeaderProps> = ({
  rfqId,
  rfqData,
  onStatusUpdate,
  commentMode,
  setCommentMode,
  vendorDetails,
  isEditingPrices,
  onToggleEditPrices,
  onUpdatePricesClick,
  isSaving,
}) => {
  const [isRejecting, setIsRejecting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string | null>(
    rfqData?.vendorStatus || null
  );
  const [downloading, setDownloading] = useState<boolean>(false);

  const {
    VITE_PROCUREMENT_ENDPOINT,
    VITE_AEC_CHATBOT_ENDPOINT,
    VITE_ACCESS_KEY,
    VITE_AEC_PORTAL_URL,
  } = useEnv();

  const { post: updateRfq } = useAxios(
    `${VITE_PROCUREMENT_ENDPOINT}/session`,
    false
  );

  const { organizationId, organizationType } = useOrganization();
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const allowComments =
    rfqData?.allowComments ?? rfqData?.rfq?.allowComments ?? true;

  const handleStatusUpdate = async (vendorStatus: "DECLINED") => {
    setIsRejecting(true);

    try {
      const nestedRfq = rfqData?.rfq;
      const resolvedRfqSerial =
        nestedRfq?.rfqSerial ??
        rfqData?.rfqSerial ??
        rfqData?.serialNumber;
      const requestData = {
        eventType: "UPDATE_VENDOR_RFQ_STATUS",
        isLeadManagerProfile: !rfqData?.clientId,
        rfqSerial: resolvedRfqSerial,
        projectName: nestedRfq?.projectName ?? rfqData?.projectName,
        vendorRfqId: rfqData?.vendorRfqId,
        vendorStatus: vendorStatus,
        rfqId: rfqData?.rfqId ?? rfqId,
        projectId: nestedRfq?.projectId ?? rfqData?.projectId,
        architectId: rfqData?.senderId,
        senderId: rfqData?.senderId,
        senderType: rfqData?.senderType,
        rfqName: nestedRfq?.rfqName ?? rfqData?.rfqName,
        organizationId: organizationId,
        organizationType: organizationType,
        receiverName: rfqData?.receiverName,
      };

      const response = await updateRfq(requestData);

      if (response.code === "RFQ_UPDATED") {
        setCurrentStatus(vendorStatus);
        onStatusUpdate?.(vendorStatus);
      } else {
        console.error("Failed to update RFQ status");
      }
    } catch (error) {
      console.error("Error updating RFQ status:", error);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleReject = () => {
    handleStatusUpdate("DECLINED");
  };

  const handlePrintAsPDF = async () => {
    const params = {
      organizationId: rfqData?.senderId,
      projectId: rfqData?.projectId,
      rfqId: rfqData?.rfqId,
      vendorDetails: vendorDetails,
    };
    const encryptedParams = await encryptAES(
      JSON.stringify(params),
      VITE_ACCESS_KEY
    );

    // This app has no server of its own — the export page lives on the real
    // intoaec-UI app, so forward there for the SSR HTML used to build the PDF
    // (same pattern as the estimate-view PDF forwarding in
    // BoqAcceptAndSignInHeader.tsx). NOTE: unlike /createEstimatePreview,
    // /client-rfqexport is not yet CORS-enabled in intoaec-UI's next.config.js
    // — this call will fail cross-origin until that's added there.
    const myItemPdfLink = `${VITE_AEC_PORTAL_URL}/client-rfqexport?params=${encodeURIComponent(
      encryptedParams
    )}`;

    const htmlContent = (
      await fetchAndInlineResources(
        await fetch(myItemPdfLink).then((res) => res.text()),
        VITE_AEC_PORTAL_URL
      )
    ).replaceAll("h-100", "");

    try {
      const response = await axios.post(
        VITE_AEC_CHATBOT_ENDPOINT + "/download-pdf",
        { htmlContent: htmlContent, fileName: "items.pdf" },
        {
          responseType: "arraybuffer",
        }
      );

      const pdfBuffer = response.data;

      const blob = new Blob([pdfBuffer], { type: "application/pdf" });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `RequestForQuotation.pdf`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  useEffect(() => {
    setCurrentStatus(rfqData?.vendorStatus);
  }, [rfqData]);

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
          <Typography className="fs-5 fw-600">
            {t("procurement.rfq")}
            {!isMobile && (
              <Typography component={"div"}>
                {(currentStatus === "DECLINED" ||
                  rfqData?.aecStatus === "DECLINED") && (
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
          </Typography>
        </Box>

        <Box
          className={`d-flex justify-content-between align-items-center ${
            !isMobile ? "px-3" : "w-100"
          }`}
          sx={{
            paddingBlock: "1px",
            borderLeft: "1px solid #E3E7E9",
          }}
        >
          <Box className="d-flex align-items-center">
            <Box className="mr-1 d-flex align-items-center">
              {downloading ? (
                <CircularProgressWithLabel size={40} value={20} />
              ) : (
                <Tooltip title={t("tooltips.downloadAsPdf")} arrow>
                  <IconButton
                    onClick={() => {
                      setDownloading(true);
                      handlePrintAsPDF().finally(() => {
                        setDownloading(false);
                      });
                    }}
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

            {rfqData?.aecStatus != "DECLINED" &&
              currentStatus != "DECLINED" && (
                <Box className="mr-1 d-flex align-items-center">
                  <Tooltip
                    title={isRejecting ? "Rejecting..." : t("common.reject")}
                    arrow
                  >
                    <IconButton
                      onClick={handleReject}
                      disabled={isRejecting}
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

          <Box className="d-flex align-items-center">
            {/* Edit/Update Prices Buttons */}
            <Box className="mr-2 d-flex align-items-center gap-2">
              {isEditingPrices ? (
                <>
                  <Button
                    variant="outlined"
                    onClick={onToggleEditPrices}
                    disabled={!!isSaving}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={onUpdatePricesClick}
                    disabled={!!isSaving}
                  >
                    {isSaving ? t("common.saving") : t("common.save")}
                  </Button>
                </>
              ) : (
                <>
                  {rfqData?.aecStatus !== "DECLINED" &&
                  currentStatus !== "DECLINED" ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={onToggleEditPrices}
                    >
                      {t("common.updatePrice")}
                    </Button>
                  ) : (
                    isMobile && (
                      <Typography component={"div"}>
                        {(currentStatus === "DECLINED" ||
                          rfqData?.aecStatus === "DECLINED") && (
                          <span
                            className="px-1 fs-7 mx-1"
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
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RfqClientHeader;
