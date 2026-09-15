"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Box, Container, Typography } from "@mui/material";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useRouter } from "next/router";
import ClientAndBilledToInformation from "./ClientAndBilledToInformation";
import PlanDetails from "./PlanDetails";
import PaymentMethod from "./PaymentMethod";
import ReviewAndSummary from "./ReviewAndSummary";
import { useEnv } from "@/features/hooks/useEnv";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { decryptAES } from "@/lib/helpers";
import { useTranslation } from "react-i18next";
import { UIBreadCrumbs } from "@/features/components/UIBreadCrumbs";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import PageLoader from "@/features/components/Loader/PageLoader";

interface CheckoutPageHomeProps {
  initialData?: {
    selectedModules?: string[];
    billingFrequency?: string;
    paymentTenure?: string;
    numberOfLicenses?: number;
    initialNumberOfLicenses?: number;
    planId?: string;
    planAmount?: number;
    currency?: string;
    successRedirectUrl?: string;
    failureRedirectUrl?: string;
    isAddingUserLicense?: boolean;
    currentSubscriptionId?: string;
    sphId?: string;
    subscriptionValidTill?: string;
    customerName?: string;
    emailId?: string;
    mobileNumber?: string;
    organizationId?: string;
    organizationName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    countryCode?: string;
    zipCode?: string;
    accountNumber?: string;
    organizationLocation?: string;
  };
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
  isExternal?: boolean;
}

const normalizeFrequency = (
  freq?: string,
): "monthly" | "quarterly" | "half-yearly" | "annually" => {
  if (!freq) return "monthly";
  const normalized = freq.toLowerCase().replace(/_/g, "-");
  if (normalized.includes("half") || normalized.includes("semi"))
    return "half-yearly";
  if (normalized.includes("annual")) return "annually";
  if (normalized.includes("quarter")) return "quarterly";
  return "monthly";
};

const CheckoutPageHome = ({
  isExternal = false,
  initialData,
  successRedirectUrl,
  failureRedirectUrl,
}: CheckoutPageHomeProps) => {
  const router = useRouter();
  const { NEXT_PUBLIC_USERHUB_ENDPOINT, NEXT_PUBLIC_ACCESS_KEY } = useEnv();
  const { t } = useTranslation();

  const { post: fetchUserDomain } = useAxiosWithAuth(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/session",
  );

  const [stripePublishKey, setStripePublishKey] = useState<string | null>(null);
  const [taxPercentage, setTaxPercentage] = useState<number>(0);
  const [isTaxEnabled, setIsTaxEnabled] = useState<boolean>(false);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | number | null
  >(null);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<
    | {
        value: number;
        unit: "PERCENTAGE" | "AMOUNT";
        discountCouponCode: string;
      }
    | undefined
  >();

  const [numberOfLicenses, setNumberOfLicenses] = useState(
    initialData?.numberOfLicenses || 5,
  );
  const [billingFrequency, setBillingFrequency] = useState<
    "monthly" | "quarterly" | "half-yearly" | "annually"
  >(
    normalizeFrequency(
      initialData?.billingFrequency || initialData?.paymentTenure,
    ),
  );
  const [selectedModules, setSelectedModules] = useState<string[]>(
    initialData?.selectedModules || [],
  );
  const [planAmount, setPlanAmount] = useState<number>(
    initialData?.planAmount || 45,
  );
  const [currency, setCurrency] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("");

  // Initialize Stripe with fetched key
  const stripePromise = useMemo(() => {
    return stripePublishKey ? loadStripe(stripePublishKey) : null;
  }, [stripePublishKey]);

  // State to trigger payment methods refresh
  const [paymentMethodsRefreshKey, setPaymentMethodsRefreshKey] = useState(0);

  const handlePaymentMethodAdded = () => {
    // Increment key to force PaymentMethod component to remount and refresh
    setPaymentMethodsRefreshKey((prev) => prev + 1);
  };

  // Fetch payment gateway details
  useEffect(() => {
    const fetchPaymentGatewayDetails = async () => {
      try {
        console.log("Fetching payment gateway details...");
        const response = await fetchUserDomain({
          eventType: "FETCH_PAYMENT_GATEWAY_DETAILS",
          countryCode: "GLOBAL",
        });

        console.log("Payment gateway response:", response);

        if (
          response?.code === "PAYMENT_GATEWAY_DETAILS_RETRIEVED" &&
          response?.body
        ) {
          // Decrypt the encrypted publish key (decryptAES is synchronous)
          const decryptedKey = await decryptAES(
            response.body.paymentGatewayPublishKey ?? "",
            NEXT_PUBLIC_ACCESS_KEY,
          );

          setStripePublishKey(decryptedKey);
          setCurrency(response.body.currencyCode ?? "");
          setCurrencySymbol(response.body.currencySymbol ?? "");

          // Set tax details
          if (response.body.isTaxEnabled) {
            setIsTaxEnabled(true);
            setTaxPercentage(parseFloat(response.body.subscriptionTax) || 0);
          }
        } else {
          console.error(
            "Failed to retrieve payment gateway details:",
            response,
          );
        }
      } catch (error) {
        console.error("Error fetching payment gateway details:", error);
      }
    };

    fetchPaymentGatewayDetails();
  }, []);

  useEffect(() => {
    console.log("sbngfiuhsag", initialData);
    if (initialData) {
      if (initialData.numberOfLicenses)
        setNumberOfLicenses(initialData.numberOfLicenses);
      if (initialData.billingFrequency || initialData.paymentTenure)
        setBillingFrequency(
          normalizeFrequency(
            initialData.billingFrequency || initialData.paymentTenure,
          ),
        );
      if (initialData.selectedModules)
        setSelectedModules(initialData.selectedModules);
      if (initialData.planAmount) setPlanAmount(initialData.planAmount);
    }
  }, [initialData]);

  // Show loading if Stripe key is not yet fetched
  if (!stripePromise) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="grey.50"
      >
        <PageLoader />
        {/* <Typography>{t("checkout.loadingPaymentGateway")}</Typography> */}
      </Box>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "grey.50",
          pt: 1,
          pb: isExternal ? 0 : 4,
          px: isExternal ? 0 : 2,
        }}
      >
        {isExternal && (
          <Box
            sx={{
              p: 1.5,
              px: 3,
              width: "100%",

              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #E4E7EB",
              bgcolor: "white",
              zIndex: 10,
              margin: "0 auto",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ fontWeight: 600, fontSize: "24px" }}>
                {t("checkout.checkout")}
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <LanguageSwitcher />
            </Box>
          </Box>
        )}
        <Container
          maxWidth="xl"
          sx={{ mt: isExternal ? 4 : 0, px: isExternal ? 2 : 0 }}
        >
          {!isExternal && (
            <UIBreadCrumbs
              currentLabel={t("checkout.checkout")}
              previousActionLabel={t("checkout.subscription")}
              onPreviousAction={() => {
                router.push("/subscription");
              }}
            />
          )}

          <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", lg: "2fr 1fr" }}
            gap={3}
          >
            {/* Left Section - Client Info & Plan Details */}
            <Box display="flex" flexDirection="column" gap={3}>
              {/* Client and Billed To Information */}
              <ClientAndBilledToInformation externalData={initialData} />

              {/* Plan Details */}
              <PlanDetails
                numberOfLicenses={numberOfLicenses}
                setNumberOfLicenses={setNumberOfLicenses}
                discountCode={discountCode}
                selectedModules={selectedModules}
                setDiscountCode={setDiscountCode}
                billingFrequency={billingFrequency}
                setBillingFrequency={setBillingFrequency}
                basePrice={planAmount}
                currency={currency}
                currencySymbol={currencySymbol}
                appliedDiscount={appliedDiscount}
                setAppliedDiscount={setAppliedDiscount}
                isAddingUserLicense={initialData?.isAddingUserLicense}
                initialNumberOfLicenses={
                  initialData?.initialNumberOfLicenses ??
                  (initialData?.numberOfLicenses
                    ? initialData.isAddingUserLicense
                      ? initialData.numberOfLicenses - 1
                      : initialData.numberOfLicenses
                    : 1)
                }
                currentSubscriptionId={initialData?.currentSubscriptionId}
                subscriptionValidTill={initialData?.subscriptionValidTill}
                taxPercentage={taxPercentage}
                isTaxEnabled={isTaxEnabled}
                countryCode={initialData?.countryCode || initialData?.country}
              />
            </Box>

            {/* Right Section - Payment & Review */}
            <Box display="flex" flexDirection="column" gap={3}>
              {/* Payment Method */}
              <PaymentMethod
                selectedPaymentMethod={selectedPaymentMethod}
                setSelectedPaymentMethod={setSelectedPaymentMethod}
                key={paymentMethodsRefreshKey}
                externalData={initialData}
              />

              {/* Review & Summary */}
              <ReviewAndSummary
                numberOfLicenses={numberOfLicenses}
                billingFrequency={billingFrequency}
                discountCode={discountCode}
                basePrice={planAmount}
                currency={currency}
                currencySymbol={currencySymbol}
                selectedPaymentMethod={selectedPaymentMethod}
                appliedDiscount={appliedDiscount}
                planId={initialData?.planId}
                successRedirectUrl={
                  initialData?.successRedirectUrl || successRedirectUrl
                }
                failureRedirectUrl={
                  initialData?.failureRedirectUrl || failureRedirectUrl
                }
                onPaymentMethodAdded={handlePaymentMethodAdded}
                externalData={initialData}
                isAddingUserLicense={initialData?.isAddingUserLicense}
                initialNumberOfLicenses={
                  initialData?.initialNumberOfLicenses ??
                  (initialData?.numberOfLicenses
                    ? initialData.isAddingUserLicense
                      ? initialData.numberOfLicenses - 1
                      : initialData.numberOfLicenses
                    : 1)
                }
                paymentTenure={initialData?.paymentTenure}
                subscriptionValidTill={initialData?.subscriptionValidTill}
                sphId={initialData?.sphId}
                taxPercentage={taxPercentage}
                isTaxEnabled={isTaxEnabled}
              />
            </Box>
          </Box>
        </Container>
      </Box>
    </Elements>
  );
};

export default CheckoutPageHome;
