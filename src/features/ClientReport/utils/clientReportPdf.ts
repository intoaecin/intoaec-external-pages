import { CLIENT_REPORT_COLORS } from "@/constants/colors";
import { fetchAndInlineResources } from "@/lib/helpers";
import { getElementHtmlWithComputedStyles } from "@/utils/pdfHtml";
import axios from "axios";

export const CLIENT_REPORT_PDF_PRINT_STYLES = `
  <style>
    @page {
      size: A4;
      margin: 12mm;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      background: ${CLIENT_REPORT_COLORS.pageBackground};
      overflow: visible !important;
      height: auto !important;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    .client-report-pdf {
      width: 100%;
      max-width: 700px;
      margin: 0 auto;
      background: ${CLIENT_REPORT_COLORS.pageBackground};
      overflow: visible !important;
      height: auto !important;
      max-height: none !important;
    }

    .client-report-pdf,
    .client-report-pdf * {
      overflow: visible !important;
      max-height: none !important;
    }

    .client-report-pdf,
    .client-report-pdf > * {
      width: 100% !important;
      max-width: 100% !important;
    }

    .client-report-pdf .report-pdf-title,
    .client-report-pdf .card-title-text,
    .client-report-pdf .report-list-title,
    .client-report-pdf .detail-item-value,
    .client-report-pdf button .MuiTypography-caption,
    .client-report-pdf button p,
    .client-report-pdf button span {
      overflow: hidden !important;
    }

    .client-report-pdf .report-task-row {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 10px !important;
      height: auto !important;
      min-height: 0 !important;
    }

    .client-report-pdf .report-task-card {
      height: auto !important;
      min-height: 180px !important;
      padding-bottom: 44px !important;
      overflow: visible !important;
      display: block !important;
    }

    .client-report-pdf .report-task-grid {
      height: auto !important;
      min-height: 132px !important;
      overflow: visible !important;
      display: block !important;
    }

    .client-report-pdf .report-task-item {
      height: auto !important;
      min-height: 128px !important;
      padding-bottom: 24px !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    .client-report-pdf .report-progress-block {
      width: 100% !important;
      max-width: 100% !important;
      margin-left: 0 !important;
      margin-top: 12px !important;
      padding-bottom: 8px !important;
      flex-shrink: 1 !important;
      display: block !important;
      height: auto !important;
      min-height: 36px !important;
      clear: both !important;
    }

    .client-report-pdf .report-progress-track {
      display: block !important;
      width: 100% !important;
      margin-top: 6px !important;
      overflow: hidden !important;
    }

    .client-report-pdf .report-status-chip {
      width: auto !important;
      max-width: 180px !important;
      min-width: 0 !important;
      overflow: hidden !important;
      height: auto !important;
      min-height: 20px !important;
      display: inline-flex !important;
      flex: 0 0 auto !important;
    }

    .client-report-pdf .report-status-chip .MuiChip-label {
      display: block !important;
      width: auto !important;
      max-width: 160px !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }

    .client-report-pdf .report-inventory-row {
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) 150px !important;
      align-items: start !important;
      gap: 16px !important;
    }

    .client-report-pdf .report-inventory-category,
    .client-report-pdf .report-inventory-name {
      display: block !important;
      line-height: 1.35 !important;
      white-space: normal !important;
      overflow-wrap: anywhere !important;
      word-break: break-word !important;
      overflow: hidden !important;
    }

    .client-report-pdf .report-inventory-category {
      margin-bottom: 4px !important;
    }

    .client-report-pdf .report-inventory-metrics {
      min-width: 150px !important;
      width: 150px !important;
      flex-shrink: 0 !important;
    }

    .report-pdf-logo-header {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 16px !important;
      padding: 16px 24px 0 !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }

    .report-pdf-logo-header > div:first-child {
      flex: 0 0 72px !important;
      min-width: 72px !important;
      max-width: 72px !important;
      overflow: hidden !important;
    }

    .report-pdf-logo-header img {
      max-height: 48px !important;
      object-fit: contain !important;
    }

    .report-pdf-title {
      margin: 0 !important;
      color: ${CLIENT_REPORT_COLORS.pdfHeaderText} !important;
      font-size: 18px !important;
      font-weight: 700 !important;
      line-height: 1.3 !important;
      text-align: right !important;
      overflow-wrap: anywhere !important;
      word-break: break-word !important;
      white-space: normal !important;
      flex: 1 1 auto !important;
      min-width: 0 !important;
      max-width: calc(100% - 96px) !important;
      display: -webkit-box !important;
      -webkit-box-orient: vertical !important;
      -webkit-line-clamp: 2 !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }

    .client-report-business-info {
      width: 100%;
      background: ${CLIENT_REPORT_COLORS.pageBackground};
      padding: 16px 8px 8px;
      color: ${CLIENT_REPORT_COLORS.pdfHeaderText};
      font-family: Arial, sans-serif;
    }

    .client-report-business-info > div > div {
      display: flex !important;
      flex-direction: row !important;
      align-items: stretch !important;
      justify-content: space-between !important;
      gap: 16px !important;
      padding: 8px 24px !important;
      height: auto !important;
      min-height: 0 !important;
    }

    .business-info-card,
    .client-info-card {
      flex: 1 !important;
      width: calc(50% - 8px) !important;
      min-width: calc(50% - 8px) !important;
      max-width: calc(50% - 8px) !important;
      border: 1px solid ${CLIENT_REPORT_COLORS.cardBorder} !important;
      border-radius: 12px !important;
      padding: 16px !important;
      box-shadow: ${CLIENT_REPORT_COLORS.cardShadow} !important;
      background: ${CLIENT_REPORT_COLORS.paperSurface} !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      display: flex !important;
      flex-direction: column !important;
      box-sizing: border-box !important;
    }

    .client-info-card {
      background: ${CLIENT_REPORT_COLORS.cardSurface} !important;
    }

    .card-header-container {
      display: block !important;
      width: 100% !important;
      margin-bottom: 16px !important;
      min-width: 0 !important;
    }

    .card-header-label {
      font-size: 10px !important;
      font-weight: 600 !important;
      color: ${CLIENT_REPORT_COLORS.mutedText} !important;
      text-transform: uppercase !important;
      letter-spacing: 0.05em !important;
      margin: 0 !important;
    }

    .card-title-text {
      font-size: 16px !important;
      font-weight: 700 !important;
      color: ${CLIENT_REPORT_COLORS.bodyText} !important;
      margin-top: 4px !important;
      line-height: 1.3 !important;
      text-align: left !important;
      white-space: normal !important;
      overflow-wrap: anywhere !important;
      word-break: break-word !important;
      display: -webkit-box !important;
      -webkit-box-orient: vertical !important;
      -webkit-line-clamp: 2 !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }

    .report-list-title {
      white-space: normal !important;
      overflow-wrap: anywhere !important;
      word-break: break-word !important;
      display: -webkit-box !important;
      -webkit-box-orient: vertical !important;
      -webkit-line-clamp: 2 !important;
      line-height: 1.35 !important;
      max-height: 2.7em !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }

    .card-logo-container {
      width: 44px !important;
      height: 44px !important;
      border-radius: 6px !important;
      border: 1px solid ${CLIENT_REPORT_COLORS.cardBorder} !important;
      padding: 2px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      overflow: hidden !important;
      flex-shrink: 0 !important;
      background-color: ${CLIENT_REPORT_COLORS.paperSurface} !important;
      box-sizing: border-box !important;
    }

    .client-info-card .card-logo-container {
      background-color: ${CLIENT_REPORT_COLORS.pdfMutedSurface} !important;
    }

    .card-logo-container p,
    .card-logo-container span {
      font-size: 18px !important;
      font-weight: 600 !important;
      color: ${CLIENT_REPORT_COLORS.bodyText} !important;
      margin: 0 !important;
    }

    .card-logo-container img {
      width: 100% !important;
      height: 100% !important;
    }

    .card-details-container {
      display: flex !important;
      flex-direction: column !important;
      gap: 12px !important;
      width: 100% !important;
    }

    .detail-item {
      display: flex !important;
      align-items: flex-start !important;
      gap: 8px !important;
      width: 100% !important;
    }

    .detail-item-icon {
      margin-top: 2px !important;
      color: ${CLIENT_REPORT_COLORS.mutedText} !important;
      display: flex !important;
      align-items: center !important;
      width: 14px !important;
      height: 14px !important;
      flex-shrink: 0 !important;
    }

    .detail-item-icon svg {
      width: 14px !important;
      height: 14px !important;
    }

    .detail-item-content {
      flex: 1 !important;
      min-width: 0 !important;
      width: 100% !important;
    }

    .detail-item-label {
      font-size: 10px !important;
      font-weight: 500 !important;
      color: ${CLIENT_REPORT_COLORS.mutedText} !important;
      margin-bottom: 2px !important;
      display: block !important;
      text-transform: none !important;
    }

    .detail-item-value {
      font-size: 12px !important;
      font-weight: 500 !important;
      color: ${CLIENT_REPORT_COLORS.bodyText} !important;
      word-break: break-word !important;
      overflow-wrap: anywhere !important;
      white-space: normal !important;
      display: block !important;
      margin: 0 !important;
      display: -webkit-box !important;
      -webkit-box-orient: vertical !important;
      -webkit-line-clamp: 2 !important;
      max-height: 2.8em !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }

    .detail-item-value > span,
    .detail-item-value > div {
      white-space: normal !important;
      overflow-wrap: anywhere !important;
      word-break: break-word !important;
    }

    .client-report-pdf [title],
    .client-report-pdf p,
    .client-report-pdf span {
      overflow-wrap: anywhere !important;
      word-break: break-word !important;
    }

    .client-report-pdf button .MuiTypography-caption,
    .client-report-pdf button p,
    .client-report-pdf button span {
      white-space: normal !important;
      display: -webkit-box !important;
      -webkit-box-orient: vertical !important;
      -webkit-line-clamp: 2 !important;
      line-height: 1.2 !important;
      max-height: 2.4em !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      text-align: center !important;
    }

    .details-grid-row {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 12px !important;
      width: 100% !important;
    }

    .details-grid-col {
      flex: 1 1 120px !important;
      min-width: 120px !important;
    }

    [data-mode="preview"],
    [data-mode="preview"] > div {
      height: auto !important;
      min-height: 0 !important;
      overflow: visible !important;
    }

    [data-mode="preview"] > div > div > div {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
  </style>
`;

export const buildClientReportPdfHtml = (reportInnerHtml: string) => `
  <!doctype html>
  <html>
    <head>${document.head.innerHTML}${CLIENT_REPORT_PDF_PRINT_STYLES}</head>
    <body style="margin:0;background:${CLIENT_REPORT_COLORS.pageBackground};">
      <main class="client-report-pdf">${reportInnerHtml}</main>
    </body>
  </html>
`;

type DownloadClientReportPdfOptions = {
  element: HTMLElement;
  fileName: string;
  chatbotEndpoint: string;
};

export const downloadClientReportPdf = async ({
  element,
  fileName,
  chatbotEndpoint,
}: DownloadClientReportPdfOptions) => {
  const safeFileName = fileName.trim() || "Client Report";
  const reportHtml = buildClientReportPdfHtml(
    getElementHtmlWithComputedStyles(element),
  );
  const htmlContent = await fetchAndInlineResources(reportHtml);

  const response = await axios.post(
    `${chatbotEndpoint}/download-pdf`,
    { htmlContent, fileName: `${safeFileName}.pdf` },
    { responseType: "arraybuffer" },
  );

  const blob = new Blob([response.data], { type: "application/pdf" });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = `${safeFileName}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};
