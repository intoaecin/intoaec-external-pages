import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import type { PageSize, SharedDrawingMarkup } from "../types";
import { DrawingPageFrame } from "./DrawingPageFrame";

/** Pages render this wide in device pixels, so they stay sharp when the client zooms in. */
const RENDER_WIDTH_PX = 2400;

interface PdfDrawingPageProps {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  markups: SharedDrawingMarkup[];
  onRendered: (pageNumber: number) => void;
}

export function PdfDrawingPage({
  pdf,
  pageNumber,
  markups,
  onRendered,
}: PdfDrawingPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState<PageSize | null>(null);

  useEffect(() => {
    let isCancelled = false;
    let renderTask: RenderTask | null = null;

    void pdf.getPage(pageNumber).then((page) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (isCancelled || !canvas || !context) return;
      const naturalViewport = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({
        scale: RENDER_WIDTH_PX / naturalViewport.width,
      });
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      setSize({ width: naturalViewport.width, height: naturalViewport.height });
      renderTask = page.render({ canvasContext: context, viewport });
      renderTask.promise.then(
        () => !isCancelled && onRendered(pageNumber),
        () => undefined,
      );
    });

    return () => {
      isCancelled = true;
      renderTask?.cancel();
    };
  }, [pdf, pageNumber, onRendered]);

  return (
    <DrawingPageFrame size={size} markups={markups}>
      <canvas ref={canvasRef} />
    </DrawingPageFrame>
  );
}
