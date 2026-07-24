import { LeadCaptureStore } from "@/lib/leadCapture/leadCaptureStore";
import { Box, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { getStepFlowLabel } from "../../leadCaptureV2StepFlowConfig";
import type { LeadCaptureV2FormField } from "../leadCaptureV2LayoutConfig";
import { useProjectTypesQuery } from "@/features/hooks/api/useProjectTypesQuery";
import LeadCaptureV2CustomerPreviewContentColumn from "./LeadCaptureV2CustomerPreviewContentColumn";
import LeadCaptureV2CustomerPreviewFieldsPanel from "./LeadCaptureV2CustomerPreviewFieldsPanel";
import LeadCaptureV2CustomerPreviewFooter from "./LeadCaptureV2CustomerPreviewFooter";
import LeadCaptureV2CustomerPreviewServiceGrid from "./LeadCaptureV2CustomerPreviewServiceGrid";
import LeadCaptureV2CustomerPreviewSlotSetup from "./LeadCaptureV2CustomerPreviewSlotSetup";
import LeadCaptureV2CustomerPreviewStepper from "./LeadCaptureV2CustomerPreviewStepper";
import LeadCaptureV2CustomerPreviewThankYou from "./LeadCaptureV2CustomerPreviewThankYou";
import LeadCaptureV2CustomerPreviewWelcome from "./LeadCaptureV2CustomerPreviewWelcome";
import type {
  LeadCaptureV2CustomerPreviewProps,
  LeadCaptureV2PreviewAnswer,
} from "./leadCaptureV2CustomerPreviewTypes";
import { leadCaptureV2PreviewPageColumnSx } from "./leadCaptureV2CustomerPreviewLayout";
import { normalizeLeadCaptureV2DimensionUnit } from "../../leadCaptureV2DimensionUnits";
import {
  areLeadCaptureV2PreviewFieldsComplete,
  buildPreviewPages,
  buildSelectedServiceFieldGroups,
  flattenServiceFieldGroups,
  getPreviewServiceName,
  getPreviewServiceTagline,
  getPreviewStepperIndex,
  getPreviewStepperItems,
} from "./leadCaptureV2CustomerPreviewUtils";

const LeadCaptureV2CustomerPreview = ({
  fields,
  formDescription,
  formName,
  formType,
  formTitle,
  services,
  serviceFieldsByServiceId,
  stepFlowConfig,
  organizationId,
  organizationType,
  leadCaptureV2Id,
  onBeforeThankYou,
  isContinueLoading = false,
  isExternalPage = false,
}: LeadCaptureV2CustomerPreviewProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const emailParam = router.query.email;
  const phoneParam = router.query.phone;
  const { data: projectTypes = [], isLoading: isLoadingProjectTypes } =
    useProjectTypesQuery({
      organizationId,
      organizationType,
    });
  const [pageIndex, setPageIndex] = useState(0);
  const [serviceSubView, setServiceSubView] = useState<"list" | "questions">(
    "list"
  );
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<
    Record<string, LeadCaptureV2PreviewAnswer>
  >({});
  const [dimensionUnitsByFieldId, setDimensionUnitsByFieldId] = useState<
    Record<string, string>
  >({});
  const [verifiedFieldIds, setVerifiedFieldIds] = useState<Set<string>>(
    () => new Set(),
  );
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, [pageIndex, serviceSubView]);

  const { leadCaptureData } = LeadCaptureStore.useState();

  const previewTitle =
    formTitle.trim() ||
    formName?.trim() ||
    t("leadCaptureV2.customerPreview.title");
  const previewDescription = formDescription.trim();
  const showServicesOnWelcome = formType === "instant-proposal";
  const shouldCenterExternalStandalonePage =
    isExternalPage && !showServicesOnWelcome;

  const selectedService = selectedServiceIds[0]
    ? (services.find((service) => service.id === selectedServiceIds[0]) ?? null)
    : null;

  const selectedServiceFieldGroups = useMemo(
    () =>
      buildSelectedServiceFieldGroups(
        services,
        selectedServiceIds,
        serviceFieldsByServiceId,
      ),
    [services, selectedServiceIds, serviceFieldsByServiceId],
  );

  const selectedServiceFields = useMemo(
    () => flattenServiceFieldGroups(selectedServiceFieldGroups),
    [selectedServiceFieldGroups],
  );

  const detailFields = fields.filter((field) => field.enabled);

  const hasServiceQuestions =
    showServicesOnWelcome &&
    services.some((service) =>
      (serviceFieldsByServiceId[service.id] ?? []).some((field) => field.enabled),
    );

  const previewNavigationOptions = useMemo(
    () => ({
      formName: formName?.trim() || undefined,
      formType,
      servicesCount: services.length,
      detailFieldsCount: detailFields.length,
      hasServiceQuestions,
    }),
    [
      detailFields.length,
      formName,
      formType,
      hasServiceQuestions,
      services.length,
    ],
  );

  const previewPages = useMemo(
    () => buildPreviewPages(stepFlowConfig, previewNavigationOptions),
    [previewNavigationOptions, stepFlowConfig],
  );
  const stepperItems = useMemo(
    () => getPreviewStepperItems(stepFlowConfig, t, previewNavigationOptions),
    [previewNavigationOptions, stepFlowConfig, t],
  );
  const stepperSteps = useMemo(
    () => stepperItems.map((item) => item.stepKey),
    [stepperItems],
  );
  const currentPage = previewPages[pageIndex];
  const shouldFillExternalStandaloneBackground =
    shouldCenterExternalStandalonePage &&
    (currentPage?.type === "welcome" || currentPage?.type === "thankYou");
  const shouldShowServiceQuestionsOnWelcome =
    showServicesOnWelcome &&
    serviceSubView === "list" &&
    selectedServiceIds.length > 0 &&
    selectedServiceFields.length > 0;

  const serviceQuestionsTitle =
    formName?.trim() ||
    previewTitle ||
    getStepFlowLabel("leadCapture", stepFlowConfig, t, formType);

  const isWelcomeServiceQuestions =
    currentPage?.type === "welcome" &&
    showServicesOnWelcome &&
    serviceSubView === "questions";

  const handleWelcomeContinue = () => {
    if (shouldShowServiceQuestionsOnWelcome) {
      setServiceSubView("questions");
      return;
    }

    void goToPage(pageIndex + 1);
  };
  const activeStepperIndex = getPreviewStepperIndex(
    stepperSteps,
    previewPages,
    pageIndex,
    {
      isWelcomeServiceQuestions,
    },
  );

  useEffect(() => {
    const dimensionFields = [
      ...detailFields,
      ...selectedServiceFields,
      ...Object.values(serviceFieldsByServiceId).flat(),
    ].filter((field) => field.typeKey === "dimension");

    if (dimensionFields.length === 0) {
      return;
    }

    setDimensionUnitsByFieldId((currentUnits) => {
      const nextUnits = { ...currentUnits };
      let changed = false;

      dimensionFields.forEach((field) => {
        if (nextUnits[field.id]) return;
        nextUnits[field.id] = normalizeLeadCaptureV2DimensionUnit(field.unitType);
        changed = true;
      });

      return changed ? nextUnits : currentUnits;
    });
  }, [detailFields, selectedServiceFields, serviceFieldsByServiceId]);

  useEffect(() => {
    if (!emailParam && !phoneParam) return;

    setAnswers((prevAnswers) => {
      const nextAnswers = { ...prevAnswers };
      let changed = false;

      const allFields = [
        ...detailFields,
        ...selectedServiceFields,
        ...Object.values(serviceFieldsByServiceId).flat(),
      ];

      allFields.forEach((field) => {
        const typeKey = field.typeKey?.toLowerCase() || "";
        const fieldNameNorm = (field.title || field.labelKey || "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ");

        if (emailParam && !nextAnswers[field.id]) {
          const isEmail = typeKey === "email" || fieldNameNorm === "email" || fieldNameNorm === "email address";
          if (isEmail) {
            nextAnswers[field.id] = String(emailParam);
            changed = true;
          }
        }

        if (phoneParam && !nextAnswers[field.id]) {
          const isPhone = typeKey === "phone" || fieldNameNorm === "mobile" || fieldNameNorm === "mobile number" || fieldNameNorm === "phone" || fieldNameNorm === "phone number";
          if (isPhone) {
            nextAnswers[field.id] = String(phoneParam);
            changed = true;
          }
        }
      });

      return changed ? nextAnswers : prevAnswers;
    });
  }, [detailFields, selectedServiceFields, serviceFieldsByServiceId, emailParam, phoneParam]);

  useEffect(() => {
    setPageIndex((currentPageIndex) =>
      Math.min(currentPageIndex, Math.max(previewPages.length - 1, 0)),
    );
  }, [previewPages.length]);

  const selectedServiceRequiredFieldsComplete =
    !isExternalPage ||
    areLeadCaptureV2PreviewFieldsComplete(
      selectedServiceFields,
      answers,
      verifiedFieldIds,
    );
  const detailRequiredFieldsComplete =
    !isExternalPage ||
    areLeadCaptureV2PreviewFieldsComplete(
      detailFields,
      answers,
      verifiedFieldIds,
    );

  const currentRequiredFieldsComplete = (() => {
    if (!isExternalPage) return true;
    if (
      currentPage?.type === "welcome" &&
      showServicesOnWelcome &&
      serviceSubView === "questions"
    ) {
      return selectedServiceRequiredFieldsComplete;
    }
    if (!currentPage || currentPage.type !== "configurable") return true;
    if (
      currentPage.stepId === "serviceTypes" &&
      serviceSubView === "questions"
    ) {
      return selectedServiceRequiredFieldsComplete;
    }
    if (currentPage.stepId === "leadCapture") {
      return detailRequiredFieldsComplete;
    }
    if (currentPage.stepId === "slotSetup") {
      return Boolean(
        leadCaptureData?.selectedDate &&
          leadCaptureData?.preferredSlot?.generatedSlotId,
      );
    }
    return true;
  })();

  const goToPage = async (nextPageIndex: number) => {
    if (nextPageIndex > pageIndex && !currentRequiredFieldsComplete) {
      return;
    }

    const boundedIndex = Math.max(
      0,
      Math.min(nextPageIndex, previewPages.length - 1),
    );
    const nextPage = previewPages[boundedIndex];

    if (nextPage?.type === "thankYou" && onBeforeThankYou) {
      const submitSucceeded = await onBeforeThankYou(answers, {
        selectedServiceId: selectedServiceIds[0] ?? null,
        selectedServiceIds,
        selectedServiceType: selectedServiceIds
          .map(
            (serviceId) =>
              services.find((service) => service.id === serviceId)?.name ??
              null,
          )
          .filter((name): name is string => Boolean(name?.trim()))
          .join(", "),
        dimensionUnitsByFieldId,
      });
      if (submitSucceeded === false) {
        return;
      }
    }

    const isNavigatingToServiceTypes =
      nextPage?.type === "configurable" && nextPage.stepId === "serviceTypes";

    setPageIndex(boundedIndex);
    setServiceSubView(
      isNavigatingToServiceTypes && selectedServiceIds.length > 0
        ? "questions"
        : "list",
    );
  };

  const handleDimensionUnitChange = (fieldId: string, nextUnit: string) => {
    setDimensionUnitsByFieldId((currentUnits) => ({
      ...currentUnits,
      [fieldId]: normalizeLeadCaptureV2DimensionUnit(nextUnit),
    }));
  };

  const handleAnswerChange = (
    fieldId: string,
    nextAnswer: LeadCaptureV2PreviewAnswer,
  ) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [fieldId]: nextAnswer,
    }));
    setVerifiedFieldIds((currentVerifiedFieldIds) => {
      if (!currentVerifiedFieldIds.has(fieldId)) {
        return currentVerifiedFieldIds;
      }

      const nextVerifiedFieldIds = new Set(currentVerifiedFieldIds);
      nextVerifiedFieldIds.delete(fieldId);
      return nextVerifiedFieldIds;
    });
  };

  const handleFieldVerifiedChange = (fieldId: string, verified: boolean) => {
    setVerifiedFieldIds((currentVerifiedFieldIds) => {
      const nextVerifiedFieldIds = new Set(currentVerifiedFieldIds);
      if (verified) {
        nextVerifiedFieldIds.add(fieldId);
      } else {
        nextVerifiedFieldIds.delete(fieldId);
      }
      return nextVerifiedFieldIds;
    });
  };

  const handleServiceSelect = (serviceId: string) => {
    if (showServicesOnWelcome) {
      setSelectedServiceIds((currentIds) =>
        currentIds.includes(serviceId)
          ? currentIds.filter((id) => id !== serviceId)
          : [...currentIds, serviceId],
      );
      return;
    }

    setSelectedServiceIds([serviceId]);
  };

  const handleServiceTypeQuestionsBack = () => {
    if (showServicesOnWelcome) {
      void goToPage(pageIndex - 1);
      return;
    }

    setServiceSubView("list");
  };

  const renderConfigurableContent = () => {
    if (!currentPage || currentPage.type !== "configurable") return null;

    if (currentPage.stepId === "serviceTypes") {
      if (serviceSubView === "questions") {
        return (
          <LeadCaptureV2CustomerPreviewContentColumn
            isExternalPage={isExternalPage}
          >
            <LeadCaptureV2CustomerPreviewFieldsPanel
              answers={answers}
              dimensionUnitsByFieldId={dimensionUnitsByFieldId}
              emptyText={t("leadCaptureV2.customerPreview.noQuestions")}
              fieldsToRender={selectedServiceFields}
              projectTypes={projectTypes}
              isLoadingProjectTypes={isLoadingProjectTypes}
              organizationId={organizationId}
              organizationType={organizationType}
              leadCaptureV2Id={leadCaptureV2Id}
              verifiedFieldIds={verifiedFieldIds}
              onAnswerChange={handleAnswerChange}
              onDimensionUnitChange={handleDimensionUnitChange}
              onFieldVerifiedChange={handleFieldVerifiedChange}
              onBack={handleServiceTypeQuestionsBack}
              onContinue={() => void goToPage(pageIndex + 1)}
              isContinueDisabled={!selectedServiceRequiredFieldsComplete}
              isContinueLoading={isContinueLoading}
              isExternalPage={isExternalPage}
              subtitle={
                selectedService
                  ? getPreviewServiceTagline(selectedService) || undefined
                  : undefined
              }
              title={
                selectedService ? getPreviewServiceName(selectedService, t) : ""
              }
            />
          </LeadCaptureV2CustomerPreviewContentColumn>
        );
      }

      return (
        <LeadCaptureV2CustomerPreviewContentColumn
          isExternalPage={isExternalPage}
        >
          <Stack
            spacing={isExternalPage ? { xs: 0, sm: 2 } : 2}
            sx={
              isExternalPage
                ? {
                    flex: { xs: 1, sm: "initial" },
                    justifyContent: { xs: "space-between", sm: "flex-start" },
                  }
                : undefined
            }
          >
            <LeadCaptureV2CustomerPreviewServiceGrid
              services={services}
              emptyText={t("leadCaptureV2.customerPreview.noServices")}
              selectedServiceIds={selectedServiceIds}
              onSelectService={handleServiceSelect}
              isExternalPage={isExternalPage}
            />
            <LeadCaptureV2CustomerPreviewFooter
              showBack={pageIndex > 0}
              showContinue={services.length === 0}
              onBack={() => void goToPage(pageIndex - 1)}
              onContinue={() => void goToPage(pageIndex + 1)}
              isExternalPage={isExternalPage}
            />
          </Stack>
        </LeadCaptureV2CustomerPreviewContentColumn>
      );
    }

    if (currentPage.stepId === "leadCapture") {
      return (
        <LeadCaptureV2CustomerPreviewContentColumn
          fillExternalPage={false}
          isExternalPage={isExternalPage}
        >
          <LeadCaptureV2CustomerPreviewFieldsPanel
            answers={answers}
            dimensionUnitsByFieldId={dimensionUnitsByFieldId}
            emptyText={t("leadCaptureV2.customerPreview.noDetails")}
            fieldsToRender={detailFields}
            projectTypes={projectTypes}
            isLoadingProjectTypes={isLoadingProjectTypes}
            organizationId={organizationId}
            organizationType={organizationType}
            leadCaptureV2Id={leadCaptureV2Id}
            verifiedFieldIds={verifiedFieldIds}
            onAnswerChange={handleAnswerChange}
            onDimensionUnitChange={handleDimensionUnitChange}
            onFieldVerifiedChange={handleFieldVerifiedChange}
            onBack={() => void goToPage(pageIndex - 1)}
            showBack={pageIndex > 0}
            onContinue={() => void goToPage(pageIndex + 1)}
            isContinueDisabled={!detailRequiredFieldsComplete}
            isContinueLoading={isContinueLoading}
            isExternalPage={isExternalPage}
            title={getStepFlowLabel(
              "leadCapture",
              stepFlowConfig,
              t,
              formType,
            )}
          />
        </LeadCaptureV2CustomerPreviewContentColumn>
      );
    }

    return (
      <LeadCaptureV2CustomerPreviewContentColumn
        isExternalPage={isExternalPage}
      >
        <LeadCaptureV2CustomerPreviewSlotSetup
          stepFlowConfig={stepFlowConfig}
          isExternalPage={isExternalPage}
          organizationId={organizationId}
          organizationType={organizationType}
          onBack={() => void goToPage(pageIndex - 1)}
          showBack={pageIndex > 0}
          onContinue={() => void goToPage(pageIndex + 1)}
          isContinueDisabled={!currentRequiredFieldsComplete}
          isContinueLoading={isContinueLoading}
        />
      </LeadCaptureV2CustomerPreviewContentColumn>
    );
  };

  return (
    <Box
      ref={scrollContainerRef}
      sx={(theme) => ({
        flex: 1,
        height: "100%",
        minHeight: "100%",
        minWidth: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        overflowY: "auto",
        overflowX: "hidden",
        bgcolor: "background.default",
        ...(isExternalPage && {
          minHeight: "100dvh",
          bgcolor: shouldFillExternalStandaloneBackground
            ? {
                xs: alpha(theme.palette.primary.main, 0.04),
                sm: "background.default",
              }
            : { xs: "background.paper", sm: "background.default" },
        }),
      })}
    >
      <Stack
        spacing={
          isExternalPage ? { xs: 0, sm: 3, md: 4 } : { xs: 2.5, sm: 3, md: 4 }
        }
        alignItems="center"
        sx={{
          ...leadCaptureV2PreviewPageColumnSx,
          ...(isExternalPage && {
            flex: 1,
            alignSelf: "stretch",
            minHeight: "100dvh",
          }),
          px: isExternalPage
            ? { xs: 0, sm: 2, md: 2.5, lg: 3, xl: 4 }
            : { xs: 1.5, sm: 2, md: 2.5, lg: 3, xl: 4 },
          py: isExternalPage
            ? { xs: 0, sm: 2.5, md: 3, lg: 4 }
            : { xs: 2, sm: 2.5, md: 3, lg: 4 },
          pb: isExternalPage ? { xs: 0, sm: 3, lg: 4 } : { xs: 3, lg: 4 },
        }}
      >
        <LeadCaptureV2CustomerPreviewContentColumn
          fillExternalPage={false}
          isExternalPage={isExternalPage}
        >
          <LeadCaptureV2CustomerPreviewStepper
            activeStepIndex={activeStepperIndex}
            isExternalPage={isExternalPage}
            steps={stepperItems}
          />
        </LeadCaptureV2CustomerPreviewContentColumn>

        {currentPage?.type === "welcome" ? (
          <LeadCaptureV2CustomerPreviewContentColumn
            isExternalPage={isExternalPage}
          >
            {showServicesOnWelcome && serviceSubView === "questions" ? (
              <LeadCaptureV2CustomerPreviewFieldsPanel
                answers={answers}
                dimensionUnitsByFieldId={dimensionUnitsByFieldId}
                emptyText={t("leadCaptureV2.customerPreview.noQuestions")}
                fieldsToRender={selectedServiceFields}
                projectTypes={projectTypes}
                isLoadingProjectTypes={isLoadingProjectTypes}
                organizationId={organizationId}
                organizationType={organizationType}
                leadCaptureV2Id={leadCaptureV2Id}
                verifiedFieldIds={verifiedFieldIds}
                onAnswerChange={handleAnswerChange}
                onDimensionUnitChange={handleDimensionUnitChange}
                onFieldVerifiedChange={handleFieldVerifiedChange}
                onBack={() => setServiceSubView("list")}
                onContinue={() => void goToPage(pageIndex + 1)}
                isContinueDisabled={!selectedServiceRequiredFieldsComplete}
                isContinueLoading={isContinueLoading}
                isExternalPage={isExternalPage}
                title={serviceQuestionsTitle}
                serviceFieldGroups={
                  showServicesOnWelcome ? selectedServiceFieldGroups : undefined
                }
              />
            ) : (
              <Stack
                spacing={isExternalPage ? { xs: 0, sm: 2 } : 2}
                sx={
                  isExternalPage
                    ? {
                        flex: { xs: 1, sm: "initial" },
                        justifyContent: {
                          xs: shouldCenterExternalStandalonePage
                            ? "center"
                            : "space-between",
                          sm: "flex-start",
                        },
                        minHeight: 0,
                      }
                    : undefined
                }
              >
                <Box
                  sx={
                    shouldCenterExternalStandalonePage
                      ? {
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flex: { xs: 1, sm: "initial" },
                          minHeight: 0,
                        }
                      : undefined
                  }
                >
                  <LeadCaptureV2CustomerPreviewWelcome
                    title={previewTitle}
                    description={previewDescription}
                    isExternalPage={isExternalPage}
                  />
                </Box>
                {showServicesOnWelcome ? (
                  <LeadCaptureV2CustomerPreviewServiceGrid
                    services={services}
                    emptyText={t("leadCaptureV2.customerPreview.noServices")}
                    selectedServiceIds={selectedServiceIds}
                    allowMultipleSelection
                    onSelectService={handleServiceSelect}
                    isExternalPage={isExternalPage}
                  />
                ) : null}
                <LeadCaptureV2CustomerPreviewFooter
                  showBack={false}
                  showContinue
                  onContinue={handleWelcomeContinue}
                  isContinueDisabled={
                    showServicesOnWelcome &&
                    services.length > 0 &&
                    selectedServiceIds.length === 0
                  }
                  isContinueLoading={isContinueLoading}
                  isExternalPage={isExternalPage}
                />
              </Stack>
            )}
          </LeadCaptureV2CustomerPreviewContentColumn>
        ) : null}

        {currentPage?.type === "configurable"
          ? renderConfigurableContent()
          : null}

        {currentPage?.type === "thankYou" ? (
          <LeadCaptureV2CustomerPreviewContentColumn
            isExternalPage={isExternalPage}
          >
            <Stack
              spacing={2}
              sx={
                isExternalPage
                  ? {
                      flex: { xs: 1, sm: "initial" },
                      justifyContent: { xs: "center", sm: "flex-start" },
                      minHeight: 0,
                    }
                  : undefined
              }
            >
              <LeadCaptureV2CustomerPreviewThankYou
                isExternalPage={isExternalPage}
              />
              {!isExternalPage ? (
                <LeadCaptureV2CustomerPreviewFooter
                  showContinue={false}
                  onBack={() => void goToPage(pageIndex - 1)}
                  isExternalPage={isExternalPage}
                />
              ) : null}
            </Stack>
          </LeadCaptureV2CustomerPreviewContentColumn>
        ) : null}
      </Stack>
    </Box>
  );
};

export default LeadCaptureV2CustomerPreview;
