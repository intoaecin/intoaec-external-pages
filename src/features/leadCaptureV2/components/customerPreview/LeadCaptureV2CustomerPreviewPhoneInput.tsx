import { useIpCountryCode } from "@/features/hooks/useIpCountryCode";
import { CircularProgress, Stack } from "@mui/material";
import {
  MuiTelInput,
  type MuiTelInputCountry,
  type MuiTelInputInfo,
} from "mui-tel-input";
import { useEffect, useMemo, useState } from "react";

type LeadCaptureV2CustomerPreviewPhoneInputProps = {
  disabled?: boolean;
  error?: boolean;
  onChange: (value: string) => void;
  value: string;
};

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

const LeadCaptureV2CustomerPreviewPhoneInput = ({
  disabled = false,
  error = false,
  onChange,
  value,
}: LeadCaptureV2CustomerPreviewPhoneInputProps) => {
  const {
    countryCode,
    hasResolved,
    loading: isResolvingCountry,
  } = useIpCountryCode();
  const [selectedCountry, setSelectedCountry] = useState<MuiTelInputCountry>();

  useEffect(() => {
    if (!hasResolved) {
      return;
    }

    setSelectedCountry((currentCountry) => {
      if (currentCountry) {
        return currentCountry;
      }

      return (countryCode || "IN") as MuiTelInputCountry;
    });
  }, [countryCode, hasResolved]);

  const phoneDefaultCountry = useMemo(
    () =>
      selectedCountry ??
      (((hasResolved ? countryCode : undefined) || "IN") as MuiTelInputCountry),
    [countryCode, hasResolved, selectedCountry],
  );

  if (isResolvingCountry && !hasResolved) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{
          height: CONTROL_HEIGHT,
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "background.paper",
        }}
      >
        <CircularProgress size={20} />
      </Stack>
    );
  }

  return (
    <MuiTelInput
      key={phoneDefaultCountry}
      forceCallingCode
      fullWidth
      size="small"
      value={value}
      defaultCountry={phoneDefaultCountry}
      error={error}
      disabled={disabled}
      MenuProps={{ disableScrollLock: true }}
      onChange={(nextValue: string, info: MuiTelInputInfo) => {
        if (info?.countryCode) {
          setSelectedCountry(info.countryCode);
        }
        onChange(nextValue);
      }}
      sx={inputControlSx}
    />
  );
};

export default LeadCaptureV2CustomerPreviewPhoneInput;
