import type { MarkupShapeData, SharedDrawingMarkup } from "../types";

/**
 * Read-only measurement helpers ported from intoaec-UI
 * `features/lead/fileViewer/markup/markupMeasurements.ts`. The label markers
 * below are what intoaec-UI stores, so they must stay identical.
 */

type MeasurementKind = "scale" | "line" | "area";
type MeasurementUnit = "m" | "ft";

const SCALE_PREFIX = "__drawing_scale_v1__:";
const LINE_LABEL = "__drawing_measure_line_v1__";
const AREA_LABEL = "__drawing_measure_area_v1__";

export const getMeasurementKind = (
  shape?: MarkupShapeData | null,
): MeasurementKind | null => {
  if (shape?.tool === "line" && shape.label?.startsWith(SCALE_PREFIX)) return "scale";
  if (shape?.tool === "line" && shape.label === LINE_LABEL) return "line";
  if (shape?.tool === "polygon" && shape.label === AREA_LABEL) return "area";
  return null;
};

const readScale = (shape?: MarkupShapeData | null) => {
  if (getMeasurementKind(shape) !== "scale" || !shape?.label) return null;
  const [rawDistance, unit] = shape.label.slice(SCALE_PREFIX.length).split(":");
  const distance = Number(rawDistance);
  return Number.isFinite(distance) && distance > 0 && (unit === "m" || unit === "ft")
    ? { distance, unit: unit as MeasurementUnit }
    : null;
};

/** Markups arrive oldest first, so the last scale reference on the page wins. */
export const getLatestScaleShape = (markups: SharedDrawingMarkup[]) =>
  [...markups].reverse().find((markup) => readScale(markup.shapeData))
    ?.shapeData;

const toPixels = ([x, y]: [number, number], width: number, height: number) =>
  [(x * width) / 100, (y * height) / 100] as const;

const linePixels = (shape: MarkupShapeData, width: number, height: number) => {
  if (shape.points.length < 2) return 0;
  const start = toPixels(shape.points[0], width, height);
  const end = toPixels(shape.points[shape.points.length - 1], width, height);
  return Math.hypot(end[0] - start[0], end[1] - start[1]);
};

const areaPixels = (shape: MarkupShapeData, width: number, height: number) => {
  if (shape.points.length < 3) return 0;
  return Math.abs(
    shape.points.reduce((sum, point, index) => {
      const next = shape.points[(index + 1) % shape.points.length];
      const [x1, y1] = toPixels(point, width, height);
      const [x2, y2] = toPixels(next, width, height);
      return sum + x1 * y2 - x2 * y1;
    }, 0) / 2,
  );
};

const formatMeasurement = (value: number, unit: string) =>
  `${value.toFixed(2)} ${unit}`;

/** The text shown on a measurement markup, or null for ordinary markups. */
export const getMeasurementLabel = (
  shape: MarkupShapeData,
  scaleShape: MarkupShapeData | undefined,
  width: number,
  height: number,
) => {
  const kind = getMeasurementKind(shape);
  if (!kind) return null;
  if (kind === "scale") {
    const reference = readScale(shape);
    return reference ? formatMeasurement(reference.distance, reference.unit) : null;
  }
  const scale = readScale(scaleShape);
  if (!scale || !scaleShape) return null;
  const referencePixels = linePixels(scaleShape, width, height);
  if (referencePixels <= 0) return null;
  const factor = scale.distance / referencePixels;
  const value =
    kind === "line"
      ? linePixels(shape, width, height) * factor
      : areaPixels(shape, width, height) * factor * factor;
  if (value <= 0) return null;
  return formatMeasurement(value, kind === "line" ? scale.unit : `${scale.unit}²`);
};

/** Where a measurement label sits: the middle of a line, the centre of an area's bounds. */
export const getMeasurementLabelPoint = (shape: MarkupShapeData) => {
  const { points } = shape;
  if (getMeasurementKind(shape) === "area") {
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    return [
      (Math.min(...xs) + Math.max(...xs)) / 2,
      (Math.min(...ys) + Math.max(...ys)) / 2,
    ] as const;
  }
  const last = points[points.length - 1] ?? points[0];
  return [(points[0][0] + last[0]) / 2, (points[0][1] + last[1]) / 2] as const;
};
