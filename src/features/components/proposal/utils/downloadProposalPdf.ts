import jsPDF from "jspdf";
import { toJpeg } from "@/lib/htmlToPng";

type DownloadProposalPdfOptions = {
  pageIds: string[];
  fileName?: string;
  onProgress?: (progress: number) => void;
};

const PROPOSAL_PAGE_WIDTH_PX = 793.700787;
const PROPOSAL_PAGE_HEIGHT_PX = 1122.519685;

export const downloadProposalPdf = async ({
  pageIds,
  fileName = "proposal.pdf",
  onProgress,
}: DownloadProposalPdfOptions) => {
  const validPageIds = pageIds.filter(Boolean);
  if (!validPageIds.length) {
    throw new Error("No proposal pages available for PDF download.");
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  let addedPages = 0;

  for (let index = 0; index < validPageIds.length; index++) {
    const pageId = validPageIds[index];
    const sourceElement = document.getElementById(
      `preview-proposal-template-${pageId}`
    ) as HTMLElement | null;

    if (!sourceElement) {
      continue;
    }
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    const imageData = await toJpeg(sourceElement, {
      cacheBust: true,
      pixelRatio: 2.5,
      backgroundColor: "#ffffff",
      quality: 0.82,
      width: PROPOSAL_PAGE_WIDTH_PX,
      height: PROPOSAL_PAGE_HEIGHT_PX,
      canvasWidth: PROPOSAL_PAGE_WIDTH_PX,
      canvasHeight: PROPOSAL_PAGE_HEIGHT_PX,
      style: {
        transform: "none",
        width: `${PROPOSAL_PAGE_WIDTH_PX}px`,
        minWidth: `${PROPOSAL_PAGE_WIDTH_PX}px`,
        maxWidth: `${PROPOSAL_PAGE_WIDTH_PX}px`,
        height: `${PROPOSAL_PAGE_HEIGHT_PX}px`,
        minHeight: `${PROPOSAL_PAGE_HEIGHT_PX}px`,
        maxHeight: `${PROPOSAL_PAGE_HEIGHT_PX}px`,
        overflow: "hidden",
      },
    });

    if (addedPages > 0) {
      pdf.addPage();
    }

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageProperties = pdf.getImageProperties(imageData);
    const imageRatio = imageProperties.width / imageProperties.height;
    const pageRatio = pageWidth / pageHeight;

    const renderWidth =
      imageRatio > pageRatio ? pageWidth : pageHeight * imageRatio;
    const renderHeight =
      imageRatio > pageRatio ? pageWidth / imageRatio : pageHeight;
    const offsetX = (pageWidth - renderWidth) / 2;
    const offsetY = (pageHeight - renderHeight) / 2;

    pdf.addImage(
      imageData,
      "JPEG",
      offsetX,
      offsetY,
      renderWidth,
      renderHeight,
      undefined,
      "MEDIUM"
    );
    addedPages += 1;
    onProgress?.(Math.round((addedPages / validPageIds.length) * 100));
  }

  if (addedPages === 0) {
    throw new Error("Unable to render proposal pages for PDF download.");
  }

  pdf.save(fileName);
  onProgress?.(100);
};
