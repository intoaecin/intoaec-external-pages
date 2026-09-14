import { RenderDateAndTime } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderDateAndTime";
import { RenderDropDownMulti } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderDropDownMulti";
import { RenderDropDownSingle } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderDropDownSingle";
import { RenderEmail } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderEmail";
import { RenderForm } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderForm";
import { RenderMatrixChoiceMulti } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderMatrixChoiceMulti";
import { RenderMatrixChoiceSingle } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderMatrixChoiceSingle";
import { RenderPhoneNumber } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderPhoneNumber";
import { RenderRadio } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderRadio";
import { RenderSliderScale } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderSliderScale";
import { RenderTextLong } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderTextLong";
import { RenderTextShort } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderTextShort";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { LeadQuestionnaireCaptureContactCard } from "@/features/questionnaireCapture/QuestionnaireContactCard";
import {
  Box,
  Button,
  Grid,
  MobileStepper,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import SwipeableViews from "react-swipeable-views";
import { toast } from "react-toastify";
import { RenderAddImage } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderAddImage";
import { RenderCheckBox } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderCheckBox";
import { RenderFileUpload } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderFileUpload";
import { RenderMatrixDropdown } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderMatrixDropdown";
import { RenderMatrixRatingScaleSingle } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderMatrixRatingScale";
import { RenderRatingScale } from "@/features/components/controller/Questionnaire/ControllerRenderers/RenderRatingScale";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/features/components/LanguageSwitcher";
import { getQuestionKey } from "@/utils/helpers";
import { LoadingButton } from "@mui/lab";
const AnswerQuestionnaire = ({ answeredQuestionnaire, isPreview = false }: { answeredQuestionnaire: any; isPreview?: boolean }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [content, setContent] = useState<any[]>(answeredQuestionnaire?.content ?? []);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { NEXT_PUBLIC_PROPOSAL_ENDPOINT } = useEnv();
  const { post } = useAxios(NEXT_PUBLIC_PROPOSAL_ENDPOINT + "/answer", false);

  useEffect(() => {
    setContent(answeredQuestionnaire?.content ?? []);
    setActiveStep(0);
  }, [answeredQuestionnaire]);

  const answerQuestionnaireByUser = async () => {
    if (!checkAllRequiredQuestionsAnswered(content, activeStep)) {
      toast.error(t("toast.thisQuestionIsCompulsory"));
      return;
    }
    setLoading(true);
    try {
      const data = await post({
        eventType: "ANSWER_QUESTIONNAIRE",
        ...answeredQuestionnaire,
        content,
        submittedBy: answeredQuestionnaire?.entityId,
        submittedByType: "USER",
      });
      if (data?.code === "ANSWER_QUESTIONNAIRE_SUCCESSFUL") {
        toast.success(data?.message ?? t("toast.questionnaireAnsweredSuccessfully"));
        window.location.reload();
      } else {
        toast.error(data?.error?.message ?? data?.message ?? t("questionnaire.invalidLinkTitle"));
      }
    } catch {
      toast.error(t("questionnaire.invalidLinkTitle"));
    } finally {
      setLoading(false);
    }
  };

  const handleStepChange = (step: number) => {
    setActiveStep((currentStep) => {
      if (step <= currentStep) {
        return step;
      } else {
        const allQuestionsAnswered = checkAllRequiredQuestionsAnswered(
          content,
          currentStep
        );
        if (allQuestionsAnswered) {
          return step;
        } else {
          toast.error(t("toast.thisQuestionIsCompulsory"));
          return currentStep;
        }
      }
    });
  };

  const checkAllRequiredQuestionsAnswered = (
    content: any[],
    activeStep: number
  ) => {
    return content?.[activeStep]?.questions?.every((control: any) => {
      if (control?.isRequired) {
        let answered;
        switch (control.controlerName) {
          case "CHECK_BOX":
            answered = control?.options?.some(
              (val: any) => val?.isSelected === true
            );
            break;
          case "RADIO_BUTTON":
            answered = control?.options?.some(
              (val: any) => val?.isSelected === true
            );
            break;
          case "DROPDOWN_SINGLE":
            answered = control?.options?.some(
              (val: any) => val?.isSelected === true
            );
            break;
          case "ADD_IMAGE":
            answered = control?.options?.some(
              (val: any) => val?.isSelected === true
            );
            break;
          case "DROPDOWN_MULTI":
            answered = control?.options?.some(
              (val: any) => val?.isSelected === true
            );
            break;
          case "SHORT_ANSWER":
            answered = control?.value ? true : false;
            break;
          case "LONG_ANSWER":
            answered = control?.value ? true : false;
            break;
          case "EMAIL":
            answered = control?.value ? true : false;
            break;
          case "SLIDER_SCALE":
            answered = control?.value ? true : false;
            break;
          case "PHONE_NUMBER":
            answered = control?.value ? true : false;
            break;
          case "DATE_AND_TIME":
            answered = control?.value ? true : false;
            break;
          case "MATRIX_CHOICE_SINGLE":
          case "MATRIX_RATING_SCALE":
            answered = control?.options?.rowLabel?.some((val: any) =>
              val?.columnSelected?.some((val: any) => val?.isSelected === true)
            );
            break;
          case "MATRIX_DROPDOWN":
            answered = control?.options?.rowLabel?.some((val: any) =>
              val?.columnSelected?.some((val: any) => !!val?.value)
            );
            break;
          case "MATRIX_CHOICE_MULTI":
            answered = control?.options?.rowLabel?.some((val: any) =>
              val?.columnSelected?.some((val: any) => val?.isSelected === true)
            );
            break;
          case "RATING_SCALE":
            answered = control?.options?.choices?.some(
              (val: any) => val?.isSelected === true
            );
            break;
          case "FILE_UPLOAD":
            answered = control?.options?.some((val: any) => !!val?.url);
            break;
          default:
            answered = false;
            break;
        }
        return answered;
      } else {
        return true;
      }
    });
  };
  const { push } = useRouter();
  const router = useRouter();
  const { questionnaireId } = router.query;
  const handleNextStep = () => {
    setActiveStep((prevStep) => {
      const allQuestionsAnswered = !isPreview
        ? checkAllRequiredQuestionsAnswered(content, prevStep)
        : true;
      if (allQuestionsAnswered) {
        // const nextQuestion = activeStep + 2 ;
        push(
          {
            pathname: router?.pathname,
            query: {
              ...router?.query,
              question: activeStep + 2,
            },
          }
        );
        return prevStep + 1;
      } else {
        return prevStep;
      }
    });
  };

  const handlePrevStep = () => {
    push({
      pathname: router?.pathname,
      query: {
        ...router?.query,
        question: activeStep,
      },
    });
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleisSelectedForMultipleOptions = (
    pageIndex: number,
    questionIndex: number,
    optionIndex: number,
    value: any,
    other?: any
  ) => {
    setContent((prev) => {
      let currentOption;
      if (
        optionIndex ==
        prev?.[pageIndex]?.questions?.[questionIndex]?.options?.length
      ) {
        currentOption = prev?.[pageIndex]?.questions?.[questionIndex]?.options;
        currentOption.push({
          isOther: true,
          value: other?.value,
          isSelected: true,
        });
      } else {
        currentOption = prev?.[pageIndex]?.questions?.[
          questionIndex
        ]?.options?.map((val: any, currentOptionIndex: number) => {
          if (currentOptionIndex == optionIndex) {
            const otherObject = other
              ? {
                  value: other?.value ?? undefined,
                  isSelected: other?.value ? value : false,
                  isOther: true,
                }
              : {};
            return {
              ...val,
              isSelected: value,
              ...otherObject,
            };
          } else {
            return val;
          }
        });
      }

      return [
        ...prev?.slice(0, pageIndex),
        {
          ...prev?.[pageIndex],
          questions: [
            ...prev?.[pageIndex]?.questions?.slice(0, questionIndex),
            {
              ...prev?.[pageIndex]?.questions?.[questionIndex],
              options: currentOption,
            },
            ...prev?.[pageIndex]?.questions?.slice(questionIndex + 1),
          ],
        },
        ...prev?.slice(pageIndex + 1),
      ];
    });
  };

  const handleisSelectedForMultipleMatrix = (
    pageIndex: number,
    questionIndex: number,
    columnIndex: number,
    rowIndex: number,
    value: any,
    other?: any
  ) => {
    setContent((prev) => {
      let currentValue;

      if (
        prev?.[pageIndex]?.questions?.[questionIndex]?.options?.rowLabel?.[
          rowIndex
        ]?.columnSelected == undefined
      ) {
        prev[pageIndex].questions[questionIndex].options.rowLabel[
          rowIndex
        ].columnSelected = [
          ...prev?.[pageIndex]?.questions?.[questionIndex]?.options
            ?.columnLabel,
        ];
      }
      if (
        columnIndex ==
        prev?.[pageIndex]?.questions?.[questionIndex]?.options?.rowLabel?.[
          rowIndex
        ]?.columnSelected?.length
      ) {
        currentValue =
          prev?.[pageIndex]?.questions?.[questionIndex]?.options?.rowLabel?.[
            rowIndex
          ]?.columnSelected;
        currentValue.push({
          isOther: true,
          value: other?.value ?? undefined,
          isSelected: value,
        });
      } else {
        currentValue = prev?.[pageIndex]?.questions?.[
          questionIndex
        ]?.options?.rowLabel?.[rowIndex]?.columnSelected?.map(
          (val: any, columnSelectedIndex: number) => {
            if (columnSelectedIndex == columnIndex) {
              const otherObject = other
                ? {
                    value: other?.value ?? undefined,
                    isOther: true,
                    isSelected: other?.value ? value : false,
                  }
                : {};

              return {
                ...val,
                isSelected: value,
                ...otherObject,
              };
            } else {
              return val;
            }
          }
        );
      }
      return [
        ...prev?.slice(0, pageIndex),
        {
          ...prev?.[pageIndex],
          questions: [
            ...prev?.[pageIndex]?.questions?.slice(0, questionIndex),
            {
              ...prev?.[pageIndex]?.questions?.[questionIndex],
              options: {
                ...prev?.[pageIndex]?.questions?.[questionIndex]?.options,
                rowLabel: [
                  ...prev?.[pageIndex]?.questions?.[
                    questionIndex
                  ]?.options?.rowLabel?.slice(0, rowIndex),
                  {
                    ...prev?.[pageIndex]?.questions?.[questionIndex]?.options
                      ?.rowLabel?.[rowIndex],
                    columnSelected: currentValue,
                  },
                  ...prev?.[pageIndex]?.questions?.[
                    questionIndex
                  ]?.options?.rowLabel?.slice(rowIndex + 1),
                ],
              },
            },
            ...prev?.[pageIndex]?.questions?.slice(questionIndex + 1),
          ],
        },
        ...prev?.slice(pageIndex + 1),
      ];
    });
  };
  const handleisSelectedForSingleMatrix = (
    pageIndex: number,
    questionIndex: number,
    columnIndex: number,
    rowIndex: number,
    value: any,
    other?: any
  ) => {
    setContent((prev) => {
      let currentValue;
      if (
        prev?.[pageIndex]?.questions?.[questionIndex]?.options?.rowLabel?.[
          rowIndex
        ]?.columnSelected == undefined
      ) {
        prev[pageIndex].questions[questionIndex].options.rowLabel[
          rowIndex
        ].columnSelected = [
          ...prev?.[pageIndex]?.questions?.[questionIndex]?.options
            ?.columnLabel,
        ];
      }
      if (
        columnIndex ==
        prev?.[pageIndex]?.questions?.[questionIndex]?.options?.rowLabel?.[
          rowIndex
        ]?.columnSelected?.length
      ) {
        currentValue = prev?.[pageIndex]?.questions?.[
          questionIndex
        ]?.options?.rowLabel?.[rowIndex]?.columnSelected.map((val: any) => ({
          ...val,
          isSelected: false,
        }));
        currentValue.push({
          isOther: true,
          value: other?.value ?? undefined,
          isSelected: other?.value ? value : false,
        });
      } else {
        currentValue = prev?.[pageIndex]?.questions?.[
          questionIndex
        ]?.options?.rowLabel?.[rowIndex]?.columnSelected?.map(
          (val: any, columnSelectedIndex: number) => {
            if (columnSelectedIndex == columnIndex) {
              const otherObject = other
                ? {
                    value: other?.value ?? undefined,
                    isOther: true,
                    isSelected: other?.value ? value : false,
                  }
                : {};
              return {
                ...val,
                isSelected: value,
                ...otherObject,
              };
            } else {
              return {
                ...val,
                isSelected: false,
              };
            }
          }
        );
      }

      return [
        ...prev?.slice(0, pageIndex),
        {
          ...prev?.[pageIndex],
          questions: [
            ...prev?.[pageIndex]?.questions?.slice(0, questionIndex),
            {
              ...prev?.[pageIndex]?.questions?.[questionIndex],
              options: {
                ...prev?.[pageIndex]?.questions?.[questionIndex]?.options,
                rowLabel: [
                  ...prev?.[pageIndex]?.questions?.[
                    questionIndex
                  ]?.options?.rowLabel?.slice(0, rowIndex),
                  {
                    ...prev?.[pageIndex]?.questions?.[questionIndex]?.options
                      ?.rowLabel?.[rowIndex],
                    columnSelected: currentValue,
                  },
                  ...prev?.[pageIndex]?.questions?.[
                    questionIndex
                  ]?.options?.rowLabel?.slice(rowIndex + 1),
                ],
              },
            },
            ...prev?.[pageIndex]?.questions?.slice(questionIndex + 1),
          ],
        },
        ...prev?.slice(pageIndex + 1),
      ];
    });
  };

  const handleisSelectedForSingleOption = (
    pageIndex: number,
    questionIndex: number,
    optionIndex: number,
    other?: any
  ) => {
    setContent((prev) => {
      let currentOption;
      if (
        optionIndex ==
        prev?.[pageIndex]?.questions?.[questionIndex]?.options?.length
      ) {
        currentOption = prev?.[pageIndex]?.questions?.[
          questionIndex
        ]?.options?.map((val: any) => ({ ...val, isSelected: false }));

        currentOption.push({
          isOther: true,
          value: other?.value,
          isSelected: true,
        });
      } else {
        currentOption = prev?.[pageIndex]?.questions?.[
          questionIndex
        ]?.options?.map((val: any, currentOptionIndex: number) => {
          if (currentOptionIndex == optionIndex) {
            const otherObject = other
              ? {
                  value: other?.value ?? undefined,
                  isSelected: other?.value ? true : false,
                  isOther: true,
                }
              : {};
            return {
              ...val,
              isSelected: true,
              ...otherObject,
            };
          } else {
            return {
              ...val,
              isSelected: false,
            };
          }
        });
      }
      return [
        ...prev?.slice(0, pageIndex),
        {
          ...prev?.[pageIndex],
          questions: [
            ...prev?.[pageIndex]?.questions?.slice(0, questionIndex),
            {
              ...prev?.[pageIndex]?.questions?.[questionIndex],
              options: currentOption,
            },
            ...prev?.[pageIndex]?.questions?.slice(questionIndex + 1),
          ],
        },
        ...prev?.slice(pageIndex + 1),
      ];
    });
  };

  const handleAnswerValue = (
    pageIndex: number,
    questionIndex: number,
    value: any
  ) => {
    setContent((prev) => [
      ...prev?.slice(0, pageIndex),
      {
        ...prev?.[pageIndex],
        questions: [
          ...prev?.[pageIndex]?.questions?.slice(0, questionIndex),
          {
            ...prev?.[pageIndex]?.questions?.[questionIndex],
            value,
          },
          ...prev?.[pageIndex]?.questions?.slice(questionIndex + 1),
        ],
      },
      ...prev?.slice(pageIndex + 1),
    ]);
  };

  const renderControlElement = (
    control: any,
    pageIndex: number,
    questionIndex: number,
    isPreview?: boolean
  ) => {
    switch (control.controlerName) {
      case "CHECK_BOX":
        return (
          <RenderCheckBox
            onChange={(value) => {
              setContent((prev) => [
                ...prev?.slice(0, pageIndex),
                {
                  ...prev?.[pageIndex],
                  questions: [
                    ...prev?.[pageIndex]?.questions?.slice(0, questionIndex),
                    {
                      ...value,
                    },
                    ...prev?.[pageIndex]?.questions?.slice(questionIndex + 1),
                  ],
                },
                ...prev?.slice(pageIndex + 1),
              ]);
            }}
            isAnswer={!isPreview}
            control={control}
          />
        );
      case "RADIO_BUTTON":
        return (
          <RenderRadio
            onChange={(value) => {
              setContent((prev) => [
                ...prev?.slice(0, pageIndex),
                {
                  ...prev?.[pageIndex],
                  questions: [
                    ...prev?.[pageIndex]?.questions?.slice(0, questionIndex),
                    {
                      ...value,
                    },
                    ...prev?.[pageIndex]?.questions?.slice(questionIndex + 1),
                  ],
                },
                ...prev?.slice(pageIndex + 1),
              ]);
            }}
            isAnswer={!isPreview}
            control={control}
          />
        );
      case "DROPDOWN_SINGLE":
        return (
          <RenderDropDownSingle
            onChange={(e, value, optionIndex) => {
              handleisSelectedForSingleOption(
                pageIndex,
                questionIndex,
                optionIndex
              );
            }}
            isAnswer={!isPreview}
            control={control}
          />
        );
      case "DROPDOWN_MULTI":
        return (
          <RenderDropDownMulti
            onChange={(optionIndex, value) => {
              handleisSelectedForMultipleOptions(
                pageIndex,
                questionIndex,
                optionIndex,
                value
              );
            }}
            isAnswer={!isPreview}
            control={control}
          />
        );
      case "SHORT_ANSWER":
        return (
          <RenderTextShort
            control={control}
            onChange={(e) => {
              handleAnswerValue(pageIndex, questionIndex, e.target.value);
            }}
            isAnswer={!isPreview}
          />
        );
      case "LONG_ANSWER":
        return (
          <RenderTextLong
            control={control}
            onChange={(e) => {
              handleAnswerValue(pageIndex, questionIndex, e.target.value);
            }}
            isAnswer={!isPreview}
          />
        );
      case "EMAIL":
        return (
          <RenderEmail
            control={control}
            onChange={(value) => {
              handleAnswerValue(pageIndex, questionIndex, value);
            }}
            isAnswer={!isPreview}
          />
        );
      case "SLIDER_SCALE":
        return (
          <RenderSliderScale
            onChange={(e, value) => {
              handleAnswerValue(pageIndex, questionIndex, value);
            }}
            isAnswer={!isPreview}
            control={control}
          />
        );
      case "FORM":
        return <RenderForm isAnswer={true} control={control} />;
      case "PHONE_NUMBER":
        return (
          <RenderPhoneNumber
            onChange={(value) => {
              handleAnswerValue(pageIndex, questionIndex, value);
            }}
            isAnswer={!isPreview}
            control={control}
          />
        );
      case "DATE_AND_TIME":
        return (
          <RenderDateAndTime
            onChange={(e) => {
              handleAnswerValue(pageIndex, questionIndex, e.toDate().getTime());
            }}
            isAnswer={!isPreview}
            control={control}
          />
        );
      case "MATRIX_CHOICE_SINGLE":
        return (
          <RenderMatrixChoiceSingle
            onChange={(rowIndex, columnIndex, value, other) => {
              handleisSelectedForSingleMatrix(
                pageIndex,
                questionIndex,
                columnIndex,
                rowIndex,
                value,
                other
              );
            }}
            isAnswer={!isPreview}
            control={control}
          />
        );
      case "MATRIX_CHOICE_MULTI":
        return (
          <RenderMatrixChoiceMulti
            onChange={(rowIndex, columnIndex, value, other) => {
              handleisSelectedForMultipleMatrix(
                pageIndex,
                questionIndex,
                columnIndex,
                rowIndex,
                value,
                other
              );
            }}
            isAnswer={!isPreview}
            control={control}
          />
        );
      case "ADD_IMAGE":
        return (
          <RenderAddImage
            organizationId={answeredQuestionnaire?.organizationId}
            organizationType={answeredQuestionnaire?.organizationType}
            questionnaireId={answeredQuestionnaire?.questionnaireId}
            pageId={answeredQuestionnaire?.content?.[pageIndex]?.pageId}
            onChange={(value) => {
              setContent((prev) => [
                ...prev?.slice(0, pageIndex),
                {
                  ...prev?.[pageIndex],
                  questions: [
                    ...prev?.[pageIndex]?.questions?.slice(0, questionIndex),
                    {
                      ...value,
                    },
                    ...prev?.[pageIndex]?.questions?.slice(questionIndex + 1),
                  ],
                },
                ...prev?.slice(pageIndex + 1),
              ]);
            }}
            isAnswer={!isPreview}
            control={control}
          />
        );
      case "FILE_UPLOAD":
        return (
          <RenderFileUpload
            organizationId={answeredQuestionnaire?.organizationId}
            organizationType={answeredQuestionnaire?.organizationType}
            questionnaireId={answeredQuestionnaire?.questionnaireId}
            pageId={answeredQuestionnaire?.content?.[pageIndex]?.pageId}
            onChange={(value) => {
              setContent((prev) => [
                ...prev?.slice(0, pageIndex),
                {
                  ...prev?.[pageIndex],
                  questions: [
                    ...prev?.[pageIndex]?.questions?.slice(0, questionIndex),
                    {
                      ...value,
                    },
                    ...prev?.[pageIndex]?.questions?.slice(questionIndex + 1),
                  ],
                },
                ...prev?.slice(pageIndex + 1),
              ]);
            }}
            isAnswer={!isPreview}
            control={control}
          />
        );
      case "RATING_SCALE":
        return (
          <RenderRatingScale
            isAnswer={!isPreview}
            pageIndex={pageIndex}
            onChange={(value) => {
              setContent((prev) => [
                ...prev?.slice(0, pageIndex),
                {
                  ...prev?.[pageIndex],
                  questions: [
                    ...prev?.[pageIndex]?.questions?.slice(0, questionIndex),
                    {
                      ...value,
                    },
                    ...prev?.[pageIndex]?.questions?.slice(questionIndex + 1),
                  ],
                },
                ...prev?.slice(pageIndex + 1),
              ]);
            }}
            control={control}
          />
        );
      case "MATRIX_DROPDOWN":
        return (
          <RenderMatrixDropdown
            control={control}
            isAnswer={!isPreview}
            onChange={(value) => {
              setContent((prev) => [
                ...prev?.slice(0, pageIndex),
                {
                  ...prev?.[pageIndex],
                  questions: [
                    ...prev?.[pageIndex]?.questions?.slice(0, questionIndex),
                    {
                      ...value,
                    },
                    ...prev?.[pageIndex]?.questions?.slice(questionIndex + 1),
                  ],
                },
                ...prev?.slice(pageIndex + 1),
              ]);
            }}
          />
        );
      case "MATRIX_RATING_SCALE":
        return (
          <RenderMatrixRatingScaleSingle
            control={control}
            isAnswer={!isPreview}
            onChange={(rowIndex, columnIndex, value, other) => {
              handleisSelectedForSingleMatrix(
                pageIndex,
                questionIndex,
                columnIndex,
                rowIndex,
                value,
                other
              );
            }}
          />
        );
      default:
        return <></>;
    }
  };

  const maxSteps = content?.length;

  const getRedirectQuery = router.query.redirect;

  return (
    <div className="container questionnaireUI ">
      <div className="row justify-content-start reverse-sm">
        <LeadQuestionnaireCaptureContactCard
          activeStep={activeStep}
          maxSteps={maxSteps}
          handleNextStep={handleNextStep}
          handlePrevStep={handlePrevStep}
        />

        <div className="col-lg-8 col-md-8 col-sm-12 row justify-content-center pt-lg-5 pt-sm-1 mt-lg-5 mt-sm-0">
          {getRedirectQuery && getRedirectQuery !== "" && (
            <Button
              sx={{ position: "absolute", top: "10px", right: "80px" }}
              onClick={() => {
                router.push(getRedirectQuery as string);
              }}
              variant="contained"
            >
              {t("common.backToPortal")}
            </Button>
          )}
          <Box
            className="col-lg-10 col-md-10 col-sm-12   m-5 mt-5"
            style={{
              borderRadius: "4px",
              boxShadow: "rgb(33 33 33 / 18%) -1px 1px 9px 4px",
              height: "fit-content",
            }}
          >
            <Box
              sx={
                {
                  // marginBlock:{
                  //   xs:".5rem",
                  //   sm:0
                  // },
                }
              }
            >
              <Paper
                style={{
                  boxShadow: "rgb(0 0 0 / 14%) 0px 0px 18px 0px",
                }}
              >
                <SwipeableViews
                  axis="x"
                  index={activeStep}
                  onSwitching={(index, type) => {
                    if (type == "end") {
                      handleStepChange(index);
                    }
                  }}
                  enableMouseEvents
                  className="pt-3"
                  disabled={true}
                  style={{ overflow: "hidden" }}
                >
                  {content?.map((page: any, pageIndex: number) => (
                    <div key={pageIndex + "-preview"} className="px-3">
                      <Typography variant="h6" className="pt-2  ">
                        <Typography
                          variant="h6"
                          component={"span"}
                          sx={{
                            display: {
                              xs: "span",
                              sm: "none",
                            },
                          }}
                        >
                          {t("questionnaire.questionnaireContactCard.questions")}
                        </Typography>{" "}
                        {page?.pageName}
                      </Typography>

                      {page?.questions
                        ?.filter((val: any) => !val?.isForm)
                        ?.map((control: any, questionIndex: number) => (
                          <div key={questionIndex} className="ml-1 pb-5">
                            <div className="my-2"></div>

                            <div
                              className="mb-2"
                              style={{
                                fontSize: "16px",
                                fontWeight: "500  ",
                              }}
                            >
                              {activeStep + 1}
                              {". "}
                              {/* {control.question}{" "} */}
                              {t(
                                `leadCapture.questions.${getQuestionKey(
                                  control.question
                                )}`,
                                {
                                  defaultValue: control.question,
                                }
                              )}
                              {control.isRequired && (
                                <span className="requiredUI"> *</span>
                              )}
                            </div>
                            <div
                              className="controllerComponent"
                              style={{
                                pointerEvents:
                                  isPreview &&
                                  control.controlerName !== "FILE_UPLOAD"
                                    ? "none"
                                    : "auto",
                              }}
                            >
                              {renderControlElement(
                                control,
                                pageIndex,
                                questionIndex,
                                isPreview
                              )}
                            </div>
                            <div
                              className="controllerComponent"
                              style={{
                                pointerEvents: isPreview ? "none" : "auto",
                              }}
                            >
                              {control.isOtherEnabled === true &&
                                !(
                                  control.controlerName.includes("MATRIX") ||
                                  control.controlerName.includes("IMAGE")
                                ) && (
                                  <div>
                                    <TextField
                                      value={
                                        control?.options?.find(
                                          (option: any) => option.isOther
                                        )?.value
                                      }
                                      onChange={(e) => {
                                        if (
                                          control?.controlerName ===
                                            "CHECK_BOX" ||
                                          control?.controlerName ===
                                            "DROPDOWN_MULTI"
                                        ) {
                                          handleisSelectedForMultipleOptions(
                                            pageIndex,
                                            questionIndex,
                                            control?.options[
                                              control?.options?.length - 1
                                            ]?.isOther
                                              ? control?.options?.length - 1
                                              : control?.options?.length,
                                            true,
                                            { value: e?.target?.value }
                                          );
                                        } else if (
                                          control?.controlerName ===
                                            "RADIO_BUTTON" ||
                                          control?.controlerName ===
                                            "DROPDOWN_SINGLE"
                                        ) {
                                          handleisSelectedForSingleOption(
                                            pageIndex,
                                            questionIndex,
                                            control?.options[
                                              control?.options?.length - 1
                                            ]?.isOther
                                              ? control?.options?.length - 1
                                              : control?.options?.length,
                                            { value: e?.target?.value }
                                          );
                                        }
                                      }}
                                      placeholder={t("common.other")}
                                    />
                                  </div>
                                )}
                            </div>
                          </div>
                        ))}

                      <Grid
                        container
                        columns={2}
                        className="mt-5 px-1"
                        columnSpacing={2}
                      >
                        {page?.questions
                          ?.filter((val: any) => val?.isForm)
                          ?.map(
                            (control: any, questionIndex: number) =>
                              control?.isEnabled && (
                                <Grid
                                  item
                                  key={questionIndex}
                                  md={1}
                                  className="pb-5"
                                >
                                  <div
                                    className="controllerComponent"
                                    style={{
                                      pointerEvents:
                                        isPreview &&
                                        control.controlerName !== "FILE_UPLOAD"
                                          ? "none"
                                          : "auto",
                                    }}
                                  >
                                    <RenderForm
                                      isAnswer={true}
                                      onChange={(e) => {
                                        handleAnswerValue(
                                          pageIndex,
                                          questionIndex,
                                          e.target.value
                                        );
                                      }}
                                      control={control}
                                    />
                                  </div>
                                  <div>
                                    {control.isOtherEnabled === true &&
                                      !(
                                        control.controlerName.includes(
                                          "MATRIX"
                                        ) ||
                                        control.controlerName.includes("IMAGE")
                                      ) && (
                                        <div>
                                          <TextField
                                            placeholder={t("common.other")}
                                          />
                                        </div>
                                      )}
                                  </div>
                                </Grid>
                              )
                          )}
                      </Grid>
                    </div>
                  ))}
                </SwipeableViews>

                <MobileStepper
                  className="justify-content-center pb-3"
                  sx={{
                    "& .MuiMobileStepper-progress": {
                      display: "none",
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
                      className="mr-2"
                      disabled={activeStep === 0}
                    >
                      {t("questionnaire.questionnaireContactCard.previous")}{" "}
                      {"<"}
                    </Button>
                  }
                  nextButton={
                    <LoadingButton
                      size="small"
                      variant="contained"
                      loading={loading}
                      type={activeStep === maxSteps - 1 ? "submit" : "button"}
                      onClick={async () => {
                        if (activeStep === maxSteps - 1) {
                          if (!isPreview) await answerQuestionnaireByUser();
                        } else {
                          handleNextStep();
                        }
                      }}
                      disabled={
                        !isPreview
                          ? !checkAllRequiredQuestionsAnswered(
                              content,
                              activeStep
                            )
                          : activeStep === maxSteps - 1
                          ? true
                          : false
                      }
                    >
                      {activeStep === maxSteps - 1
                        ? t("common.submit")
                        : t("questionnaire.questionnaireContactCard.next")}{" "}
                      {">"}
                    </LoadingButton>
                  }
                />
              </Paper>
            </Box>
            {!isPreview && (
              <div style={{ position: "absolute", top: "12px", right: "45px" }}>
                <LanguageSwitcher />
              </div>
            )}
          </Box>
        </div>
      </div>

    </div>
  );
};

export default AnswerQuestionnaire;
