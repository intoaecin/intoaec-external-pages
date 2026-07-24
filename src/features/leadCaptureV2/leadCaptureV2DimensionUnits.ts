export const LEAD_CAPTURE_V2_DIMENSION_UNIT_TYPES = [
  "sq.ft",
  "sq.mt",
  "acre",
] as const;

export type LeadCaptureV2DimensionUnitType =
  (typeof LEAD_CAPTURE_V2_DIMENSION_UNIT_TYPES)[number];

export const DEFAULT_LEAD_CAPTURE_V2_DIMENSION_UNIT_TYPE: LeadCaptureV2DimensionUnitType =
  "sq.ft";

export const normalizeLeadCaptureV2DimensionUnit = (
  unit?: string | null,
): LeadCaptureV2DimensionUnitType => {
  const trimmed = unit?.trim();
  if (
    trimmed &&
    LEAD_CAPTURE_V2_DIMENSION_UNIT_TYPES.includes(
      trimmed as LeadCaptureV2DimensionUnitType,
    )
  ) {
    return trimmed as LeadCaptureV2DimensionUnitType;
  }
  return DEFAULT_LEAD_CAPTURE_V2_DIMENSION_UNIT_TYPE;
};
