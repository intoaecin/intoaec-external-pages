import { FormControl, Typography } from "@mui/material";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
} from "@stripe/react-stripe-js";
import { useTranslation } from "react-i18next";
import React from "react";
import StripeInput from "./StripeInput";

type StripeElement =
  | typeof CardCvcElement
  | typeof CardExpiryElement
  | typeof CardNumberElement;

interface StripeTextFieldProps<T extends StripeElement> extends Omit<
  TextFieldProps,
  "onChange" | "inputComponent" | "inputProps"
> {
  inputProps?: React.ComponentProps<T>;
  labelErrorMessage?: string | null;
  onChange?: React.ComponentProps<T>["onChange"];
  stripeElement?: T;
}

export const StripeTextField = <T extends StripeElement>(
  props: StripeTextFieldProps<T>,
) => {
  const {
    helperText,
    InputLabelProps,
    InputProps = {},
    inputProps,
    error,
    labelErrorMessage,
    stripeElement,
    label,
    placeholder,
    ...other
  } = props;

  return (
    <FormControl fullWidth>
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
      <TextField
        fullWidth
        InputLabelProps={{
          ...InputLabelProps,
        }}
        error={error}
        placeholder={placeholder}
        InputProps={{
          ...InputProps,
          inputProps: {
            ...inputProps,
            ...InputProps.inputProps,
            component: stripeElement,
          },
          inputComponent: StripeInput,
          sx: {
            height: 40,
            "& .MuiInputBase-input": {
              padding: "0 14px",
            },
          },
        }}
        helperText={error ? labelErrorMessage : helperText}
        {...(other as any)}
      />
    </FormControl>
  );
};

export function StripeTextFieldNumber(
  props: StripeTextFieldProps<typeof CardNumberElement>,
) {
  const { t } = useTranslation();
  return (
    <StripeTextField
      label={t("checkout.cardNumber")}
      stripeElement={CardNumberElement}
      {...props}
    />
  );
}

export function StripeTextFieldExpiry(
  props: StripeTextFieldProps<typeof CardExpiryElement>,
) {
  const { t } = useTranslation();
  return (
    <StripeTextField
      label={t("checkout.expirationDate")}
      stripeElement={CardExpiryElement}
      {...props}
    />
  );
}

export function StripeTextFieldCVC(
  props: StripeTextFieldProps<typeof CardCvcElement>,
) {
  const { t } = useTranslation();
  return (
    <StripeTextField
      label={t("checkout.cvc")}
      stripeElement={CardCvcElement}
      placeholder="CVV"
      {...props}
    />
  );
}
