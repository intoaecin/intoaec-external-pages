import type { TFunction } from "i18next";
import type { LeadCaptureV2FormType } from "./api/leadCaptureV2Types";
import type { LeadCaptureV2StepId } from "./components/leadCaptureV2LayoutConfig";

export const LEAD_CAPTURE_V2_CONFIGURABLE_STEP_IDS = [
  "serviceTypes",
  "leadCapture",
  "slotSetup",
] as const;

const TOGGLEABLE_CONFIGURABLE_STEP_IDS = new Set<
  LeadCaptureV2ConfigurableStepId
>(["slotSetup"]);

export type LeadCaptureV2ConfigurableStepId =
  (typeof LEAD_CAPTURE_V2_CONFIGURABLE_STEP_IDS)[number];

export type LeadCaptureV2StepFlowStep = {
  stepId: LeadCaptureV2ConfigurableStepId;
  label: string | null;
  orderIndex: number;
  enabled: boolean;
};

export type LeadCaptureV2StepFlowConfig = {
  steps: LeadCaptureV2StepFlowStep[];
  welcomeEnabled?: boolean;
  thankYouEnabled?: boolean;
};

export type LeadCaptureV2StepFlowNormalizeOptions = {
  allowWelcomeToggle?: boolean;
};

type LeadCaptureV2RawStepFlowConfig = LeadCaptureV2StepFlowConfig & {
  welcome_enabled?: boolean;
  thank_you_enabled?: boolean;
};

export const DEFAULT_LEAD_CAPTURE_V2_STEP_FLOW_CONFIG: LeadCaptureV2StepFlowConfig =
  {
    welcomeEnabled: true,
    thankYouEnabled: true,
    steps: LEAD_CAPTURE_V2_CONFIGURABLE_STEP_IDS.map((stepId, orderIndex) => ({
      stepId,
      label: null,
      orderIndex,
      enabled: true,
    })),
  };

export const isWelcomeStepEnabled = (_config: LeadCaptureV2StepFlowConfig) =>
  _config.welcomeEnabled !== false;

export const isThankYouStepEnabled = (_config: LeadCaptureV2StepFlowConfig) =>
  true;

export const canToggleLeadCaptureV2WelcomeStep = (
  formType?: LeadCaptureV2FormType | null,
) => formType !== "instant-proposal";

const isConfigurableStepId = (
  stepId: string,
): stepId is LeadCaptureV2ConfigurableStepId =>
  LEAD_CAPTURE_V2_CONFIGURABLE_STEP_IDS.includes(
    stepId as LeadCaptureV2ConfigurableStepId,
  );

/** Trust API step flow; do not inject steps missing from the server payload. */
export const normalizeLeadCaptureV2StepFlowConfig = (
  config?: LeadCaptureV2StepFlowConfig | null,
  options: LeadCaptureV2StepFlowNormalizeOptions = {},
): LeadCaptureV2StepFlowConfig => {
  const allowWelcomeToggle = options.allowWelcomeToggle ?? true;
  const rawConfig = config as LeadCaptureV2RawStepFlowConfig | null | undefined;

  if (!config?.steps?.length) {
    return {
      ...DEFAULT_LEAD_CAPTURE_V2_STEP_FLOW_CONFIG,
      welcomeEnabled: allowWelcomeToggle
        ? DEFAULT_LEAD_CAPTURE_V2_STEP_FLOW_CONFIG.welcomeEnabled
        : true,
    };
  }

  const normalizedById = new Map<
    LeadCaptureV2ConfigurableStepId,
    LeadCaptureV2StepFlowStep
  >();

  config.steps.forEach((step, index) => {
    if (!isConfigurableStepId(step.stepId)) return;
    if (normalizedById.has(step.stepId)) return;

    normalizedById.set(step.stepId, {
      stepId: step.stepId,
      label: step.label?.trim() ? step.label.trim() : null,
      orderIndex: step.orderIndex ?? index,
      enabled: TOGGLEABLE_CONFIGURABLE_STEP_IDS.has(step.stepId)
        ? (step.enabled ?? true)
        : true,
    });
  });

  return {
    welcomeEnabled: allowWelcomeToggle
      ? (rawConfig?.welcomeEnabled ?? rawConfig?.welcome_enabled) !== false
      : true,
    thankYouEnabled: true,
    steps: [...normalizedById.values()].sort(
      (firstStep, secondStep) => firstStep.orderIndex - secondStep.orderIndex,
    ),
  };
};

export const getOrderedConfigurableSteps = (config: LeadCaptureV2StepFlowConfig) =>
  normalizeLeadCaptureV2StepFlowConfig(config).steps;

export const getEnabledConfigurableSteps = (
  config: LeadCaptureV2StepFlowConfig,
) => getOrderedConfigurableSteps(config).filter((step) => step.enabled);

const getLeadCaptureConfigurableStepFallbackLabel = (
  stepId: LeadCaptureV2ConfigurableStepId,
  formType: LeadCaptureV2FormType | null | undefined,
  t: TFunction,
): string => {
  if (stepId !== "leadCapture") {
    return t(`leadCaptureV2.steps.${stepId}`);
  }

  switch (formType ?? null) {
    case "feedback-form":
      return t("leadCapture.proceed.feedbackForm");
    case "complaint-form":
      return t("leadCapture.proceed.complaintForm");
    case "custom":
      return t("leadCapture.proceed.customForm");
    case "instant-proposal":
      return t("leadCaptureV2.steps.leadCapture");
    case "lead-capture":
      return t("leadCaptureV2.steps.leadCapture");
    default:
      return t("leadCaptureV2.steps.leadCapture");
  }
};

export const getStepFlowLabel = (
  stepId: LeadCaptureV2ConfigurableStepId | LeadCaptureV2StepId,
  config: LeadCaptureV2StepFlowConfig,
  t: TFunction,
  formType?: LeadCaptureV2FormType | null,
) => {
  if (stepId === "welcome") {
    return t("leadCaptureV2.steps.welcome");
  }
  if (stepId === "thankYou") {
    return t("leadCaptureV2.steps.thankYou");
  }

  const customLabel = getOrderedConfigurableSteps(config).find(
    (step) => step.stepId === stepId,
  )?.label;
  const trimmedCustom = customLabel?.trim();
  if (trimmedCustom) {
    return trimmedCustom;
  }

  if (isConfigurableStepId(stepId)) {
    return getLeadCaptureConfigurableStepFallbackLabel(
      stepId,
      formType,
      t,
    );
  }

  // This branch is logically unreachable after the guards above (welcome,
  // thankYou, and all LeadCaptureV2ConfigurableStepId values are handled).
  // Fall back to a safe known key to satisfy the typed i18next overloads.
  return t("leadCaptureV2.steps.leadCapture");
};

export const reorderConfigurableSteps = (
  config: LeadCaptureV2StepFlowConfig,
  sourceIndex: number,
  destinationIndex: number,
): LeadCaptureV2StepFlowConfig => {
  const steps = [...getOrderedConfigurableSteps(config)];
  const [movedStep] = steps.splice(sourceIndex, 1);
  if (!movedStep) return config;

  steps.splice(destinationIndex, 0, movedStep);

  return {
    ...config,
    steps: steps.map((step, orderIndex) => ({
      ...step,
      orderIndex,
    })),
  };
};

export const updateConfigurableStepLabel = (
  config: LeadCaptureV2StepFlowConfig,
  stepId: LeadCaptureV2ConfigurableStepId,
  label: string,
): LeadCaptureV2StepFlowConfig => ({
  ...config,
  steps: getOrderedConfigurableSteps(config).map((step) =>
    step.stepId === stepId
      ? { ...step, label: label.trim() ? label.trim() : null }
      : step,
  ),
});

export const updateConfigurableStepEnabled = (
  config: LeadCaptureV2StepFlowConfig,
  stepId: LeadCaptureV2ConfigurableStepId,
  enabled: boolean,
): LeadCaptureV2StepFlowConfig => ({
  ...config,
  steps: getOrderedConfigurableSteps(config).map((step) =>
    step.stepId === stepId
      ? {
          ...step,
          enabled: TOGGLEABLE_CONFIGURABLE_STEP_IDS.has(stepId)
            ? enabled
            : true,
        }
      : step,
  ),
});

export const updateWelcomeStepEnabled = (
  config: LeadCaptureV2StepFlowConfig,
  enabled: boolean,
): LeadCaptureV2StepFlowConfig => ({
  ...config,
  welcomeEnabled: enabled,
});

export const updateThankYouStepEnabled = (
  config: LeadCaptureV2StepFlowConfig,
  _enabled: boolean,
): LeadCaptureV2StepFlowConfig => ({
  ...config,
  thankYouEnabled: true,
});

export const getDefaultActiveStep = (
  config: LeadCaptureV2StepFlowConfig,
): LeadCaptureV2StepId => {
  if (isWelcomeStepEnabled(config)) return "welcome";
  const firstEnabledStep = getEnabledConfigurableSteps(config)[0]?.stepId;
  if (firstEnabledStep) return firstEnabledStep;
  if (isThankYouStepEnabled(config)) return "thankYou";
  return "leadCapture";
};

export const isConfigurableStepInFlow = (
  config: LeadCaptureV2StepFlowConfig,
  stepId: LeadCaptureV2StepId,
) =>
  stepId === "welcome"
    ? isWelcomeStepEnabled(config)
    : stepId === "thankYou"
      ? isThankYouStepEnabled(config)
      : getEnabledConfigurableSteps(config).some(
          (step) => step.stepId === stepId,
        );

export type LeadCaptureV2PreviewFlowStepKey =
  | "welcome"
  | LeadCaptureV2ConfigurableStepId
  | "thankYou";

export const buildPreviewFlowSteps = (
  config: LeadCaptureV2StepFlowConfig,
): LeadCaptureV2PreviewFlowStepKey[] => [
  ...(isWelcomeStepEnabled(config) ? (["welcome"] as const) : []),
  ...getEnabledConfigurableSteps(config).map((step) => step.stepId),
  ...(isThankYouStepEnabled(config) ? (["thankYou"] as const) : []),
];
