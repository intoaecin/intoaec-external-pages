import ExcelColorIcon from "@/assets/icons/excelColor-icon";
import TwoDPlansIcon from "@/assets/icons/two-d-plans-icon";
import {
  attachmentItemFromUploadValue,
  getAttachmentName,
  isAttachmentImage,
  isAttachmentPdf,
  parseAttachmentUrls,
  type AttachmentItem,
  type AttachmentUploadValue,
} from "@/features/attachments/attachmentUploadHelpers";
import { downloadFileFromS3 } from "@/lib/helpers";
import DownloadIcon from "@mui/icons-material/Download";
import { Box, IconButton, Typography } from "@mui/material";
import { FileIcon, PdfColorIcon } from "intoaec-react-icons";
import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const SPREADSHEET_EXTENSIONS = new Set(["xls", "xlsx", "csv"]);

function getAttachmentExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

type AttachmentPreviewTilesProps = {
  attachments?: unknown;
  pdf?: boolean;
  title?: string;
  /** When true, tiles sit flush left under the title (estimate preview). */
  flushLeft?: boolean;
};

export default function AttachmentPreviewTiles({
  attachments,
  pdf = false,
  title,
  flushLeft = false,
}: AttachmentPreviewTilesProps) {
  const { t } = useTranslation();
  const attachmentValues = useMemo<AttachmentUploadValue[]>(() => {
    if (!Array.isArray(attachments)) return parseAttachmentUrls(attachments);

    return attachments.filter((attachment): attachment is AttachmentUploadValue => {
      if (typeof attachment === "string") return attachment.trim().length > 0;
      return typeof File !== "undefined" && attachment instanceof File;
    });
  }, [attachments]);
  const attachmentItems = useMemo(
    () => attachmentValues.map(attachmentItemFromUploadValue),
    [attachmentValues],
  );
  const previewUrls = useMemo(
    () =>
      attachmentItems.map((item) => {
        if (item.kind === "existing") return item.url;
        if (typeof URL === "undefined") return "";
        return URL.createObjectURL(item.file);
      }),
    [attachmentItems],
  );

  useEffect(
    () => () => {
      attachmentItems.forEach((item, index) => {
        if (item.kind === "new" && previewUrls[index]) {
          URL.revokeObjectURL(previewUrls[index]);
        }
      });
    },
    [attachmentItems, previewUrls],
  );

  const handleDownload = useCallback(
    async (item: AttachmentItem, index: number) => {
      try {
        if (item.kind === "existing") {
          await downloadFileFromS3(item.url, getAttachmentName(item));
          return;
        }

        const downloadUrl = previewUrls[index] || URL.createObjectURL(item.file);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = item.file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (!previewUrls[index]) {
          URL.revokeObjectURL(downloadUrl);
        }
      } catch (error) {
        console.error("Error downloading file:", error);
        toast.error(t("toast.failedToDownloadFile"));
      }
    },
    [previewUrls, t],
  );

  const renderThumbnail = (
    attachment: AttachmentItem,
    index: number,
  ): ReactNode => {
    const attachmentUrl = previewUrls[index];
    const attachmentName = getAttachmentName(attachment);
    const extension = getAttachmentExtension(attachmentName);

    if (isAttachmentPdf(attachment)) {
      return <PdfColorIcon width={"60px"} />;
    }

    if (isAttachmentImage(attachment)) {
      return (
        <img
          src={attachmentUrl}
          alt={attachmentName}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        />
      );
    }

    if (SPREADSHEET_EXTENSIONS.has(extension)) {
      return <ExcelColorIcon style={{ width: "50px", height: "50px" }} />;
    }

    if (extension === "dwg") {
      return <TwoDPlansIcon width={50} height={50} fill="#323C47" />;
    }

    return <FileIcon width={50} height={50} />;
  };

  if (!attachmentItems.length) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        className="fw-500"
        sx={{
          fontSize: {
            xs: pdf ? "1rem" : ".9rem",
            sm: pdf ? "1.2rem" : "1.2rem",
          },
        }}
      >
        {title ?? (pdf ? "Attachments" : t("common.attachments"))}
      </Typography>
      <Box
        display="flex"
        flexWrap="wrap"
        sx={{ gap: 1, mt: 1, ml: flushLeft ? 0 : undefined }}
      >
        {attachmentItems.map((attachment, index) => {
          const attachmentUrl = previewUrls[index];
          const attachmentName = getAttachmentName(attachment);

          return (
            <div
              key={`${attachmentName}-${index}`}
              className={`image-box flex-box fs-2 color-gray fw-200 position-relative${
                flushLeft ? "" : " px-1 mx-1"
              }`}
              onClick={
                pdf || !attachmentUrl
                  ? undefined
                  : () => window.open(attachmentUrl, "_blank")
              }
              style={
                pdf
                  ? {
                      pageBreakInside: "avoid",
                      breakInside: "avoid",
                      ...(flushLeft ? { marginLeft: 0 } : {}),
                    }
                  : {
                      cursor: "pointer",
                      ...(flushLeft ? { marginLeft: 0 } : {}),
                    }
              }
            >
              {renderThumbnail(attachment, index)}
              {!pdf && (
                <IconButton
                  sx={{
                    position: "absolute",
                    bottom: "4px",
                    right: "4px",
                    bgcolor: "white",
                    padding: "4px",
                    zIndex: 1,
                    "&:hover": { bgcolor: "white" },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleDownload(attachment, index);
                  }}
                >
                  <DownloadIcon style={{ width: "16px" }} />
                </IconButton>
              )}
            </div>
          );
        })}
      </Box>
    </Box>
  );
}
