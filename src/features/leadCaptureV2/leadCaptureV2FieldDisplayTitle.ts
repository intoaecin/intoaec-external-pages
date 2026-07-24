import type { TFunction } from "i18next";
import type { LeadCaptureV2FormField } from "./components/leadCaptureV2LayoutConfig";
import {
  LEAD_CAPTURE_V2_AREA_FIELD,
  LEAD_CAPTURE_V2_BUDGET_FIELD,
  LEAD_CAPTURE_V2_EMAIL_FIELD,
  LEAD_CAPTURE_V2_FULL_NAME_FIELD,
  LEAD_CAPTURE_V2_MOBILE_FIELD,
  matchesLeadCaptureV2FieldName,
} from "./leadCaptureV2LockedFields";

type LeadCaptureV2FieldTitleRef = Pick<
  LeadCaptureV2FormField,
  "title" | "labelKey" | "labelGroup"
>;

const LEAD_CAPTURE_V2_COMPLAINT_SUBJECT_FIELD = "Subject";
const LEAD_CAPTURE_V2_COMPLAINT_DETAILS_FIELD = "Complaint Details";
const LEAD_CAPTURE_V2_FEEDBACK_RATING_FIELD = "Rating";
const LEAD_CAPTURE_V2_FEEDBACK_DETAILS_FIELD = "Feedback";

const resolveKnownFieldI18nKey = (
  field: LeadCaptureV2FieldTitleRef,
): string | null => {
  if (matchesLeadCaptureV2FieldName(field, [LEAD_CAPTURE_V2_FULL_NAME_FIELD])) {
    return "leadCaptureV2.fields.fullName";
  }
  if (
    matchesLeadCaptureV2FieldName(field, [
      LEAD_CAPTURE_V2_EMAIL_FIELD,
      "Email",
    ])
  ) {
    return "leadCaptureV2.fields.emailAddress";
  }
  if (
    matchesLeadCaptureV2FieldName(field, [
      LEAD_CAPTURE_V2_MOBILE_FIELD,
      "Phone",
      "Mobile",
      "Phone Number",
    ])
  ) {
    return "leadCaptureV2.fields.mobileNumber";
  }
  if (matchesLeadCaptureV2FieldName(field, [LEAD_CAPTURE_V2_AREA_FIELD])) {
    return "leadCaptureV2.fields.area";
  }
  if (matchesLeadCaptureV2FieldName(field, [LEAD_CAPTURE_V2_BUDGET_FIELD])) {
    return "leadCaptureV2.fields.budget";
  }
  if (matchesLeadCaptureV2FieldName(field, ["Project Type"])) {
    return "leadCaptureV2.fields.projectType";
  }
  if (
    matchesLeadCaptureV2FieldName(field, [LEAD_CAPTURE_V2_COMPLAINT_SUBJECT_FIELD])
  ) {
    return "leadCaptureV2.fields.subject";
  }
  if (
    matchesLeadCaptureV2FieldName(field, [
      LEAD_CAPTURE_V2_COMPLAINT_DETAILS_FIELD,
    ])
  ) {
    return "leadCaptureV2.fields.complaintDetails";
  }
  if (
    matchesLeadCaptureV2FieldName(field, [LEAD_CAPTURE_V2_FEEDBACK_RATING_FIELD])
  ) {
    return "leadCaptureV2.fields.rating";
  }
  if (
    matchesLeadCaptureV2FieldName(field, [LEAD_CAPTURE_V2_FEEDBACK_DETAILS_FIELD])
  ) {
    return "leadCaptureV2.fields.feedback";
  }
  if (matchesLeadCaptureV2FieldName(field, ["E-Sign", "E Sign", "e-sign"])) {
    return "leadCaptureV2.fields.esign";
  }

  return null;
};

const matchesFieldNameOnlyByLabelKey = (
  field: { labelKey?: string },
  names: string[],
) => {
  const normalizedLabelKey = field.labelKey?.trim().toLowerCase() ?? "";
  return names.some((name) => name.toLowerCase() === normalizedLabelKey);
};

const isFieldTitleCustomized = (field: LeadCaptureV2FieldTitleRef): boolean => {
  if (!field.title) return false;

  const normalizedTitle = field.title.trim().toLowerCase();

  if (matchesFieldNameOnlyByLabelKey(field, [LEAD_CAPTURE_V2_FULL_NAME_FIELD])) {
    return normalizedTitle !== LEAD_CAPTURE_V2_FULL_NAME_FIELD.toLowerCase();
  }
  if (matchesFieldNameOnlyByLabelKey(field, [LEAD_CAPTURE_V2_EMAIL_FIELD, "Email"])) {
    return (
      normalizedTitle !== LEAD_CAPTURE_V2_EMAIL_FIELD.toLowerCase() &&
      normalizedTitle !== "email"
    );
  }
  if (
    matchesFieldNameOnlyByLabelKey(field, [
      LEAD_CAPTURE_V2_MOBILE_FIELD,
      "Phone",
      "Mobile",
      "Phone Number",
    ])
  ) {
    return (
      normalizedTitle !== LEAD_CAPTURE_V2_MOBILE_FIELD.toLowerCase() &&
      normalizedTitle !== "phone" &&
      normalizedTitle !== "mobile" &&
      normalizedTitle !== "phone number"
    );
  }
  if (matchesFieldNameOnlyByLabelKey(field, [LEAD_CAPTURE_V2_AREA_FIELD])) {
    return normalizedTitle !== LEAD_CAPTURE_V2_AREA_FIELD.toLowerCase();
  }
  if (matchesFieldNameOnlyByLabelKey(field, [LEAD_CAPTURE_V2_BUDGET_FIELD])) {
    return normalizedTitle !== LEAD_CAPTURE_V2_BUDGET_FIELD.toLowerCase();
  }
  if (matchesFieldNameOnlyByLabelKey(field, ["Project Type"])) {
    return normalizedTitle !== "project type";
  }
  if (matchesFieldNameOnlyByLabelKey(field, [LEAD_CAPTURE_V2_COMPLAINT_SUBJECT_FIELD])) {
    return normalizedTitle !== LEAD_CAPTURE_V2_COMPLAINT_SUBJECT_FIELD.toLowerCase();
  }
  if (matchesFieldNameOnlyByLabelKey(field, [LEAD_CAPTURE_V2_COMPLAINT_DETAILS_FIELD])) {
    return normalizedTitle !== LEAD_CAPTURE_V2_COMPLAINT_DETAILS_FIELD.toLowerCase();
  }
  if (matchesFieldNameOnlyByLabelKey(field, [LEAD_CAPTURE_V2_FEEDBACK_RATING_FIELD])) {
    return normalizedTitle !== LEAD_CAPTURE_V2_FEEDBACK_RATING_FIELD.toLowerCase();
  }
  if (matchesFieldNameOnlyByLabelKey(field, [LEAD_CAPTURE_V2_FEEDBACK_DETAILS_FIELD])) {
    return normalizedTitle !== LEAD_CAPTURE_V2_FEEDBACK_DETAILS_FIELD.toLowerCase();
  }
  if (matchesFieldNameOnlyByLabelKey(field, ["esign"])) {
    return normalizedTitle !== "e-sign" && normalizedTitle !== "e sign";
  }

  return false;
};

export const getLeadCaptureV2FieldDisplayTitle = (
  field: LeadCaptureV2FieldTitleRef,
  t: TFunction,
): string => {
  if (isFieldTitleCustomized(field)) {
    return field.title!.trim();
  }

  const knownKey = resolveKnownFieldI18nKey(field);
  if (knownKey) {
    return t(knownKey);
  }

  const customTitle = field.title?.trim();
  if (customTitle) {
    return customTitle;
  }

  const labelKey = field.labelKey?.trim();
  if (labelKey && field.labelGroup) {
    const dynamicKey = `leadCaptureV2.${field.labelGroup}.${labelKey}`;
    const translated = t(dynamicKey);
    if (translated !== dynamicKey) {
      return translated;
    }
  }

  return labelKey ?? "";
};

export const resolveLeadCaptureV2CanonicalFieldName = (
  field: LeadCaptureV2FieldTitleRef,
): string => {
  if (matchesLeadCaptureV2FieldName(field, [LEAD_CAPTURE_V2_FULL_NAME_FIELD])) {
    return LEAD_CAPTURE_V2_FULL_NAME_FIELD;
  }
  if (
    matchesLeadCaptureV2FieldName(field, [
      LEAD_CAPTURE_V2_EMAIL_FIELD,
      "Email",
    ])
  ) {
    return LEAD_CAPTURE_V2_EMAIL_FIELD;
  }
  if (
    matchesLeadCaptureV2FieldName(field, [
      LEAD_CAPTURE_V2_MOBILE_FIELD,
      "Phone",
      "Mobile",
      "Phone Number",
    ])
  ) {
    return LEAD_CAPTURE_V2_MOBILE_FIELD;
  }
  if (matchesLeadCaptureV2FieldName(field, [LEAD_CAPTURE_V2_AREA_FIELD])) {
    return LEAD_CAPTURE_V2_AREA_FIELD;
  }
  if (matchesLeadCaptureV2FieldName(field, [LEAD_CAPTURE_V2_BUDGET_FIELD])) {
    return LEAD_CAPTURE_V2_BUDGET_FIELD;
  }
  if (matchesLeadCaptureV2FieldName(field, ["Project Type"])) {
    return "Project Type";
  }
  if (
    matchesLeadCaptureV2FieldName(field, [LEAD_CAPTURE_V2_COMPLAINT_SUBJECT_FIELD])
  ) {
    return LEAD_CAPTURE_V2_COMPLAINT_SUBJECT_FIELD;
  }
  if (
    matchesLeadCaptureV2FieldName(field, [
      LEAD_CAPTURE_V2_COMPLAINT_DETAILS_FIELD,
    ])
  ) {
    return LEAD_CAPTURE_V2_COMPLAINT_DETAILS_FIELD;
  }
  if (
    matchesLeadCaptureV2FieldName(field, [LEAD_CAPTURE_V2_FEEDBACK_RATING_FIELD])
  ) {
    return LEAD_CAPTURE_V2_FEEDBACK_RATING_FIELD;
  }
  if (
    matchesLeadCaptureV2FieldName(field, [LEAD_CAPTURE_V2_FEEDBACK_DETAILS_FIELD])
  ) {
    return LEAD_CAPTURE_V2_FEEDBACK_DETAILS_FIELD;
  }

  return field.title?.trim() || field.labelKey?.trim() || "";
};
