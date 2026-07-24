import { type LeadCaptureV2FormField } from "./components/leadCaptureV2LayoutConfig";

export const LEAD_CAPTURE_V2_FULL_NAME_FIELD = "Full Name";
export const LEAD_CAPTURE_V2_EMAIL_FIELD = "Email Address";
export const LEAD_CAPTURE_V2_MOBILE_FIELD = "Mobile Number";
export const LEAD_CAPTURE_V2_AREA_FIELD = "Area";
export const LEAD_CAPTURE_V2_BUDGET_FIELD = "Budget";

const normalizeFieldName = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? "";

export const matchesLeadCaptureV2FieldName = (
  field: { title?: string; labelKey?: string },
  names: string[],
) => {
  const normalizedTitle = normalizeFieldName(field.title);
  const normalizedLabelKey = normalizeFieldName(field.labelKey);
  return names.some((name) => {
    const normalizedName = normalizeFieldName(name);
    return (
      normalizedTitle === normalizedName || normalizedLabelKey === normalizedName
    );
  });
};

export const ensureLockedFieldsForAiDraft = (
  draftFields: LeadCaptureV2FormField[],
  formType: string,
  createLocalId: (prefix: string) => string,
  getLockedFieldTitle: (fieldName: string) => string = (fieldName) =>
    fieldName,
): LeadCaptureV2FormField[] => {
  if (
    formType !== "lead-capture" &&
    formType !== "instant-proposal" &&
    formType !== "complaint-form" &&
    formType !== "feedback-form"
  ) {
    return draftFields;
  }

  const hasFullName = draftFields.some((field) =>
    matchesLeadCaptureV2FieldName(field, [LEAD_CAPTURE_V2_FULL_NAME_FIELD]),
  );
  const hasEmail = draftFields.some((field) =>
    matchesLeadCaptureV2FieldName(field, [
      LEAD_CAPTURE_V2_EMAIL_FIELD,
      "Email",
    ]),
  );
  const hasPhone = draftFields.some((field) =>
    matchesLeadCaptureV2FieldName(field, [
      LEAD_CAPTURE_V2_MOBILE_FIELD,
      "Phone",
      "Mobile",
      "Phone Number",
    ]),
  );

  const addedLockedFields: LeadCaptureV2FormField[] = [];
  if (!hasFullName) {
    addedLockedFields.push({
      id: createLocalId("ai-field"),
      formFieldId: undefined,
      serviceTypeId: null,
      sourceItemId: createLocalId("ai-source"),
      labelKey: LEAD_CAPTURE_V2_FULL_NAME_FIELD,
      labelGroup: "fieldTypes",
      title: getLockedFieldTitle(LEAD_CAPTURE_V2_FULL_NAME_FIELD),
      description: "",
      unitType: null,
      typeKey: "shortText",
      options: undefined,
      priceMatrix: { enabled: false, entries: [] },
      required: false,
      enabled: true,
      verificationRequired: false,
      locked: true,
    });
  }
  if (!hasEmail) {
    addedLockedFields.push({
      id: createLocalId("ai-field"),
      formFieldId: undefined,
      serviceTypeId: null,
      sourceItemId: createLocalId("ai-source"),
      labelKey: LEAD_CAPTURE_V2_EMAIL_FIELD,
      labelGroup: "fieldTypes",
      title: getLockedFieldTitle(LEAD_CAPTURE_V2_EMAIL_FIELD),
      description: "",
      unitType: null,
      typeKey: "email",
      options: undefined,
      priceMatrix: { enabled: false, entries: [] },
      required: true,
      enabled: true,
      verificationRequired: false,
      locked: true,
    });
  }
  if (!hasPhone && formType !== "feedback-form") {
    addedLockedFields.push({
      id: createLocalId("ai-field"),
      formFieldId: undefined,
      serviceTypeId: null,
      sourceItemId: createLocalId("ai-source"),
      labelKey: LEAD_CAPTURE_V2_MOBILE_FIELD,
      labelGroup: "fieldTypes",
      title: getLockedFieldTitle(LEAD_CAPTURE_V2_MOBILE_FIELD),
      description: "",
      unitType: null,
      typeKey: "phone",
      options: undefined,
      priceMatrix: { enabled: false, entries: [] },
      required: false,
      enabled: true,
      verificationRequired: false,
      locked: false,
    });
  }

  if (addedLockedFields.length > 0) {
    return [...addedLockedFields, ...draftFields];
  }
  return draftFields;
};
