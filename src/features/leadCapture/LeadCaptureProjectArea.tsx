import ArrowRightIcons from "@/assets/icons/arrow-right";
import LocationMapIcon from "@/assets/icons/locationMap-icon";
import { TextField, Button, MenuItem, useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import { setCreateLeadFormData } from "./setCreateFormData";
import { toast } from "react-toastify";
import { LeadCaptureStore } from "@/lib/leadCapture/leadCaptureStore";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import CustomCircularProgressbar from "./LeadCaptureCircularProgressbar";

const LeadCaptureProjectArea = ({handleNextQuestions,handlePreviousQuestions}:{handleNextQuestions:()=>void,handlePreviousQuestions:()=>void}) => {
  const router = useRouter();
  const { logoUrl } = useOrganization();
  const isSmallScreen = useMediaQuery("(max-width: 1000px)");
  const currentQuestionNumber = router.query.question;
  // const [unit, setUnit] = useState("sq.ft");
  const convertToSquareFeet = (area: number, unit: string): number => {
    switch (unit) {
      case "sq.ft":
        return area;
      case "sq.mt":
        return area * 10.764;
      case "acre":
        return area * 43560;
      default:
        return area;
    }
  };
  const area = LeadCaptureStore.useState((s) => s.leadCaptureData?.projectArea);
  const unit = LeadCaptureStore.useState(
    (s) => s.leadCaptureData?.projectAreaUnit
  );

  const handleProjectArea = (area: number) => {
    setCreateLeadFormData({
      projectArea: area,
    });
  };
  const handleProjectAreaUnit = (unit?: string) => {
    setCreateLeadFormData({
      projectAreaUnit: unit ?? "sq.ft",
    });
  };

  // const handleNextQuestions = (questionNumber: any) => {
  //   if (area) {
  //     router.push({
  //       pathname: router.pathname,
  //       query: {
  //         ...router.query,
  //         question: questionNumber,
  //       },
  //     });
  //   } else {
  //     toast.error("Please enter your project area before proceeding.");
  //   }
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
        backgroundImage: 'url("/images/leadCaptureArea.svg")',
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
          3. Specify the area your project will cover?
        </div>
        <div className="d-flex align-items-center ml-3">
          <TextField
            id="outlined-basic"
            type="number"
            placeholder=" Enter your project area..."
            variant="outlined"
            style={{
              width: isSmallScreen ? "100% " : "30vw",
              padding: "10px",
              boxSizing: "border-box",
            }}
            value={area ?? ""}
            inputProps={{ maxLength: 10 }}
            onChange={(e) => {
              handleProjectArea(Number(e.target.value));
            }}
            InputProps={{
              endAdornment: (
                <div style={{ marginLeft: "10px", width: "100px" }}>
                  <TextField
                    select
                    value={unit ?? "sq.ft"}
                    onChange={(e) => {
                      if (e.target.value.length < 11) {
                        return handleProjectAreaUnit(e.target.value);
                      }
                    }}
                    variant="standard"
                    SelectProps={{
                      MenuProps: { disableScrollLock: true },
                    }}
                    sx={{
                      "& .MuiInput-root:before": {
                        borderBottom: "none",
                      },
                    }}
                  >
                    <MenuItem selected value="sq.ft">
                      sq.ft
                    </MenuItem>
                    <MenuItem value="sq.mt">sq.mt</MenuItem>
                    <MenuItem value="acre">acre</MenuItem>
                  </TextField>
                </div>
              ),
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

export default LeadCaptureProjectArea;
