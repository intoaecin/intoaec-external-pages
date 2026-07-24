import type {
  LeadCaptureV2FormField,
  LeadCaptureV2Service,
} from "./components/leadCaptureV2LayoutConfig";
import type { LeadCaptureV2PreviewAnswer } from "./components/customerPreview/leadCaptureV2CustomerPreviewTypes";
import type { LeadCaptureV2FormType } from "./api/leadCaptureV2Types";
import { parseLeadCaptureV2FileAnswer } from "./leadCaptureV2FileAnswer";
import {
  LEAD_CAPTURE_V2_AREA_FIELD,
  LEAD_CAPTURE_V2_BUDGET_FIELD,
  LEAD_CAPTURE_V2_EMAIL_FIELD,
  LEAD_CAPTURE_V2_FULL_NAME_FIELD,
  LEAD_CAPTURE_V2_MOBILE_FIELD,
  matchesLeadCaptureV2FieldName,
} from "./leadCaptureV2LockedFields";
import {
  normalizeProjectTypeValue,
  resolveDefaultProjectTypeValue,
} from "@/utils/resolveDefaultProjectType";
import type { ProjectType } from "@/types";
import { isLeadCaptureV2ProjectTypeField } from "./leadCaptureV2ProjectTypeField";
import { getLeadCaptureV2SlotSubmitFields } from "./leadCaptureV2SlotSetup";
import { normalizeLeadCaptureV2DimensionUnit } from "./leadCaptureV2DimensionUnits";

const normalizeAnswerText = (answer: LeadCaptureV2PreviewAnswer | undefined) => {
  if (answer == null) return "";
  if (typeof answer === "string") {
    const fileAnswer = parseLeadCaptureV2FileAnswer(answer);
    if (fileAnswer) {
      return fileAnswer.url;
    }
    return answer.trim();
  }
  if (typeof answer === "number") return String(answer);
  if (Array.isArray(answer)) {
    return answer
      .map((value) => (typeof value === "string" ? value.trim() : String(value)))
      .filter(Boolean)
      .join(", ");
  }
  return "";
};

const getFieldAnswer = (
  fields: LeadCaptureV2FormField[],
  answers: Record<string, LeadCaptureV2PreviewAnswer>,
  matcher: (field: LeadCaptureV2FormField) => boolean,
) => {
  const field = fields.find(matcher);
  if (!field) return "";
  return normalizeAnswerText(answers[field.id]);
};

const parseNumericAnswer = (value: string) => {
  if (!value) return undefined;
  const numericPart = value.trim().split(" ")[0];
  const parsed = Number(numericPart);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toSubmissionAnswer = (answer: LeadCaptureV2PreviewAnswer | undefined) => {
  if (answer == null) {
    return "";
  }
  return answer;
};

const mapSubmissionFieldOptions = (field: LeadCaptureV2FormField) =>
  field.options?.map((option, index) => ({
    fieldOptionId: option.fieldOptionId ?? option.id,
    label: option.label,
    orderIndex: index,
  })) ?? [];

const buildServiceTypeNameById = (services: LeadCaptureV2Service[] = []) =>
  services.reduce<Record<string, string>>((lookup, service) => {
    const name = service.name?.trim();
    if (service.id && name) {
      lookup[service.id] = name;
    }
    return lookup;
  }, {});

const resolveFieldServiceType = (
  field: LeadCaptureV2FormField,
  serviceTypeNameById: Record<string, string>,
  selectedServiceTypeId?: string | null,
  selectedServiceType?: string | null,
) => {
  if (!field.serviceTypeId) return null;
  return (
    serviceTypeNameById[field.serviceTypeId] ??
    (field.serviceTypeId === selectedServiceTypeId
      ? selectedServiceType?.trim() || null
      : null)
  );
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const resolveDimensionSelectedUnit = (
  field: LeadCaptureV2FormField,
  dimensionUnitsByFieldId: Record<string, string> = {},
) => {
  if (field.typeKey !== "dimension") {
    return null;
  }

  const selectedUnit = dimensionUnitsByFieldId[field.id]?.trim();
  if (selectedUnit) {
    return normalizeLeadCaptureV2DimensionUnit(selectedUnit);
  }

  if (field.unitType?.trim()) {
    return normalizeLeadCaptureV2DimensionUnit(field.unitType);
  }

  return null;
};

const formatFieldSubmissionAnswer = (
  field: LeadCaptureV2FormField,
  answer: LeadCaptureV2PreviewAnswer | undefined,
  selectedUnitType?: string | null,
) => {
  const raw = toSubmissionAnswer(answer);
  if (field.typeKey !== "dimension" || !selectedUnitType) {
    return raw;
  }
  if (raw == null || raw === "") {
    return raw;
  }
  if (Array.isArray(raw)) {
    return raw;
  }

  const text = String(raw).trim();
  if (!text) {
    return raw;
  }

  const unit = selectedUnitType.trim();
  const unitSuffixPattern = new RegExp(`\\s*${escapeRegExp(unit)}$`, "i");
  if (unitSuffixPattern.test(text)) {
    return text;
  }

  return `${text} ${unit}`;
};

const mapSubmissionPriceMatrix = (
  field: LeadCaptureV2FormField,
  selectedUnitType?: string | null,
) => ({
  enabled: field.priceMatrix?.enabled ?? false,
  ...(selectedUnitType ? { unitType: selectedUnitType } : {}),
  entries:
    field.priceMatrix?.entries.map((entry) => ({
      priceMatrixEntryId: entry.priceMatrixEntryId ?? entry.id,
      fieldOptionId: entry.fieldOptionId ?? null,
      value: entry.value ?? "0",
    })) ?? [],
});

const getSubmissionFieldName = (field: LeadCaptureV2FormField) => {
  const title = field.title?.trim();
  if (title) return title;
  const labelKey = field.labelKey?.trim();
  if (labelKey) return labelKey;
  return field.id;
};

const buildLeadCaptureV2Responses = (
  fields: LeadCaptureV2FormField[],
  answers: Record<string, LeadCaptureV2PreviewAnswer>,
  options: {
    services?: LeadCaptureV2Service[];
    selectedServiceTypeId?: string | null;
    selectedServiceType?: string | null;
    dimensionUnitsByFieldId?: Record<string, string>;
  } = {},
) => {
  const serviceTypeNameById = buildServiceTypeNameById(options.services ?? []);
  const dimensionUnitsByFieldId = options.dimensionUnitsByFieldId ?? {};

  return fields
    .filter((field) => field.enabled)
    .map((field) => {
      const selectedUnitType = resolveDimensionSelectedUnit(
        field,
        dimensionUnitsByFieldId,
      );

      return {
        fieldId: field.id,
        formFieldId: field.formFieldId ?? null,
        sourceItemId: field.sourceItemId ?? null,
        serviceTypeId: field.serviceTypeId ?? null,
        serviceType: resolveFieldServiceType(
          field,
          serviceTypeNameById,
          options.selectedServiceTypeId,
          options.selectedServiceType,
        ),
        fieldName: getSubmissionFieldName(field),
        description: field.description ?? "",
        typeKey: field.typeKey,
        unitType: field.unitType ?? null,
        ...(selectedUnitType ? { selectedUnitType } : {}),
        options: mapSubmissionFieldOptions(field),
        priceMatrix: mapSubmissionPriceMatrix(field, selectedUnitType),
        answer: formatFieldSubmissionAnswer(
          field,
          answers[field.id],
          selectedUnitType,
        ),
      };
    });
};

export const shouldCreateLeadForLeadCaptureV2FormType = (
  formType?: LeadCaptureV2FormType | null,
) => formType === "lead-capture" || formType === "instant-proposal";

export const collectLeadCaptureV2SubmitFields = (
  fields: LeadCaptureV2FormField[],
  serviceFieldsByServiceId: Record<string, LeadCaptureV2FormField[]> = {},
) => {
  const merged = [...fields];
  const seenIds = new Set(fields.map((field) => field.id));

  Object.values(serviceFieldsByServiceId).forEach((serviceFields) => {
    serviceFields.forEach((field) => {
      if (seenIds.has(field.id)) return;
      seenIds.add(field.id);
      merged.push(field);
    });
  });

  return merged;
};

export const buildLeadCapturePayloadFromAnswers = ({
  answers,
  fields,
  formType,
  leadCaptureV2Id,
  selectedServiceTypeId,
  selectedServiceType,
  services = [],
  dimensionUnitsByFieldId = {},
  organizationId,
  organizationName,
  organizationType,
  projectSource,
  includeSlotSetup = false,
  projectTypes = [],
  useDefaultProjectTypeWhenMissing = false,
}: {
  answers: Record<string, LeadCaptureV2PreviewAnswer>;
  fields: LeadCaptureV2FormField[];
  formType?: LeadCaptureV2FormType;
  leadCaptureV2Id?: string;
  selectedServiceTypeId?: string | null;
  selectedServiceType?: string | null;
  services?: LeadCaptureV2Service[];
  dimensionUnitsByFieldId?: Record<string, string>;
  organizationId: string;
  organizationName?: string;
  organizationType: string;
  projectSource?: string;
  includeSlotSetup?: boolean;
  projectTypes?: ProjectType[];
  useDefaultProjectTypeWhenMissing?: boolean;
}) => {
  const leadName = getFieldAnswer(fields, answers, (field) =>
    field.typeKey === "shortText" &&
    matchesLeadCaptureV2FieldName(field, [LEAD_CAPTURE_V2_FULL_NAME_FIELD]),
  );
  const leadEmail = getFieldAnswer(fields, answers, (field) =>
    field.typeKey === "email" &&
    matchesLeadCaptureV2FieldName(field, [LEAD_CAPTURE_V2_EMAIL_FIELD, "Email"]),
  );
  const leadMobile = getFieldAnswer(fields, answers, (field) =>
    field.typeKey === "phone" &&
    matchesLeadCaptureV2FieldName(field, [
      LEAD_CAPTURE_V2_MOBILE_FIELD,
      "Mobile",
      "Phone Number",
    ]),
  );
  const projectTypeAnswer = getFieldAnswer(
    fields,
    answers,
    isLeadCaptureV2ProjectTypeField,
  );
  const projectType =
    normalizeProjectTypeValue(projectTypeAnswer) ??
    (useDefaultProjectTypeWhenMissing
      ? resolveDefaultProjectTypeValue(projectTypes)
      : null);
  const projectAreaValue = getFieldAnswer(fields, answers, (field) =>
    (field.typeKey === "number" || field.typeKey === "dimension") &&
    matchesLeadCaptureV2FieldName(field, [LEAD_CAPTURE_V2_AREA_FIELD]),
  );
  const projectBudgetValue = getFieldAnswer(fields, answers, (field) =>
    field.typeKey === "number" &&
    matchesLeadCaptureV2FieldName(field, [LEAD_CAPTURE_V2_BUDGET_FIELD]),
  );
  const projectArea = parseNumericAnswer(projectAreaValue);
  const projectAreaUnit = (() => {
    if (!projectAreaValue) return undefined;
    const parts = projectAreaValue.trim().split(" ");
    return parts.length > 1 ? parts[1] : undefined;
  })();

  const slotFields = includeSlotSetup ? getLeadCaptureV2SlotSubmitFields() : {};

  return {
    eventType: "CREATE_OR_UPDATE_LEAD" as const,
    leadName,
    leadEmail: leadEmail || null,
    leadMobile,
    organizationId,
    organizationName,
    organizationType,
    projectSource: projectSource ?? "Leadcapture",
    isLeadCapture: true,
    ...(formType ? { formType } : {}),
    ...(leadCaptureV2Id ? { leadCaptureV2Id, formId: leadCaptureV2Id } : {}),
    ...(selectedServiceTypeId ? { selectedServiceTypeId } : {}),
    ...(selectedServiceType ? { serviceType: selectedServiceType } : {}),
    entityType: "LEAD_CAPTURE_V2" as const,
    ...(projectType ? { projectType } : {}),
    ...(projectArea != null ? { projectArea } : { projectArea: 0 }),
    ...(projectAreaUnit ? { projectAreaUnit } : {}),
    ...(parseNumericAnswer(projectBudgetValue) != null
      ? { projectBudget: parseNumericAnswer(projectBudgetValue) }
      : {}),
    leadCaptureV2Responses: buildLeadCaptureV2Responses(fields, answers, {
      services,
      selectedServiceTypeId,
      selectedServiceType,
      dimensionUnitsByFieldId,
    }),
    answers,
    ...slotFields,
  };
};

export const buildLeadCaptureV2SubmissionPayloadFromAnswers = (
  params: Parameters<typeof buildLeadCapturePayloadFromAnswers>[0],
) => ({
  ...buildLeadCapturePayloadFromAnswers(params),
  eventType: "CREATE_FORM_SUBMISSION" as const,
  isLeadCapture: false,
});
