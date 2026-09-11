import type { GenerateLeadCaptureV2Payload } from "./leadCaptureV2Types";

const INSTANT_PROPOSAL_AI_PATH = "/lead-capture-with-ai";

type RawGeneratedLeadCaptureV2PriceMatrixEntry = {
  fieldOptionId?: string | null;
  value?: number;
};

type RawGeneratedLeadCaptureV2PriceMatrix = {
  enabled?: boolean;
  entries?: RawGeneratedLeadCaptureV2PriceMatrixEntry[];
};

type RawGeneratedLeadCaptureV2ServiceType = {
  service_name?: string;
  serviceName?: string;
  tagline?: string;
  icon?: string;
  configured?: boolean;
  isActive?: boolean;
  fields?: RawGeneratedLeadCaptureV2Field[];
};

type RawGeneratedLeadCaptureV2Field = {
  field_name?: string;
  fieldName?: string;
  description?: string;
  type?: string;
  unitType?: string | null;
  required?: boolean;
  options?: (
    | string
    | {
        label?: string;
      }
  )[];
  priceMatrix?: RawGeneratedLeadCaptureV2PriceMatrix;
};

type GeneratedLeadCaptureV2PriceMatrixEntry = {
  fieldOptionId?: string | null;
  value?: number;
};

type GeneratedLeadCaptureV2PriceMatrix = {
  enabled?: boolean;
  entries?: GeneratedLeadCaptureV2PriceMatrixEntry[];
};

type GeneratedLeadCaptureV2ServiceType = {
  service_name?: string;
  tagline?: string;
  icon?: string;
  configured?: boolean;
  isActive?: boolean;
  fields?: GeneratedLeadCaptureV2Field[];
};

type GeneratedLeadCaptureV2Field = {
  field_name?: string;
  description?: string;
  type?: string;
  unitType?: string | null;
  required?: boolean;
  options?: string[];
  priceMatrix?: GeneratedLeadCaptureV2PriceMatrix;
};

type GeneratedLeadCaptureV2StepFlowStep = {
  step_id?: string;
  label?: string | null;
  order_index?: number;
  enabled?: boolean;
};

type GeneratedLeadCaptureV2StepFlowConfig = {
  welcome_enabled?: boolean;
  thank_you_enabled?: boolean;
  steps?: GeneratedLeadCaptureV2StepFlowStep[];
};

export type GeneratedLeadCaptureV2FormPayload = {
  form_name?: string;
  title?: string;
  description?: string;
  form_type?: string;
  step_flow_config?: GeneratedLeadCaptureV2StepFlowConfig;
  service_types?: GeneratedLeadCaptureV2ServiceType[];
  fields?: GeneratedLeadCaptureV2Field[];
};

type RawGeneratedLeadCaptureV2FormPayload = Omit<
  GeneratedLeadCaptureV2FormPayload,
  "fields" | "service_types"
> & {
  formName?: string;
  formType?: string;
  stepFlowConfig?: GeneratedLeadCaptureV2StepFlowConfig;
  serviceTypes?: RawGeneratedLeadCaptureV2ServiceType[];
  service_types?: RawGeneratedLeadCaptureV2ServiceType[];
  fields?: RawGeneratedLeadCaptureV2Field[];
};

type GenerateLeadCaptureV2Response = {
  success?: boolean;
  form?: RawGeneratedLeadCaptureV2FormPayload;
  result?: RawGeneratedLeadCaptureV2FormPayload;
  data?: RawGeneratedLeadCaptureV2FormPayload;
  status?: string;
  error?: string;
  detail?: string;
  message?: string;
  body?: {
    form?: RawGeneratedLeadCaptureV2FormPayload;
    result?: RawGeneratedLeadCaptureV2FormPayload;
    data?: RawGeneratedLeadCaptureV2FormPayload;
  };
};

type InstantProposalStreamPayload = {
  eventName: string;
  payload: unknown;
};

export type GeneratedLeadCaptureV2TranslationItem = {
  status?: string;
  actual_text?: string;
  translated_text?: string;
};

const CANONICAL_GENERATED_FIELD_NAMES = new Set([
  "full name",
  "email",
  "email address",
  "phone",
  "mobile",
  "phone number",
  "mobile number",
  "project type",
  "area",
  "budget",
]);

const FINAL_STREAM_EVENTS = new Set(["complete", "completed"]);

const buildInstantProposalAiUrl = (modelUri?: string): string => {
  const baseUrl = (modelUri ?? "").trim().replace(/\/$/, "");
  if (!baseUrl) {
    throw new Error("VITE_MODEL_URI is required.");
  }

  return `${baseUrl}${INSTANT_PROPOSAL_AI_PATH}`;
};

const normalizeGeneratedField = (
  field: RawGeneratedLeadCaptureV2Field,
): GeneratedLeadCaptureV2Field => ({
  field_name: field.field_name ?? field.fieldName,
  description: field.description,
  type: field.type,
  unitType: field.unitType,
  required: field.type === "phone" ? false : field.required,
  options: field.options
    ?.map((option) => (typeof option === "string" ? option : option.label))
    .filter((option): option is string => Boolean(option?.trim())),
  priceMatrix: field.priceMatrix,
});

const normalizeGeneratedFormPayload = (
  form: RawGeneratedLeadCaptureV2FormPayload,
): GeneratedLeadCaptureV2FormPayload => ({
  form_name: form.form_name ?? form.formName,
  title: form.title,
  description: form.description,
  form_type: form.form_type ?? form.formType,
  step_flow_config: form.step_flow_config ?? form.stepFlowConfig,
  service_types: (form.service_types ?? form.serviceTypes)?.map((service) => ({
    service_name: service.service_name ?? service.serviceName,
    tagline: service.tagline,
    icon: service.icon,
    configured: service.configured,
    isActive: service.isActive,
    fields: service.fields?.map(normalizeGeneratedField),
  })),
  fields: form.fields?.map(normalizeGeneratedField),
});

export const getGeneratedLeadCaptureV2FormPayload = (
  response: unknown,
): GeneratedLeadCaptureV2FormPayload | undefined => {
  const generatedResponse = response as GenerateLeadCaptureV2Response;
  const responseForm =
    generatedResponse?.form ??
    generatedResponse?.result ??
    generatedResponse?.data ??
    generatedResponse?.body?.form ??
    generatedResponse?.body?.result ??
    generatedResponse?.body?.data;

  if (responseForm) {
    return normalizeGeneratedFormPayload(responseForm);
  }

  const generatedForm = response as RawGeneratedLeadCaptureV2FormPayload;
  if (
    generatedForm?.fields ||
    generatedForm?.service_types ||
    generatedForm?.serviceTypes ||
    generatedForm?.form_name ||
    generatedForm?.formName ||
    generatedForm?.title
  ) {
    return normalizeGeneratedFormPayload(generatedForm);
  }

  return undefined;
};

const addGeneratedFormText = (texts: Set<string>, value?: string | null) => {
  const text = value?.trim();
  if (text) {
    texts.add(text);
  }
};

const addGeneratedFieldNameText = (
  texts: Set<string>,
  value?: string | null,
) => {
  const text = value?.trim();
  if (!text || CANONICAL_GENERATED_FIELD_NAMES.has(text.toLowerCase())) {
    return;
  }

  texts.add(text);
};

const getTranslatedGeneratedFormText = (
  translationMap: Map<string, string>,
  value?: string | null,
): string | undefined => {
  const text = value?.trim();
  if (!text) return undefined;

  return translationMap.get(text) ?? text;
};

const getTranslatedGeneratedOptionText = (
  translationMap: Map<string, string>,
  value: string,
): string => getTranslatedGeneratedFormText(translationMap, value) ?? value;

export const translateGeneratedLeadCaptureV2FormPayload = async ({
  form,
  translate,
}: {
  form: GeneratedLeadCaptureV2FormPayload;
  translate: (
    texts: string[],
  ) => Promise<GeneratedLeadCaptureV2TranslationItem[]>;
}): Promise<GeneratedLeadCaptureV2FormPayload> => {
  const texts = new Set<string>();

  addGeneratedFormText(texts, form.form_name);
  addGeneratedFormText(texts, form.title);
  addGeneratedFormText(texts, form.description);
  form.step_flow_config?.steps?.forEach((step) => {
    addGeneratedFormText(texts, step.label);
  });
  form.service_types?.forEach((service) => {
    addGeneratedFormText(texts, service.service_name);
    addGeneratedFormText(texts, service.tagline);
    service.fields?.forEach((field) => {
      addGeneratedFieldNameText(texts, field.field_name);
      addGeneratedFormText(texts, field.description);
      field.options?.forEach((option) => addGeneratedFormText(texts, option));
    });
  });
  form.fields?.forEach((field) => {
    addGeneratedFieldNameText(texts, field.field_name);
    addGeneratedFormText(texts, field.description);
    field.options?.forEach((option) => addGeneratedFormText(texts, option));
  });

  if (!texts.size) {
    return form;
  }

  const translatedResponse = await translate(Array.from(texts));
  const translationMap = new Map<string, string>();

  translatedResponse?.forEach((item) => {
    const actualText = item?.actual_text?.trim();
    if (item?.status === "success" && actualText) {
      translationMap.set(
        actualText,
        item.translated_text?.trim() || item.actual_text || actualText,
      );
    }
  });

  if (!translationMap.size) {
    return form;
  }

  return {
    ...form,
    form_name: getTranslatedGeneratedFormText(translationMap, form.form_name),
    title: getTranslatedGeneratedFormText(translationMap, form.title),
    description: getTranslatedGeneratedFormText(
      translationMap,
      form.description,
    ),
    step_flow_config: form.step_flow_config
      ? {
          ...form.step_flow_config,
          steps: form.step_flow_config.steps?.map((step) => ({
            ...step,
            label: getTranslatedGeneratedFormText(translationMap, step.label),
          })),
        }
      : form.step_flow_config,
    service_types: form.service_types?.map((service) => ({
      ...service,
      service_name: getTranslatedGeneratedFormText(
        translationMap,
        service.service_name,
      ),
      tagline: getTranslatedGeneratedFormText(translationMap, service.tagline),
      fields: service.fields?.map((field) => ({
        ...field,
        field_name: getTranslatedGeneratedFormText(
          translationMap,
          field.field_name,
        ),
        description: getTranslatedGeneratedFormText(
          translationMap,
          field.description,
        ),
        options: field.options?.map((option) =>
          getTranslatedGeneratedOptionText(translationMap, option),
        ),
      })),
    })),
    fields: form.fields?.map((field) => ({
      ...field,
      field_name: getTranslatedGeneratedFormText(
        translationMap,
        field.field_name,
      ),
      description: getTranslatedGeneratedFormText(
        translationMap,
        field.description,
      ),
      options: field.options?.map((option) =>
        getTranslatedGeneratedOptionText(translationMap, option),
      ),
    })),
  };
};

const parseStreamPayload = (text: string): unknown => {
  const trimmedText = text.trim();
  if (!trimmedText) return null;

  try {
    return JSON.parse(trimmedText);
  } catch {
    return trimmedText;
  }
};

const extractStreamPayloadsFromBlock = (
  block: string,
): InstantProposalStreamPayload[] => {
  const lines = block
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const eventName =
    lines
      .find((line) => line.startsWith("event:"))
      ?.replace(/^event:\s*/, "")
      .trim() || "";
  const dataLines = lines.filter((line) => line.startsWith("data:"));

  if (dataLines.length) {
    return [
      {
        eventName,
        payload: parseStreamPayload(
          dataLines
            .map((line) => line.replace(/^data:\s*/, "").trim())
            .join("\n"),
        ),
      },
    ];
  }

  return lines
    .filter((line) => !line.startsWith("event:") && !line.startsWith(":"))
    .map((line) => ({ eventName, payload: parseStreamPayload(line) }));
};

const getInstantProposalStreamResult = ({
  eventName,
  payload,
}: InstantProposalStreamPayload): unknown => {
  if (typeof payload === "string") {
    if (payload === "[DONE]") return undefined;
    return eventName ? undefined : payload;
  }

  const streamPayload = payload as GenerateLeadCaptureV2Response;

  if (
    eventName === "error" ||
    streamPayload?.status === "error" ||
    streamPayload?.success === false
  ) {
    throw new Error(
      streamPayload.error ||
        streamPayload.detail ||
        streamPayload.message ||
        "Failed to generate instant proposal form",
    );
  }

  if (eventName && !FINAL_STREAM_EVENTS.has(eventName)) {
    return undefined;
  }

  const generatedForm = getGeneratedLeadCaptureV2FormPayload(streamPayload);
  if (generatedForm) return generatedForm;

  if (streamPayload?.status && streamPayload.status !== "completed") {
    return undefined;
  }

  return (
    streamPayload?.body ??
    streamPayload?.result ??
    streamPayload?.data ??
    payload
  );
};

const readInstantProposalStream = async (
  response: Response,
  onStatusUpdate?: (status: { message: string; step?: string; mode?: string }) => void,
): Promise<unknown> => {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let latestPayload: unknown = null;

  const processBlocks = (blocks: string[]) => {
    blocks
      .map((block) => block.trim())
      .filter(Boolean)
      .flatMap(extractStreamPayloadsFromBlock)
      .forEach((streamPayload) => {
        if (streamPayload.eventName === "status" || streamPayload.eventName === "validating_output") {
          const payloadObj = typeof streamPayload.payload === "string"
            ? parseStreamPayload(streamPayload.payload)
            : streamPayload.payload;
          if (payloadObj && typeof payloadObj === "object") {
            const statusObj = payloadObj as { message?: string; step?: string; mode?: string };
            if (statusObj.message) {
              onStatusUpdate?.({
                message: statusObj.message,
                step: statusObj.step || (streamPayload.eventName === "validating_output" ? "validating_output" : undefined),
                mode: statusObj.mode,
              });
            }
          }
        }
        const nextPayload = getInstantProposalStreamResult(streamPayload);
        if (nextPayload !== undefined) {
          latestPayload = nextPayload;
        }
      });
  };

  if (!reader) {
    const text = await response.text();
    processBlocks(text.split(/\r?\n\r?\n/));
    return latestPayload;
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split(/\r?\n\r?\n/);
    buffer = blocks.pop() ?? "";
    processBlocks(blocks);
  }

  buffer += decoder.decode();

  if (buffer.trim()) {
    processBlocks([buffer]);
  }

  return latestPayload;
};

export const generateInstantProposalWithAi = async ({
  modelUri,
  payload,
  onStatusUpdate,
}: {
  modelUri?: string;
  payload: GenerateLeadCaptureV2Payload;
  onStatusUpdate?: (status: { message: string; step?: string; mode?: string }) => void;
}): Promise<unknown> => {
  const response = await fetch(buildInstantProposalAiUrl(modelUri), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: payload.prompt,
      organizationDetails: payload.organizationDetails,
      serviceTypes: payload.serviceTypes,
      location: payload.location,
      organizationLocalization: payload.organizationLocalization,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return readInstantProposalStream(response, onStatusUpdate);
};
