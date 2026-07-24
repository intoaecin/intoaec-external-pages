import { formatSeedValues } from "@/lib/helpers";
import type { TFunction } from "i18next";
import type { ProjectType } from "@/types";
import type { LeadCaptureV2FormField } from "./components/leadCaptureV2LayoutConfig";

export const LEAD_CAPTURE_V2_PROJECT_TYPE_FIELD_NAME = "Project Type";

export const isLeadCaptureV2ProjectTypeField = (
  field: Pick<LeadCaptureV2FormField, "title" | "labelKey" | "typeKey">,
) =>
  field.typeKey === "dropdown" &&
  (field.title?.trim().toLowerCase() ===
    LEAD_CAPTURE_V2_PROJECT_TYPE_FIELD_NAME.toLowerCase() ||
    field.labelKey?.trim().toLowerCase() ===
      LEAD_CAPTURE_V2_PROJECT_TYPE_FIELD_NAME.toLowerCase());

export type LeadCaptureV2ProjectTypeOption = {
  value: string;
  label: string;
};

export const formatLeadCaptureV2ProjectTypeLabel = (
  value: string,
  t: TFunction,
) =>
  t(`projectType.${formatSeedValues(value)}`, {
    defaultValue: formatSeedValues(value),
  });

export const getLeadCaptureV2ProjectTypeOptions = (
  projectTypes: ProjectType[],
  t: TFunction,
): LeadCaptureV2ProjectTypeOption[] =>
  projectTypes
    .filter(
      (type) =>
        type.projectTypeValue &&
        type.projectTypeValue.toUpperCase() !== "OTHERS",
    )
    .map((type) => {
      const value = type.projectTypeValue;
      return {
        value,
        label: formatLeadCaptureV2ProjectTypeLabel(value, t),
      };
    });
