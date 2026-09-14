import { UIButtonLoader } from "@/features/components/HelperComponents/UIButtonLoader";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import ArrowRightIcons from "@/assets/icons/arrow-right";
import {
  formatDateBasedOnOrganizationLocalization,
  formatDuration,
} from "@/lib/helpers";
import { emailPattern } from "@/lib/regex";
import DoneIcon from "@mui/icons-material/Done";
import {
  Button,
  FormHelperText,
  Grid,
  TextField,
  useMediaQuery,
} from "@mui/material";
import moment, { Duration } from "moment";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import { toast } from "react-toastify";
import { setCreateLeadFormData } from "./setCreateFormData";
import { LeadCaptureStore } from "@/lib/leadCapture/leadCaptureStore";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import CustomCircularProgressbar from "./LeadCaptureCircularProgressbar";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { useTranslation } from "react-i18next";

const TickIconStyle = {
  width: "25px",
  height: "25px",
  fill: "#ffffff",
  marginBottom: "5px",
  background: "#42D28A",
  borderRadius: "20px",
  padding: "3px",
};

const LeadCaptureMail = ({
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
  // const email = LeadCaptureStore.useState((s) => s.leadCaptureData?.leadEmail);
  // const isEmailVerified = LeadCaptureStore.useState(
  //   (s) => s.leadCaptureData?.isEmailVerified
  // );
  // const [emailValue, setEmailValue] = useState<any>({
  //   error: "",
  //   value: email,
  // });
  const { leadCaptureData } = LeadCaptureStore.useState();
  const { t } = useTranslation();
  const [emailError, setEmailError] = useState(false);
  const [isEmailOtploading, setEmailOtpLoader] = useState(false);
  const [emailOTP, setEmailOtp] = useState<string>();
  const [reVerifyEmail, setReverifyEmail] = useState<boolean>(false);
  const verifyEmailTimer = useRef<any>();
  // const [emailVerified, setEmailVerified] = useState<boolean>();
  const [isExistingEmail, setIsExistingEmail] = useState<boolean>(false);
  const isSmallScreen = useMediaQuery("(max-width: 1000px)");

  const { VITE_USERHUB_ENDPOINT, VITE_LEADMANAGER_ENDPOINT } =
    useEnv();
  const [emailtimer, setEmailTimer] = useState<Duration | null>(null);
  const { post: existingMail } = useAxios(
    VITE_LEADMANAGER_ENDPOINT + "/lead-capture"
  );
  const { post: otpVerification, loading: isGenerateOtpLoading } = useAxios(
    VITE_USERHUB_ENDPOINT + "/signup"
  );
  // const handleProjectTypeChange = (emailValue: string) => {
  //   setCreateLeadFormData({
  //     leadEmail: emailValue,
  //     isEmailVerified: leadCaptureData?.isEmailVerified,
  //   });
  // };
  // useEffect(() => {
  //   if (!emailError) {
  //     existingEmail();
  //   }
  //   // handleProjectTypeChange(leadCaptureData?.leadEmail);
  // }, [leadCaptureData?.isEmailVerified]);

  // useEffect(() => {
  //   if (isEmailVerified !== undefined && isEmailVerified !== emailVerified) {
  //     setEmailVerified(isEmailVerified);
  //   }
  // }, [isEmailVerified, emailVerified]);

  const existingEmail = async (value: string) => {
    try {
      const requestData = {
        eventType: "GET_EMAIL_OR_MOBILE_EXISTENCE",
        organizationId: organizationId,
        organizationType: organizationType,
        emailOrMobile: value,
      };

      const data = await existingMail(requestData);
      if (data.code === "LEAD_RETRIEVED") {
        setIsExistingEmail(true);
      } else {
        setIsExistingEmail(false);
      }
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
    data: { emailId?: string; mobileNumber?: string };
    timer: any;
    setTimer: React.Dispatch<any>;
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
            (localizationValue
              ? formatDateBasedOnOrganizationLocalization(
                  localizationValue,
                  res?.body?.retrywaitTime
                )
              : moment(new Date(res.body.retrywaitTime)).format("hh:mm a")),
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
        setCreateLeadFormData({ isEmailVerified: res.body.verified });
      }
    } else if (res.code === "GENERATE_OTP_FAILED" && res?.body?.retrywaitTime) {
      toast.error(
        "Maximum retries reached. Try again after " +
          (localizationValue
            ? formatDateBasedOnOrganizationLocalization(
                localizationValue,
                res?.body?.retrywaitTime
              )
            : moment(new Date(res.body.retrywaitTime)).format("hh:mm a")),
        { autoClose: 1000 * 10 }
      );
    }
  };

  const verifyOtp = async ({
    data,
    setTimer,
    timer,
  }: {
    data: { emailId?: string; mobileNumber?: string; otpValue: string };
    timer: any;
    setTimer: React.Dispatch<React.SetStateAction<Duration | null>>;
    // setVerified: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  }) => {
    const res = await otpVerification({
      eventType: "VERIFY_OTP_LEAD_CAPTURE",
      otpEvent: "LEAD CAPTURE",
      ...data,
    });
    if (res.error) {
      toast.error(res.error);
    } else if (res.code === "OTP_VERIFICATION_SUCCESSFUL") {
      clearInterval(timer.current);
      setTimer(null);
      setCreateLeadFormData({ isEmailVerified: true });
    }
  };

  const handleNextQuestions = (questionNumber: any) => {
    if (leadCaptureData?.isEmailVerified) {
      router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          question: questionNumber,
        },
      });
    } else {
      toast.error("Please verify your email before proceeding.");
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

  return (
    <div
      className="d-flex column justify-content-center"
      style={{
        backgroundImage: 'url("/images/leadCaptureEmail.svg")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <div className="d-flex justify-content-start ml-4 ">
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
          6. Mind dropping your virtual postcard? Your email, please!
        </div>
        <div className="d-flex column align-items-center ml-3">
          <Grid
            item
            xs={12}
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
              placeholder={t("leadCapture.enterYourEmail")}
              onChange={(e) => {
                const value = e.target.value;
                const error = !emailPattern.test(value);
                setEmailError(error);
                setCreateLeadFormData({
                  leadEmail: value,
                  isEmailVerified: false,
                });
                if (!error) {
                  existingEmail(value);
                } else {
                  setIsExistingEmail(false);
                }
                // setEmailValue({ error, value: value });
                // setEmailVerified(false);
                // setIsExistingEmail(false);
              }}
              InputLabelProps={{ shrink: true }}
              fullWidth
              onInvalid={(e) => {
                e.preventDefault();

                setEmailError(true);
                // setEmailValue({ ...emailValue, error: true });
              }}
              value={leadCaptureData?.leadEmail}
              error={emailError ? true : false}
              helperText={
                !!leadCaptureData?.leadEmail && emailError ? (
                  <p className="error-text my-0">
                    Please verify the Email address
                  </p>
                ) : (
                  ""
                )
              }
              InputProps={{
                required: true,
                endAdornment: isEmailOtploading ? (
                  <UIButtonLoader />
                ) : !leadCaptureData?.isEmailVerified ? (
                  <Button
                    variant="contained"
                    sx={{
                      width: "90px",
                      height: "40px",
                      fontSize: "11px",
                      borderRadius: "10px",
                      padding: "10px 3px",
                      bgcolor: !reVerifyEmail ? "primary.main" : "error.main ",
                      // "&:hover": {
                      //   background: !reVerifyEmail ? "#3398E6" : "#F65A4A",
                      // },
                      textTransform: "none",
                    }}
                    onClick={async () => {
                      if (!emailError) {
                        setEmailOtpLoader(true);
                        await generateOtp({
                          data: { emailId: leadCaptureData?.leadEmail },
                          reverify: reVerifyEmail,
                          setReverify: setReverifyEmail,
                          setTimer: setEmailTimer,
                          timer: verifyEmailTimer,
                        }).finally(() => {
                          setEmailOtpLoader(false);
                        });
                      }
                    }}
                    disabled={
                      isExistingEmail ||
                      emailError ||
                      !leadCaptureData?.leadEmail ||
                      leadCaptureData.leadEmail?.length == 0 ||
                      emailtimer !== null
                    }
                  >
                    {reVerifyEmail ? "Re-Verify" : "Verify"}
                  </Button>
                ) : (
                  <DoneIcon color="success" style={TickIconStyle} />
                ),
              }}
              disabled={emailtimer !== null || leadCaptureData?.isEmailVerified}
            />
            {isExistingEmail && (
              <FormHelperText sx={{ color: "error.main" }}>
                Email already exist
              </FormHelperText>
            )}
            {leadCaptureData?.leadEmail === "" && (
              <FormHelperText sx={{ color: "error.main" }}>
                Please Enter the Email
              </FormHelperText>
            )}
            {emailtimer !== null && (
              <p className="text-left my-0 error-text">
                {`Please enter verification code sent to your inbox. Your code will expire in ${formatDuration(
                  emailtimer
                )}`}{" "}
              </p>
            )}
          </Grid>
          {emailtimer !== null && (
            <Grid
              item
              xs={12}
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
                name="emailOTP"
                value={emailOTP}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.match(/^\d{0,6}$/)) {
                    setEmailOtp(value);
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
                        bgcolor: "primary.dark",
                        fontSize: "11px",
                        borderRadius: "10px",
                        padding: "10px 3px",
                      }}
                      onClick={async () => {
                        if (emailtimer !== null && emailOTP) {
                          await verifyOtp({
                            data: {
                              otpValue: emailOTP,
                              emailId: leadCaptureData?.leadEmail,
                            },
                            setTimer: setEmailTimer,
                            // setVerified: setEmailVerified,
                            timer: verifyEmailTimer,
                          });
                        }
                      }}
                      // Disable the button if isDisabled is true
                      disabled={emailOTP?.length !== 6}
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
            onClick={() => handlePreviousQuestions("5")}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            sx={(theme) => ({
              backgroundColor: theme.palette.primary.dark,
              width: "150px",
            })}
            onClick={() => handleNextQuestions("7")}
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

export default LeadCaptureMail;
