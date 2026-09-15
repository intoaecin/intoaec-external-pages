import React, { useState } from "react";
import {
  StripeTextFieldCVC,
  StripeTextFieldExpiry,
  StripeTextFieldNumber,
} from "@/features/checkoutPage/StripeFields";
import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
} from "@mui/material";
import {
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { useEnv } from "@/features/hooks/useEnv";
import { encryptAES } from "@/lib/helpers";

export const AddPaymentCardWrapper = ({
  stripePromise,
  isClient,
  clientInformation,
  loading,
}: {
  stripePromise: Promise<any>;
  isClient: boolean;
  clientInformation: any;
  loading: boolean;
}) => {
  return (
    <>
      {loading || !clientInformation ? (
        <p>Loading...</p>
      ) : (
        <Elements
          stripe={stripePromise}
          options={{ amount: 1099, currency: "usd", mode: "subscription" }}
        >
          <AddPaymentCard
            isClient={isClient}
            clientInformation={clientInformation}
            stripePromise={stripePromise}
          />
        </Elements>
      )}
    </>
  );
};

export const AddPaymentCard = ({
  clientInformation,
  stripePromise,
  isClient,
}: {
  stripePromise: Promise<any>;
  clientInformation: any;
  isClient: boolean;
}) => {
  const { NEXT_PUBLIC_PAYMASTER_ENDPOINT, NEXT_PUBLIC_ACCESS_KEY } = useEnv();
  const [isHovered, setIsHovered] = useState(false);
  const [isDefault, setIsDefault] = useState(true);
  const stripe = useStripe();
  const elements = useElements();

  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const [loading, setLoading] = useState<boolean>(false);
  const [state, setState] = React.useState({
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

  const { cardNumberError, expiredError, cvcError } = state;

  const handleAddCard = async () => {
    if (elements == null) {
      return;
    }
    const { error: submitError } = await elements.submit();
    if (submitError) {
      return;
    }

    if (!stripe || !elements) {
      return;
    }
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardNumberElement)!,
    });

    try {
      if (isClient) {
        const encryptedPaymentMethodId = await encryptAES(
          paymentMethod?.id,
          NEXT_PUBLIC_ACCESS_KEY
        );
        const { data: res } = await axios.post(
          NEXT_PUBLIC_PAYMASTER_ENDPOINT + "/invoice-payments",
          {
            beneficiaryId: clientInformation?.organizationId,
            beneficiaryType: "AEC",
            payerId: clientInformation?.clientInformation?.projectId,
            payerType: "CLIENT",
            payerCustomerDetails: {
              name: clientInformation?.clientInformation?.fullName,
              email: clientInformation?.clientInformation?.emailId,
            },
            payerPaymentMethod: "CARD",
            payerPaymentMethodId: encryptedPaymentMethodId,
            payerPaymentMethodDetails: {
              isPrimary: true,
            },
            customerName: clientInformation?.clientInformation?.fullName,
            customerEmail: clientInformation?.clientInformation?.emailId,
            beneficiaryPaymentGateway: "STRIPE",
            eventType: "ADD_PAYER_PAYMENT_METHOD",
            organizationId: clientInformation?.organizationId,
            createdBy: clientInformation?.clientInformation?.fullName,
          }
        );
        setLoading(false);
        if (res?.code === "PAYER_PAYMENT_METHOD_ADDED") {
          window.parent.postMessage("card-added", "*");
        }
      } else {
        const { data: res } = await axios.post(
          NEXT_PUBLIC_PAYMASTER_ENDPOINT + "/payment-gateway",
          {
            ...paymentMethod,
            customerName: clientInformation?.fullName,
            customerEmail: clientInformation?.emailId,
            paymentGateway: "STRIPE",
            eventType: "ADD_PAYMENT_METHOD_DETAILS",
            isPrimary: isDefault,
            organizationId: clientInformation?.organizationId,
          }
        );
        setLoading(false);
        if (res?.code === "PAYMENT_METHOD_DETAILS_ADDED") {
          window.parent.postMessage("card-added", "*");
        }
      }
    } catch (error) {
      setLoading(false);
      window.parent.postMessage("card-not-added", "*");
    }
  };

  return (
    <Box sx={{ margin: "25px" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
        <Typography
          variant="h6"
          style={{
            width: "100%",
            display: "inline-block",
            padding: "4px 8px",
            borderBottom: "2px solid rgba(0, 0, 0, 0)",
            transition: "border-bottom-width 0.2s",
            textAlign: "center",
            position: "relative",
            fontWeight: 500,
          }}
          gutterBottom
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Add Card
          <span
            style={{
              content: '""',
              position: "absolute",
              bottom: 0,
              left: "50%",
              width: isHovered ? "40%" : "10%",
              height: "2px",
              backgroundColor: "#3ca2ff",
              transition: "width 0.2s",
              transform: "translateX(-50%)",
            }}
          ></span>
        </Typography>
        <Button
          sx={{
            position: "absolute",
            top: 0,
            right: -10,
            minWidth: "auto",
          }}
          onClick={() => window.parent.postMessage("action-completed", "*")}
        >
          <CloseIcon style={{ width: "20px", height: "20px", fill: "#ccc" }} />
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <StripeTextFieldNumber
            variant="standard"
            error={Boolean(cardNumberError)}
            labelErrorMessage={cardNumberError}
            onChange={onElementChange("cardNumberComplete", "cardNumberError")}
          />
        </Grid>
        <Grid item xs={6}>
          <StripeTextFieldExpiry
            variant="standard"
            error={Boolean(expiredError)}
            labelErrorMessage={expiredError}
            onChange={onElementChange("expiredComplete", "expiredError")}
          />
        </Grid>
        <Grid item xs={6}>
          <StripeTextFieldCVC
            variant="standard"
            error={Boolean(cvcError)}
            labelErrorMessage={cvcError}
            onChange={onElementChange("cvcComplete", "cvcError")}
          />
        </Grid>
      </Grid>
      <FormControlLabel
        control={<Checkbox />}
        checked={isDefault}
        label="Make default"
        onChange={(e, c) => {
          setIsDefault(c);
        }}
        sx={{ mt: 2 }}
      />
      <Box
        sx={{
          display: "flex",
          marginTop: "20px",
          justifyContent: "center",
        }}
      >
        <LoadingButton
          loading={loading}
          variant="contained"
          sx={{
            bgcolor: "#3CA2FF",
            height: "36px",
          }}
          onClick={() => {
            setLoading(true);
            handleAddCard();
          }}
        >
          Add card
        </LoadingButton>
      </Box>
    </Box>
  );
};
