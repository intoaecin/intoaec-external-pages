import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  LinearProgress,
  Paper,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import CloseIcon from "@/assets/icons/close-icon";
import ImageUploadIcon from "@/assets/icons/imageupload-icon";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { UIDialog } from "../../../../components_v2/DialogModal";

interface FileUploadType {
  buffer?: string | ArrayBuffer | null;
  fileType?: string;
  fileExtension?: string;
  name?: string;
  lastModified?: number;
  file?: File; // Store original File object for large files
  size?: number; // Store file size for progress tracking
}

const FileCard = ({
  file,
  index,
  onRemove,
}: {
  file: FileUploadType;
  index: number;
  onRemove?: (index: number) => void;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        border: "1px dashed",
        width: 50,
        height: 50,
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 2,
        position: "relative",
      }}
    >
      <IconButton
        onClick={(event) => {
          event.stopPropagation();
          onRemove?.(index);
        }}
        style={{
          position: "absolute",
          float: "right",
          top: "-10px",
          right: "-15px",
          background: "#fff",
          border: "1px solid rgb(245 245 245)",
        }}
      >
        <CloseIcon
          style={{
            width: "12px",
            height: "12px",
            fill: theme?.palette?.error?.main,
          }}
        />
      </IconButton>
      <Tooltip title={file?.name + "." + file?.fileExtension}>
        <Typography variant="body2" textAlign={"center"}>
          .{file?.fileExtension}
        </Typography>
      </Tooltip>
    </Box>
  );
};

export const UploadFileMediaManagement = forwardRef(
  (
    {
      onSubmit,
      hideVisibleToLead = false,
      maxFileSizeMb = 500,
    }: {
      onSubmit: (
        files: Array<FileUploadType>,
        visibleToLead: boolean,
        updateProgress?: (currentMB: number) => void,
      ) => void | Promise<void>;
      hideVisibleToLead?: boolean;
      /** Max per-file size in MB; default 500. */
      maxFileSizeMb?: number;
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [acceptedFileTypes] = useState<string>("");
    const maxFileSize = maxFileSizeMb;
    const [visibleToLead, setVisibleToLead] = useState(true);
    const fileInputRef = useRef<any>();
    const [files, setFiles] = useState<Array<FileUploadType>>();
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploadedMB, setUploadedMB] = useState<number>(0);
    const [totalMB, setTotalMB] = useState<number>(0);
    const theme = useTheme();
    const { t } = useTranslation();
    const handleOpen = () => {
      setOpen(true);
    };
    const handleClose = () => {
      if (loading) {
        toast.warn("Please wait. Your files are getting uploaded.");
        return;
      }
      setOpen(false);
      setFiles(undefined);
      setUploadProgress(0);
      setUploadedMB(0);
      setTotalMB(0);
    };
    useImperativeHandle(ref, () => ({
      handleClose,
      handleOpen,
    }));
    const validateAndAddfiles = async (files?: FileList) => {
      await new Promise((resolve, reject) => {
        const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024; // 10MB threshold - don't convert to base64 for files larger than this
        let processedCount = 0;
        const totalFiles = files?.length || 0;

        if (totalFiles === 0) {
          resolve("No files");
          return;
        }

        for (let i = 0; i < totalFiles; i++) {
          const file = files?.[i];

          if (file) {
            if (file.size > maxFileSize * 1024 * 1024) {
              toast.error(`File size exceeds ${maxFileSize}MB`);
              reject(new Error(`File size exceeds ${maxFileSize}MB`)); // Reject the promise if file size exceeds the limit
              return;
            }

            // For large files (especially videos), store the File object directly to avoid memory issues
            if (file.size > LARGE_FILE_THRESHOLD) {
              setFiles((prev) => [
                ...(prev ?? []),
                {
                  file: file, // Store original File object
                  fileType: file.type,
                  fileExtension: file.name.split(".").pop() || "",
                  name: file.name,
                  lastModified: file.lastModified,
                  size: file.size,
                },
              ]);

              processedCount++;
              if (processedCount === totalFiles) {
                resolve("Files set");
              }
            } else {
              // For smaller files, use base64 for preview purposes
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = (e) => {
                setFiles((prev) => [
                  ...(prev ?? []),
                  {
                    buffer: e.target?.result,
                    fileType: file.type,
                    fileExtension: file.name.split(".").pop() || "",
                    name: file.name,
                    lastModified: file.lastModified,
                    size: file.size,
                  },
                ]);

                processedCount++;
                if (processedCount === totalFiles) {
                  resolve("Files set"); // Resolve the promise after the last file is processed
                }
              };
              reader.onerror = () => {
                processedCount++;
                if (processedCount === totalFiles) {
                  resolve("Files set");
                }
              };
            }
          } else {
            processedCount++;
            if (processedCount === totalFiles) {
              resolve("No file");
            }
          }
        }
      });

      fileInputRef.current.value = null; // Clear the input after all files are processed
    };

    const handleUploadSubmit = async () => {
      if (files && files.length) {
        setLoading(true);
        setUploadProgress(0);
        setUploadedMB(0);

        // Calculate total MB from files
        let totalSizeMB = 0;
        files.forEach((file) => {
          if (file.size) {
            // Use stored size if available
            totalSizeMB += file.size / (1024 * 1024);
          } else if (file.buffer && typeof file.buffer === "string") {
            // Estimate size from base64 string (approximately 4/3 of original size)
            const base64Size = (file.buffer.length * 3) / 4;
            totalSizeMB += base64Size / (1024 * 1024);
          } else if (file.file) {
            // Use File object size
            totalSizeMB += file.file.size / (1024 * 1024);
          }
        });
        setTotalMB(totalSizeMB);

        // Create progress tracking function
        const updateProgress = (currentMB: number) => {
          const percentage =
            totalSizeMB > 0 ? (currentMB / totalSizeMB) * 100 : 0;
          setUploadedMB(currentMB);
          setUploadProgress(Math.min(Math.max(percentage, 0), 100));
        };

        try {
          await onSubmit(files, visibleToLead, updateProgress);
          setUploadProgress(100);
          setTimeout(() => {
            setLoading(false);
            handleClose();
          }, 300);
        } catch (err) {
          console.error(err);
          setLoading(false);
        }
      }
    };

    return (
      <UIDialog
        open={open}
        onClose={(e, reason) => {
          if (reason !== "backdropClick") {
            handleClose();
          }
        }}
        title={t("fileUpload.uploadFile")}
        dividerAfterTitle
        primaryAction={{
          label: t("common.upload"),
          onClick: handleUploadSubmit,
          disabled: !files || files.length == 0,
          loading,
        }}
        secondaryAction={{
          label: t("common.cancel"),
          onClick: handleClose,
        }}
      >
        <Paper
          sx={{
            border: "1px dashed grey",
            boxShadow: "none",
            p: 5,
            backgroundImage: 'url("/images/Questionnaire BG Img.svg")',
            backgroundRepeat: "no-repeat",
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={async (e) => {
            e.preventDefault();
            await validateAndAddfiles(e?.dataTransfer?.files);
          }}
        >
          <div
            className="imgDialogBody text-center pointer py-2"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={async (e) => {
                if (e?.target?.files) {
                  await validateAndAddfiles(e?.target?.files);
                }
              }}
              accept={acceptedFileTypes}
              multiple={true}
            />

            <span>
              <ImageUploadIcon
                style={{
                  width: "61px",
                  height: "54px",
                  fill: "#C2CFE0",
                }}
              />
            </span>
            <p>{t("fileUpload.clickHereToUpload")}</p>
            <p className="color-gray">
              {t("fileUpload.maxFileSize")} {maxFileSize} mb
            </p>
          </div>
        </Paper>
        {!hideVisibleToLead && (
          <FormControlLabel
            control={<Checkbox checked={visibleToLead} />}
            label={t("fileUpload.visibleToLead")}
            onChange={(e, c) => {
              setVisibleToLead(c);
            }}
          />
        )}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 2,
            my: 1,
            flexWrap: "wrap",
          }}
        >
          {files?.map((file, index) => (
            <FileCard
              key={"file" + index}
              file={file}
              index={index}
              onRemove={(index) => {
                setFiles((prev) => prev?.filter((val, ind) => ind !== index));
              }}
            />
          ))}
        </Box>
        {loading && (
          <Box sx={{ my: 2 }}>
            <Typography
              sx={{
                color: (theme) => theme.palette.warning.dark,
                border: "1px dashed #ccc",
                p: 1,
                borderRadius: 2,
                mb: 2,
              }}
              variant="body2"
            >
              {t("fileUpload.yourFilesAreBeingUploaded")}
            </Typography>
            <Box sx={{ width: "100%", mb: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: (theme) => theme.palette.text.secondary,
                    fontSize: "0.75rem",
                  }}
                >
                  {totalMB > 0
                    ? `${uploadedMB.toFixed(2)} MB / ${totalMB.toFixed(2)} MB`
                    : ""}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: (theme) => theme.palette.text.secondary,
                    fontWeight: 500,
                    fontSize: "0.875rem",
                  }}
                >
                  {uploadProgress.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant={totalMB > 0 ? "determinate" : "indeterminate"}
                value={uploadProgress}
                sx={{
                  width: "100%",
                  height: 8,
                  borderRadius: 4,
                }}
              />
            </Box>
          </Box>
        )}
      </UIDialog>
    );
  },
);

UploadFileMediaManagement.displayName = "UploadFileMediaManagement";
