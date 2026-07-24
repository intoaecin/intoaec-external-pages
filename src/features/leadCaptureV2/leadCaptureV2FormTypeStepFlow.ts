import type { LeadCaptureV2FormType } from "./api/leadCaptureV2Types";
import {
  LEAD_CAPTURE_V2_CONFIGURABLE_STEP_IDS,
  type LeadCaptureV2ConfigurableStepId,
  type LeadCaptureV2StepFlowConfig,
  type LeadCaptureV2StepFlowStep,
} from "./leadCaptureV2StepFlowConfig";

const FULL_PROPOSAL_FLOW_STEPS: LeadCaptureV2ConfigurableStepId[] = [
  "serviceTypes",
  "leadCapture",
  "slotSetup",
];

const LEAD_CAPTURE_FLOW_STEPS: LeadCaptureV2ConfigurableStepId[] = [
  "leadCapture",
];

const FORM_TYPE_ALLOWED_STEPS: Record<
  LeadCaptureV2FormType,
  LeadCaptureV2ConfigurableStepId[]
> = {
  "instant-proposal": FULL_PROPOSAL_FLOW_STEPS,
  "lead-capture": LEAD_CAPTURE_FLOW_STEPS,
  "feedback-form": LEAD_CAPTURE_FLOW_STEPS,
  "complaint-form": LEAD_CAPTURE_FLOW_STEPS,
  custom: LEAD_CAPTURE_FLOW_STEPS,
};

export const getAllowedStepIdsForFormType = (
  formType: LeadCaptureV2FormType,
): LeadCaptureV2ConfigurableStepId[] => [...FORM_TYPE_ALLOWED_STEPS[formType]];

export const buildStepFlowConfigForStepIds = (
  stepIds: LeadCaptureV2ConfigurableStepId[],
): LeadCaptureV2StepFlowConfig => ({
  welcomeEnabled: true,
  thankYouEnabled: true,
  steps: stepIds.map((stepId, orderIndex) => ({
    stepId,
    label: null,
    orderIndex,
    enabled: true,
  })),
});

export const getDefaultStepFlowConfigForFormType = (
  formType: LeadCaptureV2FormType,
): LeadCaptureV2StepFlowConfig =>
  buildStepFlowConfigForStepIds(getAllowedStepIdsForFormType(formType));

const isConfigurableStepId = (
  stepId: string,
): stepId is LeadCaptureV2ConfigurableStepId =>
  LEAD_CAPTURE_V2_CONFIGURABLE_STEP_IDS.includes(
    stepId as LeadCaptureV2ConfigurableStepId,
  );

/** Merge AI/API step flow with defaults allowed for the selected form type. */
export const normalizeLeadCaptureV2StepFlowForFormType = (
  formType: LeadCaptureV2FormType,
  config?: LeadCaptureV2StepFlowConfig | null,
  options: { allowWelcomeToggle?: boolean } = {},
): LeadCaptureV2StepFlowConfig => {
  const allowWelcomeToggle = options.allowWelcomeToggle ?? true;
  const rawConfig = config as
    | (LeadCaptureV2StepFlowConfig & {
        welcome_enabled?: boolean;
        thank_you_enabled?: boolean;
      })
    | null
    | undefined;
  const allowedStepIds = getAllowedStepIdsForFormType(formType);
  const allowedStepIdSet = new Set(allowedStepIds);
  const defaultConfig = buildStepFlowConfigForStepIds(allowedStepIds);

  if (!config?.steps?.length) {
    return {
      ...defaultConfig,
      welcomeEnabled: allowWelcomeToggle
        ? defaultConfig.welcomeEnabled
        : true,
    };
  }

  const normalizedById = new Map<
    LeadCaptureV2ConfigurableStepId,
    LeadCaptureV2StepFlowStep
  >();

  config.steps.forEach((step, index) => {
    if (!isConfigurableStepId(step.stepId)) return;
    if (!allowedStepIdSet.has(step.stepId)) return;
    if (normalizedById.has(step.stepId)) return;

    normalizedById.set(step.stepId, {
      stepId: step.stepId,
      label: step.label?.trim() ? step.label.trim() : null,
      orderIndex: step.orderIndex ?? index,
      enabled: step.stepId === "slotSetup" ? (step.enabled ?? true) : true,
    });
  });

  defaultConfig.steps.forEach((defaultStep) => {
    if (!normalizedById.has(defaultStep.stepId)) {
      normalizedById.set(defaultStep.stepId, { ...defaultStep });
    }
  });

  return {
    welcomeEnabled: allowWelcomeToggle
      ? (rawConfig?.welcomeEnabled ?? rawConfig?.welcome_enabled) !== false
      : true,
    thankYouEnabled:
      (rawConfig?.thankYouEnabled ?? rawConfig?.thank_you_enabled) !== false,
    steps: [...normalizedById.values()].sort(
      (firstStep, secondStep) => firstStep.orderIndex - secondStep.orderIndex,
    ),
  };
};
