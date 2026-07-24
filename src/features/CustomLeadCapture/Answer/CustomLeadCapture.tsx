import RenderGeoLocation from "@/features/components/controller/CustomLeadCaptureTemplate/ControllerRenders/RenderGeoLocation";
import RenderPreferredMode from "@/features/components/controller/CustomLeadCaptureTemplate/ControllerRenders/RenderPreferredMode";
import RenderPreferredSlots from "@/features/components/controller/CustomLeadCaptureTemplate/ControllerRenders/RenderPreferredSlots";
import RenderProjectArea from "@/features/components/controller/CustomLeadCaptureTemplate/ControllerRenders/RenderProjectArea";
import RenderProjectEmail from "@/features/components/controller/CustomLeadCaptureTemplate/ControllerRenders/RenderProjectEmail";
import RenderProjectMobile from "@/features/components/controller/CustomLeadCaptureTemplate/ControllerRenders/RenderProjectMobile";
import RenderProjectName from "@/features/components/controller/CustomLeadCaptureTemplate/ControllerRenders/RenderProjectName";
import RenderProjectTypes from "@/features/components/controller/CustomLeadCaptureTemplate/ControllerRenders/RenderProjectTypes";
import RenderThankYouCard from "@/features/components/controller/CustomLeadCaptureTemplate/ControllerRenders/RenderThankYouCard";
import { RenderForm } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderForm";
import { RenderCheckBox } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderCheckBox";
import { RenderRadio } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderRadio";
import { RenderDropDownSingle } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderDropDownSingle";
import { RenderDropDownMulti } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderDropDownMulti";
import { RenderTextShort } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderTextShort";
import { RenderTextLong } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderTextLong";
import { RenderEmail } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderEmail";
import { RenderSliderScale } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderSliderScale";
import { RenderPhoneNumber } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderPhoneNumber";
import { RenderDateAndTime } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderDateAndTime";
import { RenderMatrixChoiceSingle } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderMatrixChoiceSingle";
import { RenderMatrixChoiceMulti } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderMatrixChoiceMulti";
import { RenderMatrixDropdown } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderMatrixDropdown";
import { RenderMatrixRatingScaleSingle } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderMatrixRatingScale";
import { RenderRatingScale } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderRatingScale";
import { RenderFileUpload } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderFileUpload";
import { RenderAddImage } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderAddImage";
import { useAxios, useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { capitalizeFirstLetter } from "@/lib/helpers";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  MobileStepper,
  Paper,
  TextField,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useState } from "react";
import SwipeableViews from "react-swipeable-views";
import { useLeadCaptureTemplate } from "../CustomLeadCaptureProvider";
import { useRouter } from "next/router";
import RenderIntroCard from "@/features/components/controller/CustomLeadCaptureTemplate/ControllerRenders/RenderIntroCard";
import { LeadCaptureStore } from "@/lib/leadCapture/leadCaptureStore";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import { useTheme } from "@mui/material/styles";
import { CircularProgressbarStyles } from "react-circular-progressbar/dist/types";
import { LoadScript } from "@react-google-maps/api";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useStoreLeadResponse } from "@/features/leadCapture/hooks/useStoreLeadResponse";
import { getQuestionKey } from "@/utils/helpers";
import { getLeadCaptureBackgroundStyle } from "../CustomLeadCaptureBackgroundOptions";
import { ArrowRight } from "lucide-react";

interface CustomCircularProgressbarProps {
  value: string | string[] | undefined;
  maxStep: number;
}

const CustomCircularProgressbar: React.FC<CustomCircularProgressbarProps> = ({
  value,
  maxStep,
}) => {
  const theme = useTheme();

  const customStyles: CircularProgressbarStyles = {
    root: {
      display: "flex",
    },
    path: {
      stroke: theme.palette.primary.dark,
      strokeLinecap: "round",
      transition: "stroke-dashoffset 0.5s ease 0s",
      transform: "rotate(0turn)",
      transformOrigin: "center center",
    },
    trail: {
      stroke: theme.palette.primary.light,
      strokeLinecap: "butt",
      transform: "rotate(0.25turn)",
      transformOrigin: "center center",
    },
    background: {
      fill: theme.palette.background.default,
    },
  };

  const { t } = useTranslation();
  return (
    <CircularProgressbarWithChildren
      value={(Number(value) / maxStep) * 100}
      styles={customStyles}
    >
      <div
        className="d-flex column"
        style={{ fontSize: 12, marginTop: -5, textAlign: "center" }}
      >
        <Box
          style={{ color: "#7C7C7C" }}
          sx={{
            fontSize: {
              xs: "8px",
              sm: "12px",
            },
          }}
        >
          Question
        </Box>
        <Box
          style={{ fontWeight: 600 }}
          sx={{
            fontSize: {
              xs: "14px",
              sm: "20px",
            },
          }}
        >
          {value} - {maxStep}
        </Box>
      </div>
    </CircularProgressbarWithChildren>
  );
};

const CustomLeadCapture = () => {
  const { leadCaptureData } = LeadCaptureStore.useState();
  const [activeStep, setActiveStep] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [dynamicControlsState, setDynamicControlsState] = useState<
    Record<string, any>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { NEXT_PUBLIC_GOOGLE_MAP_APIKEY } = useEnv();
  const { organizationId, organizationType, logoUrl, organizationName } =
    useOrganization();
  const router = useRouter();
  const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT, NEXT_PUBLIC_INTOAEC_LOGO } =
    useEnv();
  const { post: createLead, loading: isGenerateOtpLoading } = useAxios(
    NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/lead-capture"
  );
  const isSmallDevice = useMediaQuery("(max-width:768px)");
  const { t } = useTranslation();
  const theme = useTheme();

  // const [logoUrl, setLogoUrl] = useState("");
  // const { post: fetch } = useAxiosWithAuth<any>(
  //   NEXT_PUBLIC_USERHUB_ENDPOINT + "/myorganization"
  // );
  // const fetchData = async () => {
  //   try {
  //     const requestData = {
  //       eventType: "FETCH_LOGO",
  //     };
  //     const data = await fetch(requestData);
  //     if (data?.code === "ORGANIZATION_LOGO_FETCH_SUCCESS") {
  //       setLogoUrl(data?.body?.logoUrl);
  //     }
  //   } catch (error: any) {
  //     console.log(error);
  //   }
  // };

  // useEffect(() => {
  //   fetchData();
  // }, []);
  const updateData = async (leadCaptureData: any) => {
    try {
      if (isSubmitting) return;
      setIsSubmitting(true);
      const pathWithoutQuery = router.asPath.split("?")[0];
      const pathParts = pathWithoutQuery.split("/").filter(Boolean);
      const leadCaptureIndex = pathParts.findIndex(
        (part) => part.toLowerCase() === "leadcapture"
      );
      const leadSourceSegment =
        leadCaptureIndex >= 0 ? pathParts[leadCaptureIndex + 1] : undefined;
      const projectSource = leadSourceSegment
        ? capitalizeFirstLetter(leadSourceSegment)
        : "Leadcapture";
      const requestData = {
        eventType: "CREATE_OR_UPDATE_LEAD",
        ...leadCaptureData,
        organizationName: organizationName,
        organizationId: organizationId,
        organizationType: organizationType,
        projectSource,
        isLeadCapture: true,
      };

      const data = await createLead(requestData);
      if (data.code === "LEAD_CREATED") {
        const leadId = data?.body?.lead?.leadId ?? data?.body?.leadId;
        const leadResponses =
          visiblePages
            ?.flatMap((page: any) => getVisibleControllers(page))
            ?.map((control: any) => {
              const controllerName = getControllerName(control);
              const controlKey = control?.questionId || controllerName;
              const currentControl =
                dynamicControlsState[controlKey] || control;
              const options = currentControl?.options ?? [];
              const selectedOptions = Array.isArray(options)
                ? options.filter((opt: any) => opt?.isSelected)
                : [];
              const resolveOptionValue = (opt: any) =>
                opt?.value ?? opt?.label ?? opt;
              const answer =
                controllerName === "PROJECT_TYPES"
                  ? leadCaptureData?.projectType
                  : controllerName === "GEO_LOCATION"
                  ? leadCaptureData?.projectLocation
                  : controllerName === "PREFERRED_MODE"
                  ? leadCaptureData?.preferedContactType
                  : controllerName === "PROJECT_AREA"
                  ? leadCaptureData?.projectArea
                  : controllerName === "PREFERRED_SLOTS"
                  ? leadCaptureData?.selectedDate &&
                    leadCaptureData?.selectedMonth &&
                    leadCaptureData?.selectedYear
                    ? `${leadCaptureData.selectedDate}-${leadCaptureData.selectedMonth}-${leadCaptureData.selectedYear}`
                    : leadCaptureData?.selectedDate
                  : controllerName === "PROJECT_EMAIL"
                  ? leadCaptureData?.leadEmail
                  : controllerName === "PROJECT_MOBILE"
                  ? leadCaptureData?.leadMobile
                  : controllerName === "PROJECT_NAME"
                  ? leadCaptureData?.leadName
                  : controllerName === "RADIO_BUTTON"
                  ? resolveOptionValue(selectedOptions[0])
                  : controllerName === "CHECK_BOX" ||
                    controllerName === "DROPDOWN_MULTI"
                  ? selectedOptions.map(resolveOptionValue)
                  : controllerName === "DROPDOWN_SINGLE"
                  ? resolveOptionValue(selectedOptions[0])
                  : controllerName === "SHORT_ANSWER" ||
                    controllerName === "LONG_ANSWER" ||
                    controllerName === "EMAIL" ||
                    controllerName === "PHONE_NUMBER" ||
                    controllerName === "SLIDER_SCALE" ||
                    controllerName === "DATE_AND_TIME"
                  ? currentControl?.value
                  : controllerName?.startsWith("MATRIX")
                  ? currentControl?.options ?? currentControl?.value
                  : controllerName === "RATING_SCALE"
                  ? currentControl?.value ?? currentControl?.options
                  : currentControl?.value ?? currentControl?.options;
              return {
                questionId: control?.questionId,
                controllerName,
                question: control?.question,
                answer,
              };
            })
            ?.filter(Boolean) ?? [];
        await storeLeadResponse({
          leadId,
          leadCaptureResponse: {
            ...leadCaptureData,
            projectName:
              leadCaptureData?.projectName ?? data?.body?.projectName,
            projectType:
              leadCaptureData?.projectType ?? data?.body?.projectType,
            leadEmail: leadCaptureData?.leadEmail ?? data?.body?.lead?.leadEmail,
            leadMobile:
              leadCaptureData?.leadMobile ?? data?.body?.lead?.leadMobile,
            leadName: leadCaptureData?.leadName ?? data?.body?.lead?.leadName,
            projectLocation:
              leadCaptureData?.projectLocation ?? data?.body?.projectLocation,
            responses: leadResponses,
          },
        });
        // toast.success(
        //   t("toast.leadCreatedSuccessfully", {
        //     defaultValue: "Lead created successfully",
        //   })
        // );
        setActiveStep((prevStep) => prevStep + 1);
      }
    } catch (error: any) {
      toast.error(t("toast.somethingWentWrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const { storeLeadResponse } = useStoreLeadResponse();
  const { leadCaptureTemplateData, selectedPageIndex } =
    useLeadCaptureTemplate();

  const getControllerName = (control: any) =>
    control?.controllerName ?? control?.controlerName;
  const hideLockedControllerNames = new Set([
    "PROJECT_NAME",
    "PROJECT_MOBILE",
    "PROJECT_EMAIL",
    "INTRO_CONTENT",
    "THANK_YOU_CONTENT",
  ]);
  const isHideLockedController = (control: any) =>
    hideLockedControllerNames.has(getControllerName(control));
  const isSystemPage = (page: any) =>
    page?.pageType === "INTRO" || page?.pageType === "THANK_YOU";
  const getVisibleControllers = (page: any) =>
    (page?.controller ?? []).filter((control: any) => {
      if (isSystemPage(page)) return true;
      return isHideLockedController(control) || control?.isEnabled !== false;
    });
  const visiblePages = (leadCaptureTemplateData?.pages ?? []).filter(
    (page: any) => {
      if (isSystemPage(page)) return true;
      if (page?.showOrHide !== true) return false;
      return getVisibleControllers(page).length > 0;
    }
  );

  const handleStepChange = (step: any) => {
    setActiveStep(step);
  };

  const handleNextStep = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handlePrevStep = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const maxSteps = visiblePages.length ?? 0;

  const renderQuestionRenderer = (control: any) => {
    const controllerName = getControllerName(control);
    const controlKey = control?.questionId || controllerName;
    switch (controllerName) {
      case "GEO_LOCATION":
        return <RenderGeoLocation />;
      case "PREFERRED_MODE":
        return <RenderPreferredMode />;
      case "PROJECT_AREA":
        return <RenderProjectArea />;
      case "PROJECT_EMAIL":
        return <RenderProjectEmail />;
      case "PROJECT_NAME":
        return <RenderProjectName />;
      case "PROJECT_MOBILE":
        return <RenderProjectMobile />;
      case "PREFERRED_SLOTS":
        return <RenderPreferredSlots />;
      case "PROJECT_TYPES":
        return <RenderProjectTypes />;
      case "THANK_YOU_CONTENT":
        return <RenderThankYouCard control={control} disabled />;
      case "INTRO_CONTENT":
        return <RenderIntroCard controller={control} disabled />;
      case "RADIO_BUTTON": {
        const currentControl =
          dynamicControlsState[controlKey] || control;
        return (
          <RenderRadio
            isAnswer
            control={currentControl}
            onChange={(updatedControl) => {
              setDynamicControlsState((prev) => ({
                ...prev,
                [controlKey]: updatedControl,
              }));
            }}
          />
        );
      }
      case "CHECK_BOX": {
        const currentControl =
          dynamicControlsState[controlKey] || control;
        return (
          <RenderCheckBox
            isAnswer
            control={currentControl}
            onChange={(updatedControl) => {
              setDynamicControlsState((prev) => ({
                ...prev,
                [controlKey]: updatedControl,
              }));
            }}
          />
        );
      }
      case "DROPDOWN_SINGLE": {
        const currentControl =
          dynamicControlsState[controlKey] || control;
        return (
          <RenderDropDownSingle
            isAnswer
            control={currentControl}
            onChange={(_, __, optionIndex) => {
              const updatedOptions =
                currentControl?.options?.map(
                  (opt: any, currentIndex: number) => ({
                    ...opt,
                    isSelected: currentIndex === optionIndex,
                  })
                ) ?? [];
              const updatedControl = {
                ...currentControl,
                options: updatedOptions,
              };
              setDynamicControlsState((prev) => ({
                ...prev,
                [controlKey]: updatedControl,
              }));
            }}
          />
        );
      }
      case "DROPDOWN_MULTI": {
        const currentControl =
          dynamicControlsState[controlKey] || control;
        return (
          <RenderDropDownMulti
            isAnswer
            control={currentControl}
            onChange={(optionIndex, checked) => {
              const updatedOptions =
                currentControl?.options?.map(
                  (opt: any, currentIndex: number) => ({
                    ...opt,
                    isSelected:
                      currentIndex === optionIndex ? checked : opt.isSelected,
                  })
                ) ?? [];
              const updatedControl = {
                ...currentControl,
                options: updatedOptions,
              };
              setDynamicControlsState((prev) => ({
                ...prev,
                [controlKey]: updatedControl,
              }));
            }}
          />
        );
      }
      case "SHORT_ANSWER": {
        const currentControl =
          dynamicControlsState[controlKey] || control;
        return (
          <RenderTextShort
            isAnswer
            control={currentControl}
            onChange={(e) => {
              const updatedControl = {
                ...currentControl,
                value: e.target.value,
              };
              setDynamicControlsState((prev) => ({
                ...prev,
                [controlKey]: updatedControl,
              }));
            }}
          />
        );
      }
      case "LONG_ANSWER": {
        const currentControl =
          dynamicControlsState[controlKey] || control;
        return (
          <RenderTextLong
            isAnswer
            control={currentControl}
            onChange={(e) => {
              const updatedControl = {
                ...currentControl,
                value: e.target.value,
              };
              setDynamicControlsState((prev) => ({
                ...prev,
                [controlKey]: updatedControl,
              }));
            }}
          />
        );
      }
      case "EMAIL": {
        const currentControl =
          dynamicControlsState[controlKey] || control;
        return (
          <RenderEmail
            isAnswer
            control={currentControl}
            onChange={(value) => {
              const updatedControl = {
                ...currentControl,
                value,
              };
              setDynamicControlsState((prev) => ({
                ...prev,
                [controlKey]: updatedControl,
              }));
            }}
          />
        );
      }
      case "SLIDER_SCALE": {
        const currentControl =
          dynamicControlsState[controlKey] || control;
        return (
          <RenderSliderScale
            isAnswer
            control={currentControl}
            onChange={(_, value) => {
              const updatedControl = {
                ...currentControl,
                value,
              };
              setDynamicControlsState((prev) => ({
                ...prev,
                [controlKey]: updatedControl,
              }));
            }}
          />
        );
      }
      case "PHONE_NUMBER": {
        const currentControl =
          dynamicControlsState[controlKey] || control;
        return (
          <RenderPhoneNumber
            isAnswer
            control={currentControl}
            onChange={(value) => {
              const updatedControl = {
                ...currentControl,
                value,
              };
              setDynamicControlsState((prev) => ({
                ...prev,
                [controlKey]: updatedControl,
              }));
            }}
          />
        );
      }
      case "DATE_AND_TIME": {
        const currentControl =
          dynamicControlsState[controlKey] || control;
        return (
          <RenderDateAndTime
            isAnswer
            control={currentControl}
            onChange={(value) => {
              const updatedControl = {
                ...currentControl,
                value: value?.toDate
                  ? value.toDate().getTime()
                  : value,
              };
              setDynamicControlsState((prev) => ({
                ...prev,
                [controlKey]: updatedControl,
              }));
            }}
          />
        );
      }
      case "MATRIX_CHOICE_SINGLE": {
        const currentControl =
          dynamicControlsState[controlKey] || control;
        return (
          <RenderMatrixChoiceSingle
            isAnswer
            control={currentControl}
            onChange={(rowIndex, columnIndex, checked, other) => {
              const updatedControl = { ...currentControl };
              const { options } = updatedControl;
              if (!options?.rowLabel?.[rowIndex]) {
                return;
              }
              if (
                !options.rowLabel[rowIndex].columnSelected ||
                !Array.isArray(options.rowLabel[rowIndex].columnSelected)
              ) {
                options.rowLabel[rowIndex].columnSelected = [
                  ...options.columnLabel,
                ].map((c: any) => ({ ...c, isSelected: false }));
              }
              options.rowLabel[rowIndex].columnSelected =
                options.rowLabel[rowIndex].columnSelected.map(
                  (val: any, idx: number) => {
                    if (idx === columnIndex) {
                      return {
                        ...val,
                        isSelected: checked,
                        ...(other ? { value: other.value } : {}),
                      };
                    }
                    return { ...val, isSelected: false };
                  }
                );
              setDynamicControlsState((prev) => ({
                ...prev,
                [controlKey]: updatedControl,
              }));
            }}
          />
        );
      }
      case "MATRIX_CHOICE_MULTI": {
        const currentControl =
          dynamicControlsState[controlKey] || control;
        return (
          <RenderMatrixChoiceMulti
            isAnswer
            control={currentControl}
            onChange={(rowIndex, columnIndex, checked, other) => {
              const updatedControl = { ...currentControl };
              const { options } = updatedControl;
              if (!options?.rowLabel?.[rowIndex]) {
                return;
              }
              if (
                !options.rowLabel[rowIndex].columnSelected ||
                !Array.isArray(options.rowLabel[rowIndex].columnSelected)
              ) {
                options.rowLabel[rowIndex].columnSelected = [
                  ...options.columnLabel,
                ].map((c: any) => ({ ...c, isSelected: false }));
              }
              options.rowLabel[rowIndex].columnSelected =
                options.rowLabel[rowIndex].columnSelected.map(
                  (val: any, idx: number) => {
                    if (idx === columnIndex) {
                      return {
                        ...val,
                        isSelected: checked,
                        ...(other ? { value: other.value } : {}),
                      };
                    }
                    return val;
                  }
                );
              setDynamicControlsState((prev) => ({
                ...prev,
                [controlKey]: updatedControl,
              }));
            }}
          />
        );
      }
      case "MATRIX_DROPDOWN": {
        const currentControl =
          dynamicControlsState[controlKey] || control;
        return (
          <RenderMatrixDropdown
            isAnswer
            control={currentControl}
            onChange={(updatedControl) => {
              setDynamicControlsState((prev) => ({
                ...prev,
                [controlKey]: updatedControl,
              }));
            }}
          />
        );
      }
      case "MATRIX_RATING_SCALE": {
        const currentControl =
          dynamicControlsState[controlKey] || control;
        return (
          <RenderMatrixRatingScaleSingle
            isAnswer
            control={currentControl}
            onChange={(rowIndex, columnIndex, checked) => {
              const updatedControl = { ...currentControl };
              const { options } = updatedControl;
              if (!options?.rowLabel?.[rowIndex]) {
                return;
              }
              if (
                !options.rowLabel[rowIndex].columnSelected ||
                !Array.isArray(options.rowLabel[rowIndex].columnSelected)
              ) {
                options.rowLabel[rowIndex].columnSelected = [
                  ...options.columnLabel,
                ].map((c: any) => ({ ...c, isSelected: false }));
              }
              options.rowLabel[rowIndex].columnSelected =
                options.rowLabel[rowIndex].columnSelected.map(
                  (val: any, idx: number) => {
                    if (idx === columnIndex) {
                      return {
                        ...val,
                        isSelected: checked,
                      };
                    }
                    return { ...val, isSelected: false };
                  }
                );
              setDynamicControlsState((prev) => ({
                ...prev,
                [controlKey]: updatedControl,
              }));
            }}
          />
        );
      }
      case "RATING_SCALE": {
        const currentControl =
          dynamicControlsState[controlKey] || control;
        return (
          <RenderRatingScale
            isAnswer
            control={currentControl}
            onChange={(updatedControl) => {
              setDynamicControlsState((prev) => ({
                ...prev,
                [controlKey]: updatedControl,
              }));
            }}
          />
        );
      }
      case "FILE_UPLOAD": {
        const currentControl =
          dynamicControlsState[controlKey] || control;
        return (
          <RenderFileUpload
            isAnswer
            control={currentControl}
            onChange={(updatedControl) => {
              setDynamicControlsState((prev) => ({
                ...prev,
                [controlKey]: updatedControl,
              }));
            }}
          />
        );
      }
      case "ADD_IMAGE": {
        const currentControl =
          dynamicControlsState[controlKey] || control;
        return (
          <RenderAddImage
            control={currentControl}
            isAnswer
            organizationId={organizationId}
            organizationType={organizationType}
            questionnaireId={leadCaptureTemplateData?.leadCaptureTemplateId}
            pageId={visiblePages?.[activeStep]?.pageId}
            onChange={(updatedControl) => {
              setDynamicControlsState((prev) => ({
                ...prev,
                [controlKey]: updatedControl,
              }));
            }}
          />
        );
      }
      default:
        return null;
    }
  };
  return (
    <div className="d-flex column justify-content-center">
      <LoadScript
        googleMapsApiKey={NEXT_PUBLIC_GOOGLE_MAP_APIKEY}
        libraries={["places"]}
      >
        <div
          style={{
            width: "100%",
            margin: "auto",
            height: "100vh",
            boxShadow: "rgb(0 0 0 / 14%) 0px 0px 18px 0px",
          }}
          // sx={{
          //   "& .react-swipeable-view-container": {
          //      willChange: "inherit",
          //   },
          // }}
        >
          {/* <SwipeableViews
            axis="x"
            index={activeStep}
            onChangeIndex={handleStepChange}
            style={{ overflow: "hidden" }}
          > */}
          {visiblePages?.map(
              (page: any, index: number) =>
                index === activeStep && (
                  <div key={index + "-preview"}>
                    {getVisibleControllers(page).map((control: any, index: number) => (
                      <div
                        id={
                          "custom-lead-capture-template-" + control?.questionId
                        }
                        key={"render-" + control?.questionId}
                        className="d-flex column justify-content-center align-items-center  "
                        style={{
                          ...getLeadCaptureBackgroundStyle(control?.background),
                          minHeight: "100vh",
                          position: "relative",
                        }}
                      >
                        {!(
                          control.controllerName.includes("INTRO") ||
                          control.controllerName.includes("THANK_YOU")
                        ) && (
                          <>
                            <img
                              width={"100%"}
                              src={logoUrl ? logoUrl : NEXT_PUBLIC_INTOAEC_LOGO}
                              height={"60px"}
                              style={{
                                position: "absolute",
                                top: "0",
                                left: "0",
                                objectFit: "contain",
                                maxWidth: "200px",
                                objectPosition: "left",
                              }}
                              alt={"logo"}
                              loading="lazy"
                            />

                            <Box
                              className="mb-2 mx-sm-2 mx-lg-0 "
                              style={{ fontWeight: "500  " }}
                              sx={{
                                marginTop: {
                                  xs: "4rem",
                                  sm: "0rem",
                                },
                                fontSize: {
                                  xs: "10px",
                                  sm: "16px",
                                },
                              }}
                            >
                              {/* {parseInt(selected Page?.match(/\d+/)?.[0] || "0", 10)} */}
                              {activeStep}
                              {". "}
                              {t(
                                `leadCapture.questions.${getQuestionKey(
                                  control.question
                                )}`,
                                {
                                  defaultValue: control.question,
                                }
                              )}{" "}
                              {control.isRequired && (
                                <span className="requiredUI"> *</span>
                              )}
                            </Box>
                          </>
                        )}

                        <div>{renderQuestionRenderer(control)}</div>

                        {!control.controllerName.includes("THANK_YOU") && (
                          <>
                            <div className="mt-4">
                              <Button
                                variant="outlined"
                                sx={(theme) => ({
                                  width: {
                                    xs: "85px",
                                    sm: "150px",
                                  },
                                  color: theme.palette.primary.dark,
                                  marginRight: "20px",
                                })}
                                onClick={handlePrevStep}
                                disabled={activeStep === 0}
                              >
                                {t("common.previous")}
                              </Button>
                              {control.controllerName.includes(
                                "PROJECT_EMAIL"
                              ) ? (
                                <>
                                  <Button
                                    variant="contained"
                                    sx={(theme) => ({
                                      backgroundColor:
                                        theme.palette.primary.dark,
                                      width: {
                                        xs: "85px",
                                        sm: "150px",
                                      },
                                    })}
                                    onClick={() => {
                                      if (leadCaptureData?.isEmailVerified) {
                                        if (maxSteps - 2 === activeStep) {
                                          updateData(leadCaptureData);
                                        } else {
                                          handleNextStep();
                                        }
                                      }
                                    }}
                                    disabled={
                                      !leadCaptureData?.isEmailVerified ||
                                      isSubmitting
                                    }
                                  >
                                    {maxSteps - 2 === activeStep ? (
                                      isSubmitting ? (
                                        <CircularProgress
                                          size={20}
                                          color="inherit"
                                        />
                                      ) : (
                                        <>Submit</>
                                      )
                                    ) : (
                                      <>
                                        {t("common.next")} &nbsp;{" "}
                                        {/* <ArrowRight
                                          style={{
                                            width: "16px",
                                            height: "16px",
                                            color: theme.palette.primary.contrastText,
                                            fill: theme.palette.primary.contrastText,
                                          }}
                                        /> */}
                                      </>
                                    )}
                                  </Button>
                                </>
                              ) : control.controllerName.includes(
                                  "PROJECT_NAME"
                                ) ? (
                                <>
                                  <Button
                                    variant="contained"
                                    sx={(theme) => ({
                                      backgroundColor:
                                        theme.palette.primary.dark,
                                      width: {
                                        xs: "85px",
                                        sm: "150px",
                                      },
                                      alignItems: "center",
                                    })}
                                    onClick={() => {
                                      if (
                                        leadCaptureData?.leadName &&
                                        leadCaptureData?.leadName.length > 2
                                      ) {
                                        if (maxSteps - 2 === activeStep) {
                                          updateData(leadCaptureData);
                                        } else {
                                          handleNextStep();
                                        }
                                      }
                                    }}
                                    disabled={
                                      !(
                                        leadCaptureData?.leadName &&
                                        leadCaptureData?.leadName.length > 2
                                      ) || isSubmitting
                                    }
                                  >
                                    {maxSteps - 2 === activeStep ? (
                                      isSubmitting ? (
                                        <CircularProgress
                                          size={20}
                                          color="inherit"
                                        />
                                      ) : (
                                        <>Submit</>
                                      )
                                    ) : (
                                      <>
                                        {t("common.next")} &nbsp;{" "}
                                        {/* <ArrowRight
                                          style={{
                                            width: "16px",
                                            height: "16px",
                                            color: theme.palette.primary.contrastText,
                                            fill: theme.palette.primary.contrastText,
                                          }}
                                        /> */}
                                      </>
                                    )}
                                  </Button>
                                </>
                              ) : control.controllerName.includes(
                                  "PROJECT_MOBILE"
                                ) ? (
                                <>
                                  <Button
                                    variant="contained"
                                    sx={(theme) => ({
                                      backgroundColor:
                                        theme.palette.primary.dark,
                                      width: {
                                        xs: "85px",
                                        sm: "150px",
                                      },
                                      alignItems: "center",
                                    })}
                                    onClick={() => {
                                      if (leadCaptureData?.isMobileVerified) {
                                        if (maxSteps - 2 === activeStep) {
                                          updateData(leadCaptureData);
                                        } else {
                                          handleNextStep();
                                        }
                                      }
                                    }}
                                    disabled={
                                      !leadCaptureData?.isMobileVerified || isSubmitting
                                    }
                                  >
                                    {maxSteps - 2 === activeStep ? (
                                      isSubmitting ? (
                                        <CircularProgress
                                          size={20}
                                          color="inherit"
                                        />
                                      ) : (
                                        <>Submit</>
                                      )
                                    ) : (
                                      <>
                                        {t("common.next")} &nbsp;{" "}
                                        {/* <ArrowRight
                                          style={{
                                            width: "16px",
                                            height: "16px",
                                            color: theme.palette.primary.contrastText,
                                            fill: theme.palette.primary.contrastText,
                                          }}
                                        /> */}
                                      </>
                                    )}
                                  </Button>
                                </>
                              ) : control.controllerName.includes(
                                  "PROJECT_TYPES"
                                ) ? (
                                <>
                                  <Button
                                    variant="contained"
                                    sx={(theme) => ({
                                      backgroundColor:
                                        theme.palette.primary.dark,
                                      width: {
                                        xs: "85px",
                                        sm: "150px",
                                      },
                                      alignItems: "center",
                                    })}
                                    onClick={() => {
                                      if (leadCaptureData?.projectType) {
                                        handleNextStep();
                                      }
                                    }}
                                    disabled={
                                      !leadCaptureData?.projectType || isSubmitting
                                    }
                                  >
                                    {maxSteps - 2 === activeStep ? (
                                      isSubmitting ? (
                                        <CircularProgress
                                          size={20}
                                          color="inherit"
                                        />
                                      ) : (
                                        <>Submit</>
                                      )
                                    ) : (
                                      <>
                                        {t("common.next")} &nbsp;{" "}
                                        {/* <ArrowRight
                                          style={{
                                            width: "16px",
                                            height: "16px",
                                            color: theme.palette.primary.contrastText,
                                            fill: theme.palette.primary.contrastText,
                                          }}
                                        /> */}
                                      </>
                                    )}
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="contained"
                                    sx={(theme) => ({
                                      backgroundColor:
                                        theme.palette.primary.dark,
                                      width: {
                                        xs: "85px",
                                        sm: "150px",
                                      },
                                    })}
                                    onClick={() => {
                                      if (maxSteps - 2 === activeStep) {
                                        updateData(leadCaptureData);
                                      } else {
                                        handleNextStep();
                                      }
                                    }}
                                    disabled={
                                      activeStep === maxSteps - 1 ||
                                      isSubmitting
                                    }
                                  >
                                    {maxSteps - 2 === activeStep ? (
                                      isSubmitting ? (
                                        <CircularProgress
                                          size={20}
                                          color="inherit"
                                        />
                                      ) : (
                                        <> {t("common.submit")} </>
                                      )
                                    ) : (
                                      <>
                                        {t("common.next")} &nbsp;{" "}
                                        {/* <ArrowRight
                                          style={{
                                            width: "16px",
                                            height: "16px",
                                            color: theme.palette.primary.dark,
                                            fill: theme.palette.primary.dark,
                                          }}
                                        /> */}
                                      </>
                                    )}
                                  </Button>
                                </>
                              )}
                            </div>
                            <Box
                              style={{
                                marginRight: isSmallDevice ? "" : "50px",
                                marginBottom: "40px",
                                marginTop: isSmallDevice ? "30px" : "0px",
                                position: isSmallDevice
                                  ? "initial"
                                  : "absolute",
                                bottom: "0",
                                right: "0",
                              }}
                              sx={{
                                width: {
                                  xs: "85px",
                                  sm: "150px ",
                                },
                              }}
                            >
                              <CustomCircularProgressbar
                                maxStep={maxSteps - 2}
                                value={activeStep.toString()}
                              />
                            </Box>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )
            )}
          {/* </SwipeableViews> */}
          {/* <div className="text-center">
          <span>
            {"Questions"}
            {`${activeStep + 1}`}
            {"/"}
            {`${maxSteps}`}
          </span>
        </div> */}
          {/* <MobileStepper
          sx={{
            "& .MuiMobileStepper-progress": {
              height: "10px !important",
              borderRadius: "10px !important",
              backgroundColor: "rgb(233 233 233)",
            },
            "& .MuiLinearProgress-bar": {
              background:
                "linear-gradient(90deg, rgb(74 192 255) 5%, rgb(25 118 210) 100%)!important",
              borderRadius: "10px !important",
            },
          }}
          variant="progress"
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          backButton={
            <Button
              size="small"
              variant="outlined"
              onClick={handlePrevStep}
              disabled={activeStep === 0}
            >
              {"< Previous"}
            </Button>
          }
          nextButton={
            <Button
              size="small"
              variant="outlined"
              onClick={handleNextStep}
              disabled={activeStep === maxSteps - 1}
            >
              {"Next > "}
            </Button>
          }
        /> */}
        </div>
      </LoadScript>
    </div>
  );
};

export default CustomLeadCapture;
