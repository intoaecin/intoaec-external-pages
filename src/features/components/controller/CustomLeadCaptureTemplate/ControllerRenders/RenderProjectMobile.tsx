import { UIButtonLoader } from "@/features/components/HelperComponents/UIButtonLoader";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { setCreateLeadFormData } from "@/features/leadCapture/setCreateFormData";
import {
  formatDateBasedOnOrganizationLocalization,
  formatDuration,
} from "@/lib/helpers";
import { LeadCaptureStore } from "@/lib/leadCapture/leadCaptureStore";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  TextField,
  useMediaQuery,
} from "@mui/material";
import moment, { Duration } from "moment";
import {
  MuiTelInput,
  MuiTelInputCountry,
  MuiTelInputInfo,
} from "mui-tel-input";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import DoneIcon from "@mui/icons-material/Done";
import { useTranslation } from "react-i18next";
import { LoadingButton } from "@mui/lab";
import { useIpCountryCode } from "@/features/hooks/useIpCountryCode";

const TickIconStyle = {
  width: "25px",
  height: "25px",
  fill: "#ffffff",
  marginBottom: "5px",
  background: "#42D28A",
  borderRadius: "20px",
  padding: "3px",
};

const RenderProjectMobile = ({ disabled = false }: { disabled?: boolean }) => {
  const mobileValue = LeadCaptureStore.useState(
    (s) => s.leadCaptureData?.leadMobile
  );
  const isMobileVerified = LeadCaptureStore.useState(
    (s) => s.leadCaptureData?.isMobileVerified
  );
  const [mobileError, setMobileError] = useState(false);
  const [validateLoading, setValidateLoading] = useState(false);

  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const [isMobileNumberOtploading, setMobileNumberOtpLoader] = useState(false);
  const [mobileNumberOTP, setMobileNumberOtp] = useState<string>();
  const [reVerifyMobileNumber, setReverifyMobileNumber] =
    useState<boolean>(false);
  const verifyMobileNumberTimer = useRef<any>();
  const [mobileNumbertimer, setMobileNumberTimer] = useState<Duration | null>(
    null
  );
  const { leadCaptureData } = LeadCaptureStore.useState();
  const [isExistingMobile, setIsExistingMobile] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<
    MuiTelInputCountry | undefined
  >();
  const { countryCode, hasResolved } = useIpCountryCode();
  const { NEXT_PUBLIC_USERHUB_ENDPOINT, NEXT_PUBLIC_LEADMANAGER_ENDPOINT } =
    useEnv();
  const { post: existingMobile } = useAxios(
    NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/lead-capture"
  );
  const { post: otpVerification, loading: isGenerateOtpLoading } = useAxios(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/signup"
  );
  const { logoUrl, organizationId, organizationType } = useOrganization();

  const existingMobileNumber = async (value: string) => {
    setValidateLoading(true);
    try {
      const requestData = {
        eventType: "GET_EMAIL_OR_MOBILE_EXISTENCE",
        organizationId: organizationId,
        organizationType: organizationType,
        emailOrMobile: value,
      };

      const data = await existingMobile(requestData);
      if (data.code === "LEAD_RETRIEVED") {
        setIsExistingMobile(true);
      } else {
        setIsExistingMobile(false);
      }
      setValidateLoading(false);
    } catch (error: any) {
      console.log(error);
    }
  };
  const { localizationValue } = useOrganizationLocalization();

  const generateOtp = async ({
    data,
    setTimer,
    timer,
    reverify,
    setReverify,
  }: {
    data: { mobileNumber?: string };
    timer: any;
    setTimer: React.Dispatch<any>;
    // setVerified: React.Dispatch<any>;
    reverify: boolean;
    setReverify: React.Dispatch<React.SetStateAction<boolean>>;
  }) => {
    const res = await otpVerification({
      eventType: "GENERATE_OTP_LEAD_CAPTURE",
      otpEvent: "LEAD CAPTURE",
      organizationId: organizationId,
      organizationType: organizationType,
      ...data,
    });
    if (res?.error) {
      if (res?.body?.retrywaitTime) {
        toast.error(
          ("Maximum retries reached. Try again after " + localizationValue &&
            formatDateBasedOnOrganizationLocalization(
              localizationValue,
              res?.body?.retrywaitTime
            )) ||
            moment(new Date(res.body.retrywaitTime)).format("hh:mm a"),
          { autoClose: 1000 * 10 }
        );
        return;
      }
      toast.error(res.error);
      return;
    }
    if (res?.code === "GENERATE_OTP_SUCCESSFUL") {
      if (res.body.expirationTime) {
        const targetTime = new Date(res.body.expirationTime);
        setTimer(moment.duration(moment(targetTime).diff(moment())));
        if (reverify == false) {
          setReverify(true);
        }
        timer.current = setInterval(() => {
          const now = moment();
          const duration = moment.duration(moment(targetTime).diff(now));

          if (duration.asMilliseconds() <= 0) {
            clearInterval(timer.current);
            setTimer(null);
          } else {
            setTimer(duration);
          }
        }, 1000);
      }
      if (res.body.verified) {
        setCreateLeadFormData({ isMobileVerified: res.body.verified });
      }
    } else if (res.code === "GENERATE_OTP_FAILED" && res?.body?.retrywaitTime) {
      toast.error(
        "Maximum retries reached. Try again after " +
          moment(new Date(res.body.retrywaitTime)).format("hh:mm a"),
        { autoClose: 1000 * 10 }
      );
    }
  };

  const verifyOtp = async ({
    data,
    setTimer,
    timer,
  }: {
    data: { mobileNumber?: string; otpValue: string };
    timer: any;
    setTimer: React.Dispatch<React.SetStateAction<Duration | null>>;
  }) => {
    const res = await otpVerification({
      eventType: "VERIFY_OTP_LEAD_CAPTURE",
      otpEvent: "LEAD CAPTURE",
      organizationId: organizationId,
      organizationType: organizationType,
      ...data,
    });
    if (res.error) {
      toast.error(res.error);
    } else if (res.code === "OTP_VERIFICATION_SUCCESSFUL") {
      clearInterval(timer.current);
      setTimer(null);
      setCreateLeadFormData({ isMobileVerified: true });
    }
  };
  useEffect(() => {
    if (
      leadCaptureData?.isWhatsappActive == undefined ||
      leadCaptureData?.isWhatsappActive == null
    ) {
      setCreateLeadFormData({ isWhatsappActive: true });
    }
  }, []);

  useEffect(() => {
    if (leadCaptureData?.leadMobile || !hasResolved) {
      return;
    }

    setSelectedCountry((countryCode || "IN") as MuiTelInputCountry);
  }, [countryCode, hasResolved, leadCaptureData?.leadMobile]);

  const { t } = useTranslation();
  return (
    <div>
      <Grid
        item
        xs={6}
        style={{
          marginBottom: "25px",
          maxWidth: isSmallScreen ? "" : "80%",
          marginRight: isSmallScreen ? "" : "3rem",
        }}
      >
        {selectedCountry ? (
          <MuiTelInput
          forceCallingCode
          variant="outlined"
          style={{
            minWidth: "30vw",
          }}
          placeholder={t("leadCapture.enterYourPhoneNumber")}
          name="mobileNumber"
          fullWidth
          defaultCountry={selectedCountry}
          error={mobileError || isExistingMobile ? true : false}
          value={leadCaptureData?.leadMobile}
          onInvalid={(e) => {
            e.preventDefault();
            setMobileError(true);
            // setCreateLeadFormData({})
            // setMobileNumber({ ...mobileNumber, error: true });
          }}
          inputProps={{
            maxLength: 20, // Set the maximum length here
          }}
          onChange={(mobileNumber: string, info: MuiTelInputInfo) => {
            setSelectedCountry(info?.countryCode ?? selectedCountry);
            const value = mobileNumber.replaceAll(" ", "");
            const pattern =
              /^(\+[0-9]{1,3}[-\s]?)?(\([0-9]{1,3}\)[-.\s]?)?([0-9]{1,4}[-.\s]?)?([0-9]{6,})$/;
            const error = !pattern.test(value);
            setMobileError(error);
            setCreateLeadFormData({
              leadMobile: value,
              isMobileVerified: false,
            });
            if (!error) {
              existingMobileNumber(value);
            } else {
              setIsExistingMobile(false);
            }
            // setMobileNumber({ error, value: value });
            // setIsExistingMobile(false);
          }}
          helperText={
            mobileError ? (
              <p className="error-text my-0">
                {t("errors.pleaseVerifyTheMobileNumber", {
                  defaultValue: "Please verify the Mobile number",
                })}
              </p>
            ) : (
              ""
            )
          }
          MenuProps={{ disableScrollLock: true }}
          InputProps={{
            required: true,
            endAdornment: isMobileNumberOtploading ? (
              <UIButtonLoader />
            ) : !leadCaptureData?.isMobileVerified ? (
              <LoadingButton
                loading={validateLoading}
                variant="contained"
                sx={{
                  width: "90px",
                  height: "40px",
                  fontSize: "11px",
                  borderRadius: "10px",
                  padding: "10px 3px",
                  bgcolor: !reVerifyMobileNumber
                    ? "primary.dark"
                    : "error.main",
                  // "&:hover": {
                  //   background: !reVerifyMobileNumber
                  //     ? "#3398E6"
                  //     : "#F65A4A",
                  // },
                  textTransform: "none",
                }}
                onClick={async () => {
                  if (!mobileError) {
                    setMobileNumberOtpLoader(true);
                    await generateOtp({
                      data: { mobileNumber: leadCaptureData?.leadMobile },
                      reverify: reVerifyMobileNumber,
                      setReverify: setReverifyMobileNumber,
                      setTimer: setMobileNumberTimer,
                      timer: verifyMobileNumberTimer,
                    }).finally(() => {
                      setMobileNumberOtpLoader(false);
                    });
                  }
                }}
                // Disable the LoadingButton if isDisabled is true or the timer is active
                disabled={
                  disabled ||
                  mobileError ||
                  !leadCaptureData?.leadMobile ||
                  leadCaptureData?.leadMobile?.length == 0 ||
                  mobileNumbertimer !== null ||
                  isExistingMobile
                }
              >
                {reVerifyMobileNumber
                  ? t("common.reSend", {
                      defaultValue: "Re-send",
                    })
                  : t("common.verify", {
                      defaultValue: "Verify",
                    })}
              </LoadingButton>
            ) : (
              <DoneIcon color="success" style={TickIconStyle} />
            ),
          }}
          disabled={
            disabled ||
            mobileNumbertimer !== null ||
            leadCaptureData?.isMobileVerified
          }
          />
        ) : (
          <TextField
            variant="outlined"
            style={{
              minWidth: "30vw",
            }}
            placeholder={t("leadCapture.enterYourPhoneNumber")}
            name="mobileNumber"
            fullWidth
            disabled
            InputProps={{
              endAdornment: (
                <LoadingButton variant="contained" disabled>
                  {t("common.verify", {
                    defaultValue: "Verify",
                  })}
                </LoadingButton>
              ),
            }}
          />
        )}
        {isExistingMobile && (
          <FormHelperText sx={{ color: "error.main" }}>
            {t("toast.mobileNumberAlreadyExists", {
              defaultValue: "Mobile Number already exists",
            })}
          </FormHelperText>
        )}
        {leadCaptureData?.leadMobile === "" && (
          <FormHelperText sx={{ color: "error.main" }}>
            Please Enter the mobileNumber
          </FormHelperText>
        )}
        {mobileNumbertimer !== null && (
          <p className="text-left my-0 error-text">{`${t(
            "twoFactorAuth.pleaseEnterVerificationCodeSentToYourPhone"
          )} ${formatDuration(mobileNumbertimer)}`}</p>
        )}
        <Box className="ml-2">
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked
                  disabled={disabled}
                  sx={{
                    transform: "scale(0.8)",
                    padding: "4px",
                  }}
                />
              }
              label={t("common.whatsappActive")}
              sx={{
                alignItems: "center",
                marginTop: "1px",
              }}
              componentsProps={{
                typography: {
                  style: {
                    fontSize: "13px",
                    color: "rgba(0, 0, 0, 0.6)",
                    fontStyle: "normal",
                    fontWeight: 600,
                  },
                },
              }}
              checked={leadCaptureData?.isWhatsappActive}
              onChange={() => {
                setCreateLeadFormData({
                  isWhatsappActive: !leadCaptureData?.isWhatsappActive,
                });
              }}
            />
          </FormGroup>
        </Box>
      </Grid>
      {mobileNumbertimer !== null && (
        <Grid
          item
          xs={6}
          style={{
            marginBottom: "25px",
            maxWidth: isSmallScreen ? "" : "80%",
            marginRight: isSmallScreen ? "" : "3rem",
          }}
        >
          <TextField
            variant="outlined"
            style={{
              minWidth: "30vw",
            }}
            placeholder="Enter your OTP  "
            name="mobileNumberOTP"
            value={mobileNumberOTP}
            InputLabelProps={{ shrink: true }}
            disabled={disabled}
            onChange={(e) => {
              const value = e.target.value;
              if (value.match(/^\d{0,6}$/)) {
                setMobileNumberOtp(value);
              }
            }}
            fullWidth
            InputProps={{
              endAdornment: (
                <LoadingButton
                  variant="contained"
                  color="primary"
                  loading={isGenerateOtpLoading}
                  disabled={
                    disabled ||
                    mobileNumberOTP?.length !== 6 ||
                    isGenerateOtpLoading
                  }
                  sx={{
                    width: "90px",
                    height: "40px",
                    fontSize: "11px",
                    borderRadius: "10px",
                    padding: "10px 3px",
                    bgcolor: "primary.dark",
                  }}
                  onClick={async () => {
                    if (mobileNumbertimer !== null && mobileNumberOTP) {
                      await verifyOtp({
                        data: {
                          otpValue: mobileNumberOTP,
                          mobileNumber: leadCaptureData?.leadMobile,
                        },
                        setTimer: setMobileNumberTimer,
                        // setVerified: setMobileNumberVerified,
                        timer: verifyMobileNumberTimer,
                      });
                    }
                  }}
                >
                  {t("common.submit", {
                    defaultValue: "Submit",
                  })}
                </LoadingButton>
              ),
            }}
          />
        </Grid>
      )}
    </div>
  );
};

export default RenderProjectMobile;
