import ArrowRightIcons from "@/assets/icons/arrow-right";
import EmailIcons from "@/assets/icons/email-icons";
import InPersonMeetingIcon from "@/assets/icons/in-person-icon";
import LocationMapIcon from "@/assets/icons/locationMap-icon";
import PhoneCallIcon from "@/assets/icons/phone-cqall-icon";
import VideoCallIcon from "@/assets/icons/video-call-icon";
import {
  TextField,
  Button,
  MenuItem,
  Card,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import { setCreateLeadFormData } from "./setCreateFormData";
import { ModesOfContactType } from "@/types";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { LeadCaptureStore } from "@/lib/leadCapture/leadCaptureStore";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import CustomCircularProgressbar from "./LeadCaptureCircularProgressbar";

const LeadCapturePreferredMode = ({handleNextQuestions,handlePreviousQuestions}:{handleNextQuestions:()=>void,handlePreviousQuestions:()=>void}) => {
  const router = useRouter();
  const theme = useTheme();
  const { logoUrl } = useOrganization();
  const currentQuestionNumber = router.query.question;
  const { VITE_LEADMANAGER_ENDPOINT } = useEnv();
  const isSmallScreen = useMediaQuery("(max-width: 1000px)");
  const { post: leadCaptureFetch } = useAxios(
    VITE_LEADMANAGER_ENDPOINT + "/lead-capture"
  );
  const selectedMode = LeadCaptureStore.useState(
    (s) => s.leadCaptureData?.preferedContactType
  );

  const handleSetContactMode = (selectedMode: string) => {
    setCreateLeadFormData({
      preferedContactType: selectedMode,
    });
  };
  const [modesOfContact, setModesOfContact] = useState<
    Array<ModesOfContactType>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchModesOfContact = async () => {
    setIsLoading(true);
    try {
      const data = await leadCaptureFetch({
        eventType: "GET_MODES_OF_CONTACT",
      });
      if (data?.body) {
        setModesOfContact(data?.body);
      } else {
        setModesOfContact([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModesOfContact();
  }, []);

  // const handleCardClick = (cardTitle: string, boxShadowColor: string) => {
  //   setSelectedCard({ title: cardTitle, boxShadow: boxShadowColor });
  // };

  // const handleNextQuestions = (questionNumber: any) => {
  //   router.push({
  //     pathname: router.pathname,
  //     query: {
  //       ...router.query,
  //       question: questionNumber,
  //     },
  //   });
  // };
  // const handlePreviousQuestions = (questionNumber: any) => {
  //   router.push({
  //     pathname: router.pathname,
  //     query: {
  //       ...router.query,
  //       question: questionNumber,
  //     },
  //   });
  // };
  return (
    <div
      className="d-flex column justify-content-center"
      style={{
        backgroundImage: 'url("/images/leadCapturePreferredMode.svg")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <div
        className="d-flex justify-content-start ml-4  "
       
      >
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
          4. Which method is your preferred way to be contacted?
        </div>
        <div
          className="col-lg-7 col-sm-12 row d-flex align-items-center ml-3 justify-content-around"
          style={{ width: "70vw", height: "30vh" }}
        >
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center w-100">
              <CircularProgress size={32} />
            </div>
          ) : (
            modesOfContact
              ?.map((value) => {
                switch (value.preferedContactTypeValue) {
                  case "PHONE":
                    return {
                      title: "Phone Call",
                      icon: <PhoneCallIcon width={"30px"} />,
                      boxShadow: `${theme.palette.primary.dark}`,
                      value: value.preferedContactTypeValue,
                    };
                  case "EMAIL":
                    return {
                      title: "Email",
                      icon: <EmailIcons width={"28px"} />,
                      boxShadow: "#779FF8",
                      value: value.preferedContactTypeValue,
                    };
                  case "WHATSAPP":
                    return {
                      title: "In-Person Meeting",
                      icon: <InPersonMeetingIcon width={"30px"} />,
                      boxShadow: "#EB5574",
                      value: value.preferedContactTypeValue,
                    };
                  case "VIDEO_CALL":
                    return {
                      title: "Video Call",
                      icon: <VideoCallIcon width={"30px"} />,
                      boxShadow: "#FEC008",
                      value: value.preferedContactTypeValue,
                    };
                  default:
                    return {
                      title: "Video Call",
                      icon: <VideoCallIcon width={"30px"} />,
                      boxShadow: "#FEC008",
                      value: value.preferedContactTypeValue,
                    };
                }
              })
              .map((card, index) => (
                <Card
                  key={index}
                  className="d-flex column justify-content-center"
                  style={{
                    width: isSmallScreen ? "100px " : "20%",
                    height: isSmallScreen ? "50px " : "50%",
                    padding: "10px",
                    margin: isSmallScreen ? "3px " : "",
                    boxShadow:
                      selectedMode && selectedMode === card.value
                        ? `0px 0px 10px 2px ${card.boxShadow}`
                        : `0px 0px 10px 2px rgba(0, 0, 0, 0.1)`,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    handleSetContactMode(card.value);
                  }}
                >
                  <div>{card.icon}</div>
                  <div style={{ fontSize: "10px" }}>{card.title}</div>
                </Card>
              ))
          )}
        </div>
        <div className={`mt-4 ${isSmallScreen ? "pt-5" : ""}  `}>
          <Button
            variant="outlined"
            sx={(theme) => ({
              width: "150px",
              color: theme.palette.primary.dark,
              marginRight: "20px",
            })}
            onClick={() => handlePreviousQuestions?.()}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            sx={(theme) => ({
              backgroundColor: theme.palette.primary.dark,
              width: "150px",
            })}
            onClick={() => handleNextQuestions?.()}
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

export default LeadCapturePreferredMode;
