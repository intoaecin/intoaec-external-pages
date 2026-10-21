import { useTheme } from "@mui/material/styles";
import type { MarkupShapeData, PageSize, SharedDrawingMarkup } from "../types";
import { getMarkupFontSizePx } from "../utils/markupShapes";
import {
  getMeasurementLabel,
  getMeasurementLabelPoint,
} from "../utils/markupMeasurements";
import { MarkupShapeSvg } from "./MarkupShapeSvg";

const RESOLVED_OPACITY = 0.5;
const LABEL_OFFSET_PX = 8;
const LABEL_HALO_PX = 3;

interface DrawingMarkupLayerProps {
  markups: SharedDrawingMarkup[];
  scaleShape?: MarkupShapeData;
  size: PageSize;
}

/** Read-only SVG overlay that scales with the page it covers. */
export function DrawingMarkupLayer({
  markups,
  scaleShape,
  size,
}: DrawingMarkupLayerProps) {
  const theme = useTheme();
  const { width, height } = size;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      {markups.map((markup) => {
        const label = getMeasurementLabel(
          markup.shapeData,
          scaleShape,
          width,
          height,
        );
        const [labelX, labelY] = getMeasurementLabelPoint(markup.shapeData);
        return (
          <g
            key={markup.annotationId}
            opacity={markup.status === "RESOLVED" ? RESOLVED_OPACITY : 1}
          >
            <MarkupShapeSvg
              shape={markup.shapeData}
              text={markup.text}
              size={size}
            />
            {label && (
              <text
                x={(labelX / 100) * width}
                y={(labelY / 100) * height - LABEL_OFFSET_PX}
                textAnchor="middle"
                fontSize={getMarkupFontSizePx(width)}
                fontFamily={theme.typography.fontFamily}
                fontWeight={500}
                fill={theme.palette.text.primary}
                stroke={theme.palette.background.paper}
                strokeWidth={LABEL_HALO_PX}
                paintOrder="stroke"
              >
                {label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
