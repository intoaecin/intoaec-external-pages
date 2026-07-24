import { canToggleLeadCaptureV2WelcomeStep } from "./leadCaptureV2StepFlowConfig";
import { normalizeLeadCaptureV2StepFlowForFormType } from "./leadCaptureV2FormTypeStepFlow";
import type { LeadCaptureV2StepFlowConfig } from "./leadCaptureV2StepFlowConfig";
import type { LeadCaptureV2ApiField, LeadCaptureV2ApiItem } from "./api/leadCaptureV2Types";
import type { LeadCaptureV2ServiceTypeApiItem } from "./api/leadCaptureV2ServiceTypesTypes";
import {
  type LeadCaptureV2FieldOption,
  type LeadCaptureV2FieldTypeKey,
  type LeadCaptureV2FormField,
  type LeadCaptureV2PriceMatrix,
  type LeadCaptureV2Service,
} from "./components/leadCaptureV2LayoutConfig";

const createLeadCaptureV2LocalId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const mapApiFieldTypeToUi = (
  type: LeadCaptureV2ApiField["type"],
): LeadCaptureV2FieldTypeKey => {
  if (type === "text") return "shortText";
  if (type === "textarea") return "longText";
  if (
    type === "email" ||
    type === "phone" ||
    type === "dropdown" ||
    type === "checkbox" ||
    type === "number" ||
    type === "terms" ||
    type === "esign"
  ) {
    return type;
  }
  if (type === "multiselect") return "multiSelect";
  if (type === "radio") return "yesNo";
  if (type === "file") return "fileUpload";
  return "shortText";
};

const mapApiOptionsToUiOptions = (
  options: LeadCaptureV2ApiField["options"],
): LeadCaptureV2FieldOption[] | undefined =>
  Array.isArray(options)
    ? options.map((option) => ({
        id: option.fieldOptionId ?? createLeadCaptureV2LocalId("option"),
        fieldOptionId: option.fieldOptionId,
        label: option.label,
      }))
    : undefined;

const mapApiPriceMatrixToUi = (
  priceMatrix: LeadCaptureV2ApiField["priceMatrix"],
): LeadCaptureV2PriceMatrix => ({
  enabled: priceMatrix?.enabled ?? false,
  entries: (priceMatrix?.entries ?? []).map((entry) => ({
    id:
      entry.priceMatrixEntryId ??
      createLeadCaptureV2LocalId("price-matrix-entry"),
    priceMatrixEntryId: entry.priceMatrixEntryId,
    fieldOptionId: entry.fieldOptionId ?? null,
    value: String(entry.value ?? "0"),
  })),
});

export const normalizeLeadCaptureV2Boolean = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return value.trim().toLowerCase() === "true";
  return false;
};

export const mapApiFieldToUiField = (
  field: LeadCaptureV2ApiField,
  index: number,
): LeadCaptureV2FormField => {
  const typeKey =
    field.type === "number" && field.unitType
      ? "dimension"
      : mapApiFieldTypeToUi(field.type);
  const apiOptions = mapApiOptionsToUiOptions(field.options);
  const isLocked = Boolean(field.locked);

  return {
    id: field.formFieldId ?? `saved-${index}-${Date.now()}`,
    formFieldId: field.formFieldId,
    serviceTypeId: field.serviceTypeId ?? field.service_type_id ?? null,
    sourceItemId: field.formFieldId ?? field.type,
    labelKey: field.fieldName,
    labelGroup: "fieldTypes",
    title: field.fieldName,
    description: field.description ?? "",
    unitType: field.unitType ?? null,
    typeKey,
    options: apiOptions,
    priceMatrix: mapApiPriceMatrixToUi(field.priceMatrix),
    required: isLocked ? true : (field.required ?? false),
    enabled: isLocked ? true : (field.enabled ?? true),
    verificationRequired: field.verificationRequired ?? false,
    locked: isLocked,
  };
};

export const mapServiceTypeToService = (
  serviceType: LeadCaptureV2ServiceTypeApiItem,
): LeadCaptureV2Service => ({
  id: serviceType.serviceTypeId,
  icon: serviceType.icon || "🛠️",
  leadCaptureV2Id: serviceType.leadCaptureV2Id ?? null,
  name: serviceType.serviceName,
  tagline: serviceType.tagline || serviceType.tagLine || "",
  configured: serviceType.configured,
  active: normalizeLeadCaptureV2Boolean(serviceType.isActive),
});

export type ParsedLeadCaptureV2Form = {
  fields: LeadCaptureV2FormField[];
  serviceFieldsByServiceId: Record<string, LeadCaptureV2FormField[]>;
  stepFlowConfig: ReturnType<typeof normalizeLeadCaptureV2StepFlowForFormType>;
  formType: LeadCaptureV2ApiItem["formType"];
  formName: string;
  formTitle: string;
  formDescription: string;
};

export const parseLeadCaptureV2FormFromApi = (
  form: LeadCaptureV2ApiItem,
): ParsedLeadCaptureV2Form => {
  const allFields = (form.fields ?? []).map(mapApiFieldToUiField);
  const stepFlowConfig =
    form.stepFlowConfig ??
    (form as { step_flow_config?: LeadCaptureV2StepFlowConfig })
      .step_flow_config;

  return {
    fields: allFields.filter((field) => !field.serviceTypeId),
    serviceFieldsByServiceId: allFields.reduce<
      Record<string, LeadCaptureV2FormField[]>
    >((fieldsByServiceId, field) => {
      if (!field.serviceTypeId) return fieldsByServiceId;

      return {
        ...fieldsByServiceId,
        [field.serviceTypeId]: [
          ...(fieldsByServiceId[field.serviceTypeId] ?? []),
          field,
        ],
      };
    }, {}),
    stepFlowConfig: normalizeLeadCaptureV2StepFlowForFormType(
      form.formType,
      stepFlowConfig,
      {
        allowWelcomeToggle: canToggleLeadCaptureV2WelcomeStep(form.formType),
      },
    ),
    formType: form.formType,
    formName: form.formName ?? "",
    formTitle: form.title ?? "",
    formDescription: form.description ?? "",
  };
};

export const filterLeadCaptureV2ServicesForForm = (
  serviceTypes: LeadCaptureV2ServiceTypeApiItem[],
  leadCaptureV2Id: string,
  serviceFieldsByServiceId: Record<string, unknown[]> = {},
): LeadCaptureV2Service[] =>
  serviceTypes
    .filter((serviceType) => {
      if (!normalizeLeadCaptureV2Boolean(serviceType.isActive)) return false;
      if (serviceType.leadCaptureV2Id !== leadCaptureV2Id) return false;

      const hasSavedFields =
        (serviceFieldsByServiceId[serviceType.serviceTypeId]?.length ?? 0) > 0;

      return serviceType.configured || hasSavedFields;
    })
    .map(mapServiceTypeToService);
