"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  Alert,
  Divider,
  Link,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useEnv } from "@/features/hooks/useEnv";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { getMonthValueForSubscriptionFrequency } from "@/utils/helpers";
import { formatNumberITL, suffixOfNumber } from "@/lib/helpers";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import {
  buildPricingTierBreakdown,
  getAdditionalLicensesMonthlyAmount,
  getMonthlyPackageAmount,
  getPricingForUserCount,
  toPricingBillingPeriod,
} from "@/features/hooks/api/pricing/pricing.helpers";
import { usePricingQuery } from "@/features/hooks/api/pricing/usePricingQuery";

type BillingFrequency = "monthly" | "quarterly" | "half-yearly" | "annually";

interface ReviewAndSummaryProps {
  numberOfLicenses: number;
  billingFrequency: BillingFrequency;
  discountCode: string;
  basePrice?: number;
  currency?: string;
  currencySymbol?: string;
  selectedPaymentMethod: string | number | null;
  appliedDiscount?: {
    value: number;
    unit: "PERCENTAGE" | "AMOUNT";
    discountCouponCode: string;
  };
  planId?: string;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
  onPaymentMethodAdded?: () => void; // Callback to refresh payment methods list
  isAddingUserLicense?: boolean;
  initialNumberOfLicenses?: number;
  paymentTenure?: string;
  subscriptionValidTill?: string;
  externalData?: any;
  sphId?: string;
  taxPercentage?: number;
  isTaxEnabled?: boolean;
}

const ReviewAndSummary: React.FC<ReviewAndSummaryProps> = ({
  numberOfLicenses,
  billingFrequency,
  discountCode,
  basePrice = 45.0,
  currency = "",
  currencySymbol = "",
  selectedPaymentMethod,
  appliedDiscount,
  planId,
  successRedirectUrl,
  failureRedirectUrl,
  onPaymentMethodAdded,
  isAddingUserLicense,
  initialNumberOfLicenses,
  paymentTenure,
  subscriptionValidTill,
  externalData,
  sphId,
  taxPercentage = 0,
  isTaxEnabled = false,
}) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // 3DS Verification State
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState<string>("");
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);

  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isSpanish = i18n.language === "es";
  const { localizationValue } = useOrganizationLocalization();

  const {
    NEXT_PUBLIC_PAYMASTER_ENDPOINT,
    NEXT_PUBLIC_TERMS_OF_SERVICES_URL,
    NEXT_PUBLIC_PRIVACY_POLICY_URL,
  } = useEnv();

  const { post: pgPaymentPost } = useAxiosWithAuth(
    NEXT_PUBLIC_PAYMASTER_ENDPOINT + "/payment-gateway",
  );

  const remainingDays = React.useMemo(() => {
    if (!subscriptionValidTill) return 0;
    const expiryDate = new Date(Number(subscriptionValidTill));
    const currentDate = new Date();
    const diffTime = expiryDate.getTime() - currentDate.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [subscriptionValidTill]);

  const pricingBillingPeriod = toPricingBillingPeriod(billingFrequency);
  const { data: pricingData } = usePricingQuery({
    countryCode: externalData?.countryCode || "GLOBAL",
    billingPeriod: pricingBillingPeriod,
  });

  const monthlyFactor = {
    monthly: 1,
    quarterly: 3,
    "half-yearly": 6,
    annually: 12,
  };

  const frequencyDiscount = {
    monthly: 0,
    quarterly: 0.05,
    "half-yearly": 0.08,
    annually: 0.1,
  };

  const startCount = isAddingUserLicense
    ? (initialNumberOfLicenses ??
      externalData?.initialNumberOfLicenses ??
      (externalData?.numberOfLicenses && externalData.numberOfLicenses > 1
        ? externalData.numberOfLicenses - 1
        : 0))
    : 0;

  const rawTenureStr = isAddingUserLicense
    ? paymentTenure || externalData?.paymentTenure || billingFrequency
    : billingFrequency;

  const normalizeTenureEnum = (tenureStr?: string): string => {
    if (!tenureStr) return "MONTHLY";
    const lower = tenureStr.toLowerCase().replace(/_/g, "-");
    if (lower.includes("half") || lower.includes("semi")) return "HALF_YEARLY";
    if (lower.includes("annual")) return "ANNUALLY";
    if (lower.includes("quarter")) return "QUARTERLY";
    return "MONTHLY";
  };

  const existingPaymentTenure = normalizeTenureEnum(rawTenureStr);

  const packagePricing = getPricingForUserCount(pricingData, numberOfLicenses);
  const priorPackagePricing =
    startCount > 0
      ? getPricingForUserCount(pricingData, startCount)
      : undefined;
  const resolvedBasePrice = packagePricing?.basePrice ?? basePrice;

  const subtotalAfterUserDiscount = pricingData
    ? isAddingUserLicense
      ? getAdditionalLicensesMonthlyAmount(
          pricingData,
          numberOfLicenses,
          startCount,
          pricingBillingPeriod,
        )
      : getMonthlyPackageAmount(packagePricing, pricingBillingPeriod)
    : (numberOfLicenses - startCount) * resolvedBasePrice;

  const monthlyNet = subtotalAfterUserDiscount;

  const frequencyDiscountAmount = pricingData
    ? Math.max(
        0,
        ((packagePricing?.billingPeriodDiscount || 0) -
          (priorPackagePricing?.billingPeriodDiscount || 0)) /
          monthlyFactor[billingFrequency],
      )
    : monthlyNet * frequencyDiscount[billingFrequency];

  const monthlySubtotalAfterBillingDiscount = Math.max(
    0,
    monthlyNet - frequencyDiscountAmount,
  );

  let promoDiscountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.unit === "PERCENTAGE") {
      const promoDiscountBase = isAddingUserLicense
        ? monthlySubtotalAfterBillingDiscount
        : monthlyNet;
      promoDiscountAmount = promoDiscountBase * (appliedDiscount.value / 100);
    } else {
      promoDiscountAmount = appliedDiscount.value;
    }
  }

  const monthlyTotal = Math.max(
    0,
    monthlySubtotalAfterBillingDiscount - promoDiscountAmount,
  );

  const periodSubtotalBeforePromo = pricingData
    ? Math.max(
        0,
        (packagePricing?.subTotalAfterBillingPeriodDiscount || 0) -
          (priorPackagePricing?.subTotalAfterBillingPeriodDiscount || 0),
      )
    : (subtotalAfterUserDiscount -
        subtotalAfterUserDiscount * frequencyDiscount[billingFrequency]) *
      monthlyFactor[billingFrequency];

  let periodPromoDiscount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.unit === "PERCENTAGE") {
      periodPromoDiscount =
        periodSubtotalBeforePromo * (appliedDiscount.value / 100);
    } else {
      periodPromoDiscount =
        appliedDiscount.value * monthlyFactor[billingFrequency];
    }
  }

  const total =
    isAddingUserLicense && remainingDays > 0
      ? (monthlyTotal / 30) * remainingDays
      : Math.max(0, periodSubtotalBeforePromo - periodPromoDiscount);

  const resolvedTaxPercentage =
    packagePricing?.taxPercentage ?? taxPercentage ?? 0;
  const shouldApplyTax = isTaxEnabled || resolvedTaxPercentage > 0;
  const taxAmount = shouldApplyTax ? (total * resolvedTaxPercentage) / 100 : 0;
  const totalWithTax = total + taxAmount;

  // Calculate subscription validity timestamp based on billing frequency
  const calculateSubscriptionValidTill = (
    frequency: BillingFrequency,
  ): number => {
    const now = Date.now(); // Current time in milliseconds
    const daysToAdd = {
      monthly: 30,
      quarterly: 90,
      "half-yearly": 180,
      annually: 365,
    };

    const millisecondsToAdd = daysToAdd[frequency] * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    return now + millisecondsToAdd;
  };

  // Handle 3DS Popup logic
  const open3DSPopup = (url: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        url,
        t("checkout.3dsVerificationTitle"),
        `width=${width},height=${height},top=${top},left=${left}`,
      );

      if (!popup) {
        toast.error(t("checkout.popupBlocked")); // Fallback message if somehow still blocked
        resolve(null);
        return;
      }

      const interval = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(interval);
            resolve(null);
            return;
          }

          // Check if popup has redirected back to our domain
          if (popup.location.href.includes("payment_intent")) {
            // Parse query params from popup URL
            const urlParams = new URL(popup.location.href).searchParams;
            const paymentIntent = urlParams.get("payment_intent");

            clearInterval(interval);
            popup.close();
            resolve(paymentIntent);
          }
        } catch (e) {
          // Cross-origin access error is expected while on 3DS page
        }
      }, 1000);
    });
  };

  // Handle payment submission
  const handleSubmit = async () => {
    if (!stripe || !elements) {
      toast.error(t("checkout.stripeNotLoaded"));
      return;
    }

    if (!externalData?.organizationId) {
      toast.error(t("checkout.organizationNotFound"));
      return;
    }

    setSubmitLoading(true);

    try {
      let paymentMethodId = selectedPaymentMethod;

      // Create new payment method if not selected
      if (!selectedPaymentMethod) {
        const cardElement = elements.getElement(CardNumberElement);
        if (!cardElement) {
          toast.error(t("checkout.pleaseAddPaymentMethod"));
          setSubmitLoading(false);
          return;
        }

        const { error: submitError } = await elements.submit();
        if (submitError) {
          toast.error(
            submitError.message || t("checkout.paymentValidationFailed"),
          );
          setSubmitLoading(false);
          return;
        }

        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
        });

        if (error) {
          toast.error(
            error.message || t("checkout.failedToCreatePaymentMethod"),
          );
          setSubmitLoading(false);
          return;
        }

        // Save payment method to organization
        try {
          const { data: saveRes } = await axios.post(
            NEXT_PUBLIC_PAYMASTER_ENDPOINT + "/payment-gateway",
            {
              ...paymentMethod,
              customerName:
                externalData?.customerName ?? t("common.customer"),
              customerEmail: externalData?.emailId ?? "",
              paymentGateway: "STRIPE",
              eventType: "ADD_PAYMENT_METHOD_DETAILS",
              countryCode: "GLOBAL",
              organizationId: externalData?.organizationId,
            },
          );
          paymentMethodId = saveRes?.body?.opmdId;
        } catch (saveError: any) {
          // Extract error message from response
          const errorMessage =
            saveError?.response?.data?.error?.raw?.message ||
            saveError?.response?.data?.error?.message ||
            saveError?.response?.data?.message ||
            t("checkout.failedToSavePaymentMethod");

          toast.error(errorMessage);
          setSubmitLoading(false);
          return;
        }

        // Refresh payment methods list and select the newly added card
        if (onPaymentMethodAdded) {
          onPaymentMethodAdded();
        }
      }
      // Build line items
      const lineItems: Array<{
        description: string;
        amount?: number;
        isSubscriptionFee?: boolean;
        isDiscount?: boolean;
        quantity?: number | string;
      }> = [];

      const pricingTier = buildPricingTierBreakdown(
        pricingData?.userBasedDiscountBands,
        pricingData?.pricing,
        numberOfLicenses,
        startCount,
      );

      if (pricingTier.length > 0) {
        pricingTier.forEach((tier) => {
          let description =
            tier.minUser === tier.maxUser
              ? `${tier.minUser}${suffixOfNumber(tier.minUser)} ${t("common.userLabel")}`
              : `${tier.minUser} - ${tier.maxUser} ${t("common.users")}`;

          if (tier.discountPercentage > 0) {
            description += ` : ${currencySymbol}${formatNumberITL(
              localizationValue,
              tier.priceAfterUserDiscount,
            )} ${t("common.perUser")} (${tier.discountPercentage}% off)`;
          }

          const lineItemAmount =
            isAddingUserLicense && remainingDays > 0
              ? (tier.tierTotal / 30) * remainingDays
              : tier.tierTotal;

          lineItems.push({
            description,
            amount: lineItemAmount,
            quantity: tier.usersInTier,
            isSubscriptionFee: true,
          });
        });
      } else {
        const usersCount = Math.max(0, numberOfLicenses - startCount);
        const tierTotal = usersCount * resolvedBasePrice;
        const lineItemAmount =
          isAddingUserLicense && remainingDays > 0
            ? (tierTotal / 30) * remainingDays
            : tierTotal;

        lineItems.push({
          description:
            usersCount === 1
              ? `1 ${t("common.userLabel")}`
              : `${usersCount} ${t("common.users")}`,
          amount: lineItemAmount,
          quantity: usersCount,
          isSubscriptionFee: true,
        });
      }

      if (promoDiscountAmount > 0 && appliedDiscount) {
        const promoAmount =
          isAddingUserLicense && remainingDays > 0
            ? (promoDiscountAmount / 30) * remainingDays
            : promoDiscountAmount;

        lineItems.push({
          description: `${t("checkout.promoDiscount")} (${appliedDiscount.discountCouponCode})`,
          isDiscount: true,
          amount: promoAmount,
          isSubscriptionFee: false,
        });
      }

      if (frequencyDiscountAmount > 0) {
        const frequencyAmount =
          isAddingUserLicense && remainingDays > 0
            ? (frequencyDiscountAmount / 30) * remainingDays
            : frequencyDiscountAmount * monthlyFactor[billingFrequency];

        lineItems.push({
          description: t("checkout.billingFrequencyDiscount", {
            percent: Math.round(frequencyDiscount[billingFrequency] * 100),
          }),
          isDiscount: true,
          amount: frequencyAmount,
          isSubscriptionFee: false,
        });
      }

      // Add tax line item if enabled
      if (shouldApplyTax && taxAmount > 0) {
        lineItems.push({
          description: `${t("checkout.tax")} (${resolvedTaxPercentage}%)`,
          amount: taxAmount,
          isSubscriptionFee: false,
        });
      }

      // Prepare billing details with fallbacks
      const billingName = externalData?.customerName ?? "";
      const billingEmail = externalData?.emailId ?? "";

      // Initiate payment
      const { data: paymentRes } = await axios.post(
        NEXT_PUBLIC_PAYMASTER_ENDPOINT + "/payment-gateway",
        {
          opmdId: paymentMethodId,
          amount: Math.round(totalWithTax * 100), // Convert to cents with tax
          currency: currency,
          eventType: "INITIATE_PAYMENT",
          redirectUrl: window.location.href, // Redirect back to current page for popup handling
          lineItems,
          frequency: getMonthValueForSubscriptionFrequency(billingFrequency),
          paymentTenure: existingPaymentTenure,
          billingFrequency,
          planId: planId || "your-plan-id-here",
          organizationId: externalData?.organizationId,
          countryCode: "GLOBAL",
          ...(successRedirectUrl || failureRedirectUrl
            ? {
                metaData: {
                  ...(successRedirectUrl ? { successRedirectUrl } : {}),
                  ...(failureRedirectUrl ? { failureRedirectUrl } : {}),
                },
              }
            : {}),
          ...(billingName ||
          billingEmail ||
          externalData?.mobileNumber ||
          externalData?.addressLine1 ||
          externalData?.city ||
          externalData?.country
            ? {
                billingDetails: {
                  ...(billingName ? { name: billingName } : {}),
                  ...(billingEmail ? { email: billingEmail } : {}),
                  ...(externalData?.mobileNumber
                    ? { mobileNumber: externalData?.mobileNumber }
                    : {}),
                  ...(externalData?.addressLine1
                    ? { addressLine1: externalData?.addressLine1 }
                    : {}),
                  ...(externalData?.addressLine2
                    ? { addressLine2: externalData?.addressLine2 }
                    : {}),
                  ...(externalData?.city ? { city: externalData?.city } : {}),
                  ...(externalData?.state
                    ? { state: externalData?.state }
                    : {}),
                  ...(externalData?.zipCode
                    ? { zipCode: externalData?.zipCode }
                    : {}),
                  ...(externalData?.country
                    ? { country: externalData?.country }
                    : {}),
                },
              }
            : {}),
          ...(appliedDiscount
            ? { couponCodes: [appliedDiscount.discountCouponCode] }
            : {}),
          ...(sphId ? { sphId } : {}),
        },
      );

      if (paymentRes?.code === "PAYMENT_INITIATED_SUCCESSFULLY") {
        const paymentId = paymentRes.body.id;

        // Handle 3D Secure redirect - Open Prompt to avoid popup blocker
        if (paymentRes?.body?.next_action?.redirect_to_url) {
          setVerificationUrl(paymentRes.body.next_action.redirect_to_url.url);
          setPendingPaymentId(paymentId);
          setIsVerificationModalOpen(true);
          return; // Pause flow, wait for user interaction
        }

        // Proceed directly if no 3DS required
        await completePaymentProcessing(paymentId);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      const stripeErrorCode =
        error?.response?.data?.error?.code ||
        error?.response?.data?.error?.raw?.code;
      if (stripeErrorCode === "amount_too_small") {
        toast.error(t("checkout.amountTooSmall"));
      } else {
        toast.error(
          error?.response?.data?.message || t("checkout.paymentFailed"),
        );
      }
      setSubmitLoading(false);
    }
  };

  const completePaymentProcessing = async (paymentId: string) => {
    try {
      // Update payment status (Happens for both 3DS success and non-3DS flows)
      const updateRes = await pgPaymentPost({
        eventType: "UPDATE_PAYMENT_DETAILS",
        paymentGatewayReferenceId: paymentId,
        isAddingUserLicense: Boolean(isAddingUserLicense),
        subscriptionValidTill: isAddingUserLicense
          ? subscriptionValidTill
          : calculateSubscriptionValidTill(billingFrequency),
        licenseCount: numberOfLicenses,
        paymentTenure: existingPaymentTenure,
        billingFrequency,
        countryCode: "GLOBAL",
        currency,
      });

      const paymentStatus =
        updateRes?.body?.paymentHistory?.paymentTransactionStatus;

      if (paymentStatus === "PAYMENT_SUCCEEDED") {
        if (successRedirectUrl) {
          router.push(successRedirectUrl);
        } else {
          toast.success(t("checkout.paymentSuccessful"));
          // Reload to re-initialize SubscriptionProvider with fresh data
          window.location.reload();
        }
      } else {
        if (failureRedirectUrl) {
          router.push(failureRedirectUrl);
        } else {
          toast.error(t("checkout.paymentFailed"));
        }
      }
    } catch (error) {
      console.error("Error completing payment:", error);
      toast.error(t("checkout.failedToConfirmPaymentStatus"));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleManualVerification = async () => {
    setIsVerificationModalOpen(false); // Close modal

    if (!verificationUrl) return;

    // Now called directly from user click
    const popupPaymentIntent = await open3DSPopup(verificationUrl);

    if (!popupPaymentIntent) {
      setSubmitLoading(false);
      // User closed popup or verification failed
      // Could check status here if needed, but safe to assume incomplete
      return;
    }

    // Continue flow if we got a payment intent from popup
    if (pendingPaymentId) {
      await completePaymentProcessing(pendingPaymentId);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="body1" fontWeight="bold" mb={2.5}>
          {t("checkout.reviewAndSummary")}
        </Typography>

        {/* Summary Text */}
        <Box display="flex" gap={1} mb={3}>
          <CheckCircleOutlineIcon color="success" />
          <Typography variant="body2">
            {t("checkout.autoRenewalMessage")}
          </Typography>
        </Box>

        {/* Pricing Summary */}
        <Box bgcolor="grey.50" borderRadius={1} p={2} mb={3}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body1" fontWeight="bold">
              {t("checkout.total")}
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {currencySymbol}
              {formatNumberITL(localizationValue, totalWithTax)}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            color="text.primary"
            display="block"
            textAlign="center"
            mt={1}
          >
            {t("checkout.nextBillingDate", {
              date: (() => {
                if (isAddingUserLicense && subscriptionValidTill) {
                  return new Date(Number(subscriptionValidTill));
                }
                const date = new Date();
                const daysToAdd = {
                  monthly: 30,
                  quarterly: 90,
                  "half-yearly": 180,
                  annually: 365,
                };
                date.setDate(date.getDate() + daysToAdd[billingFrequency]);
                return date;
              })().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            })}
          </Typography>
        </Box>

        {/* Terms Acceptance */}
        <Box mb={3}>
          <FormControlLabel
            sx={{ alignItems: "flex-start" }}
            control={
              <Checkbox
                checked={termsAccepted}
                disabled={submitLoading}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                sx={{ py: 0, mt: -0.25 }}
              />
            }
            label={
              <Typography variant="caption" color="text.secondary">
                {t("checkout.iAcceptOur")}{" "}
                <Link
                  href={
                    isSpanish
                      ? "https://maec.ai/terms-and-conditions/"
                      : NEXT_PUBLIC_TERMS_OF_SERVICES_URL || "#"
                  }
                  target="_blank"
                  underline="hover"
                  fontWeight="500"
                >
                  {t("common.termsAndConditions")}
                </Link>
                , {t("checkout.andConjunction")}{" "}
                <Link
                  href={
                    isSpanish
                      ? "https://maec.ai/privacy-policy/"
                      : NEXT_PUBLIC_PRIVACY_POLICY_URL || "#"
                  }
                  target="_blank"
                  underline="hover"
                  fontWeight="500"
                >
                  {t("checkout.privacyPolicy")}
                </Link>{" "}
              </Typography>
            }
          />
        </Box>

        {/* Proceed Button */}
        <LoadingButton
          fullWidth
          variant="contained"
          disabled={!termsAccepted}
          loading={submitLoading}
          onClick={handleSubmit}
          sx={{
            py: 1.5,
            fontWeight: "bold",
            textTransform: "none",
          }}
        >
          {t("checkout.proceedToPayment")}
        </LoadingButton>
      </CardContent>

      <Dialog
        open={isVerificationModalOpen}
        onClose={() => {
          setIsVerificationModalOpen(false);
          setSubmitLoading(false); // Reset loading if cancelled
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {t("checkout.verificationRequired")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t("checkout.verificationMessage")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsVerificationModalOpen(false);
              setSubmitLoading(false);
            }}
            color="inherit"
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleManualVerification}
            variant="contained"
            autoFocus
          >
            {t("checkout.verifyNow")}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ReviewAndSummary;
