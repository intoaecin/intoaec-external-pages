import ArrowRightIcons from "@/assets/icons/arrow-right";
import LocationIcon from "@/assets/icons/location-icon";
import LocationMapIcon from "@/assets/icons/locationMap-icon";
import ProjectTypeCheck from "@/assets/icons/project-type-check";
import { Button, Card, Grid, TextField, useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import { setCreateLeadFormData } from "./setCreateFormData";
import { toast } from "react-toastify";
import { LeadCaptureStore } from "@/lib/leadCapture/leadCaptureStore";
import CustomCircularProgressbar from "./LeadCaptureCircularProgressbar";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { LoadScript, StandaloneSearchBox } from "@react-google-maps/api";
import { useEnv } from "@/features/hooks/useEnv";

const LeadCaptureProjectLocation = ({handleNextQuestions,handlePreviousQuestions}:{handleNextQuestions:()=>void,handlePreviousQuestions:()=>void}) => {
  const router = useRouter();
  const { logoUrl } = useOrganization();
  const isSmallScreen = useMediaQuery("(max-width: 1000px)");
  const { NEXT_PUBLIC_GOOGLE_MAP_APIKEY } = useEnv();
  const currentQuestionNumber = router.query.question;
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const handleProjectLocationChange = (location: string) => {
    setCreateLeadFormData({ projectLocation: location });
  };
  const location = LeadCaptureStore.useState(
    (s) => s.leadCaptureData?.projectLocation
  );
  const inputRef = useRef<any>(null);
  const handlProjectLocationChange = () => {
    const place = inputRef.current.getPlaces()[0];
    console.log("Place changed:", place);

    if (place && place.address_components) {
      const addressComponents = place.address_components;

      let city = "";
      let state = "";
      let country = "";

      addressComponents.forEach((component: any) => {
        if (component.types.includes("locality")) {
          city = component.long_name;
        } else if (component.types.includes("administrative_area_level_1")) {
          state = component.long_name;
        } else if (component.types.includes("country")) {
          country = component.long_name;
        }
      });
      setSelectedLocation(`${city}, ${state}, ${country}`);
      setCreateLeadFormData({
        projectLocation: `${city}, ${state}, ${country}`,
      });
    }
  };

  // const handleNextQuestions = (questionNumber: any) => {
  //   if (location) {
  //     router.push({
  //       pathname: router.pathname,
  //       query: {
  //         ...router.query,
  //         question: questionNumber,
  //       },
  //     });
  //   } else {
  //     toast.error("Please enter your location before proceeding.");
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
        backgroundImage: 'url("/images/leadCaptureLocation.svg")',
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
          2. Specify your exact project location!
        </div>
        <div className="d-flex align-items-center ml-3">
          <LoadScript
            googleMapsApiKey={NEXT_PUBLIC_GOOGLE_MAP_APIKEY}
            libraries={["places"]}
          >
            <StandaloneSearchBox
              onLoad={(ref) => (inputRef.current = ref)}
              onPlacesChanged={handlProjectLocationChange}
            >
              <div style={{ margin: " 20px 0" }}>
                <TextField
                  id="outlined-basic"
                  placeholder=" Enter your project location..."
                  type="text"
                  variant="outlined"
                  style={{
                    width: isSmallScreen ? "100% " : "30vw",
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                  }}
                  InputProps={{
                    startAdornment: (
                      <>
                        <LocationMapIcon width={"12px"} fill="#ACB0B4" />
                        &nbsp;&nbsp;
                      </>
                    ),
                  }}
                />
              </div>
            </StandaloneSearchBox>
          </LoadScript>
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

export default LeadCaptureProjectLocation;
