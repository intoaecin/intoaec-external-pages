import type { Palette } from "@mui/material/styles";
import type { MarkupShapeData, MarkupTool } from "../types";

/**
 * Rendering geometry ported from intoaec-UI
 * `features/lead/fileViewer/markup/markupShapes.ts` (drawing/editing helpers left out).
 * Markups must look the same in both apps, so keep the two in sync.
 */

/** Earlier markups stored a theme palette key instead of a hex colour. */
const LEGACY_PALETTE_COLORS = ["error", "warning", "primary", "success"] as const;
type LegacyPaletteColor = (typeof LEGACY_PALETTE_COLORS)[number];

const BOX_TOOLS: MarkupTool[] = ["rect", "ellipse", "triangle", "cloud"];
const CLOSED_TOOLS: MarkupTool[] = [...BOX_TOOLS, "polygon"];

const HIGHLIGHTER_OPACITY = 0.35;
const FILL_OPACITY = 0.35;
const ARROW_HEAD_PER_MILLE = 8;
const CLOUD_SCALLOP_PER_MILLE = 12;
const DEFAULT_MARKUP_TEXT_SIZE = 16;
/** Narrow drawings render text as if this wide, so small sizes stay legible and keep their ratios. */
const MIN_TEXT_REFERENCE_WIDTH = 750;

type Point = [number, number];

const toPx = ([x, y]: Point, width: number, height: number): Point => [
  (x / 100) * width,
  (y / 100) * height,
];

export const resolveMarkupColor = (color: string, palette: Palette) =>
  (LEGACY_PALETTE_COLORS as readonly string[]).includes(color)
    ? palette[color as LegacyPaletteColor].main
    : color;

/**
 * Saved stroke widths render at this fraction, so markups (new and already saved)
 * stay fine lines on detailed drawings instead of bold strokes.
 */
const MARKUP_STROKE_SCALE = 0.3;

export const getMarkupStrokeWidthPx = (shape: MarkupShapeData, width: number) =>
  (shape.strokeWidth * width * MARKUP_STROKE_SCALE) / 1000;

export const getMarkupOpacity = (shape: MarkupShapeData) =>
  shape.tool === "highlighter" ? HIGHLIGHTER_OPACITY : 1;

/** Fill opacity for filled shapes, or 0 when the shape is outline-only. */
export const getMarkupFillOpacity = (shape: MarkupShapeData) =>
  shape.filled && CLOSED_TOOLS.includes(shape.tool) ? FILL_OPACITY : 0;

/** Regular weight for text markups and measurement labels, so they read lighter than the drawing's lines. */
export const MARKUP_FONT_WEIGHT = 400;

/** Measurement labels ("8.00 m") are smaller than default text so they don't cover the drawing. */
export const MEASUREMENT_LABEL_TEXT_SIZE = 8;

export const getMarkupFontSizePx = (
  width: number,
  size: number = DEFAULT_MARKUP_TEXT_SIZE,
) => (size * Math.max(width, MIN_TEXT_REFERENCE_WIDTH)) / 1000;

export const getMarkupAnchor = (shape: MarkupShapeData): Point =>
  shape.points[0] ?? [0, 0];

const polylinePath = (points: Point[]) =>
  points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");

/** Revision cloud: half-circle scallops bulging outward along each edge of the box. */
const cloudPath = (start: Point, end: Point, width: number) => {
  const [left, right] = [Math.min(start[0], end[0]), Math.max(start[0], end[0])];
  const [top, bottom] = [Math.min(start[1], end[1]), Math.max(start[1], end[1])];
  const targetSize = (CLOUD_SCALLOP_PER_MILLE * width) / 1000;
  const corners: Point[] = [
    [left, top],
    [right, top],
    [right, bottom],
    [left, bottom],
    [left, top],
  ];
  let path = `M ${left} ${top}`;
  for (let edge = 0; edge < 4; edge += 1) {
    const [from, to] = [corners[edge], corners[edge + 1]];
    const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const count = Math.max(1, Math.round(length / targetSize));
    const radius = length / count / 2;
    for (let index = 1; index <= count; index += 1) {
      const x = from[0] + ((to[0] - from[0]) * index) / count;
      const y = from[1] + ((to[1] - from[1]) * index) / count;
      // Clockwise travel with sweep-flag 1 makes every scallop bulge outward.
      path += ` A ${radius} ${radius} 0 0 1 ${x} ${y}`;
    }
  }
  return `${path} Z`;
};

/** SVG path data for a markup in pixel space; text and symbol markups have no path. */
export const getMarkupPath = (
  shape: MarkupShapeData,
  width: number,
  height: number,
): string => {
  const points = shape.points.map((point) => toPx(point, width, height));
  const [start, end = start] = [points[0], points[points.length - 1]];
  if (!start) return "";

  switch (shape.tool) {
    case "pen":
    case "highlighter":
    case "polyline":
      return polylinePath(points);
    case "polygon":
      return `${polylinePath(points)} Z`;
    case "line":
      return `M ${start[0]} ${start[1]} L ${end[0]} ${end[1]}`;
    case "rect":
      return `M ${start[0]} ${start[1]} H ${end[0]} V ${end[1]} H ${start[0]} Z`;
    case "ellipse": {
      const cx = (start[0] + end[0]) / 2;
      const cy = (start[1] + end[1]) / 2;
      const rx = Math.abs(end[0] - start[0]) / 2;
      const ry = Math.abs(end[1] - start[1]) / 2;
      return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
    }
    case "triangle": {
      const [left, right] = [Math.min(start[0], end[0]), Math.max(start[0], end[0])];
      const [top, bottom] = [Math.min(start[1], end[1]), Math.max(start[1], end[1])];
      return `M ${(left + right) / 2} ${top} L ${right} ${bottom} L ${left} ${bottom} Z`;
    }
    case "cloud":
      return cloudPath(start, end, width);
    case "arrow": {
      const angle = Math.atan2(end[1] - start[1], end[0] - start[0]);
      const head = (ARROW_HEAD_PER_MILLE * width) / 1000;
      const left: Point = [
        end[0] - head * Math.cos(angle - Math.PI / 6),
        end[1] - head * Math.sin(angle - Math.PI / 6),
      ];
      const right: Point = [
        end[0] - head * Math.cos(angle + Math.PI / 6),
        end[1] - head * Math.sin(angle + Math.PI / 6),
      ];
      return `M ${start[0]} ${start[1]} L ${end[0]} ${end[1]} M ${left[0]} ${left[1]} L ${end[0]} ${end[1]} L ${right[0]} ${right[1]}`;
    }
    default:
      return "";
  }
};
