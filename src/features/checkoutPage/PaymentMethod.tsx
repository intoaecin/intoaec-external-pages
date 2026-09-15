"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Collapse,
  CircularProgress,
  Chip,
  TextField,
} from "@mui/material";
import {
  CreditCard as CreditCardIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { useEnv } from "@/features/hooks/useEnv";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { PaymentMethodType, StripePaymentMethodResponse } from "@/types";
import {
  StripeTextFieldNumber,
  StripeTextFieldExpiry,
  StripeTextFieldCVC,
} from "./StripeFields";
import { useTranslation } from "react-i18next";
import { decryptAES } from "@/lib/helpers";

/* ---------------- Types ---------------- */
interface PaymentMethodProps {
  selectedPaymentMethod: string | number | null;
  setSelectedPaymentMethod: (value: string | number | null) => void;
  onPaymentMethodAdded?: () => void; // Callback to refresh payment methods
  externalData?: any;
}

interface SavedCardWithDetails extends PaymentMethodType {
  details?: StripePaymentMethodResponse;
}

/* ---------------- Card Brand Icon Helper ---------------- */
/* ---------------- Card Brand Icon Helper ---------------- */
const CardBrandIcon = ({ brand }: { brand?: string }) => {
  const [imgError, setImgError] = useState(false);
  const brandLower = brand?.toLowerCase();

  // Using Icons8 CDN
  const getIconUrl = (name: string) =>
    `https://img.icons8.com/color/48/${name}.png`;

  if (!brandLower || imgError) {
    return (
      <Box
        sx={{
          width: 40,
          height: 26,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 0.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 9,
          fontWeight: 700,
          color: "primary.main",
          textTransform: "uppercase",
          bgcolor: "grey.50",
        }}
      >
        {brand || "CARD"}
      </Box>
    );
  }

  // Determine styles based on brand (mimicking previous logic)
  const isVisa = brandLower === "visa";
  const height = isVisa ? undefined : 40;
  const objectFit = isVisa ? undefined : "contain";

  return (
    <img
      src={getIconUrl(brandLower)}
      alt={brand}
      width={40}
      height={height}
      style={{ objectFit: objectFit as any }}
      onError={() => setImgError(true)}
    />
  );
};

/* ---------------- Unified Input Wrapper ---------------- */
const InputBox = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <Box>
    <Typography
      variant="caption"
      sx={{
        mb: 0.5,
        display: "block",
        color: "text.secondary",
        fontWeight: 500,
      }}
    >
      {label}
    </Typography>

    <Box
      sx={{
        height: 40,
        px: 1.5,
        display: "flex",
        alignItems: "center",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "#fff",
        transition: "all 0.2s",
        "&:hover": {
          borderColor: "text.primary",
        },
        "&:focus-within": {
          borderColor: "primary.main",
          boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}20`,
        },
      }}
    >
      {children}
    </Box>
  </Box>
);

/* ---------------- Main Component ---------------- */
const PaymentMethod: React.FC<PaymentMethodProps> = ({
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  onPaymentMethodAdded,
  externalData,
}) => {
  const [showExisting, setShowExisting] = useState(false);
  const [showAddNew, setShowAddNew] = useState(true);
  const [savedCards, setSavedCards] = useState<SavedCardWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const {
    NEXT_PUBLIC_PAYMASTER_ENDPOINT,
    NEXT_PUBLIC_USERHUB_ENDPOINT,
    NEXT_PUBLIC_ACCESS_KEY,
  } = useEnv();

  const { post: pgPost } = useAxiosWithAuth(
    NEXT_PUBLIC_PAYMASTER_ENDPOINT + "/payment-gateway",
  );

  const { post: fetchUserDomain } = useAxiosWithAuth(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/session",
  );

  const [stripePublishKey, setStripePublishKey] = useState<string | null>(null);

  // Initialize Stripe with fetched key
  const stripePromise = stripePublishKey ? loadStripe(stripePublishKey) : null;

  // Fetch saved payment methods
  const fetchSavedCards = async () => {
    if (!externalData?.organizationId) return;

    setLoading(true);
    try {
      const res = await pgPost({
        eventType: "GET_ORGANIZATION_PAYMENT_METHODS",
        organizationId: externalData?.organizationId,
      });

      if (res?.code === "PAYMENT_METHODS_RETRIEVED" && res?.body) {
        const cardsWithDetails = await Promise.all(
          res.body.map(async (card: PaymentMethodType) => {
            try {
              const detailsRes = await pgPost({
                eventType: "GET_PAYMENT_METHOD_DETAILS_BY_ID",
                paymentGateway: card.paymentGateway,
                paymentMethodId: card.paymentMethodId,
                customerId: card.customerId,
              });

              if (detailsRes?.code === "PAYMENT_METHOD_DETAILS_RETRIEVED") {
                return { ...card, details: detailsRes.body };
              }
            } catch (error) {
              console.error("Error fetching card details:", error);
            }
            return card;
          }),
        );

        setSavedCards(cardsWithDetails);
      }
    } catch (error) {
      console.error("Error fetching saved cards:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch payment gateway details
  useEffect(() => {
    const fetchPaymentGatewayDetails = async () => {
      try {
        console.log("[PaymentMethod] Fetching payment gateway details...");
        const response = await fetchUserDomain({
          eventType: "FETCH_PAYMENT_GATEWAY_DETAILS",
          countryCode: "GLOBAL",
        });

        console.log("[PaymentMethod] Payment gateway response:", response);

        if (
          response?.code === "PAYMENT_GATEWAY_DETAILS_RETRIEVED" &&
          response?.body
        ) {
          console.log(
            "[PaymentMethod] Encrypted publish key:",
            response.body.paymentGatewayPublishKey,
          );

          // Decrypt the encrypted publish key (decryptAES is synchronous)
          const decryptedKey = decryptAES(
            response.body.paymentGatewayPublishKey,
            NEXT_PUBLIC_ACCESS_KEY,
          );

          console.log(
            "[PaymentMethod] Decrypted Stripe publish key:",
            decryptedKey,
          );
          setStripePublishKey(decryptedKey);
        } else {
          console.error(
            "[PaymentMethod] Failed to retrieve payment gateway details:",
            response,
          );
        }
      } catch (error) {
        console.error(
          "[PaymentMethod] Error fetching payment gateway details:",
          error,
        );
      }
    };

    fetchPaymentGatewayDetails();
  }, []);

  /* ---------------- Fetching Logic ---------------- */

  const organizationId = externalData?.organizationId;

  useEffect(() => {
    // Fetch saved payment methods from API
    if (organizationId) {
      fetchSavedCards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  // Determine if we should show the existing cards section
  const hasSavedCards = savedCards.length > 0;
  // Show existing section if we are loading OR if we have saved cards
  // (This prevents it from disappearing while loading initial data)
  const showExistingSection = loading || hasSavedCards;

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={1} mb={2.5}>
          <CreditCardIcon fontSize="small" />
          <Typography fontWeight={700}>{t("common.paymentMethod")}</Typography>
        </Box>

        {/* Add New Payment Method - Accordion */}
        {showExistingSection && (
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              const nextShowAddNew = !showAddNew;
              setShowAddNew(nextShowAddNew);
              if (nextShowAddNew) {
                setShowExisting(false);
                setSelectedPaymentMethod(null);
              }
            }}
            endIcon={
              <ExpandMoreIcon
                sx={{
                  transform: showAddNew ? "rotate(180deg)" : "rotate(0)",
                  transition: "0.3s",
                }}
              />
            }
            sx={{ mb: 1.5, fontWeight: 700, textTransform: "none" }}
          >
            {t("checkout.addNewPaymentMethod")}
          </Button>
        )}

        <Collapse in={showAddNew || !showExistingSection}>
          <Box mt={0} mb={2} p={2} bgcolor="grey.50" borderRadius={2}>
            {/* Card Holder Name */}
            <Box mb={2}>
              <Typography
                variant="caption"
                sx={{
                  mb: 0.5,
                  display: "block",
                  color: "text.secondary",
                  fontWeight: 500,
                }}
              >
                {t("checkout.cardHolderName")}
              </Typography>
              <TextField
                fullWidth
                placeholder={t("checkout.cardHolderPlaceholder")}
                sx={{
                  "& .MuiInputBase-root": {
                    height: 40,
                    bgcolor: "white",
                  },
                }}
              />
            </Box>

            {/* Card Number */}
            <Box mb={2}>
              <Typography
                variant="caption"
                sx={{
                  mb: 0.5,
                  display: "block",
                  color: "text.secondary",
                  fontWeight: 500,
                }}
              >
                {t("checkout.cardNumber")}
              </Typography>
              <Box
                sx={{
                  height: 40,
                  px: 1.5,
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "white",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "text.primary",
                  },
                  "&:focus-within": {
                    borderColor: "primary.main",
                    boxShadow: (theme) =>
                      `0 0 0 2px ${theme.palette.primary.main}20`,
                  },
                  "& .StripeElement": {
                    width: "100%",
                  },
                }}
              >
                <CardNumberElement
                  options={{
                    style: {
                      base: {
                        fontSize: "14px",
                        color: "#000000",
                        "::placeholder": {
                          color: "#aab7c4",
                        },
                      },
                      invalid: {
                        color: "#d32f2f",
                      },
                    },
                  }}
                  id="card-number-element"
                />
              </Box>
            </Box>

            {/* Expiry and CVC */}
            <Box display="flex" gap={1.5}>
              <Box flex={1}>
                <Typography
                  variant="caption"
                  sx={{
                    mb: 0.5,
                    display: "block",
                    color: "text.secondary",
                    fontWeight: 500,
                  }}
                >
                  {t("checkout.expirationDate")}
                </Typography>
                <Box
                  sx={{
                    height: 40,
                    px: 1.5,
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    bgcolor: "white",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "text.primary",
                    },
                    "&:focus-within": {
                      borderColor: "primary.main",
                      boxShadow: (theme) =>
                        `0 0 0 2px ${theme.palette.primary.main}20`,
                    },
                    "& .StripeElement": {
                      width: "100%",
                    },
                  }}
                >
                  <CardExpiryElement
                    options={{
                      style: {
                        base: {
                          fontSize: "14px",
                          color: "#000000",
                          "::placeholder": {
                            color: "#aab7c4",
                          },
                        },
                        invalid: {
                          color: "#d32f2f",
                        },
                      },
                    }}
                    id="card-expiry-element"
                  />
                </Box>
              </Box>
              <Box width={140}>
                <Typography
                  variant="caption"
                  sx={{
                    mb: 0.5,
                    display: "block",
                    color: "text.secondary",
                    fontWeight: 500,
                  }}
                >
                  {t("checkout.cvc", { defaultValue: "CVV" })}
                </Typography>
                <Box
                  sx={{
                    height: 40,
                    px: 1.5,
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    bgcolor: "white",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "text.primary",
                    },
                    "&:focus-within": {
                      borderColor: "primary.main",
                      boxShadow: (theme) =>
                        `0 0 0 2px ${theme.palette.primary.main}20`,
                    },
                    "& .StripeElement": {
                      width: "100%",
                    },
                  }}
                >
                  <CardCvcElement
                    options={{
                      placeholder: "CVV",
                      style: {
                        base: {
                          fontSize: "14px",
                          color: "#000000",
                          "::placeholder": {
                            color: "#aab7c4",
                          },
                        },
                        invalid: {
                          color: "#d32f2f",
                        },
                      },
                    }}
                    id="card-cvv-element"
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Collapse>

        {/* Existing Cards */}
        {showExistingSection && (
          <>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                const nextShowExisting = !showExisting;
                setShowExisting(nextShowExisting);
                if (nextShowExisting) {
                  setShowAddNew(false);
                }
              }}
              endIcon={
                <ExpandMoreIcon
                  sx={{
                    transform: showExisting ? "rotate(180deg)" : "rotate(0)",
                    transition: "0.3s",
                  }}
                />
              }
              sx={{ mb: 1.5, fontWeight: 700, textTransform: "none" }}
            >
              {t("checkout.chooseFromExisting")}
            </Button>

            <Collapse in={showExisting}>
              <Box
                display="flex"
                flexDirection="column"
                gap={1.5}
                mb={2}
                sx={{
                  maxHeight: "310px",
                  overflowY: "auto",
                  pr: 0.5,
                }}
              >
                {loading ? (
                  <Box display="flex" justifyContent="center" py={3}>
                    <CircularProgress size={24} />
                  </Box>
                ) : savedCards.length === 0 ? (
                  <Box py={2} textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      {t("checkout.noSavedPaymentMethods")}
                    </Typography>
                  </Box>
                ) : (
                  savedCards.map((card) => (
                    <Box
                      key={card.opmdId}
                      onClick={() => {
                        if (selectedPaymentMethod === card.opmdId) {
                          setSelectedPaymentMethod(null);
                        } else {
                          setSelectedPaymentMethod(card.opmdId);
                        }
                      }}
                      sx={{
                        p: 1.5,
                        border: "1px solid",
                        borderColor:
                          selectedPaymentMethod === card.opmdId
                            ? "success.main"
                            : "divider",
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        cursor: "pointer",
                        bgcolor:
                          selectedPaymentMethod === card.opmdId
                            ? "success.50"
                            : "#fff",
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor:
                            selectedPaymentMethod === card.opmdId
                              ? "success.main"
                              : "grey.400",
                        },
                      }}
                    >
                      {/* Card Brand Icon */}
                      <Box
                        sx={{
                          width: 50,
                          height: 32,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CardBrandIcon brand={card.details?.card?.brand} />
                      </Box>

                      {/* Card Details */}
                      <Box flex={1}>
                        <Typography fontWeight={600} variant="body2">
                          **** **** **** {card.details?.card?.last4 || "****"}
                        </Typography>
                        {card.details?.card?.exp_month &&
                          card.details?.card?.exp_year && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {t("checkout.expires")}{" "}
                              {card.details.card.exp_month}/
                              {card.details.card.exp_year}
                            </Typography>
                          )}
                      </Box>

                      {/* Default Badge */}
                      {card.isPrimary && (
                        <Chip
                          label={t("common.default")}
                          size="small"
                          sx={{
                            bgcolor: "primary.main",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.625rem",
                            height: 20,
                          }}
                        />
                      )}

                      {/* Selected Checkmark */}
                      {selectedPaymentMethod === card.opmdId && (
                        <CheckCircleIcon color="success" fontSize="small" />
                      )}
                    </Box>
                  ))
                )}
              </Box>
            </Collapse>
          </>
        )}
      </CardContent>
    </Card>
  );
};

/* ---------------- Stripe Card Form ---------------- */
const StripeCardForm = ({
  onSuccess,
}: {
  onSuccess: (pmId: string) => void;
}) => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState({
    cardNumberComplete: false,
    expiredComplete: false,
    cvcComplete: false,
    cardNumberError: null,
    expiredError: null,
    cvcError: null,
  });

  const onElementChange =
    (field: any, errorField: any) =>
    ({ complete, error = { message: null } }: any) => {
      setState({ ...state, [field]: complete, [errorField]: error.message });
    };

  const submit = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const card = elements.getElement(CardNumberElement);
    if (!card) return;

    const result = await stripe.createPaymentMethod({
      type: "card",
      card,
      billing_details: { name },
    });

    if (result.error) {
      setError(result.error.message || t("checkout.paymentFailed"));
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess(result.paymentMethod.id);
  };

  const { cardNumberError, expiredError, cvcError } = state;

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "grey.50",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Card Holder Name */}
      <Box>
        <Typography
          variant="caption"
          sx={{
            mb: 0.5,
            display: "block",
            color: "text.secondary",
            fontWeight: 500,
          }}
        >
          {t("checkout.cardHolderName")}
        </Typography>
        <TextField
          fullWidth
          placeholder={t("checkout.cardHolderPlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{
            "& .MuiInputBase-root": {
              height: 40,
            },
          }}
        />
      </Box>

      {/* Card Number */}
      <StripeTextFieldNumber
        error={Boolean(cardNumberError)}
        labelErrorMessage={cardNumberError}
        onChange={onElementChange("cardNumberComplete", "cardNumberError")}
      />

      {/* Expiry + CVC */}
      <Box display="flex" gap={1.5}>
        <Box flex={1}>
          <StripeTextFieldExpiry
            error={Boolean(expiredError)}
            labelErrorMessage={expiredError}
            onChange={onElementChange("expiredComplete", "expiredError")}
          />
        </Box>
        <Box width={140}>
          <StripeTextFieldCVC
            error={Boolean(cvcError)}
            labelErrorMessage={cvcError}
            onChange={onElementChange("cvcComplete", "cvcError")}
          />
        </Box>
      </Box>

      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}

      <Button
        fullWidth
        variant="contained"
        onClick={submit}
        disabled={!name || loading}
        sx={{ py: 1.25, fontWeight: 700, textTransform: "none" }}
      >
        {loading ? t("checkout.adding") : t("checkout.addPaymentMethod")}
      </Button>
    </Box>
  );
};

export default PaymentMethod;
