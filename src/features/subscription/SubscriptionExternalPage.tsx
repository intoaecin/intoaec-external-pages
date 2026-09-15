"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Grid,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEnv } from "@/features/hooks/useEnv";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { decryptAES } from "@/lib/helpers";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutPageHome from "../checkoutPage/CheckoutPageHome";
import { OrganizationLocalizationProvider } from "@/features/components/providers/OrganizationLocalizationProvider";

interface SubscriptionData {
  selectedModules?: string[];
  billingFrequency?: string;
  paymentTenure?: string;
  numberOfLicenses?: number;
  planType?: string;
  planId?: string;
  planAmount?: number;
  currency?: string;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
  isAddingUserLicense?: boolean;
  currentSubscriptionId?: string;
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
  zipCode?: string;
  accountNumber?: string;
  organizationLocation?: string;
}

const SubscriptionExternalPage = () => {
  const router = useRouter();
  const { NEXT_PUBLIC_ACCESS_KEY, NEXT_PUBLIC_USERHUB_ENDPOINT } = useEnv();

  const { post: fetchUserDomain } = useAxiosWithAuth(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/session",
  );

  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stripePublishKey, setStripePublishKey] = useState<string | null>(null);

  // Initialize Stripe with fetched key
  const stripePromise = stripePublishKey ? loadStripe(stripePublishKey) : null;

  // Fetch payment gateway details
  useEffect(() => {
    const fetchPaymentGatewayDetails = async () => {
      try {
        const response = await fetchUserDomain({
          eventType: "FETCH_PAYMENT_GATEWAY_DETAILS",
          countryCode: subscriptionData?.country || "GLOBAL",
        });

        if (
          response?.code === "PAYMENT_GATEWAY_DETAILS_RETRIEVED" &&
          response?.body
        ) {
          if (!NEXT_PUBLIC_ACCESS_KEY) {
            console.error(
              "[SubscriptionExternalPage] CRITICAL: NEXT_PUBLIC_ACCESS_KEY is not defined!",
            );
            setError("Configuration error: Access key is missing");
            return;
          }

          if (!response.body.paymentGatewayPublishKey) {
            console.error(
              "[SubscriptionExternalPage] CRITICAL: paymentGatewayPublishKey is empty!",
            );
            setError("Payment gateway configuration is incomplete");
            return;
          }

          // Decrypt the encrypted publish key (decryptAES is synchronous)
          try {
            const decryptedKey = decryptAES(
              response.body.paymentGatewayPublishKey,
              NEXT_PUBLIC_ACCESS_KEY,
            );

            if (!decryptedKey || decryptedKey.trim() === "") {
              console.error(
                "[SubscriptionExternalPage] CRITICAL: Decryption returned empty string!",
              );
              console.error(
                "[SubscriptionExternalPage] This usually means the encryption key doesn't match",
              );
              setError("Failed to decrypt payment gateway credentials");
              return;
            }

            setStripePublishKey(decryptedKey);
          } catch (decryptError) {
            console.error(
              "[SubscriptionExternalPage] Decryption error:",
              decryptError,
            );
            setError("Failed to decrypt payment gateway credentials");
          }
        } else {
          console.error(
            "[SubscriptionExternalPage] Failed to retrieve payment gateway details:",
            response,
          );
          setError("Failed to retrieve payment gateway configuration");
        }
      } catch (error) {
        console.error(
          "[SubscriptionExternalPage] Error fetching payment gateway details:",
          error,
        );
        setError("Error loading payment gateway");
      }
    };

    fetchPaymentGatewayDetails();
  }, []);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (router.isReady) {
        const { data } = router.query;

        if (data && typeof data === "string") {
          try {
            // Decrypt using AES from helpers
            const decryptedString = decryptAES(
              decodeURIComponent(data),
              NEXT_PUBLIC_ACCESS_KEY,
            );

            const decryptedData = JSON.parse(decryptedString);
            console.log("Decrypted subscription data:", decryptedData);
            setSubscriptionData(decryptedData);
            setError(null);
          } catch (error) {
            console.error("Error decrypting subscription data:", error);
            setError(
              "This link has expired or is no longer valid—please contact our support team to request a new link",
            );
          }
        } else {
          console.warn("No data parameter found in URL query");
          setError(
            "No subscription data found in the URL. Please use the correct URL format: /subscription/checkout-payment?data=...",
          );
        }

        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [router.isReady, router.query, NEXT_PUBLIC_ACCESS_KEY]);

  if (loading || !stripePromise) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="grey.50"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="grey.50"
        p={3}
      >
        <Container maxWidth="md">
          <Alert severity="error" sx={{ fontSize: "1.1rem" }}>
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  if (!subscriptionData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="grey.50"
        p={3}
      >
        <Container maxWidth="md">
          <Alert severity="warning" sx={{ fontSize: "1.1rem" }}>
            No subscription information available.
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
        <OrganizationLocalizationProvider
          organizationId={subscriptionData.organizationId}
          organizationType="AEC"
          isAuth={false}
        >
          <CheckoutPageHome
            isExternal={true}
            initialData={subscriptionData}
            successRedirectUrl={subscriptionData.successRedirectUrl}
            failureRedirectUrl={subscriptionData.failureRedirectUrl}
          />
        </OrganizationLocalizationProvider>
      </Box>
    </Elements>
  );
};

export default SubscriptionExternalPage;
