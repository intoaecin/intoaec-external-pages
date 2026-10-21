import { useEffect, useState } from "react";
import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentProxy,
} from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/** Loads a PDF once per URL and destroys it when the URL changes or the page unmounts. */
export function usePdfDocument(fileUrl?: string) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!fileUrl) return;
    const loadingTask = getDocument({ url: fileUrl });
    setPdf(null);
    setError(null);
    loadingTask.promise.then(setPdf, (loadError: unknown) => {
      setError(loadError);
    });
    return () => {
      void loadingTask.destroy();
    };
  }, [fileUrl]);

  return { pdf, error };
}
