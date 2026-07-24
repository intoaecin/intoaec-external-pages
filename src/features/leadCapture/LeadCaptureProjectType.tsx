import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import useGetProjectType from "@/features/components/preferences/hooks/useGetProjectType";
import ArrowRightIcons from "@/assets/icons/arrow-right";
import ProjectTypeCheck from "@/assets/icons/project-type-check";
import { formatSeedValues } from "@/lib/helpers";
import { LeadCaptureStore } from "@/lib/leadCapture/leadCaptureStore";
import { ProjectType } from "@/types";
import { Box, Button, Card, CircularProgress, useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CustomCircularProgressbar from "./LeadCaptureCircularProgressbar";
import { setCreateLeadFormData } from "./setCreateFormData";

const LeadCaptureProjectType = ({handleStartQuestions}:{handleStartQuestions:()=> void}) => {
  const router = useRouter();
  const { logoUrl, organizationId, organizationType } = useOrganization();
  const isSmallScreen = useMediaQuery("(max-width: 1000px)");
  const currentQuestionNumber = router.query.question;
  // const [selectedType, setSelectedType] = React.useState<string>();
  const [projectTypes, setProjectTypes] = useState<Array<ProjectType>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const selectedType = LeadCaptureStore.useState(
    (s) => s.leadCaptureData?.projectType
  );
  const handleProjectTypeChange = (selectedTypeValue: string) => {
    setCreateLeadFormData({ projectType: selectedTypeValue });
  };
  const { getProjectTypes } = useGetProjectType();

  const handleCardClick = (typeValue: string) => {
    handleProjectTypeChange(typeValue);
    // if (type === "Others") {
    //   setSelectedType("Others");
    // } else {
    //   setSelectedType(type);
    // }
  };
  const fetchProjectTypes = async () => {
    if (!organizationId || !organizationType) return;
    setIsLoading(true);
    try {
      const response = await getProjectTypes({
        organizationId,
        organizationType,
      });
      if (response?.success) {
        setProjectTypes(response?.data || []);
      } else {
        setProjectTypes([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectTypes();
  }, [organizationId, organizationType]);
  // const handleStartQuestions = (questionNumber: any) => {
  //   // eslint-disable-next-line no-extra-boolean-cast
  //   if (selectedType) {
  //     router.push({
  //       pathname: router.pathname,
  //       query: {
  //         ...router.query,
  //         question: questionNumber,
  //       },
  //     });
  //   } else {
  //     toast.error("Please select your project type before proceeding.");
  //   }
  // };

  return (
    <div
      className="d-flex column justify-content-center"
      style={{
        backgroundImage: 'url("/images/question1.svg")',
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
      <Box
        style={{
          fontSize: "20px",
          fontWeight: 600,
          width: isSmallScreen ? "100% " : "50vw",

          color: "black",
          margin: isSmallScreen ? "auto " : "0 auto",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
        sx={{
          marginTop:{
            xs:"1rem",
            sm:"auto"
          }
        }}
      >
        <div className="d-flex justify-content-center align mb-4">
          1. Define your project type - Lets shape your vision
        </div>
        <Box
          // className="row col-lg-7 justify-content-center"
          sx={{
            flexWrap: "wrap",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center w-100">
              <CircularProgress size={32} />
            </div>
          ) : (
            projectTypes.map((type, index) => (
              <Box
                className="col "
                sx={{
                  width: "100px",
                  padding: isSmallScreen ? "10px " : "30px",
                  height: "100px",
                  minWidth: "100px",
                }}
                key={type?.projectTypeId}
              >
                <Card
                  className="d-flex justify-content-center align-items-center m-2"
                  style={{
                    padding: isSmallScreen ? "0 " : "10px",
                    position: "relative",
                    width: "100px",
                    height: "100px",
                    minWidth: "100px",
                    backgroundImage: `url(${type?.projectTypeImageUrl})`,
                    backgroundSize: "cover",
                    minHeight: "100px",
                    color: "white",
                    cursor: "pointer",
                  }}
                  // sx={{
                  //   ":hover .project-type-name":{
                  //     color:""
                  //   }
                  // }}
                  onClick={() =>
                    handleCardClick(String(type.projectTypeValue ?? ""))
                  }
                  onMouseEnter={(e) => {
                    const overlay = e.currentTarget.querySelector(
                      ".overlay"
                    ) as HTMLElement | null;
                    if (overlay) {
                      overlay.style.opacity = "0.3";
                    }
                  }}
                  onMouseLeave={(e) => {
                    const overlay = e.currentTarget.querySelector(
                      ".overlay"
                    ) as HTMLElement | null;
                    if (overlay) {
                      overlay.style.opacity = "1";
                    }
                  }}
                >
                  <div
                    className="overlay"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background: "rgba(0, 0, 0, 0.5)",
                      opacity: 1,
                      transition: "opacity 0.3s",
                    }}
                  ></div>
                  <div
                    className="d-flex column align-items-end overlay"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      opacity: 1,
                      background:
                        selectedType === String(type?.projectTypeValue ?? "")
                        ? "rgba(0, 0, 0, 0.5)"
                        : "transparent",
                    }}
                  >
                    {selectedType === String(type?.projectTypeValue ?? "") && (
                      <ProjectTypeCheck width={"30px"} />
                    )}
                  </div>
                  <div
                    style={{
                      zIndex: 1,
                      fontSize: "12px",
                      textShadow: "2px 2px 2px #000",
                    }}
                    className="project-type-name"
                  >
                    {formatSeedValues(type?.projectTypeValue)}
                  </div>
                </Card>
              </Box>
            ))
          )}
        </Box>
        <div className="my-3">
          <Button
            variant="contained"
            sx={(theme) => ({
              backgroundColor: theme.palette.primary.dark,
              color: theme.palette.primary.contrastText,
              width: "150px",
            })}
            onClick={() => handleStartQuestions?.()}
          >
            Next &nbsp; <ArrowRightIcons />
          </Button>
        </div>
      </Box>
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
          {/* <CircularProgressbarWithChildren
            value={12.5}
            styles={customStyles}
          >
            <div
              className="d-flex column"
              style={{ fontSize: 12, marginTop: -5, textAlign: "center" }}
            >
              <div style={{ color: "#7C7C7C" }}>Question</div>
              <div style={{ fontWeight: 600, fontSize: "20px" }}>
                {currentQuestionNumber}-8
              </div>
            </div>
          </CircularProgressbarWithChildren> */}
        </div>
      </div>
    </div>
  );
};

export default LeadCaptureProjectType;
