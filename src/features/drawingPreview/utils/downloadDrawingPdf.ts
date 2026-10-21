import jsPDF from "jspdf";

/** Marks each page frame so the download can find its background and markup layer. */
export const DRAWING_PAGE_ATTRIBUTE = "data-drawing-page";

const loadSvgImage = (svg: SVGSVGElement, width: number, height: number) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const copy = svg.cloneNode(true) as SVGSVGElement;
    copy.setAttribute("width", String(width));
    copy.setAttribute("height", String(height));
    const markup = new XMLSerializer().serializeToString(copy);
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  });

/** Flattens one on-screen page (PDF canvas or image, plus its SVG markups) into a canvas. */
const renderPageWithMarkups = async (page: HTMLElement) => {
  const background = page.querySelector<HTMLCanvasElement | HTMLImageElement>("canvas, img");
  if (!background) return null;
  const width =
    background instanceof HTMLCanvasElement ? background.width : background.naturalWidth;
  const height =
    background instanceof HTMLCanvasElement ? background.height : background.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(background, 0, 0, width, height);
  const svg = page.querySelector("svg");
  if (svg) context.drawImage(await loadSvgImage(svg, width, height), 0, 0, width, height);
  return canvas;
};

/** Downloads the drawing as a PDF with the markups drawn on every page, as the client sees it. */
export const downloadDrawingPdf = async (container: HTMLElement, fileName: string) => {
  const pages = Array.from(
    container.querySelectorAll<HTMLElement>(`[${DRAWING_PAGE_ATTRIBUTE}]`),
  );
  let doc: jsPDF | undefined;
  for (const page of pages) {
    const canvas = await renderPageWithMarkups(page);
    if (!canvas) continue;
    const format: [number, number] = [canvas.width, canvas.height];
    const orientation = canvas.width > canvas.height ? "landscape" : "portrait";
    if (!doc) doc = new jsPDF({ unit: "px", format, orientation });
    else doc.addPage(format, orientation);
    doc.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, canvas.width, canvas.height);
  }
  if (!doc) throw new Error("NO_PAGES_TO_DOWNLOAD");
  doc.save(`${fileName.replace(/\.[^.]+$/, "")}-markups.pdf`);
};
