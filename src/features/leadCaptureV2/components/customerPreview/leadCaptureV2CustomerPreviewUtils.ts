import type { TFunction } from "i18next";
import type { LeadCaptureV2FormType } from "../../api/leadCaptureV2Types";
import {
  buildPreviewFlowSteps,
  getStepFlowLabel,
  type LeadCaptureV2ConfigurableStepId,
  type LeadCaptureV2PreviewFlowStepKey,
  type LeadCaptureV2StepFlowConfig,
} from "../../leadCaptureV2StepFlowConfig";
import type {
  LeadCaptureV2FormField,
  LeadCaptureV2Service,
} from "../leadCaptureV2LayoutConfig";
import type {
  LeadCaptureV2PreviewAnswer,
  LeadCaptureV2PreviewPage,
  LeadCaptureV2PreviewServiceFieldGroup,
} from "./leadCaptureV2CustomerPreviewTypes";
import { hasLeadCaptureV2FileAnswer } from "../../leadCaptureV2FileAnswer";
import { getLeadCaptureV2FieldDisplayTitle } from "../../leadCaptureV2FieldDisplayTitle";
import { validateLeadCaptureV2Email, validateLeadCaptureV2Phone } from "../../validation/leadCaptureV2Validation";


export const hasLeadCaptureV2PreviewAnswer = (
  answer: LeadCaptureV2PreviewAnswer | undefined,
) => {
  if (Array.isArray(answer)) return answer.length > 0;
  if (hasLeadCaptureV2FileAnswer(answer)) return true;
  return typeof answer === "string" && answer.trim().length > 0;
};

export const areLeadCaptureV2PreviewFieldsComplete = (
  fieldsToValidate: LeadCaptureV2FormField[],
  answers: Record<string, LeadCaptureV2PreviewAnswer>,
  verifiedFieldIds: ReadonlySet<string>,
) =>
  fieldsToValidate.every((field) => {
    const answer = answers[field.id];
    const hasAnswer = hasLeadCaptureV2PreviewAnswer(answer);

    if (field.required && !hasAnswer) {
      return false;
    }

    if (
      field.verificationRequired &&
      hasAnswer &&
      !verifiedFieldIds.has(field.id)
    ) {
      return false;
    }

    if (hasAnswer && typeof answer === "string") {
      const trimmed = answer.trim();
      if (trimmed.length > 0) {
        if (field.typeKey === "email" && !validateLeadCaptureV2Email(trimmed)) {
          return false;
        }
        if (field.typeKey === "phone" && !validateLeadCaptureV2Phone(trimmed)) {
          return false;
        }
      }
    }

    return true;
  });

export const getPreviewServiceName = (
  service: LeadCaptureV2Service,
  t: TFunction
) => service.name?.trim() || t("leadCaptureV2.customerPreview.customService");

export const getPreviewServiceTagline = (service: LeadCaptureV2Service) =>
  service.tagline?.trim() ?? "";

export const buildSelectedServiceFieldGroups = (
  services: LeadCaptureV2Service[],
  selectedServiceIds: string[],
  serviceFieldsByServiceId: Record<string, LeadCaptureV2FormField[]>,
): LeadCaptureV2PreviewServiceFieldGroup[] =>
  selectedServiceIds.flatMap((serviceId) => {
    const service = services.find((entry) => entry.id === serviceId);
    if (!service) {
      return [];
    }

    const fields = (serviceFieldsByServiceId[serviceId] ?? []).filter(
      (field) => field.enabled,
    );
    if (fields.length === 0) {
      return [];
    }

    return [{ service, fields }];
  });

export const flattenServiceFieldGroups = (
  groups: LeadCaptureV2PreviewServiceFieldGroup[],
) => groups.flatMap((group) => group.fields);

export const getPreviewFieldTitle = (
  field: LeadCaptureV2FormField,
  t: TFunction,
) => getLeadCaptureV2FieldDisplayTitle(field, t);

export type LeadCaptureV2PreviewStepperStepKey =
  | LeadCaptureV2PreviewFlowStepKey
  | "serviceQuestions";

export type BuildPreviewPagesOptions = {
  formName?: string;
  formType?: LeadCaptureV2FormType;
  servicesCount?: number;
  detailFieldsCount?: number;
  hasServiceQuestions?: boolean;
};

export const getPreviewStepperLabel = (
  stepKey: LeadCaptureV2PreviewStepperStepKey,
  config: LeadCaptureV2StepFlowConfig,
  t: TFunction,
  options: BuildPreviewPagesOptions = {},
) => {
  if (stepKey === "welcome") {
    return t("leadCaptureV2.steps.welcome");
  }
  if (stepKey === "thankYou") {
    return t("leadCaptureV2.steps.thankYou");
  }
  if (stepKey === "serviceQuestions") {
    const formName = options.formName?.trim();
    if (formName) {
      return formName;
    }
    return getStepFlowLabel("leadCapture", config, t, options.formType);
  }
  return getStepFlowLabel(stepKey, config, t, options.formType);
};

/** Customer stepper mirrors enabled navigation steps; instant-proposal adds service questions. */
export const buildPreviewStepperFlowSteps = (
  config: LeadCaptureV2StepFlowConfig,
  options: BuildPreviewPagesOptions = {},
): LeadCaptureV2PreviewStepperStepKey[] => {
  const navigationSteps = buildPreviewCustomerNavigationSteps(config, options);

  if (options.formType !== "instant-proposal" || !options.hasServiceQuestions) {
    return navigationSteps;
  }

  const steps: LeadCaptureV2PreviewStepperStepKey[] = [];
  navigationSteps.forEach((stepKey) => {
    if (stepKey === "welcome") {
      steps.push("welcome", "serviceQuestions");
      return;
    }
    steps.push(stepKey);
  });
  return steps;
};

const shouldIncludePreviewNavigationStep = (
  stepKey: LeadCaptureV2PreviewFlowStepKey,
  options: BuildPreviewPagesOptions,
) => {
  if (stepKey === "welcome" || stepKey === "thankYou") {
    return true;
  }

  const stepId = stepKey as LeadCaptureV2ConfigurableStepId;
  const { formType, servicesCount = 0, detailFieldsCount = 0 } = options;

  if (stepId === "serviceTypes") {
    if (formType === "instant-proposal") {
      return false;
    }
    return servicesCount > 0;
  }

  if (stepId === "leadCapture") {
    return detailFieldsCount > 0;
  }

  if (stepId === "slotSetup") {
    return formType !== "custom";
  }

  return true;
};

/** Customer-facing pages skip redundant or empty middle steps. */
export const buildPreviewCustomerNavigationSteps = (
  config: LeadCaptureV2StepFlowConfig,
  options: BuildPreviewPagesOptions = {},
): LeadCaptureV2PreviewFlowStepKey[] =>
  buildPreviewFlowSteps(config).filter((stepKey) =>
    shouldIncludePreviewNavigationStep(stepKey, options),
  );

export const buildPreviewPages = (
  config: LeadCaptureV2StepFlowConfig,
  options: BuildPreviewPagesOptions = {},
): LeadCaptureV2PreviewPage[] =>
  buildPreviewCustomerNavigationSteps(config, options).map((stepKey) => {
      if (stepKey === "welcome") {
        return { type: "welcome" as const };
      }
      if (stepKey === "thankYou") {
        return { type: "thankYou" as const };
      }

      return {
        type: "configurable" as const,
        stepId: stepKey,
        serviceSubView:
          stepKey === "serviceTypes" ? ("list" as const) : undefined,
      };
    });

export const getPreviewStepperItems = (
  config: LeadCaptureV2StepFlowConfig,
  t: TFunction,
  options: BuildPreviewPagesOptions = {},
) =>
  buildPreviewStepperFlowSteps(config, options).map((stepKey) => ({
    stepKey,
    label: getPreviewStepperLabel(stepKey, config, t, options),
  }));

export type LeadCaptureV2PreviewStepperItem = ReturnType<
  typeof getPreviewStepperItems
>[number];

export const getPreviewStepperIndex = (
  stepperSteps: LeadCaptureV2PreviewStepperStepKey[],
  pages: LeadCaptureV2PreviewPage[],
  pageIndex: number,
  options: { isWelcomeServiceQuestions?: boolean } = {},
) => {
  const currentPage = pages[pageIndex];
  if (!currentPage) return 0;

  if (currentPage.type === "thankYou") {
    const thankYouIndex = stepperSteps.indexOf("thankYou");
    return thankYouIndex >= 0 ? thankYouIndex : stepperSteps.length - 1;
  }

  if (currentPage.type === "welcome") {
    if (options.isWelcomeServiceQuestions) {
      const serviceQuestionsIndex = stepperSteps.indexOf("serviceQuestions");
      return serviceQuestionsIndex >= 0
        ? serviceQuestionsIndex
        : stepperSteps.indexOf("welcome");
    }
    return Math.max(stepperSteps.indexOf("welcome"), 0);
  }

  if (currentPage.type === "configurable") {
    const stepIndex = stepperSteps.indexOf(currentPage.stepId);
    return stepIndex >= 0 ? stepIndex : 0;
  }

  return 0;
};
