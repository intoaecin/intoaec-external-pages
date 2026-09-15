"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Slider,
  TextField,
  Button,
  InputAdornment,
  Divider,
} from "@mui/material";
import {
  LocalOffer as LocalOfferIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { useEnv } from "@/features/hooks/useEnv";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useTranslation } from "react-i18next";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import {
  formatNumberITL,
  formatSeedValues,
  suffixOfNumber,
} from "@/lib/helpers";
import { toast } from "react-toastify";
import {
  buildPricingTierBreakdown,
  getAdditionalLicensesMonthlyAmount,
  getMonthlyPackageAmount,
  getPricingForUserCount,
  toPricingBillingPeriod,
} from "@/features/hooks/api/pricing/pricing.helpers";
import { usePricingQuery } from "@/features/hooks/api/pricing/usePricingQuery";

type BillingFrequency = "monthly" | "quarterly" | "half-yearly" | "annually";

interface PlanDetailsProps {
  numberOfLicenses: number;
  setNumberOfLicenses: (value: number) => void;
  discountCode: string;
  setDiscountCode: (value: string) => void;
  billingFrequency: BillingFrequency;
  selectedModules: string[];
  setBillingFrequency: (value: BillingFrequency) => void;
  basePrice?: number;
  currency?: string;
  currencySymbol?: string;
  appliedDiscount?: {
    value: number;
    unit: "PERCENTAGE" | "AMOUNT";
    discountCouponCode: string;
  };
  setAppliedDiscount: (
    discount:
      | {
          value: number;
          unit: "PERCENTAGE" | "AMOUNT";
          discountCouponCode: string;
        }
      | undefined,
  ) => void;
  isAddingUserLicense?: boolean;
  initialNumberOfLicenses?: number;
  currentSubscriptionId?: string;
  subscriptionValidTill?: string;
  taxPercentage?: number;
  isTaxEnabled?: boolean;
  countryCode?: string;
}

const PlanDetails: React.FC<PlanDetailsProps> = ({
  numberOfLicenses,
  setNumberOfLicenses,
  discountCode,
  setDiscountCode,
  selectedModules,
  billingFrequency,
  setBillingFrequency,
  basePrice = 45.0, // Default to 45 if not provided
  currency = "",
  currencySymbol = "",
  appliedDiscount,
  setAppliedDiscount,
  isAddingUserLicense = false,
  initialNumberOfLicenses,
  currentSubscriptionId,
  subscriptionValidTill,
  taxPercentage = 0,
  isTaxEnabled = false,
  countryCode,
}) => {
  const [validateCouponLoading, setValidateCouponLoading] = useState(false);
  const [couponCodeError, setCouponCodeError] = useState<string>();
  const [localLicenseValue, setLocalLicenseValue] = useState<string>(
    numberOfLicenses.toString(),
  );
  const { t } = useTranslation();
  const { localizationValue } = useOrganizationLocalization();
  // Safe fallback when accessed out of session
  const safeLocalizationValue = localizationValue || undefined;
  const { NEXT_PUBLIC_INTOAEC_ORG_EMAIL, NEXT_PUBLIC_INTOAEC_SALES_EMAIL } =
    useEnv();

  // Calculate remaining days until subscription expiry for pro-rating
  const remainingDays = React.useMemo(() => {
    if (!subscriptionValidTill) return 0;
    const expiryDate = new Date(Number(subscriptionValidTill));
    const currentDate = new Date();
    const diffTime = expiryDate.getTime() - currentDate.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [subscriptionValidTill]);

  const { NEXT_PUBLIC_PAYMASTER_ENDPOINT, NEXT_PUBLIC_AECPOSTMAN_ENDPOINT } =
    useEnv();
  const { post: pgPost } = useAxiosWithAuth(
    NEXT_PUBLIC_PAYMASTER_ENDPOINT + "/subscriptions",
  );
  const { post: sendPost } = useAxiosWithAuth(
    NEXT_PUBLIC_AECPOSTMAN_ENDPOINT + `/validate-request`,
  );
  const [emailLoading, setEmailLoading] = useState(false);
  const resolvedCountryCode = countryCode;
  const existingCount = isAddingUserLicense
    ? initialNumberOfLicenses ?? (numberOfLicenses > 1 ? numberOfLicenses - 1 : 1)
    : 0;
  const minimumLicenseCount = isAddingUserLicense
    ? Math.max(1, existingCount + 1)
    : 3;

  const pricingBillingPeriod = toPricingBillingPeriod(billingFrequency);
  const { data: pricingData } = usePricingQuery({
    countryCode: resolvedCountryCode || "GLOBAL",
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
    quarterly: 0.03,
    "half-yearly": 0.07,
    annually: 0.15,
  };

  useEffect(() => {
    setLocalLicenseValue(numberOfLicenses.toString());
  }, [numberOfLicenses]);

  useEffect(() => {
    if (numberOfLicenses < minimumLicenseCount) {
      setNumberOfLicenses(minimumLicenseCount);
    }
  }, [minimumLicenseCount, numberOfLicenses, setNumberOfLicenses]);

  // Validate discount coupon
  const validateDiscountCoupon = async (couponCode: string) => {
    setValidateCouponLoading(true);
    setCouponCodeError(undefined);
    try {
      const res = await pgPost({
        eventType: "GET_DISCOUNT_COUPON",
        couponCode,
      });

      if (res?.code === "DISCOUNT_RETRIEVED_SUCCESSFULLY") {
        setCouponCodeError(undefined);
        setAppliedDiscount({
          discountCouponCode: couponCode,
          value: res?.body?.couponDiscountValue,
          unit: res?.body?.couponDiscountUnit,
        });
      } else if (res?.code === "INVALID_DISCOUNT") {
        // toast.error(res?.error || t("checkout.invalidCouponCode"));
        setCouponCodeError(res?.error || t("checkout.invalidCouponCode"));
      }
    } catch (error: any) {
      console.error("Error while validating coupon code:", error);
      setCouponCodeError(
        error?.response?.data?.message || t("checkout.invalidCouponCode"),
      );
    } finally {
      setValidateCouponLoading(false);
    }
  };

  const handleContactUs = async () => {
    setEmailLoading(true);
    try {
      // Create HTML table with modules and user counts
      const tableRows = selectedModules
        .map(
          (module) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 16px; text-align: left; color: #374151;">${
            module.toLowerCase() === "crm" ? "CRM" : formatSeedValues(module)
          }</td>
          <td style="padding: 12px 16px; text-align: left; color: #374151;">> 20</td>
        </tr>
      `,
        )
        .join("");

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p style="color: #374151; margin-bottom: 16px;">User requested more than 20 licenses for the following configuration:</p>
          <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #1f2937; border-bottom: 2px solid #e5e7eb;">${t("subscription.modules")}</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #1f2937; border-bottom: 2px solid #e5e7eb;">${t("subscription.users")}</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      `;

      const requestData = {
        eventType: "SEND_POST",
        communicationMode: "EMAIL",
        sourceType: "INTOAEC",
        destinationType: "ORGANIZATION",
        destinationContactId:
          NEXT_PUBLIC_INTOAEC_ORG_EMAIL || "support@intoaec.ai",
        emailRequirements: {
          notificationTemplateName: "SUBSCRIPTION_REQUEST_OVER_LIMIT",
          // htmlcontent: btoa(unescape(encodeURIComponent(emailContent))),
          subject: t("checkout.planUpgradeRequest"),
          ccEmailIds: [NEXT_PUBLIC_INTOAEC_SALES_EMAIL || "sales@intoaec.ai"],
          "{CURRENT_PLAN}": "Custom Plan",
          "{DETAILS_TABLE}": emailContent,
          "{REQUESTED_TOTAL_USERS}": "-",
          "{SELECTED_MODULES}": "-",
          isBindMacro: true,
          isCommunication: true,
        },
      };

      const res = await sendPost(requestData);
      if (!res?.error) {
        toast.success(t("subscription.requestSentSuccessfully"));
      } else {
        toast.error(t("checkout.failedToSendRequest"));
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error(t("checkout.failedToSendRequest"));
    } finally {
      setEmailLoading(false);
    }
  };

  const startCount = isAddingUserLicense ? existingCount : 0;
  const resolvedBasePrice =
    getPricingForUserCount(pricingData, Math.max(numberOfLicenses, 1))
      ?.basePrice ?? basePrice;

  const packagePricing = getPricingForUserCount(pricingData, numberOfLicenses);
  const priorPackagePricing =
    startCount > 0
      ? getPricingForUserCount(pricingData, startCount)
      : undefined;

  const pricingTierBreakdown = buildPricingTierBreakdown(
    pricingData?.userBasedDiscountBands,
    pricingData?.pricing,
    numberOfLicenses,
    startCount,
  );

  const monthlyNet = pricingData
    ? isAddingUserLicense
      ? getAdditionalLicensesMonthlyAmount(
          pricingData,
          numberOfLicenses,
          startCount,
          pricingBillingPeriod,
        )
      : getMonthlyPackageAmount(packagePricing, pricingBillingPeriod)
    : numberOfLicenses * resolvedBasePrice;

  const periodBillingDiscount = pricingData
    ? Math.max(
        0,
        (packagePricing?.billingPeriodDiscount || 0) -
          (priorPackagePricing?.billingPeriodDiscount || 0),
      )
    : monthlyNet *
      frequencyDiscount[billingFrequency] *
      monthlyFactor[billingFrequency];

  const proratedBillingDiscount =
    isAddingUserLicense && remainingDays > 0
      ? pricingData
        ? (periodBillingDiscount / monthlyFactor[billingFrequency] / 30) *
          remainingDays
        : (monthlyNet * frequencyDiscount[billingFrequency] / 30) *
          remainingDays
      : periodBillingDiscount;

  const periodSubtotalBeforePromo = (() => {
    if (isAddingUserLicense && remainingDays > 0) {
      return Math.max(
        0,
        (monthlyNet / 30) * remainingDays - proratedBillingDiscount,
      );
    }
    if (pricingData) {
      return Math.max(
        0,
        (packagePricing?.subTotalAfterBillingPeriodDiscount || 0) -
          (priorPackagePricing?.subTotalAfterBillingPeriodDiscount || 0),
      );
    }
    return (
      (monthlyNet - monthlyNet * frequencyDiscount[billingFrequency]) *
      monthlyFactor[billingFrequency]
    );
  })();

  const additionalLicensesSubtotal =
    isAddingUserLicense && remainingDays > 0
      ? (monthlyNet / 30) * remainingDays
      : periodSubtotalBeforePromo + proratedBillingDiscount;

  let periodPromoDiscount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.unit === "PERCENTAGE") {
      periodPromoDiscount =
        periodSubtotalBeforePromo * (appliedDiscount.value / 100);
    } else {
      const multiplier =
        isAddingUserLicense && remainingDays > 0
          ? remainingDays / 30
          : monthlyFactor[billingFrequency];
      periodPromoDiscount = appliedDiscount.value * multiplier;
    }
  }

  const totalTaxable = Math.max(
    0,
    periodSubtotalBeforePromo - periodPromoDiscount,
  );

  const resolvedTaxPercentage =
    packagePricing?.taxPercentage ?? taxPercentage ?? 0;
  const shouldApplyTax = isTaxEnabled || resolvedTaxPercentage > 0;
  const taxAmount = shouldApplyTax
    ? (totalTaxable * resolvedTaxPercentage) / 100
    : 0;
  const totalWithTax = totalTaxable + taxAmount;

  // UI Helper variables
  const subtotal = monthlyNet;
  const tenureBaseRate = subtotal * monthlyFactor[billingFrequency];
  const periodSubtotal = periodSubtotalBeforePromo;
  const total = totalWithTax;
  const pricePerUser = resolvedBasePrice;

  const getFrequencyLabel = () => {
    const labels = {
      monthly: t("checkout.perUserMonth"),
      quarterly: t("checkout.perUserQuarter"),
      "half-yearly": t("checkout.perUser6Months"),
      annually: t("checkout.perUserYear"),
    };
    return labels[billingFrequency];
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={3}>
          {t("checkout.planDetails")}
        </Typography>

        {/* Current Subscription Info - shown when adding licenses */}
        {isAddingUserLicense && currentSubscriptionId && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: "info.50",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "info.200",
            }}
          >
            <Typography
              variant="body2"
              fontWeight="600"
              color="info.main"
              mb={0.5}
            >
              {t("checkout.addingToExistingSubscription")}
            </Typography>
            <Typography variant="caption" color="text.primary">
              {t("checkout.addingLicenseNote")}
            </Typography>
          </Box>
        )}

        {/* Plan Name and Price */}
        {false && (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={2}
            pb={2}
            borderBottom={1}
            borderColor="divider"
          >
            <Box>
              <Typography variant="body1" fontWeight="bold" gutterBottom>
                {t("checkout.customPlan")}
              </Typography>
              <Box display="flex" gap={0.5} mt={0.5}>
                {selectedModules?.map((module) => (
                  <Chip
                    key={module}
                    label={
                      module.toLowerCase() === "crm"
                        ? "CRM"
                        : formatSeedValues(module)
                    }
                    size="small"
                    sx={{
                      bgcolor: "primary.50",
                      color: "primary.main",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    }}
                  />
                ))}
              </Box>
            </Box>
            <Box textAlign="right">
              <Typography variant="h5" fontWeight="bold" color="primary">
                {currencySymbol}
                {formatNumberITL(safeLocalizationValue, pricePerUser)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getFrequencyLabel()}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Number of Licenses */}
        <Box mb={3}>
          <Typography variant="body2" fontWeight="600" mb={2}>
            {t("checkout.numberOfLicenses")}
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Slider
              value={numberOfLicenses}
              onChange={(e, value) => {
                const newValue = value as number;
                if (newValue < minimumLicenseCount) {
                  setNumberOfLicenses(minimumLicenseCount);
                } else {
                  setNumberOfLicenses(newValue);
                }
              }}
              min={1}
              max={20}
              sx={{ flex: 1, ml: 1 }}
            />
            <TextField
              value={localLicenseValue}
              onChange={(e) => {
                const val = e.target.value;
                // Only allow digits
                if (/^\d*$/.test(val)) {
                  if (val !== "") {
                    const num = parseInt(val);
                    if (num > 20) return; // Prevent entering more than 20
                  }

                  setLocalLicenseValue(val);

                  if (val !== "") {
                    const num = parseInt(val);
                    if (num >= minimumLicenseCount) {
                      setNumberOfLicenses(num);
                    }
                  }
                }
              }}
              onBlur={() => {
                const num = parseInt(localLicenseValue);
                if (
                  localLicenseValue === "" ||
                  isNaN(num) ||
                  num < minimumLicenseCount
                ) {
                  setNumberOfLicenses(minimumLicenseCount);
                  setLocalLicenseValue(minimumLicenseCount.toString());
                } else if (num > 20) {
                  setNumberOfLicenses(20);
                  setLocalLicenseValue("20");
                }
              }}
              sx={{ width: 80 }}
              size="small"
            />
          </Box>
          {numberOfLicenses >= 20 && (
            <Box
              mt={2}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={2}
              bgcolor="primary.50"
              borderRadius={1}
              border="1px dashed"
              borderColor="primary.main"
            >
              <Typography
                variant="body2"
                color="primary.main"
                fontWeight="medium"
              >
                {t("checkout.wantMoreUsers")}
              </Typography>
              <LoadingButton
                variant="contained"
                size="small"
                color="primary"
                loading={emailLoading}
                onClick={handleContactUs}
                sx={{ textTransform: "none" }}
              >
                {t("checkout.contactUs")}
              </LoadingButton>
            </Box>
          )}
        </Box>

        {/* Pricing Breakdown by Tier */}
        {numberOfLicenses > 0 && (
          <Box
            mb={3}
            bgcolor="primary.50"
            borderRadius={2}
            p={2.5}
            border={1}
            borderColor="primary.200"
          >
            <Typography
              variant="body2"
              fontWeight="700"
              color="primary.main"
              mb={2}
            >
              {t("checkout.pricingBreakdown")}:
            </Typography>

            {(isAddingUserLicense
              ? numberOfLicenses === (initialNumberOfLicenses || 0)
              : numberOfLicenses === 1) && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic", mb: 2 }}
              >
                {t("checkout.discountIncentive")}
              </Typography>
            )}
            <Box display="flex" flexDirection="column" gap={1}>
              {/* Dynamic Tiers from pricing API */}
              {pricingTierBreakdown.map((tier) => (
                <Box
                  key={tier.key}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2" color="text.primary">
                    {tier.minUser === tier.maxUser
                      ? `${tier.minUser}${suffixOfNumber(tier.minUser)} ${t("common.userLabel")}`
                      : `${tier.minUser} - ${tier.maxUser} ${t("common.users")}`}
                    {tier.discountPercentage > 0
                      ? ` : ${currencySymbol}${formatNumberITL(
                          safeLocalizationValue,
                          tier.priceAfterUserDiscount,
                        )}/${t("common.userLabel")} (${tier.discountPercentage}% off)`
                      : ""}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="600"
                    color="text.primary"
                  >
                    {currencySymbol}
                    {formatNumberITL(safeLocalizationValue, tier.tierTotal)}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 1 }} />

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="body2"
                  fontWeight="700"
                  color="primary.main"
                >
                  {t("checkout.totalCostPerMonth")}
                </Typography>
                <Typography variant="h6" fontWeight="700" color="primary.main">
                  {currencySymbol}
                  {formatNumberITL(safeLocalizationValue, subtotal)}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Billing Frequency */}
        {!isAddingUserLicense && (
          <Box mb={3}>
            <Typography variant="body2" fontWeight="600" mb={2}>
              {t("checkout.billingFrequency")}
            </Typography>
            <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={1.5}>
              {[
                { value: "monthly", label: t("checkout.monthly") },
                { value: "quarterly", label: t("checkout.quarterly") },
                { value: "half-yearly", label: t("checkout.halfYearly") },
                { value: "annually", label: t("checkout.annually") },
              ].map((option) => {
                const discount =
                  frequencyDiscount[option.value as BillingFrequency];
                return (
                  <Box key={option.value} position="relative">
                    {discount > 0 && (
                      <Chip
                        label={`${Math.round(discount * 100)}% OFF`}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: -14,
                          left: "50%",
                          transform: "translateX(-50%)",
                          bgcolor: "#10b981",
                          color: "white",
                          fontWeight: 600,
                          fontSize: "0.625rem",
                          height: 22,
                          borderRadius: "12px",
                          zIndex: 1,
                          "& .MuiChip-label": {
                            px: 1.5,
                            py: 0,
                          },
                        }}
                      />
                    )}
                    <Button
                      onClick={() =>
                        setBillingFrequency(option.value as BillingFrequency)
                      }
                      variant="outlined"
                      fullWidth
                      sx={{
                        textTransform: "none",
                        fontWeight: 500,
                        borderRadius: "6px",
                        borderColor:
                          billingFrequency === option.value
                            ? "primary.main"
                            : "grey.300",
                        color:
                          billingFrequency === option.value
                            ? "primary.main"
                            : "text.primary",
                        bgcolor:
                          billingFrequency === option.value
                            ? "rgba(33, 150, 243, 0.08)"
                            : "transparent",
                        py: 1,
                        "&:hover": {
                          borderColor:
                            billingFrequency === option.value
                              ? "primary.main"
                              : "grey.400",
                          bgcolor:
                            billingFrequency === option.value
                              ? "rgba(33, 150, 243, 0.12)"
                              : "rgba(0, 0, 0, 0.04)",
                        },
                      }}
                    >
                      {option.label}
                    </Button>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Discount Code */}
        <Box mb={3}>
          <Typography variant="body2" fontWeight="600" mb={2}>
            Discount Code
          </Typography>
          {appliedDiscount ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1.5,
                bgcolor: "success.50",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "success.main",
              }}
            >
              <LocalOfferIcon fontSize="small" color="success" />
              <Box flex={1}>
                <Typography
                  variant="body2"
                  fontWeight="600"
                  color="success.main"
                >
                  {appliedDiscount.discountCouponCode}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {appliedDiscount.unit === "PERCENTAGE"
                    ? `${appliedDiscount.value}% discount applied`
                    : `$${appliedDiscount.value} discount applied`}
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => {
                  setAppliedDiscount(undefined);
                  setDiscountCode("");
                }}
                sx={{ minWidth: "auto", p: 0.5 }}
              >
                <CancelIcon color="error" fontSize="small" />
              </Button>
            </Box>
          ) : (
            <>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  placeholder="Enter promo code"
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value);
                    setCouponCodeError(undefined);
                  }}
                  size="small"
                  error={Boolean(couponCodeError)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalOfferIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <LoadingButton
                  variant="contained"
                  loading={validateCouponLoading}
                  onClick={() => {
                    if (discountCode) {
                      validateDiscountCoupon(discountCode);
                    }
                  }}
                  disabled={!discountCode}
                  sx={{ textTransform: "none", px: 3 }}
                >
                  Apply
                </LoadingButton>
              </Box>
              {couponCodeError && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  {couponCodeError}
                </Typography>
              )}
            </>
          )}
        </Box>

        {/* Pricing Breakdown */}
        <Box bgcolor="grey.50" borderRadius={1} p={2}>
          {!isAddingUserLicense && (
            <>
              {/* Base rate for the selected billing tenure */}
              <Box display="flex" justifyContent="space-between" mb={1.5}>
                <Typography variant="body2" color="text.secondary">
                  {t("checkout.baseRate")}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="600"
                  color="text.primary"
                >
                  {currencySymbol}
                  {formatNumberITL(safeLocalizationValue, tenureBaseRate)}
                </Typography>
              </Box>

              {/* Plan Duration */}
              <Box display="flex" justifyContent="space-between" mb={1.5}>
                <Typography variant="body2" color="text.secondary">
                  {t("checkout.planDuration", "Plan Duration")} (
                  {monthlyFactor[billingFrequency]} {t("recepitContent.months")}
                  )
                </Typography>
                <Typography variant="body2" fontWeight="600" color="#10b981">
                  {billingFrequency === "monthly"
                    ? t("checkout.monthlyPlan", "Monthly Plan")
                    : `${
                        billingFrequency === "quarterly"
                          ? t("checkout.quarterlyPlan", "Quarterly Plan")
                          : billingFrequency === "half-yearly"
                            ? t("checkout.halfYearlyPlan", "Half-Yearly Plan")
                            : t("checkout.annualPlan", "Annual Plan")
                      } • ${t("checkout.youSave", "You save")} ${currencySymbol}${formatNumberITL(
                        safeLocalizationValue,
                        periodBillingDiscount,
                      )}`}
                </Typography>
              </Box>

              {/* Subtotal */}
              <Box display="flex" justifyContent="space-between" mb={1.5}>
                <Typography variant="body2" color="text.secondary">
                  {t("recepitContent.subtotal")}
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {currencySymbol}
                  {formatNumberITL(safeLocalizationValue, periodSubtotal)}
                </Typography>
              </Box>
            </>
          )}

          {/* Discount Applied (Promo) */}
          {periodPromoDiscount > 0 && !isAddingUserLicense && (
            <Box display="flex" justifyContent="space-between" mb={1.5}>
              <Typography variant="body2" color="success.main">
                {t("checkout.discountApplied", "Discount Applied")} (
                {appliedDiscount?.discountCouponCode})
              </Typography>
              <Typography variant="body2" fontWeight="500" color="success.main">
                -{currencySymbol}
                {formatNumberITL(safeLocalizationValue, periodPromoDiscount)}
              </Typography>
            </Box>
          )}

          {/* Tax */}
          {shouldApplyTax && taxAmount > 0 && !isAddingUserLicense && (
            <Box display="flex" justifyContent="space-between" mb={1.5}>
              <Typography variant="body2" color="text.secondary">
                {t("checkout.tax")} ({resolvedTaxPercentage}%)
              </Typography>
              <Typography variant="body2" fontWeight="500">
                +{currencySymbol}
                {formatNumberITL(safeLocalizationValue, taxAmount)}
              </Typography>
            </Box>
          )}

          {/* Adding User License Logic (Kept as is for fallback/compatibility) */}
          {isAddingUserLicense && (
            <>
              <Box display="flex" justifyContent="space-between" mb={1.5}>
                <Typography variant="body2" color="text.secondary">
                  {t("checkout.additionalLicenses", {
                    count: numberOfLicenses - (initialNumberOfLicenses || 0),
                    price: resolvedBasePrice,
                  })}
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {currencySymbol}
                  {/* {currencySymbol} */}
                  {formatNumberITL(safeLocalizationValue, subtotal)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1.5}>
                <Typography variant="body2" color="text.secondary">
                  {t("recepitContent.subtotal")} (
                  {`${remainingDays} ${t("checkout.days")}`})
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {currencySymbol}
                  {formatNumberITL(
                    safeLocalizationValue,
                    additionalLicensesSubtotal,
                  )}
                </Typography>
              </Box>
              {proratedBillingDiscount > 0 && (
                <Box display="flex" justifyContent="space-between" mb={1.5}>
                  <Typography variant="body2" color="success.main">
                    {t("checkout.billingFrequencyDiscount", {
                      percent: Math.round(
                        frequencyDiscount[billingFrequency] * 100,
                      ),
                    })}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="500"
                    color="success.main"
                  >
                    -{currencySymbol}
                    {formatNumberITL(
                      safeLocalizationValue,
                      proratedBillingDiscount,
                    )}
                  </Typography>
                </Box>
              )}
              {shouldApplyTax && taxAmount > 0 && (
                <Box display="flex" justifyContent="space-between" mb={1.5}>
                  <Typography variant="body2" color="text.secondary">
                    {t("checkout.tax")} ({resolvedTaxPercentage}%)
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    +{currencySymbol}
                    {formatNumberITL(safeLocalizationValue, taxAmount)}
                  </Typography>
                </Box>
              )}
            </>
          )}

          <Divider sx={{ my: 1.5 }} />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body1" fontWeight="bold">
              {t("checkout.total")}
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {currencySymbol}
              {formatNumberITL(safeLocalizationValue, totalWithTax)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PlanDetails;
