import { useTheme } from "@mui/material/styles";
import type { MarkupShapeData, PageSize } from "../types";
import {
  getMarkupAnchor,
  getMarkupFillOpacity,
  getMarkupFontSizePx,
  getMarkupOpacity,
  getMarkupPath,
  getMarkupStrokeWidthPx,
  MARKUP_FONT_WEIGHT,
  resolveMarkupColor,
} from "../utils/markupShapes";
import {
  getMarkupSymbolArt,
  getSymbolSizePerMille,
} from "../utils/markupSymbols";
import { SymbolArtIcon } from "./SymbolArtIcon";

interface MarkupShapeSvgProps {
  shape: MarkupShapeData;
  /** Text markups fall back to the annotation text when the shape has no label */
  text: string;
  size: PageSize;
}

/** One markup as SVG, in the page's natural coordinate space. */
export function MarkupShapeSvg({ shape, text, size }: MarkupShapeSvgProps) {
  const theme = useTheme();
  const { width, height } = size;
  const color = resolveMarkupColor(shape.color, theme.palette);
  const [xPercent, yPercent] = getMarkupAnchor(shape);
  const x = (xPercent / 100) * width;
  const y = (yPercent / 100) * height;

  if (shape.tool === "symbol") {
    const art = getMarkupSymbolArt(shape.symbolKey);
    const symbolSize = (getSymbolSizePerMille(shape) * width) / 1000;
    return art ? (
      <SymbolArtIcon
        art={art}
        x={x - symbolSize / 2}
        y={y - symbolSize / 2}
        size={symbolSize}
        color={color}
      />
    ) : null;
  }

  if (shape.tool === "text") {
    return (
      <text
        x={x}
        y={y}
        fill={color}
        fontSize={getMarkupFontSizePx(width, shape.fontSize)}
        fontFamily={theme.typography.fontFamily}
        fontWeight={MARKUP_FONT_WEIGHT}
        dominantBaseline="hanging"
      >
        {shape.label || text}
      </text>
    );
  }

  const path = getMarkupPath(shape, width, height);
  const fillOpacity = getMarkupFillOpacity(shape);
  return (
    <g opacity={getMarkupOpacity(shape)}>
      {fillOpacity > 0 && (
        <path d={path} fill={color} fillOpacity={fillOpacity} stroke="none" />
      )}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={getMarkupStrokeWidthPx(shape, width)}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}
