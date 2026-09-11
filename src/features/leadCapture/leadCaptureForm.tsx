import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import ArrowRightIcons from "@/assets/icons/arrow-right";
import { Button } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import LeadCaptureMail from "./LeadCaptureMail";
import LeadCaptureMobile from "./LeadCaptureMobile";
import LeadCaptureName from "./LeadCaptureName";
import LeadCapturePreferredMode from "./LeadCapturePreferredMode";
import LeadCapturePreferredSLot from "./LeadCapturePreferredSlot";
import LeadCaptureProjectArea from "./LeadCaptureProjectArea";
import LeadCaptureProjectLocation from "./LeadCaptureProjectLocation";
import LeadCaptureProjectType from "./LeadCaptureProjectType";
import LeadCaptureThankYouPage from "./LeadCaptureThankYouPage";
import { toast } from "react-toastify";
import { LeadCaptureStore } from "@/lib/leadCapture/leadCaptureStore";
import { useEnv } from "@/features/hooks/useEnv";
import { capitalizeFirstLetter } from "@/lib/helpers";
import { useAxios } from "@/features/hooks/useAxios";
import { useTranslation } from "react-i18next";

const LeadCaptureForm = ({
  isCustomerPortal,
}: {
  isCustomerPortal?: boolean;
}) => {
  const router = useRouter();
  const { push } = useRouter();

  const { organizationId, organizationName, organizationType, logoUrl } =
    useOrganization();
  const selectedType = LeadCaptureStore.useState(
    (s) => s.leadCaptureData?.projectType
  );
  const location = LeadCaptureStore.useState(
    (s) => s.leadCaptureData?.projectLocation
  );

  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  const {
    VITE_LEADMANAGER_ENDPOINT,
    VITE_DEFAULT_ORGANIZATION_TYPE,
  } = useEnv();
  const { post: createLead, loading: isGenerateOtpLoading } = useAxios(
    VITE_LEADMANAGER_ENDPOINT + "/lead-capture"
  );
  const { leadCaptureData } = LeadCaptureStore.useState();

  const { t } = useTranslation();

  const updateData = async (leadCaptureData: any) => {
    try {
      const requestData = {
        eventType: "CREATE_OR_UPDATE_LEAD",
        ...leadCaptureData,
        // Lead capture form: use 0 for project area when user doesn't provide it
        projectArea:
          leadCaptureData?.projectArea != null &&
          leadCaptureData?.projectArea !== ""
            ? Number(leadCaptureData.projectArea)
            : 0,
        organizationName: organizationName,
        organizationId: organizationId,
        organizationType: VITE_DEFAULT_ORGANIZATION_TYPE,
        ...(isCustomerPortal ? { leadChannel: "Customer Portal" } : {}),
        projectSource: router?.query?.projectSource
          ? capitalizeFirstLetter(router?.query?.projectSource as any)
          : "Leadcapture",
      };

      const data = await createLead(requestData);
      if (data.code === "LEAD_CREATED") {
        console.log("profile", data.body);
        toast.success(t('toast.leadCreatedSuccessfully'));
        if (isCustomerPortal) {
          const getRedirectQuery = router.query.redirect;
          push(`/leadCapture/thankYou?redirect=${getRedirectQuery}`);
        } else {
          push(`/leadCapture/thankYou`);
        }
      }
    } catch (error: any) {
      console.log(error);
      toast.error(t('toast.somethingWentWrong'));
    }
  };

  const handleSubmit = () => {
    if (!leadCaptureData?.projectType) {
      toast.error(t('toast.pleaseEnterProjectType'));
      router.push({
        pathname: router.pathname,
        query: { ...router.query, question: 1 },
      });
      return;
    }
    if (!leadCaptureData?.leadEmail) {
      toast.error(t('toast.pleaseEnterEmail'));
      router.push({
        pathname: router.pathname,
        query: { ...router.query, question: 6 },
      });
      return;
    }
    if (!leadCaptureData?.leadMobile) {
      toast.error(t('toast.pleaseEnterMobile'));
      router.push({
        pathname: router.pathname,
        query: { ...router.query, question: 7 },
      });
      return;
    }
    if (leadCaptureData?.leadName) {
      updateData(leadCaptureData);
    } else {
      toast.error(t('toast.pleaseEnterName'));
    }
  };

  const handleStartQuestions = (questionNumber: any) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        question: questionNumber,
      },
    });
    setSelectedQuestion(questionNumber);
  };
  useEffect(() => {
    const question = Array.isArray(router.query.question)
      ? router.query.question[0]
      : router.query.question;

    setSelectedQuestion(question || null);
  }, [router.query.question]);

  const questionChange = (questionNumber: string) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        question: questionNumber,
      },
    });
  };

  const questionComponents: any = {
    "1": (
      <LeadCaptureProjectType
        handleStartQuestions={() => {
          if (selectedType) {
            questionChange("2");
          } else {
            toast.error(t('toast.pleaseSelectProjectType'));
          }
        }}
      />
    ),

    "2": (
      <LeadCaptureProjectLocation
        handlePreviousQuestions={() => {
          questionChange("1");
        }}
        handleNextQuestions={() => {
          if (location) {
            questionChange("3");
          } else {
            toast.error(t('toast.pleaseEnterLocation'));
          }
        }}
      />
    ),
    "3": (
      <LeadCaptureProjectArea
        handlePreviousQuestions={() => {
          questionChange("2");
        }}
        handleNextQuestions={() => {
          // Project area is optional; user can skip and lead profile will show 0
          questionChange("4");
        }}
      />
    ),
    "4": (
      <LeadCapturePreferredMode
        handlePreviousQuestions={() => {
          questionChange("3");
        }}
        handleNextQuestions={() => {
          questionChange("5");
        }}
      />
    ),
    "5": (
      <LeadCapturePreferredSLot
        handlePreviousQuestions={() => {
          questionChange("4");
        }}
        handleNextQuestions={() => {
          if (isCustomerPortal) {
            handleSubmit();
          } else {
            questionChange("6");
          }
        }}
      />
    ),
    "6": (
      <LeadCaptureMail
        organizationId={organizationId}
        organizationType={organizationType}
      />
    ),
    "7": (
      <LeadCaptureMobile
        organizationId={organizationId}
        organizationType={organizationType}
      />
    ),
    "8": (
      <LeadCaptureName
        handleSubmit={handleSubmit}
        handlePreviousQuestions={() => {
          questionChange("7");
        }}
      />
    ),
  };
  const currentQuestionNumber = router.query.question;

  const isQuestionSelected = selectedQuestion !== null;

  return (
    <div className="d-flex column justify-content-center">
      {!isQuestionSelected && (
        <div
          className="d-flex  justify-content-center align-items-center"
          style={{
            backgroundImage: 'url("/images/lead capture intro page.svg")',
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            height: "100vh",
          }}
        >
          <div>
            <div className="d-flex justify-content-center mb-4">
              <img
                alt="Company Logo"
                src={logoUrl}
                style={{
                  width: "200px",
                  height: "70px",
                  objectFit: "contain",
                  objectPosition: "center",
                }}
              />
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 600,
                width: "60vw",
                color: "black",
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              <div className="d-flex justify-content-center align mb-4">
                {t('leadCapture.welcomeMessage', { organizationName })}
              </div>
              <div className="d-flex justify-content-center mb-4">
                {t('leadCapture.informationRequest')}
              </div>
            </div>
            <div className="d-flex justify-content-center">
              <Button
                variant="contained"
                sx={(theme) => ({
                  backgroundColor: theme.palette.primary.dark,
                })}
                onClick={() => handleStartQuestions("1")}
              >
                Let's get started &nbsp; <ArrowRightIcons />
              </Button>
            </div>
          </div>
        </div>
      )}
      {isQuestionSelected && questionComponents[selectedQuestion]}
      {selectedQuestion === "thankYou" && <LeadCaptureThankYouPage />}
    </div>
  );
};

export default LeadCaptureForm;
