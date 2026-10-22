import { Box } from "@mui/material";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import type { SharedDrawing } from "./types";
import { DrawingDecisionActions } from "./components/DrawingDecisionActions";
import { DrawingPages } from "./components/DrawingPages";
import { DrawingPreviewHeader } from "./components/DrawingPreviewHeader";
import { DrawingZoomControls } from "./components/DrawingZoomControls";
import { useDrawingZoom } from "./useDrawingZoom";
import { downloadDrawingPdf } from "./utils/downloadDrawingPdf";

/** Page width at 100% zoom on wide screens */
const BASE_PAGE_WIDTH_PX = 1200;

/** Client-facing, read-only view of a shared drawing and its markups. */
export function DrawingPreview({ drawing }: { drawing: SharedDrawing }) {
  const { t } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const pagesRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const zoomState = useDrawingZoom(previewRef);

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
    <Box ref={previewRef} sx={{ minHeight: "100dvh" }}>
      <DrawingPreviewHeader
        fileName={drawing.fileName}
        versionNumber={drawing.versionNumber}
        onDownload={drawing.allowDownload === false ? undefined : handleDownload}
        canDownload={isReady}
        isDownloading={isDownloading}
        decisionActions={
          drawing.isDrawing === false ? undefined : (
            <DrawingDecisionActions drawing={drawing} />
          )
        }
      />
      <DrawingZoomControls
        zoom={zoomState.zoom}
        canZoomIn={zoomState.canZoomIn}
        canZoomOut={zoomState.canZoomOut}
        onZoomIn={zoomState.zoomIn}
        onZoomOut={zoomState.zoomOut}
        onZoomReset={zoomState.zoomReset}
      />
      <Box sx={{ overflow: "auto", p: { xs: 1.5, sm: 3 } }}>
        <Box
          ref={pagesRef}
          sx={{
            width: `calc(min(${BASE_PAGE_WIDTH_PX}px, 100%) * ${zoomState.zoom})`,
            mx: "auto",
          }}
        >
          <DrawingPages drawing={drawing} onReadyChange={setIsReady} />
        </Box>
      </Box>
    </Box>
  );
}
