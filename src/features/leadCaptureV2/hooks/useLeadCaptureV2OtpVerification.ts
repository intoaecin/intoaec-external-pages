import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import {
  formatDateBasedOnOrganizationLocalization,
  formatDuration,
} from "@/lib/helpers";
import moment, { type Duration } from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

type GenerateOtpPayload = {
  emailId?: string;
  mobileNumber?: string;
};

type VerifyOtpPayload = GenerateOtpPayload & {
  otpValue: string;
};

type UseLeadCaptureV2OtpVerificationArgs = {
  organizationId?: string;
  organizationType?: string;
};

export const useLeadCaptureV2OtpVerification = ({
  organizationId,
  organizationType,
}: UseLeadCaptureV2OtpVerificationArgs) => {
  const { VITE_USERHUB_ENDPOINT } = useEnv();
  const { post: otpRequest } = useAxios(
    `${VITE_USERHUB_ENDPOINT}/signup`,
  );
  const { localizationValue } = useOrganizationLocalization();
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState<Duration | null>(null);
  const [isGenerateOtpLoading, setIsGenerateOtpLoading] = useState(false);
  const [isVerifyOtpLoading, setIsVerifyOtpLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearOtpTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setOtpTimer(null);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    },
    [],
  );

  const formatRetryWaitMessage = useCallback(
    (retrywaitTime: string | number) => {
      const localized =
        localizationValue &&
        formatDateBasedOnOrganizationLocalization(
          localizationValue,
          retrywaitTime,
        );

      return localized
        ? `Maximum retries reached. Try again after ${localized}`
        : `Maximum retries reached. Try again after ${moment(
            new Date(retrywaitTime),
          ).format("hh:mm a")}`;
    },
    [localizationValue],
  );

  const startOtpTimer = useCallback(
    (expirationTime: string | number) => {
      clearOtpTimer();
      const targetTime = new Date(expirationTime);

      const updateTimer = () => {
        const duration = moment.duration(moment(targetTime).diff(moment()));

        if (duration.asMilliseconds() <= 0) {
          clearOtpTimer();
          return;
        }

        setOtpTimer(duration);
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
    },
    [clearOtpTimer],
  );

  const generateOtp = useCallback(
    async (payload: GenerateOtpPayload) => {
      if (!organizationId || !organizationType) {
        return false;
      }

      setIsGenerateOtpLoading(true);

      try {
        const res = await otpRequest({
          eventType: "GENERATE_OTP_LEAD_CAPTURE",
          otpEvent: "LEAD CAPTURE",
          organizationId,
          organizationType,
          ...payload,
        });

        if (res?.error) {
          if (res?.body?.retrywaitTime) {
            toast.error(formatRetryWaitMessage(res.body.retrywaitTime), {
              autoClose: 10_000,
            });
            return false;
          }

          toast.error(res.error);
          return false;
        }

        if (res?.code === "GENERATE_OTP_SUCCESSFUL") {
          if (res.body?.expirationTime) {
            startOtpTimer(res.body.expirationTime);
          }
          setOtpSent(true);
          if (res.body?.verified) {
            return true;
          }
          return true;
        }

        if (res?.code === "GENERATE_OTP_FAILED" && res?.body?.retrywaitTime) {
          toast.error(formatRetryWaitMessage(res.body.retrywaitTime), {
            autoClose: 10_000,
          });
        }

        return false;
      } finally {
        setIsGenerateOtpLoading(false);
      }
    },
    [
      formatRetryWaitMessage,
      organizationId,
      organizationType,
      otpRequest,
      startOtpTimer,
    ],
  );

  const verifyOtp = useCallback(
    async (payload: VerifyOtpPayload) => {
      if (!organizationId || !organizationType) {
        return false;
      }

      setIsVerifyOtpLoading(true);

      try {
        const res = await otpRequest({
          eventType: "VERIFY_OTP_LEAD_CAPTURE",
          otpEvent: "LEAD CAPTURE",
          organizationId,
          organizationType,
          ...payload,
        });

        if (res?.error) {
          toast.error(res.error);
          return false;
        }

        if (res?.code === "OTP_VERIFICATION_SUCCESSFUL") {
          clearOtpTimer();
          setOtpSent(false);
          return true;
        }

        return false;
      } finally {
        setIsVerifyOtpLoading(false);
      }
    },
    [clearOtpTimer, organizationId, organizationType, otpRequest],
  );

  const resetOtpState = useCallback(() => {
    clearOtpTimer();
    setOtpSent(false);
  }, [clearOtpTimer]);

  const otpTimerLabel =
    otpTimer && otpTimer.asMilliseconds() > 0 ? formatDuration(otpTimer) : null;

  return {
    generateOtp,
    verifyOtp,
    resetOtpState,
    otpSent,
    otpTimerLabel,
    isGenerateOtpLoading,
    isVerifyOtpLoading,
  };
};
