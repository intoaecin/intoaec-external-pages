import { UIButtonLoader } from "@/features/components/HelperComponents/UIButtonLoader";
import { emailPattern, mobileNumberPattern } from "@/lib/regex";
import DoneIcon from "@mui/icons-material/Done";
import {
  Box,
  Button,
  FormHelperText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLeadCaptureV2OtpVerification } from "../../hooks/useLeadCaptureV2OtpVerification";
import type { LeadCaptureV2FormField } from "../leadCaptureV2LayoutConfig";
import LeadCaptureV2CustomerPreviewPhoneInput from "./LeadCaptureV2CustomerPreviewPhoneInput";

const CONTROL_HEIGHT = 40;

const inputControlSx = {
  "& .MuiInputBase-root": {
    height: CONTROL_HEIGHT,
    boxSizing: "border-box",
  },
  "& .MuiInputBase-input": {
    py: 0,
  },
} as const;

const actionButtonSx = {
  height: CONTROL_HEIGHT,
  minHeight: CONTROL_HEIGHT,
  maxHeight: CONTROL_HEIGHT,
  px: 1.5,
  textTransform: "none",
  whiteSpace: "nowrap",
} as const;

type LeadCaptureV2OtpVerifiedFieldInputProps = {
  field: LeadCaptureV2FormField;
  value: string;
  organizationId?: string;
  organizationType?: string;
  isVerified: boolean;
  onValueChange: (nextValue: string) => void;
  onVerifiedChange: (verified: boolean) => void;
};

const LeadCaptureV2OtpVerifiedFieldInput = ({
  field,
  value,
  organizationId,
  organizationType,
  isVerified,
  onValueChange,
  onVerifiedChange,
}: LeadCaptureV2OtpVerifiedFieldInputProps) => {
  const { t } = useTranslation();
  const [inputError, setInputError] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const {
    generateOtp,
    verifyOtp,
    resetOtpState,
    otpSent,
    otpTimerLabel,
    isGenerateOtpLoading,
    isVerifyOtpLoading,
  } = useLeadCaptureV2OtpVerification({ organizationId, organizationType });

  const isEmailField = field.typeKey === "email";
  const trimmedValue = value.trim();

  const validateValue = (nextValue: string) => {
    if (isEmailField) {
      return emailPattern.test(nextValue.trim());
    }

    return mobileNumberPattern.test(nextValue.replaceAll(" ", ""));
  };

  const handleValueChange = (nextValue: string) => {
    const normalizedValue = isEmailField
      ? nextValue.trim()
      : nextValue.replaceAll(" ", "");
    const hasError =
      normalizedValue.length > 0 && !validateValue(normalizedValue);

    setInputError(hasError);
    onValueChange(normalizedValue);
    onVerifiedChange(false);
    resetOtpState();
    setOtpValue("");
  };

  const handleGenerateOtp = async () => {
    if (!validateValue(trimmedValue)) {
      setInputError(true);
      return;
    }

    const payload = isEmailField
      ? { emailId: trimmedValue }
      : { mobileNumber: trimmedValue };

    const succeeded = await generateOtp(payload);
    if (succeeded) {
      setOtpValue("");
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otpValue.trim())) {
      return;
    }

    const payload = isEmailField
      ? { emailId: trimmedValue, otpValue: otpValue.trim() }
      : { mobileNumber: trimmedValue, otpValue: otpValue.trim() };

    const succeeded = await verifyOtp(payload);
    if (succeeded) {
      onVerifiedChange(true);
      setOtpValue("");
    }
  };

  const sendOtpLabel = (() => {
    if (otpSent) {
      if (otpTimerLabel) {
        return t("leadCaptureV2.customerPreview.resendOtpWithTimer", {
          defaultValue: `Resend OTP in ${otpTimerLabel}`,
          time: otpTimerLabel,
        });
      }
      return t("leadCaptureV2.customerPreview.resendOtp", {
        defaultValue: "Resend OTP",
      });
    }

    if (otpTimerLabel) {
      return t("leadCaptureV2.customerPreview.sendOtpWithTimer", {
        defaultValue: `Send OTP in ${otpTimerLabel}`,
        time: otpTimerLabel,
      });
    }
    return t("leadCaptureV2.customerPreview.sendOtp", {
      defaultValue: "Send OTP",
    });
  })();

  const fieldHelperText = (() => {
    if (inputError) {
      return isEmailField
        ? t("leadCaptureV2.customerPreview.invalidEmail", {
            defaultValue: "Enter a valid email address.",
          })
        : t("leadCaptureV2.customerPreview.invalidPhone", {
            defaultValue: "Enter a valid phone number.",
          });
    }

    if (field.verificationRequired && !isVerified && !otpSent) {
      return t("leadCaptureV2.customerPreview.verificationPending", {
        defaultValue: "Verify this field with the code we send you.",
      });
    }

    return undefined;
  })();

  const canSendOtp =
    !isGenerateOtpLoading &&
    !inputError &&
    Boolean(trimmedValue) &&
    !isVerified &&
    !otpTimerLabel;
  const canVerifyOtp = /^\d{6}$/.test(otpValue.trim());

  const actionColumnWidth = { xs: "100%", sm: 128 };

  const renderContactInput = () => {
    if (isEmailField) {
      return (
        <TextField
          fullWidth
          size="small"
          type="email"
          value={value}
          error={inputError}
          disabled={isVerified}
          onChange={(event) => handleValueChange(event.target.value)}
          sx={inputControlSx}
        />
      );
    }

    return (
      <LeadCaptureV2CustomerPreviewPhoneInput
        value={value}
        error={inputError}
        disabled={isVerified}
        onChange={handleValueChange}
      />
    );
  };

  return (
    <Stack spacing={0.75}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>{renderContactInput()}</Box>

        <Box sx={{ width: actionColumnWidth, flexShrink: 0 }}>
          {isVerified ? (
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              justifyContent="center"
              sx={{
                height: CONTROL_HEIGHT,
                px: 1,
                borderRadius: 1,
                border: 1,
                borderColor: "success.light",
                bgcolor: (theme) => `${theme.palette.success.main}14`,
              }}
            >
              <DoneIcon color="success" sx={{ fontSize: 18 }} />
              <Typography variant="body2" color="success.main" fontWeight={500}>
                {t("leadCaptureV2.customerPreview.verified", {
                  defaultValue: "Verified",
                })}
              </Typography>
            </Stack>
          ) : (
            <Button
              variant="contained"
              fullWidth
              disabled={!canSendOtp}
              onClick={handleGenerateOtp}
              sx={actionButtonSx}
            >
              {isGenerateOtpLoading ? <UIButtonLoader /> : sendOtpLabel}
            </Button>
          )}
        </Box>
      </Stack>

      {fieldHelperText ? (
        <FormHelperText error={inputError} sx={{ mx: 0, mt: 0 }}>
          {fieldHelperText}
        </FormHelperText>
      ) : null}

      {otpSent && !isVerified ? (
        <Stack spacing={0.75} sx={{ pt: 0.25 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <TextField
              fullWidth
              size="small"
              value={otpValue}
              onChange={(event) =>
                setOtpValue(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              sx={{ flex: 1, ...inputControlSx }}
            />
            <Button
              variant="contained"
              fullWidth
              disabled={!canVerifyOtp || isVerifyOtpLoading}
              onClick={handleVerifyOtp}
              sx={{
                ...actionButtonSx,
                width: actionColumnWidth,
              }}
            >
              {isVerifyOtpLoading ? (
                <UIButtonLoader />
              ) : (
                t("leadCaptureV2.customerPreview.verifyOtp", {
                  defaultValue: "Verify",
                })
              )}
            </Button>
          </Stack>
          {otpTimerLabel ? (
            <FormHelperText sx={{ mx: 0, mt: 0 }}>
              {t("leadCaptureV2.customerPreview.otpExpiresIn", {
                defaultValue: "Code expires in {{time}}",
                time: otpTimerLabel,
              })}
            </FormHelperText>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  );
};

export default LeadCaptureV2OtpVerifiedFieldInput;
