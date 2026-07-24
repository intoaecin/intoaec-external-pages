import type { ProjectType } from "@/types";

export const FALLBACK_DEFAULT_PROJECT_TYPE = "RESIDENTIAL_PROJECT";

export type ProjectTypeDefaultCandidate = Pick<
  ProjectType,
  "projectTypeValue"
> & {
  isDefault?: boolean;
  isActive?: boolean;
};

export const normalizeProjectTypeValue = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const resolveDefaultProjectTypeValue = (
  projectTypes: ProjectTypeDefaultCandidate[],
): string => {
  const activeTypes = projectTypes.filter((type) => type.isActive !== false);
  const markedDefault = activeTypes.find((type) => type.isDefault);
  if (markedDefault?.projectTypeValue) {
    return markedDefault.projectTypeValue;
  }

  const residential = activeTypes.find(
    (type) => type.projectTypeValue === FALLBACK_DEFAULT_PROJECT_TYPE,
  );
  if (residential?.projectTypeValue) {
    return residential.projectTypeValue;
  }

  const firstUsable = activeTypes.find(
    (type) =>
      type.projectTypeValue &&
      type.projectTypeValue.toUpperCase() !== "OTHERS",
  );
  return firstUsable?.projectTypeValue ?? FALLBACK_DEFAULT_PROJECT_TYPE;
};

export const resolveProjectTypeWithDefault = (
  projectType: unknown,
  projectTypes: ProjectTypeDefaultCandidate[],
): string => {
  return (
    normalizeProjectTypeValue(projectType) ??
    resolveDefaultProjectTypeValue(projectTypes)
  );
};
