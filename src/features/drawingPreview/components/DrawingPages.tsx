import { Box, CircularProgress, Stack } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import FallbackExternalPage from "@/components/FallbackExternalPage";
import { useTranslation } from "react-i18next";
import type { SharedDrawing, SharedDrawingMarkup } from "../types";
import { groupMarkupsByPage } from "../utils/groupMarkupsByPage";
import { usePdfDocument } from "../utils/usePdfDocument";
import { ImageDrawingPage } from "./ImageDrawingPage";
import { PdfDrawingPage } from "./PdfDrawingPage";

const NO_MARKUPS: SharedDrawingMarkup[] = [];

interface DrawingPagesProps {
  drawing: SharedDrawing;
  /** True once every page has finished rendering, so it can be downloaded */
  onReadyChange: (isReady: boolean) => void;
}

/** Every page of the drawing, stacked, each with its own markups. */
export function DrawingPages({ drawing, onReadyChange }: DrawingPagesProps) {
  const { t } = useTranslation();
  const isPdf = drawing.fileExtension?.toLowerCase() === "pdf";
  const { pdf, error } = usePdfDocument(isPdf ? drawing.fileUrl : undefined);
  const markupsByPage = useMemo(
    () => groupMarkupsByPage(drawing.markups),
    [drawing.markups],
  );
  const [renderedPages, setRenderedPages] = useState<Set<number>>(new Set());
  const markRendered = useCallback(
    (pageNumber: number) =>
      setRenderedPages((current) => new Set(current).add(pageNumber)),
    [],
  );
  const pageCount = isPdf ? pdf?.numPages ?? 0 : 1;

  useEffect(() => {
    onReadyChange(pageCount > 0 && renderedPages.size >= pageCount);
  }, [onReadyChange, pageCount, renderedPages]);

  if (!isPdf) {
    return (
      <ImageDrawingPage
        fileUrl={drawing.fileUrl}
        fileName={drawing.fileName}
        markups={markupsByPage.get(1) ?? NO_MARKUPS}
        onRendered={() => markRendered(1)}
      />
    );
  }
  if (error) {
    return (
      <FallbackExternalPage
        title={t("drawingPreview.loadFailedTitle")}
        description={t("drawingPreview.loadFailedDescription")}
      />
    );
  }
  if (!pdf) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Stack spacing={2}>
      {Array.from({ length: pdf.numPages }, (_, index) => index + 1).map(
        (pageNumber) => (
          <PdfDrawingPage
            key={pageNumber}
            pdf={pdf}
            pageNumber={pageNumber}
            markups={markupsByPage.get(pageNumber) ?? NO_MARKUPS}
            onRendered={markRendered}
          />
        ),
      )}
    </Stack>
  );
}
