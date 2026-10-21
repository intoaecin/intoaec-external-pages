import { Box } from "@mui/material";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import type { SharedDrawing } from "./types";
import { DrawingPages } from "./components/DrawingPages";
import { DrawingPreviewHeader } from "./components/DrawingPreviewHeader";
import { downloadDrawingPdf } from "./utils/downloadDrawingPdf";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
/** Page width at 100% zoom on wide screens */
const BASE_PAGE_WIDTH_PX = 1200;

/** Client-facing, read-only view of a shared drawing and its markups. */
export function DrawingPreview({ drawing }: { drawing: SharedDrawing }) {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const pagesRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!pagesRef.current) return;
    setIsDownloading(true);
    try {
      await downloadDrawingPdf(pagesRef.current, drawing.fileName);
    } catch {
      toast.error(t("drawingPreview.downloadFailed"));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "background.default" }}>
      <DrawingPreviewHeader
        fileName={drawing.fileName}
        versionNumber={drawing.versionNumber}
        zoom={zoom}
        canZoomIn={zoom < MAX_ZOOM}
        canZoomOut={zoom > MIN_ZOOM}
        onZoomIn={() => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))}
        onZoomOut={() => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))}
        onDownload={drawing.allowDownload === false ? undefined : handleDownload}
        canDownload={isReady}
        isDownloading={isDownloading}
      />
      <Box sx={{ overflow: "auto", p: { xs: 1.5, sm: 3 } }}>
        <Box
          ref={pagesRef}
          sx={{
            width: `calc(min(${BASE_PAGE_WIDTH_PX}px, 100%) * ${zoom})`,
            mx: "auto",
          }}
        >
          <DrawingPages drawing={drawing} onReadyChange={setIsReady} />
        </Box>
      </Box>
    </Box>
  );
}
