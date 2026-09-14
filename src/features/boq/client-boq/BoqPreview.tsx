import { BoqCommentPopup } from "@/features/components/boq/BoqCommentPopup";
import BusinessAndClientInfo from "@/features/components/boq/BuisinessAndClientInfo";
import NextImage from "@/features/components/NextImage";
import { useEstimateCommentsData } from "@/features/components/providers/BoqProvider/BoqSuggestionProvider";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import ProposalLeadCommentsIcon from "@/assets/icons/proposalLeadComments-icon";
import axios from "axios";
import {
  formatDateBasedOnOrganizationLocalization,
  formatNumberITL,
  formatSeedValues,
  getLocalizationValue,
} from "@/lib/helpers";
import { useTranslationText } from "@/hooks/useTranslationText";
import {
  calculateSequentialDiscounts,
  calculateSequentialTaxes,
} from "@/utils/sequentialDiscountCalculator";
import {
  BoqClientEstiamteSectionResponseType,
  BoqClientEstimateSectionType,
  EstimateSuggestionType,
} from "@/types";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SendIcon from "@mui/icons-material/Send";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  SxProps,
  Stack,
  Theme,
} from "@mui/material";
import { useRouter } from "next/router";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { formatCurrencyAndConvertToWords } from "@/lib/helpers";
import SectionTable from "./BoqPreliminaryTable";
import PlateEditor from "@/components/plate-editor";
import { PlateProvider } from "@/features/components/providers/PlateProvider";
import { useEnv } from "@/features/hooks/useEnv";
import { useEstimationData } from "@/features/components/providers/BoqProvider/BoqClientEstimateDataProvider";
import { useTranslation } from "react-i18next";
import { defaultBOQColumns } from "@/lib/constants";
import { TruncatedText } from "@/components_v2/TruncatedText";
import StatusLabel from "@/components/StatusLabel";
import AttachmentPreviewTiles from "@/features/attachments/AttachmentPreviewTiles";
import { getAttachmentUploadValues } from "@/features/attachments/attachmentUploadHelpers";

const sortVisibleColumns = (columns?: any[]) => {
  if (!Array.isArray(columns)) return [];
  // If NOT app → filter showToCustomer
  const filtered = columns.filter(
    (col) => col.showToCustomer && col.disabled !== false,
  );

  return filtered.sort((a, b) => {
    if (a.accessor === "itemDescription") return -1;
    if (b.accessor === "itemDescription") return 1;
    if (a.accessor === "totalCost") return 1;
    if (b.accessor === "totalCost") return -1;

    return Number(b.fixedOrder) - Number(a.fixedOrder);
  });
};

const getPdfColumnWidth = (columnValue?: string) => {
  switch (columnValue) {
    case "itemName":
      return "35%";
    case "quantity":
      return "7%";
    case "unit":
      return "7%";
    case "ratePerUnit":
    case "rateIncluProfit":
      return "10%";
    case "startDate":
      return "12%";
    case "duration":
      return "8%";
    case "endDate":
      return "12%";
    case "totalCost":
      return "9%";
    default:
      return "10%";
  }
};

const isDateColumn = (columnValue?: string) =>
  columnValue === "startDate" || columnValue === "endDate";

const dateColumnCellSx = {
  minWidth: "96px",
  whiteSpace: "nowrap",
  overflowWrap: "normal",
  wordBreak: "normal",
};

const pdfColumnDivider = "1px solid #DDE7F2";

const pdfWrapSx = {
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
  lineHeight: 1.3,
};

const isEmptyPreviewValue = (value: unknown) =>
  value === null ||
  value === undefined ||
  (typeof value === "string" && value.trim() === "");

const isEmptyOrZeroPreviewValue = (value: unknown) =>
  isEmptyPreviewValue(value) || Number(value) === 0;

const hasPreviewDescription = (value?: string | null) => {
  if (!value) return false;

  return Boolean(
    value
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim(),
  );
};

const decodePreviewDescriptionText = (value: string) =>
  value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const getPreviewDescriptionText = (value?: string | null, wordLimit = 150) => {
  if (!value) return "";

  const text = decodePreviewDescriptionText(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
      .replace(/<[^>]*>/g, " "),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .trim();

  const words = text.split(/\s+/).filter(Boolean);

  if (words.length <= wordLimit) {
    return text;
  }

  return `${words.slice(0, wordLimit).join(" ")}...`;
};

const OverflowTooltip = ({
  title,
  children,
  disabled = false,
}: {
  title?: string;
  children: React.ReactElement;
  disabled?: boolean;
}) => {
  const contentRef = useRef<HTMLElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = useCallback(() => {
    const element = contentRef.current;
    if (!element) {
      setIsOverflowing(false);
      return;
    }

    setIsOverflowing(
      element.scrollWidth > element.clientWidth ||
        element.scrollHeight > element.clientHeight,
    );
  }, []);

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [checkOverflow, title]);

  return (
    <Tooltip
      title={!disabled && isOverflowing ? title || "" : ""}
      arrow
      placement="top-start"
    >
      <span
        style={{ display: "block", maxWidth: "100%" }}
        onMouseEnter={checkOverflow}
      >
        {React.cloneElement(children, { ref: contentRef })}
      </span>
    </Tooltip>
  );
};

const PdfColumnGroup = ({ columns }: { columns: any[] }) => (
  <colgroup>
    <col style={{ width: getPdfColumnWidth("itemName") }} />
    {columns.map((col) => (
      <col
        key={col.columnId ?? col.columnValue}
        style={{ width: getPdfColumnWidth(col.columnValue) }}
      />
    ))}
  </colgroup>
);

const scrollToEstimateCommentTarget = (targetId?: string) => {
  if (!targetId || typeof document === "undefined") return;

  const element = document.getElementById(targetId);
  if (!element) return;

  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  const highlightTarget =
    element.closest<HTMLElement>(".MuiTableContainer-root") ?? element;

  highlightTarget.style.transition =
    "box-shadow 200ms ease, outline-color 200ms ease";
  highlightTarget.style.boxShadow = "0 0 28px rgba(16, 156, 241, 0.6)";
  highlightTarget.style.outline = "3px solid rgba(16, 156, 241, 0.38)";
  highlightTarget.style.borderRadius = "6px";

  window.setTimeout(() => {
    highlightTarget.style.boxShadow = "";
    highlightTarget.style.outline = "";
  }, 2000);

  highlightTarget.animate(
    [
      {
        boxShadow: "0 0 0 rgba(16, 156, 241, 0)",
        outline: "0 solid rgba(16, 156, 241, 0)",
      },
      {
        boxShadow: "0 0 28px rgba(16, 156, 241, 0.55)",
        outline: "3px solid rgba(16, 156, 241, 0.35)",
      },
      {
        boxShadow: "0 0 0 rgba(16, 156, 241, 0)",
        outline: "0 solid rgba(16, 156, 241, 0)",
      },
    ],
    {
      duration: 2000,
      easing: "ease-out",
    },
  );
};

const LeadCommentThreadComponent = ({
  comment,
  // commentPinIndex,
  commentPin,
}: {
  comment: EstimateSuggestionType;
  // commentPinIndex: any;
  commentPin: number;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box
      className="card my-2    "
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        justifyContent: "center",
        // bgcolor:
        //   comment.acceptedAt
        //     ? "#fff"
        //     : comment.acceptedAt
        //     ? "rgba(239,83,80,0.5)"
        //     : "none",
      }}
      onClick={() => {
        scrollToEstimateCommentTarget(comment.id);
      }}
    >
      <Box className="d-flex justify-content-between align-items-center px-1">
        <div className="d-flex align-items-center">
          <ChatBubbleIcon
            sx={{ width: "23px", height: "23px", fill: "#909090" }}
          />
          <span
            className="position-relative fs-8"
            style={{ top: "-1px", left: "-15px", color: "#ffffff" }}
          >
            {commentPin}
          </span>
          <span>{t("reasons.you")}</span>
          {comment?.acceptedAt ? (
            <span
              className="fs-8 ml-2 d-flex align-items-center px-1"
              style={{
                background: theme?.palette?.success?.main,
                color: "#fff",
                borderRadius: "4px",
              }}
            >
              <CheckCircleOutlinedIcon
                className="mr-1"
                style={{ width: "12px", height: "12px" }}
              />
              {"Accepted"}
            </span>
          ) : (
            <></>
          )}

          {comment?.declinedAt ? (
            <span
              className="fs-8 ml-2 d-flex align-items-center px-1"
              style={{
                background: "#c62828 ",
                color: "#fff",
                borderRadius: "4px",
              }}
            >
              <CancelOutlinedIcon
                className="mr-1"
                style={{ width: "12px", height: "12px" }}
              />
              {"Denied"}
            </span>
          ) : (
            <></>
          )}
        </div>
        <div>
          <span style={{ color: "#d1d1d1" }}>{"#" + commentPin}</span>
        </div>
      </Box>

      <Typography style={{ fontSize: "0.85rem" }} className="fw-500 px-1">
        {comment?.clientSuggestion}
      </Typography>
      {comment?.reply && (
        <Box className="py-2 px-1 mt-1" sx={{ background: "#f9f9f9" }}>
          <Box className="d-flex align-items-center mb-1">
            <NextImage
              src={"/images/userImage.png"}
              width={"20px"}
              height="20px"
              alt={""}
            />
            <span className="ml-1 fw-500">{t("reasons.architect")}</span>
          </Box>
          <Typography className="ml-2 pl-1" style={{ fontSize: "0.75rem" }}>
            {comment?.reply}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
const ArchitectCommentThreadComponent = ({
  comment,

  commentPin,
}: {
  comment: any;

  commentPin: any;
}) => {
  const [reason, setReason] = useState<string>(comment?.reply);
  const [editReason, setEditReason] = useState(!comment?.reply);

  const { AdminReasonCommentAction } = useEstimateCommentsData();
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box sx={{ p: 2 }}>
      <Box
        onClick={() => {
          scrollToEstimateCommentTarget(comment.id);
        }}
      >
        <Box className="d-flex justify-content-between align-items-center px-1">
          <div className="d-flex align-items-center">
            <ChatBubbleIcon
              sx={{ width: "23px", height: "23px", fill: "#909090" }}
            />
            <span
              className="position-relative fs-8"
              style={{ top: "-1px", left: "-15px", color: "#ffffff" }}
            >
              {commentPin}
            </span>
            <span>{"Lead"}</span>
            {comment.acceptedAt ? (
              <span
                className="fs-8 ml-2 d-flex align-items-center px-1"
                style={{
                  background: theme?.palette?.success?.main,
                  color: "#fff",
                  borderRadius: "4px",
                }}
              >
                <CheckCircleOutlinedIcon
                  className="mr-1"
                  style={{ width: "12px", height: "12px" }}
                />
                {"Accepted"}
              </span>
            ) : (
              <></>
            )}

            {comment.declinedAt ? (
              <span
                className="fs-8 ml-2 d-flex align-items-center px-1"
                style={{
                  background: "#c62828 ",
                  color: "#fff",
                  borderRadius: "4px",
                }}
              >
                <CancelOutlinedIcon
                  className="mr-1"
                  style={{ width: "12px", height: "12px" }}
                />
                {"Denied"}
              </span>
            ) : (
              <></>
            )}
          </div>
          <div>
            <span style={{ color: "#d1d1d1" }}>{"#" + commentPin}</span>
          </div>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography style={{ fontSize: "0.85rem" }} className="fw-500 px-1">
          {comment?.clientSuggestion}
        </Typography>
      </Box>
      <Box className="mt-1">
        {editReason ? (
          <TextField
            multiline
            placeholder="Reply"
            variant="outlined"
            fullWidth
            onChange={(e) => {
              setReason(e.target.value);
            }}
            value={reason}
            disabled={!editReason}
            sx={{ borderRadius: "50%" }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    disabled={!reason}
                    onClick={() => {
                      if (reason) {
                        AdminReasonCommentAction({
                          commentId: comment?.commentId,
                          reason,
                        });
                        setEditReason(false);
                      }
                    }}
                    sx={{
                      svg: {
                        fill: "#32acff",
                      },
                      ":disabled": {
                        svg: {
                          fill: "#d1d1d1",
                          opacity: "0.5",
                        },
                      },
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        ) : (
          <Box>
            <Box className="py-2 px-1 mt-1" sx={{ background: "#f9f9f9" }}>
              <Box className="d-flex align-items-center mb-1">
                <NextImage
                  src={"/images/userImage.png"}
                  width={"20px"}
                  height="20px"
                  alt={""}
                />
                <span className="ml-1 fw-500">{t("reasons.you")}</span>
              </Box>
              <Typography className="ml-2 pl-1" style={{ fontSize: "0.75rem" }}>
                {reason}
              </Typography>
            </Box>
            <IconButton
              className="btnPrimaryUI   mt-2"
              sx={{
                borderRadius: "4px",
                height: "32px !important",
                width: "100% !important",
              }}
              onClick={() => {
                setEditReason(true);
              }}
            >
              <EditRoundedIcon style={{ width: "18px", height: "18px" }} />
              <span style={{ fontSize: "0.85rem" }} className=" ml-1">
                {"Edit Comment"}
              </span>
            </IconButton>
          </Box>
        )}
      </Box>

      <Box className="d-flex align-items-center justify-content-between">
        <Button
          className="btnSuccessUI my-1 mr-1"
          sx={{
            height: "32px !important",
            width: "100% !important",
          }}
          disabled={comment?.acceptedAt}
          onClick={() => {
            AdminReasonCommentAction({
              commentId: comment.commentId,
              acceptedAt: Date.now(),
            });
          }}
          color="success"
        >
          <span style={{ fontSize: "0.85rem" }}>{"Accept"}</span>
          <CheckCircleRoundedIcon
            className="ml-1"
            style={{ width: "18px", height: "18px", fill: "#FFF" }}
          />
        </Button>
        <Button
          className="btnErrorUI"
          sx={{
            height: "32px !important",
            width: "100% !important",
          }}
          disabled={comment?.declinedAt}
          onClick={() => {
            AdminReasonCommentAction({
              commentId: comment.commentId,
              declinedAt: Date.now(),
            });
          }}
          color="error"
        >
          <span style={{ fontSize: "0.85rem" }}>{"Denied"}</span>
          <CancelRoundedIcon
            className="ml-1"
            style={{ width: "18px", height: "18px", fill: "#FFF" }}
          />
        </Button>
      </Box>
    </Box>
  );
};

const BoqPreview = ({
  commentMode,
  clientEstimateId,
  data,
  type,
  validTill,
  projectId,
  clientEstimateData,
  organizationId,
  withAuth,
  columns,
  grandTotal,
  trackAnalytics,
  pdf,
  defaultClientDetails,
  defaultOrganizationDetails,
  currency: defaultCurrency,
  showFullDetails = true,
  showPaymentActions = true,
  allowComments,
  selectedItemIds,
  onToggleItemSelect,
  showItemSelection = true,
  entityType,
}: {
  commentMode?: boolean;
  setCommentMode?: Dispatch<SetStateAction<boolean>>;
  data: BoqClientEstiamteSectionResponseType[] | BoqClientEstimateSectionType[];
  type: "CLIENT" | "ADMIN";
  validTill: number;
  clientEstimateId?: string;
  clientEstimateData?: any;
  grandTotal: number;
  organizationId: string;
  withAuth: boolean;
  projectId: string;
  columns?: any;
  pdf?: boolean;
  trackAnalytics: boolean;
  defaultOrganizationDetails?: {
    organizationName?: string;
    organizationWebsite?: string;
    organizationLocation?: string;
    mobileNumber?: string;
    emailId?: string;
    organizationLogo?: string;
    adminSign: string;
  };
  defaultClientDetails?: {
    clientName?: string;
    clientEmailAddress?: string;
    clientContactNumber?: string;
    clientLocation?: string;
  };
  currency?: string | null;
  showFullDetails?: boolean;
  showPaymentActions?: boolean;
  allowComments?: boolean;
  selectedItemIds?: Set<string>;
  onToggleItemSelect?: (itemId: string) => void;
  showItemSelection?: boolean;
  entityType?: "ESTIMATE" | "SALES_ORDER";
}) => {
  const { VITE_AEC_PORTAL_URL } = useEnv();
  const router = useRouter();
  const isSalesOrderPath =
    entityType === "SALES_ORDER" ||
    (typeof window !== "undefined" &&
      (window.location.pathname.startsWith("/sales-order") ||
        router?.query?.entityType === "SALES_ORDER"));

  const {
    estimatePaymentLink,
    isStripeIntegrated: isEstimateStripeIntegrated,
    paymentLinkLoading: estimatePaymentLinkLoading,
    organizationDetail,
  } = useEstimationData();

  const displayedPaymentTerms: any[] =
    clientEstimateData?.estimatePaymentTerms || [];
  const areAllPaymentTermsPaid =
    displayedPaymentTerms.length > 0 &&
    displayedPaymentTerms.every(
      (payment: any) => payment?.status === "PAID" || payment?.isPaid,
    );
  const isEstimateAccepted = Boolean(clientEstimateData?.acceptedAt);
  const hasConvertedInvoice = Boolean(clientEstimateData?.isConvertedInvoice);
  // Admin-only "convert to invoice" / "mark as paid" actions (and the
  // feature-access + money-matters hooks that gate/support them) are not
  // ported here — this page only ever renders the CLIENT branch.
  const shouldShowClientPaymentStatus =
    showPaymentActions && type === "CLIENT" && !pdf;

  const commentPopupRef = useRef<any>();
  const { clientCommentAction, estimateComments } = useEstimateCommentsData();
  const { localizationValue } = useOrganizationLocalization();
  const startTimeRef = useRef<number | null>(null);
  const { t, i18n } = useTranslation();
  const { translateText } = useTranslationText();
  const theme = useTheme();
  const adminSignature =
    clientEstimateData?.adminSignature ||
    organizationDetail?.adminSign ||
    defaultOrganizationDetails?.adminSign;
  const showAdminSignature = Boolean(
    clientEstimateData?.isAdminSignatureVisible && adminSignature,
  );
  const clientSignature =
    clientEstimateData?.clientSignature || clientEstimateData?.leadSignature;
  const clientSignatureName =
    clientEstimateData?.acceptedByName ?? clientEstimateData?.leadSignatureName;
  const clientSignedDate =
    clientEstimateData?.acceptedAt ?? clientEstimateData?.leadSignedDate;
  const signatureOrganizationName =
    organizationDetail?.organizationName ??
    defaultOrganizationDetails?.organizationName ??
    "";
  const formatSignatureDate = (value: string | number) => {
    const formattedDate = formatDateBasedOnOrganizationLocalization(
      localizationValue,
      value,
      true,
    );

    return formattedDate.toLowerCase().includes("invalid")
      ? String(value)
      : formattedDate;
  };
  const paidStatusLabel = (
    <Box
      className="d-flex justify-content-center"
      sx={{
        height: 30,
        alignItems: "center",
        "& > .MuiBox-root": { px: 1.5, py: 0.75 },
        "& > .MuiBox-root > span": {
          fontSize: "0.75rem",
          height: "auto",
        },
      }}
    >
      <StatusLabel
        status="PAID"
        translationKey="common"
        labelOverride={t("common.paid") || "Paid"}
        customBackground={theme.palette.success.main}
        customColor={theme.palette.common.white}
        customIcon={false}
      />
    </Box>
  );

  const [grandTotalInWords, setGrandTotalInWords] = useState<string>("");

  useEffect(() => {
    const handleTranslation = async () => {
      const words = formatCurrencyAndConvertToWords(
        grandTotal,
        localizationValue ?? [],
      );
      if (i18n.language && i18n.language !== "en") {
        try {
          const translated = await translateText({
            data: [words],
            language: i18n.language,
          });
          if (translated && translated.length > 0) {
            setGrandTotalInWords(translated[0].translated_text ?? words);
          } else {
            setGrandTotalInWords(words);
          }
        } catch (error) {
          console.error("Translation failed:", error);
          setGrandTotalInWords(words);
        }
      } else {
        setGrandTotalInWords(words);
      }
    };
    handleTranslation();
  }, [grandTotal, i18n.language, localizationValue]);

  const totalOtherCharges =
    clientEstimateData?.otherCharges?.reduce(
      (sum: number, charge: any) =>
        sum +
        parseFloat(charge?.amountValue || 0) *
          (charge?.amountUnit === "PERCENTAGE" ? 0 : 1),
      0,
    ) || 0;

  // Calculate subtotal from data if clientEstimateData.subTotal is not available or is 0
  const calculatedSubTotal = useMemo(() => {
    if (clientEstimateData?.subTotal && clientEstimateData.subTotal > 0) {
      return clientEstimateData.subTotal;
    }

    // Calculate from data prop (sections and items)
    return (
      data?.reduce((total, section) => {
        const sectionTotal =
          section?.sectionItems?.reduce((secTotal, item) => {
            return secTotal + (item.totalCost ?? 0);
          }, 0) ?? 0;
        return total + sectionTotal;
      }, 0) ?? 0
    );
  }, [clientEstimateData?.subTotal, data]);

  // Calculate sequential discounts and taxes
  const subTotal = calculatedSubTotal;
  const hasSubtotalValue = useMemo(() => {
    if (!isEmptyOrZeroPreviewValue(clientEstimateData?.subTotal)) {
      return true;
    }

    return data?.some((section) =>
      section?.sectionItems?.some(
        (item) => !isEmptyOrZeroPreviewValue(item.totalCost),
      ),
    );
  }, [clientEstimateData?.subTotal, data]);
  const hasGrandTotalValue = !isEmptyOrZeroPreviewValue(grandTotal);
  const { totalDiscountAmount, amountAfterDiscounts } =
    calculateSequentialDiscounts(
      subTotal,
      clientEstimateData?.discountApplied?.map((discount: any) => ({
        discountId: discount.discountId || "",
        discountName: discount.discountName || "",
        discountValue: discount.discountValue || 0,
        discountAmountUnit: discount.discountAmountUnit,
        discountFixedAmount: discount.discountFixedAmount,
      })) || [],
    );

  const { totalTaxAmount } = calculateSequentialTaxes(
    amountAfterDiscounts,
    clientEstimateData?.taxApplied?.map((tax: any) => ({
      taxId: tax.taxId || "",
      taxName: tax.taxName || "",
      taxValue: tax.taxValue || 0,
    })) || [],
  );

  const [currency, setCurrency] = useState<string>(defaultCurrency as any);
  useEffect(() => {
    if (localizationValue) {
      const curr =
        getLocalizationValue(localizationValue, "CURRENCY", "SYMBOL") ?? "";
      if (curr) {
        setCurrency(curr);
      }
    }
  }, [localizationValue]);

  const clearTimer = () => {
    if (!trackAnalytics || startTimeRef.current === null) return;

    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    startTimeRef.current = null;

    if (elapsed > 0) {
      void axios.post(`${VITE_AEC_PORTAL_URL}/api/add-to-queue`, {
        eventType: isSalesOrderPath
          ? "REGISTER_SALES_ORDER_ANALYTICS"
          : "REGISTER_ESTIMATE_ANALYTICS",
        ...(isSalesOrderPath
          ? { salesOrderId: clientEstimateId }
          : {
              estimateId: clientEstimateId,
              estimateRevision: clientEstimateData?.estimateRevision,
            }),
        timeSpent: elapsed,
      });
    }
  };

  const handleStartTimer = () => {
    if (!trackAnalytics || !clientEstimateId || startTimeRef.current !== null) {
      return;
    }

    startTimeRef.current = Date.now();
    void axios.post(`${VITE_AEC_PORTAL_URL}/api/add-to-queue`, {
      eventType: isSalesOrderPath
        ? "REGISTER_SALES_ORDER_ANALYTICS"
        : "REGISTER_ESTIMATE_ANALYTICS",
      ...(isSalesOrderPath
        ? { salesOrderId: clientEstimateId }
        : {
            estimateId: clientEstimateId,
            estimateRevision: clientEstimateData?.estimateRevision,
          }),
      viewed: 1,
    });
  };
  useEffect(() => {
    const initializeTimer = () => handleStartTimer();

    const handleFocus = () => handleStartTimer();

    const handleBlur = () => {
      console.log("Window blurred");
      clearTimer();
    };

    // Call the initialize function
    initializeTimer();

    // Add event listeners
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      clearTimer();
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [
    trackAnalytics,
    clientEstimateId,
    clientEstimateData?.estimateRevision,
    isSalesOrderPath,
  ]);

  const columnsToRender = useMemo(() => {
    const visibleColumns = sortVisibleColumns(
      pdf ? defaultBOQColumns : columns,
    );

    return visibleColumns.filter(
      (col) =>
        col.columnValue !== "itemDescription" &&
        col.accessor !== "itemDescription",
    );
  }, [columns, pdf]);

  const renderCell = (key: any, value: any, colDef?: any, rowItem?: any) => {
    const isText = typeof value === "string";
    const renderCurrencyValue = (valToRender: any = value) => {
      if (isEmptyPreviewValue(valToRender)) {
        return "-";
      }

      const formatted = `${currency ?? ""}${
        formatNumberITL(localizationValue, valToRender) ?? valToRender
      }`;

      if (pdf) {
        return (
          <Box
            component="span"
            sx={{
              whiteSpace: "normal",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {formatted}
          </Box>
        );
      }

      return (
        <Box
          component="span"
          title={formatted}
          sx={{
            maxWidth: "100%",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "block",
          }}
        >
          {formatted}
        </Box>
      );
    };

    switch (key) {
      case "itemName":
        return pdf ? (
          <Typography
            variant="body2"
            sx={{
              ...pdfWrapSx,
            }}
          >
            {value || "-"}
          </Typography>
        ) : (
          <OverflowTooltip title={value || ""}>
            <Typography
              variant="body2"
              sx={{
                maxWidth: "100%",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                ...pdfWrapSx,
              }}
            >
              {value || "-"}
            </Typography>
          </OverflowTooltip>
        );

      case "quantity": {
        return (
          <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
            {value ?? "-"}
          </Typography>
        );
      }

      case "unit": {
        return pdf ? (
          <Typography variant="body2" sx={pdfWrapSx}>
            {value || "-"}
          </Typography>
        ) : (
          <TruncatedText text={value || "-"} limit={20} />
        );
      }

      case "ratePerUnit":
      case "rateIncluProfit": {
        return (
          <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
            {renderCurrencyValue()}
          </Typography>
        );
      }

      case "totalCost": {
        return (
          <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
            {renderCurrencyValue()}
          </Typography>
        );
      }

      case "startDate":
      case "endDate":
        return (
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {value
              ? formatDateBasedOnOrganizationLocalization(
                  localizationValue,
                  value,
                  true,
                )
              : "-"}
          </Typography>
        );

      case "duration":
        return (
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {value ?? "-"}
          </Typography>
        );

      default: {
        if (colDef?.calcConfig?.isCurrencyColumn) {
          return renderCurrencyValue();
        }

        if (
          colDef?.dataType === "Number" &&
          !isEmptyPreviewValue(value) &&
          !isNaN(Number(value))
        ) {
          return formatNumberITL(localizationValue, value) ?? value;
        }

        if (colDef?.dataType === "Link") {
          if (value && value !== "") {
            return (
              <a
                href={String(value)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#1976d2",
                  textDecoration: "none",
                  ...(pdf
                    ? {
                        whiteSpace: "normal",
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                      }
                    : {}),
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {pdf ? (
                  String(value)
                ) : (
                  <TruncatedText text={String(value)} limit={30} />
                )}
              </a>
            );
          }
          return "-";
        }

        if (isText) {
          return pdf ? (
            <Typography variant="body2" sx={pdfWrapSx}>
              {value || "-"}
            </Typography>
          ) : (
            <TruncatedText text={value || "-"} limit={30} />
          );
        }
        return value ?? "-";
      }
    }
  };

  return (
    <Box>
      <BoqCommentPopup
        onChange={(commentText, currentId) => {
          clientCommentAction(commentText, currentId, "ITEM");
        }}
        ref={commentPopupRef}
      />
      <Grid
        container
        spacing={2}
        id="boq-create-estimate-pdf"
        // className="d-flex justify-content-center px-sm-0 px-md-1 px-3  w-100"
        className={`px-sm-0 ${pdf ? "px-md-0" : "px-md-1"} px-3  w-100`}
      >
        <Grid
          component={"main"}
          item
          sm={commentMode ? 9 : 12}
          className={`px-sm-1 ${pdf ? "px-md-1" : "px-md-3"} px-5`}
        >
          <Box
            component={"section"}
            className={`px-sm-1 ${pdf ? "px-md-1" : "px-md-3"} px-5 ${
              type === "ADMIN" ? "pt-6" : "pt-4"
            } mx-auto border-bottom pb-3`}
          >
            <Box
              className={`d-flex justify-content-between px-sm-1 ${
                pdf ? "px-md-1" : "px-md-3"
              } px-5 py-2 align-items-center flex-wrap`}
            >
              <Typography className="fs-6 fw-500">
                {pdf ? "General Details" : t("common.generalDetails")}
              </Typography>
              <Typography className="fs-7 fw-500">
                {pdf ? "Valid Till" : t("common.validTill")}:{" "}
                {validTill
                  ? formatDateBasedOnOrganizationLocalization(
                      localizationValue,
                      validTill,
                      true,
                    )
                  : "-"}
              </Typography>
            </Box>
            <BusinessAndClientInfo
              type={type}
              projectId={projectId}
              organizationId={organizationId}
              withAuth={withAuth}
              defaultClientDetails={defaultClientDetails}
              pdf={pdf}
              isPreview={true}
              defaultOrganizationDetails={defaultOrganizationDetails}
              isTaxDisplay={clientEstimateData?.isTaxDisplay ?? true}
            />
            {hasPreviewDescription(clientEstimateData?.estimateDescription) && (
              <Box
                className={`px-sm-1 ${pdf ? "px-md-1" : "px-md-3"} px-5 pt-3`}
              >
                <Typography
                  className="fw-500"
                  sx={{
                    fontSize: {
                      xs: ".9rem",
                      sm: "1.2rem",
                    },
                    mb: 1,
                  }}
                >
                  {pdf ? "Description" : t("common.description")}
                </Typography>
                {pdf ? (
                  <Box
                    id="estimate-preview-description"
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      minHeight: 80,
                      px: 1.5,
                      py: 1.25,
                      typography: "body2",
                      color: "text.primary",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      "& ul": {
                        pl: 3,
                        my: 1,
                      },
                      "& ol": {
                        listStylePosition: "inside",
                        pl: 0,
                        my: 1,
                      },
                    }}
                    dangerouslySetInnerHTML={{
                      __html: clientEstimateData?.estimateDescription ?? "",
                    }}
                  />
                ) : (
                  <Box
                    id="estimate-preview-description"
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      px: 1.5,
                      py: 1.25,
                      color: "text.primary",
                      overflow: "hidden",
                    }}
                  >
                    <OverflowTooltip
                      title={getPreviewDescriptionText(
                        clientEstimateData?.estimateDescription,
                        Number.POSITIVE_INFINITY,
                      )}
                    >
                      <Typography
                        variant="body2"
                        component="div"
                        sx={{
                          lineHeight: 1.5,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          display: "-webkit-box",
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {getPreviewDescriptionText(
                          clientEstimateData?.estimateDescription,
                        )}
                      </Typography>
                    </OverflowTooltip>
                  </Box>
                )}
              </Box>
            )}
          </Box>
          <Box
            component={"section"}
            className={`px-sm-1 ${
              pdf ? "px-md-1" : "px-md-3"
            } px-5 mx-auto pb-3`}
          >
            <Box
              className={` px-5 ${pdf ? "px-md-1" : "px-md-3"} px-sm-1 py-2`}
            >
              <Typography
                className="fw-500"
                sx={{
                  fontSize: {
                    xs: ".9rem",
                    sm: "1.2rem",
                  },
                }}
              >
                {pdf
                  ? "Preliminary And General Items"
                  : t("boq.preliminaryAndGeneralItems")}
              </Typography>
            </Box>
            <Box className={`px-sm-0 ${pdf ? "px-md-1" : "px-md-3"} px-5`}>
              <SectionTable
                data={data || []}
                columns={columns}
                commentMode={commentMode}
                type={type}
                currency={currency || ""}
                localizationValue={localizationValue}
                pdf={pdf || false}
                showMaterials={Boolean(clientEstimateData?.isSentAsBoq)}
                selectedItemIds={
                  showItemSelection ? selectedItemIds : undefined
                }
                onToggleItemSelect={
                  showItemSelection ? onToggleItemSelect : undefined
                }
              />
              <Box className=" mt-3 ">
                {totalOtherCharges > 0 && (
                  <Box>
                    <Typography
                      className="fw-500 text-right mb-3 mb-sm-2"
                      sx={{
                        fontSize: {
                          xs: ".7rem",
                          sm: "1rem",
                        },
                      }}
                    >
                      {pdf ? "Total" : t("common.total")}{" "}
                      {pdf ? "Other Charges" : t("boq.otherCharges")}
                    </Typography>
                    <Box className="d-flex justify-content-center align-items-end column">
                      {clientEstimateData?.otherCharges?.map(
                        (otherCharge: any, index: any) => (
                          <Box
                            key={index}
                            className="mb-3 d-flex justify-content-end align-items-center pr-2"
                            sx={{
                              width: {
                                xs: "60%",
                                sm: "30%",
                              },
                            }}
                          >
                            <Typography
                              className="fw-500 t "
                              sx={{
                                fontSize: {
                                  xs: ".5rem",
                                  sm: ".8rem",
                                },
                              }}
                            >
                              {otherCharge?.chargeName}{" "}
                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:
                            </Typography>
                            <Typography
                              className="fw-500  "
                              sx={{
                                fontSize: {
                                  xs: ".5rem",
                                  sm: ".8rem",
                                },
                              }}
                            >
                              {otherCharge?.amountUnit === "PERCENTAGE"
                                ? null
                                : currency}
                              {otherCharge?.amountValue}
                              {otherCharge?.amountUnit === "PERCENTAGE"
                                ? "%"
                                : null}
                            </Typography>
                          </Box>
                        ),
                      )}
                    </Box>
                  </Box>
                )}

                <Box className="d-flex justify-content-end align-items-center">
                  <Box
                    sx={{
                      width: {
                        xs: "90%",
                        sm: "60%",
                        md: "35%",
                      },
                      borderRadius: "10px",
                      minWidth: 0,
                      maxWidth: "100%",
                      overflow: "hidden",
                    }}
                    className="bg-white "
                  >
                    <Box className="p-sm-1 p-2">
                      {/* Subtotal */}
                      <Box
                        className="d-flex justify-content-between align-items-center mb-2"
                        sx={{
                          flexDirection: {
                            xs: "column",
                            sm: "row",
                          },
                          textAlign: {
                            xs: "center",
                            sm: "left",
                          },
                          gap: 1,
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: {
                              xs: ".6rem",
                              sm: ".8rem",
                            },
                            marginBottom: {
                              xs: "0.5rem",
                              sm: "0",
                            },
                            flexShrink: 0,
                          }}
                          className="fw-500"
                        >
                          {pdf ? "Subtotal" : t("boq.subtotal")}:
                        </Typography>
                        <Typography
                          title={
                            hasSubtotalValue
                              ? `${currency ?? ""}${formatNumberITL(
                                  localizationValue,
                                  subTotal,
                                )}`
                              : undefined
                          }
                          sx={{
                            fontSize: {
                              xs: ".6rem",
                              sm: ".8rem",
                            },
                            minWidth: 0,
                            maxWidth: "70%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            textAlign: { xs: "center", sm: "right" },
                          }}
                          className="fw-500"
                        >
                          {hasSubtotalValue ? (
                            <>
                              {currency ?? ""}
                              {formatNumberITL(localizationValue, subTotal)}
                            </>
                          ) : (
                            "-"
                          )}
                        </Typography>
                      </Box>

                      {/* Total Discount */}
                      {clientEstimateData?.discountApplied &&
                        clientEstimateData.discountApplied.length > 0 && (
                          <Box
                            className="d-flex justify-content-between align-items-center mb-2"
                            sx={{
                              flexDirection: {
                                xs: "column",
                                sm: "row",
                              },
                              textAlign: {
                                xs: "center",
                                sm: "left",
                              },
                              gap: 1,
                              minWidth: 0,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: {
                                  xs: ".6rem",
                                  sm: ".8rem",
                                },
                                marginBottom: {
                                  xs: "0.5rem",
                                  sm: "0",
                                },
                                color: "#2ED47A",
                                flexShrink: 0,
                              }}
                              className="fw-500"
                            >
                              {pdf ? "Total Discount" : t("boq.totalDiscount")}:
                            </Typography>
                            <Typography
                              title={`-${currency ?? ""}${formatNumberITL(
                                localizationValue,
                                totalDiscountAmount,
                              )}`}
                              sx={{
                                fontSize: {
                                  xs: ".6rem",
                                  sm: ".8rem",
                                },
                                color: "#2ED47A",
                                minWidth: 0,
                                maxWidth: "70%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                textAlign: { xs: "center", sm: "right" },
                              }}
                              className="fw-500"
                            >
                              -{currency ?? ""}
                              {formatNumberITL(
                                localizationValue,
                                totalDiscountAmount,
                              )}
                            </Typography>
                          </Box>
                        )}

                      {/* Total Tax */}
                      {clientEstimateData?.taxApplied &&
                        clientEstimateData.taxApplied.length > 0 && (
                          <Box
                            className="d-flex justify-content-between align-items-center mb-2"
                            sx={{
                              flexDirection: {
                                xs: "column",
                                sm: "row",
                              },
                              textAlign: {
                                xs: "center",
                                sm: "left",
                              },
                              gap: 1,
                              minWidth: 0,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: {
                                  xs: ".6rem",
                                  sm: ".8rem",
                                },
                                marginBottom: {
                                  xs: "0.5rem",
                                  sm: "0",
                                },
                                flexShrink: 0,
                              }}
                              className="fw-500"
                            >
                              {pdf ? "Total Tax" : t("boq.totalTax")}:
                            </Typography>
                            <Typography
                              title={`+${currency ?? ""}${formatNumberITL(
                                localizationValue,
                                totalTaxAmount,
                              )}`}
                              sx={{
                                fontSize: {
                                  xs: ".6rem",
                                  sm: ".8rem",
                                },
                                minWidth: 0,
                                maxWidth: "70%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                textAlign: { xs: "center", sm: "right" },
                              }}
                              className="fw-500"
                            >
                              +{currency ?? ""}
                              {formatNumberITL(
                                localizationValue,
                                totalTaxAmount,
                              )}
                            </Typography>
                          </Box>
                        )}
                    </Box>
                    <Box
                      className="d-flex justify-content-between align-items-center p-sm-1 p-2"
                      sx={{
                        borderRadius: "10px",
                        flexDirection: {
                          xs: "column",
                          sm: "row",
                        },
                        textAlign: {
                          xs: "center",
                          sm: "left",
                        },
                        gap: 1,
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: {
                            xs: ".6rem",
                            sm: ".8rem",
                          },
                          marginBottom: {
                            xs: "0.5rem",
                            sm: "0",
                          },
                          flexShrink: 0,
                        }}
                        className="fw-500"
                      >
                        {isSalesOrderPath
                          ? pdf
                            ? "Total Sales Order Amount"
                            : t("boq.totalSalesOrderAmount")
                          : pdf
                            ? "Total Estimate Amount"
                            : t("boq.totalEstimateAmount")}
                        :
                      </Typography>
                      <Box
                        sx={{
                          textAlign: {
                            xs: "center",
                            sm: "right",
                          },
                          minWidth: 0,
                          maxWidth: { xs: "100%", sm: "65%" },
                          overflow: "hidden",
                        }}
                      >
                        <Typography
                          title={
                            hasGrandTotalValue
                              ? `${currency ?? ""}${formatNumberITL(
                                  localizationValue,
                                  grandTotal,
                                )}`
                              : undefined
                          }
                          sx={{
                            color: "#3CA2FF",
                            fontSize: {
                              xs: ".8rem",
                              sm: "1rem",
                            },
                            maxWidth: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          className="fw-600"
                        >
                          {hasGrandTotalValue ? (
                            <>
                              {currency ?? ""}
                              {formatNumberITL(localizationValue, grandTotal)}
                            </>
                          ) : (
                            "-"
                          )}
                        </Typography>
                        {hasGrandTotalValue && (
                          <Typography
                            title={grandTotalInWords}
                            sx={{
                              fontSize: {
                                xs: ".4rem",
                                sm: ".6rem",
                              },
                              marginTop: {
                                xs: "0.25rem",
                                sm: "0",
                              },
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {grandTotalInWords}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {((clientEstimateData?.estimatePaymentTerms &&
            clientEstimateData.estimatePaymentTerms.length > 0)) && (
            <Box
              component="section"
              className={`px-sm-1 ${
                pdf ? "px-md-1" : "px-md-3"
              } px-5 mx-auto pb-3`}
            >
              <Box className={`px-sm-0 ${pdf ? "px-md-1" : "px-md-3"} px-5`}>
                <Box className="mb-2 d-flex align-items-center justify-content-between">
                  <Typography
                    className="fw-500"
                    sx={{
                      fontSize: {
                        xs: ".9rem",
                        sm: "1.2rem",
                      },
                    }}
                  >
                    {pdf ? "Payment Terms" : t("common.paymentTerms")}
                  </Typography>
                  {type === "CLIENT" &&
                    !pdf &&
                    isEstimateStripeIntegrated &&
                    !hasConvertedInvoice &&
                    !areAllPaymentTermsPaid && (
                      <LoadingButton
                        variant="contained"
                        loading={estimatePaymentLinkLoading}
                        disabled={!isEstimateAccepted || !estimatePaymentLink}
                        sx={{
                          textTransform: "none",
                          backgroundColor: "#3CA2FF",
                          fontWeight: 500,
                          fontSize: "11px",
                          borderRadius: "4px",
                          padding: "6px 16px",
                          "&:hover": {
                            backgroundColor: "#2BA1FF",
                          },
                        }}
                        onClick={() => {
                          if (isEstimateAccepted && estimatePaymentLink) {
                            window.open(
                              estimatePaymentLink,
                              "_blank",
                              "noopener,noreferrer",
                            );
                          }
                        }}
                      >
                        {t("common.payNow", { defaultValue: "Pay Now" })}
                      </LoadingButton>
                    )}
                </Box>
                <TableContainer
                  sx={{
                    borderTopLeftRadius: "5px",
                    borderTopRightRadius: "5px",
                    mb: 2.5,
                    overflowX: "auto",
                    overflowY:
                      !pdf && displayedPaymentTerms.length > 6
                        ? "auto"
                        : "visible",
                    maxHeight:
                      !pdf && displayedPaymentTerms.length > 6 ? 350 : "none",
                    borderTop:
                      !pdf && displayedPaymentTerms.length > 6 ? 1 : 0,
                    borderColor: "divider",
                    width: "100%",
                  }}
                >
                  <Table
                    stickyHeader={!pdf && displayedPaymentTerms.length > 6}
                    sx={{
                      minWidth: pdf ? "100%" : "800px",
                      tableLayout: "fixed",
                      borderCollapse: "separate",
                    }}
                    aria-label={
                      pdf ? "Payment Terms" : t("common.paymentTerms")
                    }
                  >
                    <TableHead
                      sx={{
                        backgroundColor:
                          type === "CLIENT" &&
                          !pdf &&
                          displayedPaymentTerms.length > 6
                            ? theme.palette.primary.dark
                            : theme.palette.primary.main,
                        "& .MuiTableCell-head": {
                          backgroundColor:
                            type === "CLIENT" &&
                            !pdf &&
                            displayedPaymentTerms.length > 6
                              ? theme.palette.primary.dark
                              : theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                        },
                      }}
                    >
                      <TableRow>
                        <TableCell
                          align="center"
                          sx={{ width: "20%", maxWidth: 200 }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {pdf ? "Payment Name" : t("common.paymentName")}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ width: "13%", maxWidth: 180 }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {pdf ? "Amount" : t("common.amount")}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ width: "17%", maxWidth: 180 }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {pdf ? "Payment Terms" : t("common.paymentTerms")}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ width: "14%", maxWidth: 160 }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {pdf ? "Due Date" : t("common.paymentDate")}
                          </Typography>
                        </TableCell>
                        {shouldShowClientPaymentStatus && (
                          <TableCell
                            align="center"
                            sx={{ width: "15%", maxWidth: 140 }}
                          >
                            <Typography variant="body2" fontWeight={500}>
                              {t("common.status") || "Status"}
                            </Typography>
                          </TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody
                      sx={{
                        boxShadow:
                          "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",
                      }}
                    >
                      {displayedPaymentTerms.map(
                        (payment: any, index: number) => {
                          const isPaidTerm =
                            String(payment?.status || "").toUpperCase() ===
                              "PAID" || payment?.isPaid;

                          return (
                            <TableRow
                              key={payment?.estimatePaymentTermId ?? index}
                            >
                              <TableCell
                                sx={{
                                  width: "20%",
                                  maxWidth: 200,
                                  overflow: "hidden",
                                }}
                              >
                                <TruncatedText
                                  text={payment?.paymentName || "-"}
                                  useEllipsis
                                  maxWidth="100%"
                                />
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{
                                  width: "13%",
                                  maxWidth: 220,
                                  overflow: "hidden",
                                }}
                              >
                                {(() => {
                                  const amountLabel = `${currency ?? ""}${
                                    formatNumberITL(
                                      localizationValue,
                                      payment?.amount ?? 0,
                                    ) ?? ""
                                  }`;
                                  return (
                                    <Typography
                                      component="span"
                                      title={amountLabel}
                                      sx={{
                                        display: "block",
                                        width: "100%",
                                        maxWidth: "100%",
                                        minWidth: 0,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {amountLabel}
                                    </Typography>
                                  );
                                })()}
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{
                                  width: "17%",
                                  maxWidth: 180,
                                  overflow: "hidden",
                                }}
                              >
                                <Typography
                                  component="span"
                                  sx={{
                                    display: "block",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {payment?.paymentTerms
                                    ? formatSeedValues(payment.paymentTerms)
                                    : "Custom"}
                                </Typography>
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{
                                  width: "14%",
                                  maxWidth: 160,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {payment?.paymentScheduleDueDate
                                  ? formatDateBasedOnOrganizationLocalization(
                                      localizationValue,
                                      payment.paymentScheduleDueDate,
                                      true,
                                    )
                                  : "-"}
                              </TableCell>
                              {shouldShowClientPaymentStatus && (
                                <TableCell align="center">
                                  {isPaidTerm ? paidStatusLabel : "-"}
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        },
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          )}

          <Box
            component="section"
            className={`px-sm-1 ${
              pdf ? "px-md-1" : "px-md-3"
            } px-5 mx-auto pb-3`}
            sx={{
              paddingBottom: "40px",
            }}
          >
            <Box className={`px-sm-0 ${pdf ? "px-md-1" : "px-md-3"} px-5`}>
              <AttachmentPreviewTiles
                attachments={getAttachmentUploadValues(clientEstimateData)}
                pdf={pdf}
                flushLeft
              />
              {clientEstimateData?.notes?.length > 0 && (
                <Box>
                  <Typography
                    className="fw-500"
                    sx={{
                      marginTop: "40px",
                      fontSize: {
                        xs: pdf ? "1rem" : ".9rem",
                        sm: pdf ? "1.2rem" : "1.2rem",
                      },
                    }}
                  >
                    {pdf
                      ? "Terms And Conditions"
                      : t("common.termsAndConditions")}
                  </Typography>
                  <Box
                    sx={{
                      ...(pdf && {
                        marginTop: "12px",
                        "&, & *": {
                          fontSize: "13px !important",
                          lineHeight: "1.5 !important",
                        },
                      }),
                    }}
                  >
                    <PlateProvider>
                      <PlateEditor
                        id={`estimate-lead-preview`}
                        intialValue={clientEstimateData?.notes}
                        value={clientEstimateData?.notes}
                        readOnly
                      />
                    </PlateProvider>
                  </Box>
                </Box>
              )}
              {(showAdminSignature ||
                clientSignature ||
                clientEstimateData?.cameraVerificationUrl) && (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{
                    mt: 5,
                    justifyContent: showAdminSignature
                      ? "flex-start"
                      : "flex-end",
                  }}
                >
                  {showAdminSignature && (
                    <Box sx={{ flex: 1, minWidth: 0, order: 1 }}>
                      <Stack spacing={1} alignItems="flex-start">
                        <Typography variant="body1" fontWeight={500}>
                          {signatureOrganizationName
                            ? pdf
                              ? `Legal Representative of ${signatureOrganizationName}`
                              : t("changeOrder.legalRepresentative", {
                                  organizationName: signatureOrganizationName,
                                  defaultValue: `Legal Representative of ${signatureOrganizationName}`,
                                })
                            : pdf
                              ? "Admin"
                              : t("changeOrder.adminSignature", {
                                  defaultValue: "Admin",
                                })}{" "}
                          :
                        </Typography>
                        <Box sx={{ minWidth: 0 }}>
                          {clientEstimateData?.adminSignatureName && (
                            <Typography variant="body2">
                              {clientEstimateData.adminSignatureName}
                            </Typography>
                          )}
                          {clientEstimateData?.adminSignedDate && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              sx={{ mt: 0.25 }}
                            >
                              {formatSignatureDate(
                                clientEstimateData.adminSignedDate,
                              )}
                            </Typography>
                          )}
                          <Box
                            component="img"
                            src={adminSignature}
                            alt={
                              pdf
                                ? "Admin signature"
                                : t("changeOrder.adminSignature", {
                                    defaultValue: "Admin",
                                  })
                            }
                            draggable={false}
                            sx={{
                              display: "block",
                              mt: 0.5,
                              maxWidth: 180,
                              maxHeight: 64,
                              objectFit: "contain",
                              bgcolor: "common.white",
                              filter:
                                "grayscale(1) contrast(1.15) brightness(1.08)",
                            }}
                          />
                        </Box>
                      </Stack>
                    </Box>
                  )}

                  {clientSignature && (
                    <Box
                      sx={{
                        flex: showAdminSignature ? 1 : "none",
                        minWidth: 0,
                        order: 2,
                        display: "flex",
                        justifyContent: showAdminSignature
                          ? "flex-end"
                          : "flex-start",
                      }}
                    >
                      <Stack spacing={1} alignItems="flex-start">
                        <Typography variant="body1" fontWeight={500}>
                          {pdf
                            ? "Client signature"
                            : t("changeOrder.clientSignature", {
                                defaultValue: "Client signature",
                              })}{" "}
                          :
                        </Typography>
                        <Box sx={{ minWidth: 0 }}>
                          {clientSignatureName && (
                            <Typography variant="body2">
                              {clientSignatureName}
                            </Typography>
                          )}
                          {clientSignedDate && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              sx={{ mt: 0.25 }}
                            >
                              {formatSignatureDate(clientSignedDate)}
                            </Typography>
                          )}
                          {clientSignature && (
                            <Box
                              component="img"
                              src={clientSignature}
                              alt={
                                pdf
                                  ? "Client signature"
                                  : t("changeOrder.clientSignature", {
                                      defaultValue: "Client signature",
                                    })
                              }
                              draggable={false}
                              sx={{
                                display: "block",
                                mt: 0.5,
                                maxWidth: 180,
                                maxHeight: 64,
                                objectFit: "contain",
                                bgcolor: "common.white",
                                filter:
                                  "grayscale(1) contrast(1.15) brightness(1.08)",
                              }}
                            />
                          )}
                        </Box>
                      </Stack>
                    </Box>
                  )}

                  {clientEstimateData?.cameraVerificationUrl && (
                    <Box
                      sx={{
                        flex: showAdminSignature ? 1 : "none",
                        minWidth: 0,
                        order: 3,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="flex-start"
                      >
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{ flexShrink: 0 }}
                        >
                          {pdf
                            ? "Camera Verification"
                            : t("signature.cameraVerificationTitle", {
                                defaultValue: "Camera Verification",
                              })}{" "}
                          :
                        </Typography>
                        <Box
                          component="img"
                          src={clientEstimateData.cameraVerificationUrl}
                          alt={
                            pdf
                              ? "Camera Verification"
                              : t("signature.cameraVerificationTitle", {
                                  defaultValue: "Camera Verification",
                                })
                          }
                          draggable={false}
                          sx={{
                            display: "block",
                            mt: 0.5,
                            maxWidth: 180,
                            maxHeight: 180,
                            borderRadius: 1,
                            objectFit: "cover",
                          }}
                        />
                      </Stack>
                    </Box>
                  )}
                </Stack>
              )}
            </Box>
          </Box>
        </Grid>

        {/* {commentMode && ( */}
        {allowComments !== false && commentMode && (
          <Grid
            sx={{
              bgcolor: "background.paper",
              // maxHeight: "75vh",
              width: {
                xs: "60%",
                sm: "100%",
              },
              marginTop: "2rem",
              // zIndex: "1000",
              bottom: "0px",
              overflowY: "scroll",
            }}
            item
            sm={3}
            // className=" mt-6 "
          >
            {estimateComments && estimateComments?.length > 0 ? (
              estimateComments.map(
                (comment: EstimateSuggestionType, commentPin: number) => (
                  <Box
                    key={commentPin}
                    component={"div"}
                    sx={{
                      cursor: "pointer",
                      pb: 2,
                      mb: 2,
                      borderBottom:
                        commentPin < estimateComments.length - 1 ? 1 : 0,
                      borderColor: "divider",
                    }}
                  >
                    {type == "CLIENT" ? (
                      <LeadCommentThreadComponent
                        comment={comment}
                        commentPin={commentPin + 1}
                      />
                    ) : (
                      <ArchitectCommentThreadComponent
                        comment={comment}
                        commentPin={commentPin + 1}
                      />
                    )}
                  </Box>
                ),
              )
            ) : (
              <Typography
                width={"100%"}
                variant="body2"
                textAlign={"center"}
                my={2}
              >
                {t("common.noSuggestions")}
              </Typography>
            )}
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default BoqPreview;
