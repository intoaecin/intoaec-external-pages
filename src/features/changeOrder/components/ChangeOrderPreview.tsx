"use client";

/**
 * Ported from intoaec-UI `src/features/changeOrder/components/ChangeOrderPreview.tsx`.
 *
 * Only the named export `ChangeOrderPreviewContent` is ported — that is the
 * only thing the client-facing `/change-order-preview/[changeOrderId]` page
 * actually renders. The source file's default export (`ChangeOrderPreviewDialog`,
 * an admin-only full-screen preview dialog used inside intoaec-UI's builder
 * flows) pulls in `next-auth`'s `useSession`, `useInvalidateMoneyMatters`,
 * `useAxiosWithAuth`, and a "mark payment term as paid" -> invoice/receipt
 * creation flow gated entirely inside that dialog component. None of that is
 * reachable from `ChangeOrderPreviewContent` itself (verified by reading the
 * source: `useSession`/`useInvalidateMoneyMatters` are referenced only inside
 * `ChangeOrderPreviewDialog`'s body, never inside `ChangeOrderPreviewContent`),
 * so it is intentionally left out of this port rather than stripped out of a
 * ported copy.
 *
 * `ChangeOrderPreviewData` is redefined locally here (instead of importing
 * intoaec-UI's `ChangeOrder` type from `features/changeOrder/types.ts`) since
 * that type file pulls in the admin builder's `profileSourceReturnTab` module,
 * which has no equivalent — and no purpose — in this app. Only the fields the
 * preview UI itself reads are included below.
 */

import BusinessAndClientInfo from "@/features/components/boq/BuisinessAndClientInfo";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import {
  formatNumberITL,
  formatDateBasedOnOrganizationLocalization,
  getLocalizationValue,
  formatSeedValues,
} from "@/lib/helpers";
import type { OrganizationLocalizationType } from "@/types";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Fragment, useMemo } from "react";
import { useTranslation } from "react-i18next";
import PlateEditor from "@/components/plate-editor";
import { PlateProvider } from "@/features/components/providers/PlateProvider";
import { getLocalizedUnitLabel } from "@/lib/unitLocalization";
import StatusLabel from "@/components/StatusLabel";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { LoadingButton } from "@mui/lab";

type PreviewLineItem = Record<string, unknown>;

export interface ChangeOrderPaymentTerm {
  estimatePaymentTermId?: string;
  paymentName?: string;
  amount?: number | string;
  paymentTerms?: string;
  paymentScheduleDueDate?: string | number;
  status?: string;
  isPaid?: boolean;
}

export interface ChangeOrderPreviewData {
  changeOrderId?: string;
  changeOrderTitle?: string;
  changeOrderSerial?: string;
  changeOrderDescription?: string;
  organizationId?: string;
  organizationType?: string;
  projectId?: string;
  projectName?: string;
  leadId?: string;
  leadName?: string;
  leadEmail?: string;
  leadMobile?: string;
  clientName?: string;
  estimatePrice?: number;
  changeOrderPrice?: number;
  priceDifference?: number;
  status?: "DRAFT" | "PENDING_APPROVAL" | "SENT" | "ACCEPTED" | "DECLINED" | "REJECTED";
  isAdminSignatureVisible?: boolean;
  adminSignature?: string;
  adminSignatureName?: string;
  adminSignedDate?: string;
  leadSignature?: string;
  leadSignatureName?: string;
  leadSignedDate?: string;
  acceptedAt?: number;
  declinedAt?: number;
  rejectedAt?: number;
  lineItems?: PreviewLineItem[];
  notes?: unknown;
  estimatePaymentTerms?: ChangeOrderPaymentTerm[];
  captureImage?: boolean;
  cameraVerificationUrl?: string;
  clientCameraVerificationUrl?: string;
  currency?: string;
}

interface ChangeOrderPreviewContentProps {
  changeOrder: ChangeOrderPreviewData;
  currency?: string;
  formatAmount?: (value: number) => string;
  localization?: OrganizationLocalizationType[];
  projectId?: string;
  organizationId?: string;
  organizationName?: string;
  withAuth?: boolean;
  printMode?: boolean;
  showDocumentTitle?: boolean;
  showPaymentTermStatus?: boolean;
  showPayNow?: boolean;
  paymentLink?: string;
  paymentLinkLoading?: boolean;
  showMarkAsPaid?: boolean;
  pendingPaymentTermIds?: ReadonlySet<string>;
  onMarkAsPaid?: (term: ChangeOrderPaymentTerm, index: number) => void;
  reversePriceColors?: boolean;
  defaultOrganizationDetails?: {
    organizationName?: string;
    organizationWebsite?: string;
    organizationLocation?: string;
    mobileNumber?: string;
    emailId?: string;
    organizationLogo?: string;
  };
  defaultClientDetails?: {
    clientName?: string;
    clientEmailAddress?: string;
    clientContactNumber?: string;
    clientLocation?: string;
  };
}

const numberValue = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const textValue = (value: unknown): string =>
  typeof value === "string" ? value : "";

const itemNameValue = (value: unknown): string =>
  typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";

const hasMeaningfulTermsContent = (value: unknown): boolean => {
  if (value == null) return false;

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    if (!trimmedValue) return false;

    try {
      return hasMeaningfulTermsContent(JSON.parse(trimmedValue));
    } catch {
      return trimmedValue.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, "").trim().length > 0;
    }
  }

  if (Array.isArray(value)) {
    return value.some(hasMeaningfulTermsContent);
  }

  if (typeof value === "object") {
    const node = value as Record<string, unknown>;
    if (typeof node.text === "string" && node.text.trim().length > 0) {
      return true;
    }
    if (Array.isArray(node.children)) {
      return node.children.some(hasMeaningfulTermsContent);
    }
    return Boolean(node.url || node.src || node.image || node.file);
  }

  return false;
};

export function ChangeOrderPreviewContent({
  changeOrder,
  currency,
  formatAmount,
  localization,
  projectId = "",
  organizationId = "",
  organizationName = "",
  withAuth = true,
  printMode = false,
  showDocumentTitle = true,
  showPaymentTermStatus = true,
  showPayNow = false,
  paymentLink,
  paymentLinkLoading = false,
  showMarkAsPaid = false,
  pendingPaymentTermIds,
  onMarkAsPaid,
  reversePriceColors = false,
  defaultOrganizationDetails,
  defaultClientDetails,
}: ChangeOrderPreviewContentProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { localizationValue: contextLocalization } =
    useOrganizationLocalization();
  const localizationValue = localization ?? contextLocalization ?? [];
  const lineItems = changeOrder.lineItems ?? [];
  const isAccepted =
    String(changeOrder.status ?? "").toUpperCase() === "ACCEPTED" ||
    Boolean(changeOrder.acceptedAt);
  const canMarkPaymentTermsAsPaid = showMarkAsPaid && isAccepted;
  const shouldShowPaymentTermStatus =
    showPaymentTermStatus && !showMarkAsPaid;
  const currencySymbol =
    currency ||
    changeOrder.currency ||
    getLocalizationValue(localizationValue, "CURRENCY", "SYMBOL") ||
    "";
  const priceDifference = numberValue(changeOrder.priceDifference);
  const estimatePrice = numberValue(changeOrder.estimatePrice);
  const impactPercentage =
    estimatePrice > 0 ? (priceDifference / estimatePrice) * 100 : 0;
  const isBudgetIncrease = priceDifference > 0;
  const isBudgetDecrease = priceDifference < 0;
  const useExternalPriceColors = reversePriceColors || printMode;
  const budgetImpactColor = isBudgetIncrease
    ? useExternalPriceColors
      ? theme.palette.error.main
      : theme.palette.success.main
    : isBudgetDecrease
      ? useExternalPriceColors
        ? theme.palette.success.main
        : theme.palette.error.main
      : theme.palette.common.black;
  const BudgetImpactIcon = isBudgetIncrease
    ? TrendingUp
    : isBudgetDecrease
      ? TrendingDown
      : Minus;
  const amount = (value: unknown) => {
    const numericValue = numberValue(value);
    const formattedValue = formatAmount
      ? formatAmount(numericValue)
      : String(
          formatNumberITL(localizationValue, numericValue) ??
            numericValue.toLocaleString(),
        );

    return `${currencySymbol}${formattedValue}`;
  };
  const label = (key: string, fallback: string) =>
    printMode ? fallback : t(key, { defaultValue: fallback });
  const formatSignedDate = (value: string) => {
    const formattedDate = formatDateBasedOnOrganizationLocalization(
      localizationValue,
      value,
      true,
    );

    return formattedDate.toLowerCase().includes("invalid")
      ? value
      : formattedDate;
  };

  const groupedLineItems = useMemo(() => {
    const groups: { sectionName: string; items: PreviewLineItem[] }[] = [];
    lineItems.forEach((item) => {
      const secName = textValue(item.sectionName) || "General Items";
      let group = groups.find((g) => g.sectionName === secName);
      if (!group) {
        group = { sectionName: secName, items: [] };
        groups.push(group);
      }
      group.items.push(item);
    });
    return groups;
  }, [lineItems]);

  return (
    <Paper
      elevation={0}
      style={
        printMode
          ? {
              width: "100%",
              maxWidth: "none",
              margin: "0 auto",
              padding: 0,
              backgroundColor: "transparent",
            }
          : undefined
      }
      sx={{
        width: printMode ? "100%" : { xs: "100%", md: "92%" },
        maxWidth: "none",
        mx: "auto",
        p: printMode ? 0 : { xs: 1.5, md: 2 },
        bgcolor: "transparent",
      }}
    >
      <Stack
        spacing={printMode ? 1.5 : 2}
        style={
          printMode
            ? { display: "flex", flexDirection: "column", gap: "12px" }
            : undefined
        }
      >
        {showDocumentTitle && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={1}
          >
            <Box>
              <Typography variant="body1" fontWeight={500}>
                {changeOrder.changeOrderTitle ||
                  label("changeOrder.title", "Change Order")}
              </Typography>
              {changeOrder.changeOrderSerial ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {changeOrder.changeOrderSerial}
                </Typography>
              ) : null}
            </Box>
          </Stack>
        )}

        {projectId && organizationId ? (
          <Box>
            <Typography
              variant="body1"
              fontWeight={500}
              style={printMode ? { marginBottom: "8px" } : undefined}
              sx={{ mb: 1 }}
            >
              {label("common.generalDetails", "General Details")}
            </Typography>
            <BusinessAndClientInfo
              type={withAuth ? "ADMIN" : "CLIENT"}
              projectId={projectId}
              organizationId={organizationId}
              withAuth={withAuth}
              defaultOrganizationDetails={defaultOrganizationDetails}
              defaultClientDetails={defaultClientDetails}
              defaultReceiverDetails={{}}
              isPreview
              pdf={printMode}
              fullWidth
              singleRow={printMode}
            />
          </Box>
        ) : null}

        <TableContainer
          style={
            printMode
              ? {
                  width: "100%",
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  borderRadius: "4px",
                  overflow: "visible",
                }
              : undefined
          }
          sx={{
            width: "100%",
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            overflow: printMode ? "visible" : "hidden",
          }}
        >
          <Table
            style={
              printMode
                ? { width: "100%", minWidth: 0, tableLayout: "fixed" }
                : undefined
            }
            sx={{
              width: "100%",
              minWidth: printMode ? 0 : 760,
              tableLayout: "fixed",
              "& .MuiTableRow-root > .MuiTableCell-root:not(:last-child)": {
                borderRight: 1,
                borderColor: "divider",
              },
            }}
            aria-label={label("changeOrder.items", "Change Order Items")}
          >
            <colgroup>
              <col style={{ width: "30%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "16%" }} />
            </colgroup>
            <TableHead
              style={
                printMode
                  ? { backgroundColor: theme.palette.primary.main }
                  : undefined
              }
              sx={{ bgcolor: "primary.main" }}
            >
              <TableRow
                style={printMode ? { height: 48 } : undefined}
                sx={{
                  height: printMode ? 48 : 64,
                  "& .MuiTableCell-root": {
                    color: "primary.contrastText",
                    py: printMode ? 0.75 : 1,
                    fontWeight: 500,
                  },
                }}
              >
                {(
                  [
                    ["changeOrder.itemName", "Item Name"],
                    ["changeOrder.type", "Type"],
                    ["boq.columns.Qty", "Qty"],
                    ["changeOrder.unit", "Unit"],
                    ["boq.columns.Rate", "Rate"],
                    ["boq.columns.Total Cost", "Total Cost"],
                  ] as const
                ).map(([key, fallback]) => (
                  <TableCell
                    key={key}
                    align="center"
                    style={
                      printMode
                        ? {
                            color: theme.palette.primary.contrastText,
                            padding: "8px",
                            fontWeight: 500,
                            backgroundColor: theme.palette.primary.main,
                            borderBottom: "none",
                          }
                        : undefined
                    }
                  >
                    {label(key, fallback)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {groupedLineItems.length ? (
                groupedLineItems.map((group) => (
                  <Fragment key={`preview-sec-${group.sectionName}`}>
                    <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                      <TableCell
                        colSpan={7}
                        sx={{
                          py: 1,
                          px: 2,
                          fontWeight: 700,
                          color: "primary.main",
                          bgcolor: "#f1f5f9",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          color="primary.main"
                          title={group.sectionName}
                          sx={{
                            maxWidth: printMode ? "50vw" : "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {group.sectionName}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {group.items.map((item, index) => {
                      const itemName =
                        itemNameValue(item.itemName) ||
                        label("changeOrder.itemName", "Item Name");
                      const description = textValue(item.itemDescription);
                      const isMaterial = Boolean(item.isMaterial);
                      const rowKey =
                        textValue(item.changeOrderLineItemId) ||
                        `${itemName}-${index}`;
                      const plannedPrice = numberValue(
                        item.estimatePrice ?? item.totalCost,
                      );
                      const updatedPrice = numberValue(
                        item.changeOrderPrice ?? item.totalCost,
                      );
                      const differenceBackground = (
                        updatedValue: number,
                        plannedValue: number,
                      ) =>
                        updatedValue > plannedValue
                          ? useExternalPriceColors
                            ? "error.light"
                            : "success.light"
                          : updatedValue < plannedValue
                            ? useExternalPriceColors
                              ? "success.light"
                              : "error.light"
                            : "background.paper";
                      const plannedQuantity = numberValue(
                        item.estimateQuantity ?? item.quantity,
                      );
                      const updatedQuantity = numberValue(
                        item.changeOrderQuantity ?? item.quantity,
                      );
                      const plannedRate = numberValue(
                        item.estimateRateIncluProfit ??
                          item.estimateRate ??
                          item.ratePerUnit ??
                          item.changeOrderRate,
                      );
                      const updatedRate = numberValue(
                        item.changeOrderRate ??
                          item.rateIncluProfit ??
                          item.ratePerUnit,
                      );
                      const itemCell = (
                        <TableCell
                          rowSpan={2}
                          sx={{
                            px: 1,
                            py: 1,
                            verticalAlign: "middle",
                            bgcolor: isMaterial
                              ? "action.selected"
                              : "background.paper",
                          }}
                        >
                          <Box sx={{ minWidth: 0, ml: isMaterial ? 4 : 0 }}>
                            <Box sx={{ minWidth: 0 }}>
                              <Tooltip
                                disableHoverListener={printMode}
                                title={
                                  !printMode && itemName.length > 35
                                    ? itemName
                                    : ""
                                }
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={400}
                                  color="text.primary"
                                  sx={{
                                    overflow: printMode ? "visible" : "hidden",
                                    textOverflow: printMode
                                      ? "clip"
                                      : "ellipsis",
                                    whiteSpace: printMode ? "normal" : "nowrap",
                                    overflowWrap: printMode
                                      ? "anywhere"
                                      : "normal",
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {itemName}
                                </Typography>
                              </Tooltip>
                            </Box>
                            {description ? (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                sx={{
                                  mt: 0.25,
                                  overflowWrap: "anywhere",
                                  lineHeight: 1.4,
                                }}
                              >
                                {description}
                              </Typography>
                            ) : null}
                          </Box>
                        </TableCell>
                      );

                      return (
                        <Fragment key={rowKey}>
                          <TableRow
                            sx={{
                              height: 52,
                              bgcolor: "background.paper",
                              "& > .MuiTableCell-root:not(:first-of-type)": {
                                bgcolor: "action.hover",
                              },
                            }}
                          >
                            {itemCell}
                            <TableCell align="center">
                              {label("changeOrder.planned", "Planned")}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ whiteSpace: "nowrap" }}
                            >
                              {plannedQuantity}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ whiteSpace: "nowrap" }}
                            >
                              {getLocalizedUnitLabel(
                                textValue(item.estimateUnit ?? item.unit),
                                t,
                              ) || "-"}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ whiteSpace: "nowrap" }}
                            >
                              {amount(plannedRate)}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ whiteSpace: "nowrap" }}
                            >
                              {amount(item.estimatePrice ?? item.totalCost)}
                            </TableCell>
                          </TableRow>
                          <TableRow
                            sx={{ height: 52, bgcolor: "background.paper" }}
                          >
                            <TableCell align="center">
                              {label("changeOrder.updated", "Updated")}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                whiteSpace: "nowrap",
                                bgcolor: differenceBackground(
                                  updatedQuantity,
                                  plannedQuantity,
                                ),
                              }}
                            >
                              {updatedQuantity}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ whiteSpace: "nowrap" }}
                            >
                              {getLocalizedUnitLabel(textValue(item.unit), t) ||
                                "-"}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                whiteSpace: "nowrap",
                                bgcolor: differenceBackground(
                                  updatedRate,
                                  plannedRate,
                                ),
                              }}
                            >
                              {amount(updatedRate)}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                whiteSpace: "nowrap",
                                bgcolor: differenceBackground(
                                  updatedPrice,
                                  plannedPrice,
                                ),
                              }}
                            >
                              {amount(item.changeOrderPrice ?? item.totalCost)}
                            </TableCell>
                          </TableRow>
                        </Fragment>
                      );
                    })}
                  </Fragment>
                ))
              ) : (
                <TableRow sx={{ bgcolor: "background.paper" }}>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {label("common.noData", "No items")}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          style={
            printMode
              ? { display: "flex", justifyContent: "flex-end" }
              : undefined
          }
          sx={{ display: "flex", justifyContent: "flex-end" }}
        >
          <Stack
            spacing={1}
            style={
              printMode
                ? {
                    width: "420px",
                    maxWidth: "100%",
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }
                : undefined
            }
            sx={{
              width: { xs: "100%", sm: 420 },
              bgcolor: "background.paper",
              borderRadius: 2,
              p: 1.5,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              style={
                printMode
                  ? { display: "flex", justifyContent: "space-between" }
                  : undefined
              }
            >
              <Typography variant="body2" color="text.secondary">
                {label("changeOrder.originalEstimate", "Original Estimate")}
              </Typography>
              <Typography variant="body2">
                {amount(changeOrder.estimatePrice)}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              style={
                printMode
                  ? { display: "flex", justifyContent: "space-between" }
                  : undefined
              }
            >
              <Typography variant="body1" fontWeight={500}>
                {label("changeOrder.changeOrderTotal", "Change Order Total")}
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {amount(changeOrder.changeOrderPrice)}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              style={
                printMode
                  ? {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }
                  : undefined
              }
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                style={
                  printMode
                    ? { display: "flex", alignItems: "center", gap: "8px" }
                    : undefined
                }
              >
                <BudgetImpactIcon
                  size={18}
                  color={budgetImpactColor}
                  aria-hidden
                />
                <Typography variant="body2" color="text.secondary">
                  {label("changeOrder.budgetImpact", "Budget Impact")}
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                fontWeight={600}
                style={
                  printMode
                    ? { color: budgetImpactColor, whiteSpace: "nowrap" }
                    : undefined
                }
                sx={{ color: budgetImpactColor, whiteSpace: "nowrap" }}
              >
                {priceDifference > 0 ? "+" : ""}
                {amount(priceDifference)} ({impactPercentage.toFixed(1)}%)
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {Array.isArray(changeOrder?.estimatePaymentTerms) &&
        changeOrder.estimatePaymentTerms.length > 0 ? (
          <Box sx={{ mt: printMode ? 1.5 : 2, mb: printMode ? 1 : 2.5 }}>
            <Box
              sx={{
                mb: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography variant="body1" fontWeight={500}>
                {printMode
                  ? "Payment Terms"
                  : t("common.paymentTerms", {
                      defaultValue: "Payment Terms",
                    })}
              </Typography>
              {showPayNow && !printMode ? (
                <LoadingButton
                  variant="contained"
                  loading={paymentLinkLoading}
                  disabled={!isAccepted || !paymentLink}
                  sx={{
                    textTransform: "none",
                    backgroundColor: "#3CA2FF",
                    fontWeight: 500,
                    fontSize: "11px",
                    borderRadius: "4px",
                    padding: "6px 16px",
                    "&:hover": { backgroundColor: "#2BA1FF" },
                  }}
                  onClick={() => {
                    if (isAccepted && paymentLink) {
                      window.open(
                        paymentLink,
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }
                  }}
                >
                  {t("common.payNow", { defaultValue: "Pay Now" })}
                </LoadingButton>
              ) : null}
            </Box>
            <TableContainer
              sx={{
                borderTopLeftRadius: "5px",
                borderTopRightRadius: "5px",
                overflowX: "auto",
                width: "100%",
              }}
            >
              <Table
                sx={{
                  minWidth: printMode ? "100%" : "800px",
                  tableLayout: "fixed",
                  borderCollapse: "separate",
                }}
                aria-label={
                  printMode
                    ? "Payment Terms"
                    : t("common.paymentTerms", {
                        defaultValue: "Payment Terms",
                      })
                }
              >
                <TableHead
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    "& .MuiTableCell-head": {
                      color: theme.palette.primary.contrastText,
                    },
                  }}
                >
                  <TableRow>
                    <TableCell align="center" sx={{ width: "22%" }}>
                      <Typography variant="body2" fontWeight={500}>
                        {label("common.paymentName", "Payment Name")}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ width: "23%" }}>
                      <Typography variant="body2" fontWeight={500}>
                        {label("common.amount", "Amount")}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ width: "22%" }}>
                      <Typography variant="body2" fontWeight={500}>
                        {label("common.paymentTerms", "Payment Terms")}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ width: "20%" }}>
                      <Typography variant="body2" fontWeight={500}>
                        {label("common.paymentDate", "Due Date")}
                      </Typography>
                    </TableCell>
                    {shouldShowPaymentTermStatus ? (
                      <TableCell align="center" sx={{ width: "13%" }}>
                        <Typography variant="body2" fontWeight={500}>
                          {label("common.status", "Status")}
                        </Typography>
                      </TableCell>
                    ) : null}
                    {canMarkPaymentTermsAsPaid ? (
                      <TableCell align="center" sx={{ width: "16%" }}>
                        <Typography variant="body2" fontWeight={500}>
                          {label("common.action", "Action")}
                        </Typography>
                      </TableCell>
                    ) : null}
                  </TableRow>
                </TableHead>
                <TableBody sx={{ boxShadow: 3 }}>
                  {changeOrder.estimatePaymentTerms.map((term, index) => {
                    const isPaid = term.status === "PAID" || term.isPaid;
                    return (
                      <TableRow key={term.estimatePaymentTermId || index}>
                        <TableCell align="center">
                          {term.paymentName || `Payment ${index + 1}`}
                        </TableCell>
                        <TableCell align="center">
                          <Typography component="span" variant="body2">
                            {amount(Number(term.amount || 0))}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {term.paymentTerms
                            ? formatSeedValues(term.paymentTerms)
                            : "Custom"}
                        </TableCell>
                        <TableCell align="center">
                          {term.paymentScheduleDueDate
                            ? formatDateBasedOnOrganizationLocalization(
                                localizationValue,
                                term.paymentScheduleDueDate,
                                true,
                              )
                            : "-"}
                        </TableCell>
                        {shouldShowPaymentTermStatus ? (
                          <TableCell align="center">
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
                              {isPaid ? (
                                <StatusLabel
                                  status="PAID"
                                  translationKey="common"
                                  labelOverride={label("common.paid", "Paid")}
                                  customBackground={theme.palette.success.main}
                                  customColor={theme.palette.common.white}
                                  customIcon={false}
                                />
                              ) : (
                                "-"
                              )}
                            </Box>
                          </TableCell>
                        ) : null}
                        {canMarkPaymentTermsAsPaid ? (
                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<PaidOutlinedIcon />}
                              disabled={
                                isPaid ||
                                (pendingPaymentTermIds?.has(
                                  term.estimatePaymentTermId || `term-${index}`,
                                ) ?? false)
                              }
                              onClick={() => onMarkAsPaid?.(term, index)}
                              sx={{
                                width: 140,
                                minWidth: 140,
                                height: 32,
                                borderRadius: 2,
                                textTransform: "none",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {isPaid
                                ? t("common.paid")
                                : t("common.markAsPaid")}
                            </Button>
                          </TableCell>
                        ) : null}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : null}

        {hasMeaningfulTermsContent(changeOrder?.notes) ? (
          <Box sx={{ mt: printMode ? 1.5 : 2, mb: printMode ? 1 : 1.5 }}>
            <Typography variant="body1" fontWeight={600} sx={{ mb: 0.75 }}>
              {printMode
                ? "Terms And Conditions"
                : t("common.termsAndConditions", {
                    defaultValue: "Terms And Conditions",
                  })}
            </Typography>
            <Box
              sx={{
                bgcolor: "background.paper",
                borderRadius: 1,
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                ...(printMode && {
                  "&, & *": {
                    fontSize: "13px !important",
                    lineHeight: "1.5 !important",
                  },
                }),
              }}
            >
              <PlateProvider>
                <PlateEditor
                  id={`change-order-preview-terms-${changeOrder.changeOrderId || "notes"}`}
                  intialValue={changeOrder.notes}
                  value={changeOrder.notes}
                  readOnly
                />
              </PlateProvider>
            </Box>
          </Box>
        ) : null}

        {changeOrder.adminSignature ||
        changeOrder.leadSignature ||
        changeOrder.cameraVerificationUrl ||
        changeOrder.clientCameraVerificationUrl ? (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            {changeOrder.isAdminSignatureVisible &&
            changeOrder.adminSignature ? (
              <Box sx={{ flex: 1, minWidth: 0, order: 1 }}>
                <Stack spacing={1} alignItems="flex-start">
                  <Typography
                    variant="body1"
                    fontWeight={500}
                    sx={{ flexShrink: 0 }}
                  >
                    {printMode
                      ? `Legal Representative of ${organizationName}`
                      : t("changeOrder.legalRepresentative", {
                          organizationName,
                          defaultValue: `Legal Representative of ${organizationName}`,
                        })}{" "}
                    :
                  </Typography>
                  <Box sx={{ minWidth: 0 }}>
                    {changeOrder.adminSignatureName ? (
                      <Typography variant="body2">
                        {changeOrder.adminSignatureName}
                      </Typography>
                    ) : null}
                    {changeOrder.adminSignedDate ? (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ mt: 0.25 }}
                      >
                        {formatSignedDate(changeOrder.adminSignedDate)}
                      </Typography>
                    ) : null}
                    <Box
                      component="img"
                      src={changeOrder.adminSignature}
                      alt={label("changeOrder.adminSignature", "Admin")}
                      sx={{
                        display: "block",
                        mt: 0.5,
                        maxWidth: 180,
                        maxHeight: 64,
                        objectFit: "contain",
                        bgcolor: "common.white",
                        filter: "grayscale(1) contrast(1.15) brightness(1.08)",
                      }}
                    />
                  </Box>
                </Stack>
              </Box>
            ) : null}
            {changeOrder.leadSignature ? (
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  order: 2,
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Stack spacing={1} alignItems="flex-start">
                  <Typography
                    variant="body1"
                    fontWeight={500}
                    sx={{ flexShrink: 0 }}
                  >
                    {label("changeOrder.clientSignature", "Client signature")} :
                  </Typography>
                  <Box sx={{ minWidth: 0 }}>
                    {changeOrder.leadSignatureName ? (
                      <Typography variant="body2">
                        {changeOrder.leadSignatureName}
                      </Typography>
                    ) : null}
                    {changeOrder.leadSignedDate ? (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ mt: 0.25 }}
                      >
                        {formatSignedDate(changeOrder.leadSignedDate)}
                      </Typography>
                    ) : null}
                    <Box
                      component="img"
                      src={changeOrder.leadSignature}
                      alt={label("changeOrder.clientSignature", "Client")}
                      sx={{
                        display: "block",
                        mt: 0.5,
                        maxWidth: 180,
                        maxHeight: 64,
                        objectFit: "contain",
                        bgcolor: "common.white",
                        filter: "grayscale(1) contrast(1.15) brightness(1.08)",
                      }}
                    />
                  </Box>
                </Stack>
              </Box>
            ) : null}
            {changeOrder.cameraVerificationUrl ||
            changeOrder.clientCameraVerificationUrl ? (
              <Box sx={{ flex: 1, minWidth: 0, order: 3 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{ flexShrink: 0 }}
                  >
                    {label(
                      "signature.cameraVerificationTitle",
                      "Camera Verification",
                    )}{" "}
                    :
                  </Typography>
                  <Box sx={{ minWidth: 0 }}>
                    <Box
                      component="img"
                      src={
                        changeOrder.cameraVerificationUrl ||
                        changeOrder.clientCameraVerificationUrl
                      }
                      alt="Camera Verification"
                      sx={{
                        display: "block",
                        mt: 0.5,
                        maxWidth: 180,
                        maxHeight: 180,
                        borderRadius: 1,
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                </Stack>
              </Box>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}
