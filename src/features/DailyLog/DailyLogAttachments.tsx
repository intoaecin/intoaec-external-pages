import { CLIENT_REPORT_COLORS } from "@/constants/colors";
import { UploadFileMediaManagement } from "@/features/components/Modal/FileUpload/UploadFileMediaManagement";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import type { KeyboardEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import ImagePreviewDialog from "../components/ImagePreviewDialog";
import {
  type ClientReportUploadedAttachment,
  type ClientReportUploadableFile,
  useClientReportAttachmentUpload,
} from "@/features/ClientReport/hooks/useClientReportAttachmentUpload";

type DailyLogAttachmentsProps = {
  isPreview?: boolean;
  clientReportId?: string;
  attachments?: string[];
  attachmentDetails?: ClientReportUploadedAttachment[];
  onAttachmentsChange?: (attachments: string[]) => void;
  onAttachmentDetailsChange?: (
    attachmentDetails: ClientReportUploadedAttachment[],
  ) => void;
};

type AttachmentDisplayNameByUrl = Record<string, string>;

type UploadModalHandle = {
  handleOpen: () => void;
  handleClose: () => void;
};

const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
const browserPreviewExtensions = ["pdf"];

const isImageAttachment = (fileExtension: string) =>
  imageExtensions.includes(fileExtension.toLowerCase());

const canPreviewInBrowser = (fileExtension: string) =>
  browserPreviewExtensions.includes(fileExtension.toLowerCase());

const downloadAttachment = async (attachment: ClientReportUploadedAttachment) => {
  const response = await fetch(attachment.fileUrl);

  if (!response.ok) {
    throw new Error("Failed to download attachment");
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = attachment.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};

const AttachmentName = ({ fileName }: { fileName: string }) => (
  <Typography
    variant="caption"
    title={fileName}
    sx={{
      width: { xs: 72, sm: 84 },
      color: CLIENT_REPORT_COLORS.sectionTitle,
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      WebkitBoxOrient: "vertical",
      WebkitLineClamp: 2,
      lineHeight: 1.2,
      minHeight: "2.4em",
      whiteSpace: "normal",
      overflowWrap: "anywhere",
      textAlign: "center",
    }}
  >
    {fileName}
  </Typography>
);

const getAttachmentFileName = (fileUrl: string) => {
  try {
    const pathParts = fileUrl
      .split("?")[0]
      .split("/")
      .filter(Boolean)
      .map((pathPart) => decodeURIComponent(pathPart));
    const fileName = pathParts[pathParts.length - 1] ?? "file";
    const parentFileName = pathParts[pathParts.length - 2];
    const uuidFileNamePattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]+$/i;

    return parentFileName && uuidFileNamePattern.test(fileName)
      ? parentFileName
      : fileName;
  } catch {
    return "file";
  }
};

const getAttachmentFileExtension = (fileName: string) => {
  const extension = fileName.split(".").pop();
  return extension?.toLowerCase() ?? "file";
};

const DailyLogAttachments = ({
  isPreview = false,
  clientReportId = "draft",
  attachments = [],
  attachmentDetails = [],
  onAttachmentsChange,
  onAttachmentDetailsChange,
}: DailyLogAttachmentsProps) => {
  const { t } = useTranslation();
  const uploadModalRef = useRef<UploadModalHandle | null>(null);
  const { uploadClientReportAttachments } = useClientReportAttachmentUpload();
  const [uploadedAttachments, setUploadedAttachments] = useState<
    ClientReportUploadedAttachment[]
  >([]);
  const [attachmentDisplayNames, setAttachmentDisplayNames] =
    useState<AttachmentDisplayNameByUrl>({});
  const [previewAttachment, setPreviewAttachment] =
    useState<ClientReportUploadedAttachment | null>(null);
  const visibleAttachments = useMemo(() => {
    const attachmentsByUrl = new Map<string, ClientReportUploadedAttachment>();

    attachments.forEach((fileUrl) => {
      const fileName =
        attachmentDisplayNames[fileUrl] ?? getAttachmentFileName(fileUrl);

      attachmentsByUrl.set(fileUrl, {
        fileName,
        fileExtension: getAttachmentFileExtension(fileName),
        fileUrl,
      });
    });
    attachmentDetails.forEach((attachment) => {
      attachmentsByUrl.set(attachment.fileUrl, {
        ...attachment,
        fileExtension:
          attachment.fileExtension ?? getAttachmentFileExtension(attachment.fileName),
      });
    });
    uploadedAttachments.forEach((attachment) => {
      attachmentsByUrl.set(attachment.fileUrl, attachment);
    });

    return Array.from(attachmentsByUrl.values());
  }, [
    attachmentDetails,
    attachmentDisplayNames,
    attachments,
    uploadedAttachments,
  ]);

  const handleAttachmentClick = (
    attachment: ClientReportUploadedAttachment,
  ) => {
    const fileExtension = attachment.fileExtension.toLowerCase();

    if (isImageAttachment(fileExtension)) {
      setPreviewAttachment(attachment);
      return;
    }

    if (canPreviewInBrowser(fileExtension)) {
      window.open(attachment.fileUrl, "_blank", "noopener,noreferrer");
      return;
    }

    void downloadAttachment(attachment).catch(() => {
      toast.error(t("toast.somethingWentWrong"));
    });
  };

  const handleAttachmentKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    attachment: ClientReportUploadedAttachment,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleAttachmentClick(attachment);
  };

  const handleRemoveAttachment = (fileUrl: string) => {
    const nextVisibleAttachments = visibleAttachments.filter(
      (attachment) => attachment.fileUrl !== fileUrl,
    );

    setUploadedAttachments((prev) =>
      prev.filter((attachment) => attachment.fileUrl !== fileUrl),
    );
    setAttachmentDisplayNames((prev) => {
      const nextDisplayNames = { ...prev };
      delete nextDisplayNames[fileUrl];
      return nextDisplayNames;
    });
    onAttachmentsChange?.(
      nextVisibleAttachments.map((attachment) => attachment.fileUrl),
    );
    onAttachmentDetailsChange?.(nextVisibleAttachments);
  };

  return (
    <Box>
      <UploadFileMediaManagement
        ref={uploadModalRef}
        hideVisibleToLead
        onSubmit={async (
          files: ClientReportUploadableFile[],
          _visibleToLead,
          _updateProgress,
        ) => {
          const uploaded = await uploadClientReportAttachments(
            files,
            clientReportId,
          );
          const uploadedWithDisplayNames = uploaded.map((attachment, index) => {
            const fileName = files[index]?.name ?? attachment.fileName;

            return {
              ...attachment,
              fileName,
              fileExtension: getAttachmentFileExtension(fileName),
            };
          });
          const uploadedDisplayNames = uploaded.reduce<AttachmentDisplayNameByUrl>(
            (displayNames, attachment, index) => ({
              ...displayNames,
              [attachment.fileUrl]: files[index]?.name ?? attachment.fileName,
            }),
            {},
          );

          setAttachmentDisplayNames((prev) => ({
            ...prev,
            ...uploadedDisplayNames,
          }));
          setUploadedAttachments((prev) => [...prev, ...uploadedWithDisplayNames]);
          onAttachmentsChange?.(
            [
              ...attachments,
              ...uploadedAttachments.map((attachment) => attachment.fileUrl),
              ...uploadedWithDisplayNames.map(
                (attachment) => attachment.fileUrl,
              ),
            ].filter(
              (fileUrl, index, attachmentUrls) =>
                attachmentUrls.indexOf(fileUrl) === index,
            ),
          );
          onAttachmentDetailsChange?.([
            ...attachmentDetails,
            ...uploadedAttachments,
            ...uploadedWithDisplayNames,
          ].filter(
            (attachment, index, attachmentList) =>
              attachmentList.findIndex(
                (item) => item.fileUrl === attachment.fileUrl,
              ) === index,
          ));
          toast.success(t("toast.filesUploadedSuccessfully"));
        }}
      />
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography
          variant="h6"
          sx={{
            color: CLIENT_REPORT_COLORS.sectionTitle,
          }}
        >
          {t("common.attachments")}
        </Typography>
        {!isPreview && (
          <IconButton
            size="small"
            sx={{ color: "primary.main" }}
            onClick={() => uploadModalRef.current?.handleOpen()}
          >
            <AttachFileIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
      {visibleAttachments.length === 0 ? (
        <Typography variant="body2" sx={{ color: CLIENT_REPORT_COLORS.mutedText }}>
          {t("common.noAttachment", {
            defaultValue: "No attachments available",
          })}
        </Typography>
      ) : (
        <Stack
          direction="row"
          spacing={{ xs: 1, sm: 1.25 }}
          flexWrap="wrap"
          useFlexGap
        >
          {visibleAttachments.map((attachment) => (
            <Stack
              key={attachment.fileUrl}
              component="div"
              role="button"
              tabIndex={0}
              alignItems="center"
              spacing={0.5}
              onClick={() => handleAttachmentClick(attachment)}
              onKeyDown={(event) => handleAttachmentKeyDown(event, attachment)}
              sx={{
                width: { xs: 72, sm: 84 },
                p: 0,
                border: 0,
                bgcolor: "transparent",
                cursor: "pointer",
                position: "relative",
              }}
            >
              {!isPreview && (
                <IconButton
                  size="small"
                  aria-label={t("common.remove")}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemoveAttachment(attachment.fileUrl);
                  }}
                  onKeyDown={(event) => event.stopPropagation()}
                  sx={{
                    position: "absolute",
                    top: -6,
                    right: 4,
                    zIndex: 1,
                    width: 18,
                    height: 18,
                    bgcolor: "background.paper",
                    color: "text.secondary",
                    border: `1px solid ${CLIENT_REPORT_COLORS.borderMuted}`,
                    boxShadow: "0px 1px 4px rgba(15, 23, 42, 0.18)",
                    "&:hover": {
                      bgcolor: "error.main",
                      color: "common.white",
                    },
                  }}
                >
                  <CloseRoundedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              )}
              {isImageAttachment(attachment.fileExtension) ? (
                <Box
                  title={attachment.fileName}
                  sx={{
                    width: { xs: 42, sm: 48 },
                    height: { xs: 42, sm: 48 },
                    borderRadius: 1,
                    bgcolor: CLIENT_REPORT_COLORS.surfaceMuted,
                    backgroundImage: `url(${attachment.fileUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    border: `1px solid ${CLIENT_REPORT_COLORS.borderMuted}`,
                  }}
                />
              ) : (
                <Box
                  title={attachment.fileName}
                  sx={{
                    width: { xs: 42, sm: 48 },
                    height: { xs: 50, sm: 56 },
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: CLIENT_REPORT_COLORS.iconMuted,
                  }}
                >
                  <InsertDriveFileOutlinedIcon
                    sx={{ fontSize: { xs: 46, sm: 52 } }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 6,
                      left: 3,
                      right: 3,
                      bgcolor: CLIENT_REPORT_COLORS.pdfBadge,
                      color: "common.white",
                      typography: "caption",
                      textAlign: "center",
                      borderRadius: 0.5,
                      py: 0.15,
                      textTransform: "uppercase",
                    }}
                  >
                    {attachment.fileExtension}
                  </Box>
                </Box>
              )}
              <AttachmentName fileName={attachment.fileName} />
            </Stack>
          ))}
        </Stack>
      )}
      <ImagePreviewDialog
        open={Boolean(previewAttachment)}
        imageSrc={previewAttachment?.fileUrl}
        fileName={previewAttachment?.fileName}
        closeLabel={t("common.close")}
        downloadLabel={t("common.download")}
        onClose={() => setPreviewAttachment(null)}
        onDownload={
          previewAttachment
            ? () => {
                void downloadAttachment(previewAttachment).catch(() => {
                  toast.error(t("toast.somethingWentWrong"));
                });
              }
            : undefined
        }
      />
    </Box>
  );
};

export default DailyLogAttachments;
