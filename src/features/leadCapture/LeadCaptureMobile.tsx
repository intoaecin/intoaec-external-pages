import { UIButtonLoader } from "@/features/components/HelperComponents/UIButtonLoader";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import ArrowRightIcons from "@/assets/icons/arrow-right";
import DoneIcon from "@mui/icons-material/Done";
import {
  Button,
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
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import { toast } from "react-toastify";
import { setCreateLeadFormData } from "./setCreateFormData";
import {
  formatDateBasedOnOrganizationLocalization,
  formatDuration,
} from "@/lib/helpers";
import { LeadCaptureStore } from "@/lib/leadCapture/leadCaptureStore";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import CustomCircularProgressbar from "./LeadCaptureCircularProgressbar";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { useTranslation } from "react-i18next";
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

const LeadCaptureMobile = ({
  organizationId,
  organizationType,
}: {
  organizationId: string;
  organizationType: string;
}) => {
  const { push } = useRouter();
  const router = useRouter();
  const { logoUrl } = useOrganization();
  const currentQuestionNumber = router.query.question;
  const mobileValue = LeadCaptureStore.useState(
    (s) => s.leadCaptureData?.leadMobile
  );
  const isMobileVerified = LeadCaptureStore.useState(
    (s) => s.leadCaptureData?.isMobileVerified
  );
  const [mobileError, setMobileError] = useState(false);
  // const [mobileNumber, setMobileNumber] = useState<any>({
  //   error: "",
  //   value: mobileValue,
  // });
  const isSmallScreen = useMediaQuery("(max-width: 1000px)");
  const [isMobileNumberOtploading, setMobileNumberOtpLoader] = useState(false);
  const [mobileNumberOTP, setMobileNumberOtp] = useState<string>();
  const [reVerifyMobileNumber, setReverifyMobileNumber] =
    useState<boolean>(false);
  const verifyMobileNumberTimer = useRef<any>();
  // const [mobileNumberVerified, setMobileNumberVerified] = useState<boolean>();
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

  // const handleProjectTypeChange = (mobileNumber: string) => {
  //   setCreateLeadFormData({
  //     leadMobile: mobileNumber,
  //     isMobileVerified: mobileNumberVerified,
  //   });
  // };
  // useEffect(() => {
  //   handleProjectTypeChange(mobileNumber.value);
  //   if (!mobileNumber.error) {
  //     existingMobileNumber();
  //   }
  // }, [mobileNumber, mobileNumberVerified]);
  // useEffect(() => {
  //   if (
  //     isMobileVerified !== undefined &&
  //     isMobileVerified !== mobileNumberVerified
  //   ) {
  //     setMobileNumberVerified(isMobileVerified);
  //   }
  // }, [isMobileVerified, mobileNumberVerified]);
  const existingMobileNumber = async (value: string) => {
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
    } catch (error: any) {
      console.log(error);
    }
  };
  const { localizationValue } = useOrganizationLocalization();

  useEffect(() => {
    if (leadCaptureData?.leadMobile || !hasResolved) {
      return;
    }

    setSelectedCountry((countryCode || "IN") as MuiTelInputCountry);
  }, [countryCode, hasResolved, leadCaptureData?.leadMobile]);

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
          "Maximum retries reached. Try again after " +
            (localizationValue &&
              formatDateBasedOnOrganizationLocalization(
                localizationValue,
                res?.body?.retrywaitTime
              )) ? "Maximum retries reached. Try again after " +
            (localizationValue &&
              formatDateBasedOnOrganizationLocalization(
                localizationValue,
                res?.body?.retrywaitTime
              )) : moment(new Date(res.body.retrywaitTime)).format("hh:mm a"),
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

  const handleNextQuestions = (questionNumber: any) => {
    if (leadCaptureData?.isMobileVerified) {
      router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          question: questionNumber,
        },
      });
    } else {
      toast.error("Please verify your mobile number before proceeding.");
    }
  };
  const handlePreviousQuestions = (questionNumber: any) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        question: questionNumber,
      },
    });
  };

  const { t } = useTranslation();
  return (
    <div
      className="d-flex column justify-content-center"
      style={{
        backgroundImage: 'url("/images/leadCapturePhone.svg")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <div className="d-flex justify-content-start ml-4  ">
        <img
          alt="Remy Sharp"
          src={logoUrl}
          style={{
            width: "200px",
            height: "70px",
            objectFit: "contain",
            objectPosition: "left",
          }}
        />
      </div>
      <div
        style={{
          fontSize: "20px",
          fontWeight: 600,
          width: isSmallScreen ? "100% " : "50vw",
          color: "black",
          margin: isSmallScreen ? "auto " : "0 auto",
          minHeight: "60vh",
          height: "100%",

          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="d-flex justify-content-center align mb-4">
          7. Could I please have your phone number for coordination purposes?
        </div>
        <div className="d-flex column align-items-center ml-3">
          <Grid
            item
            xs={6}
            style={{
              marginBottom: "25px",
              maxWidth: "80%",
              marginRight: "3rem",
            }}
          >
            {selectedCountry ? (
              <MuiTelInput
            forceCallingCode
              variant="outlined"
              style={{
                minWidth: "30vw",
              }}
              placeholder={t('leadCapture.enterYourPhoneNumber')}
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
                    Please verify the Mobile number
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
                  <Button
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
                    // Disable the button if isDisabled is true or the timer is active
                    disabled={
                      mobileError ||
                      !leadCaptureData?.leadMobile ||
                      leadCaptureData?.leadMobile?.length == 0 ||
                      mobileNumbertimer !== null ||
                      isExistingMobile
                    }
                  >
                    {reVerifyMobileNumber ? "Re-send" : "Verify"}
                  </Button>
                ) : (
                  <DoneIcon color="success" style={TickIconStyle} />
                ),
              }}
              disabled={
                mobileNumbertimer !== null || leadCaptureData?.isMobileVerified
              }
              />
            ) : (
              <TextField
                variant="outlined"
                style={{
                  minWidth: "30vw",
                }}
                placeholder={t('leadCapture.enterYourPhoneNumber')}
                name="mobileNumber"
                fullWidth
                disabled
                InputProps={{
                  endAdornment: (
                    <Button variant="contained" disabled>
                      Verify
                    </Button>
                  ),
                }}
              />
            )}
            {isExistingMobile && (
              <FormHelperText sx={{ color: "error.main" }}>
                Mobile Number already exist
              </FormHelperText>
            )}
            {leadCaptureData?.leadMobile === "" && (
              <FormHelperText sx={{ color: "error.main" }}>
                Please Enter the mobileNumber
              </FormHelperText>
            )}
            {mobileNumbertimer !== null && (
              <p className="text-left my-0 error-text">{`Please enter verification code sent to your inbox. Your code will expire in ${formatDuration(
                mobileNumbertimer
              )}`}</p>
            )}
          </Grid>
          {mobileNumbertimer !== null && (
            <Grid
              item
              xs={6}
              style={{
                marginBottom: "25px",
                maxWidth: "80%",
                marginRight: "3rem",
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
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.match(/^\d{0,6}$/)) {
                    setMobileNumberOtp(value);
                  }
                }}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <Button
                      variant="contained"
                      color="primary"
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
                      // Disable the button if isDisabled is true
                      disabled={mobileNumberOTP?.length !== 6}
                    >
                      Submit
                    </Button>
                  ),
                }}
              />
            </Grid>
          )}
        </div>
        <div className="mt-4">
          <Button
            variant="outlined"
            sx={(theme) => ({
              width: "150px",
              color: theme.palette.primary.dark,
              marginRight: "20px",
            })}
            onClick={() => handlePreviousQuestions("6")}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            sx={(theme) => ({
              backgroundColor: theme.palette.primary.dark,
              width: "150px",
            })}
            onClick={() => handleNextQuestions("8")}
          >
            Next &nbsp; <ArrowRightIcons />
          </Button>
        </div>
      </div>
      <div
        className={`d-flex ${
          isSmallScreen ? "justify-content-center " : "justify-content-end"
        } mt-4`}
      >
        <div
          style={{
            width: isSmallScreen ? "150px " : "8vw",
            marginRight: isSmallScreen ? "0 " : "50px",
            marginBottom: "40px",
          }}
        >
          <CustomCircularProgressbar value={currentQuestionNumber} />
        </div>
      </div>
    </div>
  );
};

export default LeadCaptureMobile;
