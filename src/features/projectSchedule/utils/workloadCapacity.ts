export const DEFAULT_ORGANIZATION_WORKING_HOURS = 8;
export const MIN_ORGANIZATION_WORKING_HOURS = 0.5;
export const MAX_ORGANIZATION_WORKING_HOURS = 24;

export function normalizeOrganizationWorkingHours(value: unknown): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
      ? Number(value)
      : Number.NaN;

  if (
    Number.isFinite(parsed) &&
    parsed >= MIN_ORGANIZATION_WORKING_HOURS &&
    parsed <= MAX_ORGANIZATION_WORKING_HOURS
  ) {
    return Number(parsed.toFixed(2));
  }

  return DEFAULT_ORGANIZATION_WORKING_HOURS;
}

