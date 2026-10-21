import { Box } from "@mui/material";
import type { ReactNode } from "react";
import type { PageSize, SharedDrawingMarkup } from "../types";
import { DRAWING_PAGE_ATTRIBUTE } from "../utils/downloadDrawingPdf";
import { getLatestScaleShape } from "../utils/markupMeasurements";
import { DrawingMarkupLayer } from "./DrawingMarkupLayer";

interface DrawingPageFrameProps {
  /** Natural page size; unknown until the page has loaded */
  size: PageSize | null;
  markups: SharedDrawingMarkup[];
  children: ReactNode;
}

/** One drawing page with its markups layered on top; width follows the zoomed container. */
export function DrawingPageFrame({ size, markups, children }: DrawingPageFrameProps) {
  return (
    <Box
      {...{ [DRAWING_PAGE_ATTRIBUTE]: true }}
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: size ? `${size.width} / ${size.height}` : undefined,
        overflow: "hidden",
        border: 1,
        borderColor: "divider",
      }}
    >
      <Box sx={{ "& > canvas, & > img": { display: "block", width: "100%", height: "100%" } }}>
        {children}
      </Box>
      {size && (
        <DrawingMarkupLayer
          markups={markups}
          scaleShape={getLatestScaleShape(markups)}
          size={size}
        />
      )}
    </Box>
  );
}
