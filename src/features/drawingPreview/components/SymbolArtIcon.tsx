import type { SymbolArt } from "../utils/markupSymbolArt";

export interface SymbolIconProps {
  size?: number | string;
  color?: string;
  /** Position when nested inside another SVG (shared previews) */
  x?: number;
  y?: number;
}

const SYMBOL_FONT_FAMILY = "Helvetica, Arial, sans-serif";

/**
 * Draws one markup symbol as a standalone SVG: in the picker, inline on shared previews,
 * and as the image source for the viewer and PDF export, so all of them look the same.
 */
export function SymbolArtIcon({
  art,
  size = 24,
  color = "currentColor",
  x,
  y,
}: SymbolIconProps & { art: SymbolArt }) {
  const [minX, minY, side] = art.viewBox;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox={`${minX} ${minY} ${side} ${side}`}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {art.paths.map((path, index) => (
        <path
          key={index}
          d={path.d}
          strokeWidth={path.width}
          fill={path.filled ? color : "none"}
        />
      ))}
      {art.text && (
        <text
          x={art.text.x}
          y={art.text.y}
          fontSize={art.text.size}
          fontFamily={SYMBOL_FONT_FAMILY}
          fill={color}
          stroke="none"
        >
          {art.text.value}
        </text>
      )}
    </svg>
  );
}
