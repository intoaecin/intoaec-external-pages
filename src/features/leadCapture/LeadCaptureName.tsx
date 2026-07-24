import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import ArrowRightIcons from "@/assets/icons/arrow-right";
import { LeadCaptureStore } from "@/lib/leadCapture/leadCaptureStore";
import { Button, TextField, useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import { toast } from "react-toastify";
import { setCreateLeadFormData } from "./setCreateFormData";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import CustomCircularProgressbar from "./LeadCaptureCircularProgressbar";
import { capitalizeFirstLetter } from "@/lib/helpers";
import { useTranslation } from "react-i18next";

const LeadCaptureName = ({
  handleSubmit,
  handlePreviousQuestions,
}: {
  handleSubmit: () => void;
  handlePreviousQuestions: () => void;
}) => {
  const { push } = useRouter();
  const router = useRouter();
  const isSmallScreen = useMediaQuery("(max-width: 1000px)");
  const { organizationId, logoUrl } = useOrganization();
  const currentQuestionNumber = router.query.question;

  const handleLeadNameChange = (leadName: string) => {
    setCreateLeadFormData({
      leadName: leadName,
    });
  };

  const { leadCaptureData } = LeadCaptureStore.useState();

  const { t } = useTranslation();
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
        backgroundImage: 'url("/images/leadCaptureName.svg")',
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
          8. {t("leadCapture.questions.nameRequest")}
        </div>
        <div className="d-flex align-items-center ml-3">
          <TextField
            id="outlined-basic"
            placeholder={t("leadCapture.enterYourName")}
            variant="outlined"
            value={leadCaptureData?.leadName}
            onChange={(e) => {
              handleLeadNameChange(e.target.value);
            }}
            style={{
              width: isSmallScreen ? "100% " : "30vw",
              padding: "10px",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div className="mt-4">
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
            onClick={handleSubmit}
          >
            Submit &nbsp; <ArrowRightIcons />
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

export default LeadCaptureName;
