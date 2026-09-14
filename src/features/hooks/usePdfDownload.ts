import { useState } from "react";
import axios from "axios";
import { useEnv } from "@/features/hooks/useEnv";

const toDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string) || "");
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

export const usePdfDownload = () => {
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const { VITE_AEC_CHATBOT_ENDPOINT } = useEnv();

    const inlineImageSources = async (container: HTMLElement) => {
        const imageNodes = Array.from(container.querySelectorAll("img"));

        await Promise.all(
            imageNodes.map(async (imageNode) => {
                const src = imageNode.getAttribute("src");
                if (!src || src.startsWith("data:")) return;

                try {
                    const absoluteUrl = new URL(src, window.location.href).href;
                    const response = await fetch(absoluteUrl);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
                    }
                    const blob = await response.blob();
                    if (blob.size === 0) {
                        throw new Error("Fetched blob is empty");
                    }
                    imageNode.src = await toDataUrl(blob);
                } catch (error) {
                    console.error(`Error inlining image for PDF [${src}]:`, error);
                }
            })
        );
    };

    const inlineSvgIcons = (container: HTMLElement) => {
        const svgNodes = Array.from(container.querySelectorAll("svg"));
        const serializer = new XMLSerializer();

        svgNodes.forEach((svgNode) => {
            const svgMarkup = serializer.serializeToString(svgNode);
            const encodedSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
            const imageNode = document.createElement("img");

            const explicitWidth =
                svgNode.getAttribute("width") ||
                svgNode.style.width ||
                `${svgNode.clientWidth || 24}px`;
            const explicitHeight =
                svgNode.getAttribute("height") ||
                svgNode.style.height ||
                `${svgNode.clientHeight || 24}px`;

            imageNode.src = encodedSvg;
            imageNode.width = parseInt(explicitWidth, 10) || 24;
            imageNode.height = parseInt(explicitHeight, 10) || 24;
            imageNode.style.width = explicitWidth;
            imageNode.style.height = explicitHeight;
            imageNode.style.display = "inline-block";
            imageNode.style.verticalAlign = "middle";
            imageNode.className = svgNode.getAttribute("class") || "";
            imageNode.alt = "icon";

            svgNode.replaceWith(imageNode);
        });
    };

    const getDivWithStyles = async (elementId: string) => {
        const originalElement = document.getElementById(elementId);
        if (!originalElement) return "";

        const div = originalElement.cloneNode(true) as HTMLElement;

        div.style.transform = "scale(1)";
        div.style.width = "210mm";
        div.style.minHeight = "297mm";
        div.style.border = "none";
        div.style.backgroundColor = "#FFFFFF";
        div.style.overflow = "visible";

        // Keep Business / Vendor / Ship-To cards stretched side-by-side in the PDF clone.
        div.querySelectorAll(".rfq-po-info-cards").forEach((row) => {
            const el = row as HTMLElement;
            el.style.display = "flex";
            el.style.flexDirection = "row";
            el.style.flexWrap = "nowrap";
            el.style.alignItems = "stretch";
            el.style.width = "100%";
        });
        div.querySelectorAll(".rfq-po-info-cards > *").forEach((card) => {
            const el = card as HTMLElement;
            el.style.flex = "1 1 0";
            el.style.minWidth = "0";
            el.style.maxWidth = "none";
        });

        inlineSvgIcons(div);
        await inlineImageSources(div);

        // Ensure export HTML does not rely on clickable external links.
        Array.from(div.querySelectorAll("a")).forEach((anchor) => {
            anchor.removeAttribute("href");
            anchor.removeAttribute("target");
            anchor.removeAttribute("rel");
            anchor.style.pointerEvents = "none";
            anchor.style.textDecoration = "none";
        });

        // Copy styles from the document
        const styles = Array.from(document.styleSheets)
            .map((styleSheet) => {
                try {
                    return Array.from(styleSheet.cssRules)
                        .map((rule) => rule.cssText)
                        .join("\n");
                } catch (error) {
                    return "";
                }
            })
            .join("\n");

        const styleElement = document.createElement("style");
        styleElement.innerHTML = styles;
        div.prepend(styleElement);

        const fontFaces = Array.from(document.styleSheets)
            .flatMap((styleSheet) => {
                try {
                    return Array.from(styleSheet.cssRules)
                        .filter((rule) => rule instanceof CSSFontFaceRule)
                        .map((fontFaceRule) => fontFaceRule.cssText);
                } catch (error) {
                    return [];
                }
            })
            .join("\n");

        styleElement.innerHTML += fontFaces;

        div.style.fontFamily = "'Poppins', sans-serif";
        div.style.fontSize = "14px";

        return div.outerHTML;
    };

    const downloadPdf = async (fileName: string, elementId: string) => {
        try {
            const targetElement = document.getElementById(elementId);
            if (!targetElement) {
                console.error(`PDF Download Error: Element with ID "${elementId}" not found.`);
                return false;
            }

            setDownloading(true);
            setProgress(0);

            await new Promise((resolve) => setTimeout(resolve, 500));

            let htmlContentString = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                <style>
                html { font-size: 14px !important; background-color: #ffffff !important; font-family: 'Poppins', sans-serif !important; }
                body { font-size: 14px !important; margin: 0; padding: 0; transform: scale(1); background-color: #ffffff !important; font-family: 'Poppins', sans-serif !important; }
                * { box-sizing: border-box; }
                p, li, div, span, td, th { font-size: 14px !important; line-height: 1.5 !important; font-family: 'Poppins', sans-serif !important; }
                ul, ol { font-size: 14px !important; }
                ul li, ol li { font-size: 14px !important; line-height: 1.5 !important; margin-bottom: 0.5em !important; }
                p *, li *, div *, span * { font-size: 14px !important; font-family: 'Poppins', sans-serif !important; }
                img { max-width: 100%; }
                .hide-in-pdf { display: none !important; visibility: hidden !important; }
                .MuiTableHead-root, .MuiTableHead-root * { background-color: #3CA2FF !important; color: #ffffff !important; }
                .bg-white { background-color: #ffffff !important; }
                .rfq-po-info-cards { display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important; align-items: stretch !important; width: 100% !important; gap: 12px !important; }
                .rfq-po-info-cards > * { flex: 1 1 0 !important; min-width: 0 !important; max-width: none !important; overflow: hidden !important; }
                .rfq-po-org-logo { width: 64px !important; height: 64px !important; min-width: 64px !important; min-height: 64px !important; max-width: 64px !important; max-height: 64px !important; overflow: hidden !important; flex-shrink: 0 !important; }
                .rfq-po-org-logo img { width: 100% !important; height: 100% !important; max-width: 100% !important; max-height: 100% !important; object-fit: contain !important; display: block !important; }
                @media print {
                    html { font-size: 14px !important; background-color: #ffffff !important; font-family: 'Poppins', sans-serif !important; }
                    body { font-size: 14px !important; transform: scale(1) !important; background-color: #ffffff !important; font-family: 'Poppins', sans-serif !important; }
                    p, li, div, span, td, th { font-size: 14px !important; line-height: 1.5 !important; font-family: 'Poppins', sans-serif !important; }
                    ul, ol { font-size: 14px !important; }
                    ul li, ol li { font-size: 14px !important; line-height: 1.5 !important; margin-bottom: 0.5em !important; }
                    .hide-in-pdf { display: none !important; visibility: hidden !important; }
                    .rfq-po-info-cards { display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important; align-items: stretch !important; width: 100% !important; }
                    .rfq-po-info-cards > * { flex: 1 1 0 !important; min-width: 0 !important; max-width: none !important; overflow: hidden !important; }
                    .rfq-po-org-logo { width: 64px !important; height: 64px !important; overflow: hidden !important; flex-shrink: 0 !important; }
                    .rfq-po-org-logo img { width: 100% !important; height: 100% !important; object-fit: contain !important; display: block !important; }
                }
                @page { size: A4; margin: 5mm; }
            </style></head><body style="font-size: 14px !important; background-color: #ffffff !important; font-family: 'Poppins', sans-serif !important;">`;

            const divContent = await getDivWithStyles(elementId);
            htmlContentString += divContent;
            htmlContentString += "</body></html>";

            const response = await axios.post(
                VITE_AEC_CHATBOT_ENDPOINT + "/download-pdf",
                { htmlContent: htmlContentString, fileName },
                {
                    responseType: "arraybuffer",
                    onDownloadProgress: (progressEvent) => {
                        const total = progressEvent.total ?? progressEvent.loaded;
                        const current = progressEvent.loaded;
                        const percentage = Math.round((current / total) * 100);
                        setProgress(percentage);
                    },
                }
            );

            const pdfBuffer = response.data;
            const blob = new Blob([pdfBuffer], { type: "application/pdf" });
            const link = document.createElement("a");

            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);

            return true;
        } catch (error) {
            console.error("Error generating PDF:", error);
            return false;
        } finally {
            setDownloading(false);
            setProgress(0);
        }
    };

    return {
        downloading,
        progress,
        downloadPdf,
    };
};
