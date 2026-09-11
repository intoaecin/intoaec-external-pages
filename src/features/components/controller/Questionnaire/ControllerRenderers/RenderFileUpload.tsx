import { useEnv } from "@/features/hooks/useEnv";
import { fileuploadDropdownOptions } from "@/features/constants/constant";
import CloseIcon from "@/assets/icons/close-icon";
import { Info } from "lucide-react";
import { base64ToBlob } from "@/lib/helpers";
import {
  Box,
  Button,
  Grid,
  IconButton,
  LinearProgress,
  Tooltip,
  useTheme,
} from "@mui/material";
import axios from "axios";
import {
  DownloadIcon,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export const RenderFileUpload = ({
  control,
  isAnswer,
  onChange,
  organizationId,
  organizationType,
  pageId,
  questionnaireId,
}: {
  isAnswer?: boolean;
  control?: any;
  onChange?: (control: any) => void;
  organizationType?: string;
  organizationId?: string;
  questionnaireId?: string;
  pageId?: string;
}) => {
  const fileref = useRef<any>([]);
  const { t } = useTranslation();
  const [uploadProgress, setUploadProgress] = useState<Array<boolean | null>>(
    Array(control?.options?.length || 0).fill(false)
  );
  const theme = useTheme();
  const getFileIcon = (
    fileName?: string,
    fileType?: string,
    acceptedType?: string
  ) => {
    const iconProps = {
      size: 50,
      strokeWidth: 1.75,
    };

    const normalizedExtension =
      fileName?.split(".").pop()?.toLowerCase() ??
      fileType?.split("/").pop()?.toLowerCase() ??
      acceptedType?.split(",")[0]?.trim().toLowerCase() ??
      "";

    if (
      ["xls", "xlsx", "csv"].includes(normalizedExtension) ||
      fileType?.includes("spreadsheet")
    ) {
      return (
        <FileSpreadsheet
          {...iconProps}
          color={theme.palette.success.main}
        />
      );
    }

    if (
      ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
        normalizedExtension
      ) ||
      fileType?.startsWith("image/")
    ) {
      return <FileImage {...iconProps} color={theme.palette.info.main} />;
    }

    if (["zip", "rar", "7z", "tar", "gz"].includes(normalizedExtension)) {
      return <FileArchive {...iconProps} color={theme.palette.warning.main} />;
    }

    if (
      ["pdf", "doc", "docx", "txt", "rtf", "ppt", "pptx"].includes(
        normalizedExtension
      ) ||
      fileType?.startsWith("text/") ||
      fileType === "application/pdf"
    ) {
      return <FileText {...iconProps} color={theme.palette.error.main} />;
    }

    return <FileType {...iconProps} color={theme.palette.text.secondary} />;
  };
  const { VITE_MEETANDNOTE_ENDPOINT, VITE_APIKEY } = useEnv();

  const helperUpload = async (file: any) => {
    const filePath: any = `${organizationId}/${organizationType}/QUESTIONNAIRE/${questionnaireId}/${pageId}`;
    let blob;
    if (file?.buffer?.startsWith("data")) {
      blob = base64ToBlob(
        file?.buffer
          ?.split(",")
          .filter((val: any, index: number) => index !== 0)
          .join(",")
      );
    } else {
      const arrayBuffer = file?.buffer as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      blob = new Blob([uint8Array], { type: file?.fileType });
    }

    const formData = new FormData();
    const filename = (file?.fileName as string) || "file ";
    formData.append("file", blob, { filename } as any);
    if (file?.fileName?.split(".")[1]) {
      formData.append("fileExtension", file?.fileName?.split(".")[1]);
    } else {
      formData.append("fileExtension", file?.fileExtension);
    }
    formData.append("filePath", filePath);
    formData.append("eventType", "ADD_MEDIA");
    formData.append("eventSource", "QUESTIONNAIRE");

    const { data } = await axios.post(
      VITE_MEETANDNOTE_ENDPOINT + "/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(VITE_APIKEY ? { apikey: VITE_APIKEY } : {}),
        },
      }
    );
    if (data) {
      return {
        fileName: file?.name || "file",
        fileType: file?.fileType || "images/jpeg",
        url: data?.body[0]?.uri ?? "",
        description: file?.description ?? "",
      };
    }
  };

  return (
    <Box>
      <Grid container direction={"row"} sx={{ gap: 2 }}>
        {control?.options?.map((image: any, optionIndex: number) =>
          image?.url ? (
            <Grid item key={"render-add-image-" + optionIndex}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  border: "1px dashed",
                  borderColor: "grey.400",
                  borderRadius: 1,
                  mr: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.secondary",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                {isAnswer && (
                  <IconButton
                    onClick={() => {
                      const newControl = {
                        ...control,
                        options: [
                          ...control?.options?.slice(0, optionIndex),
                          {
                            acceptedType: image?.acceptedType,
                            description: image?.description,
                          },
                          ...control?.options?.slice(optionIndex + 1),
                        ],
                      };

                      onChange?.(newControl);
                    }}
                    style={{
                      position: "absolute",
                      float: "right",
                      top: "-10px",
                      right: "-10px",
                      background: "#fff",
                      border: "1px solid rgb(213 213 213)",
                      padding: "5px",
                    }}
                  >
                    <CloseIcon
                      style={{
                        width: "15px",
                        height: "15px",
                        fill: theme?.palette?.error?.main,
                      }}
                    />
                  </IconButton>
                )}

                {getFileIcon(
                  image?.fileName,
                  image?.fileType,
                  image?.acceptedType
                )}
              </Box>

              {!isAnswer ? (
                <a href={image?.url} target="_blank" download={image?.fileName}>
                  <Button
                    sx={{ px: 1 }}
                    variant="outlined"
                    endIcon={
                      <DownloadIcon style={{ width: "12px", height: "12px" }} />
                    }
                  >
                    <span style={{ fontSize: "0.75rem" }}>{"Download"}</span>
                  </Button>
                </a>
              ) : (
                <Box sx={{ textAlign: "center" }}>
                  <Tooltip
                    arrow
                    placement="top"
                    title={`${t("templateCenter.questionnaire.fileType")}: ${
                      image?.acceptedType
                    }`}
                  >
                    <IconButton>
                      <Info size={12} strokeWidth={1} color="#000" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
              <p
                style={{
                  textAlign: "center",
                  marginTop: "8px",
                  marginBottom: 0,
                  width: "120px",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                }}
              >
                {image?.description}
              </p>
            </Grid>
          ) : (
            <Grid
              item
              key={optionIndex}
              sx={{display: "flex", flexDirection: "column", alignItems: "center"}}
            >
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  border: "1px dashed",
                  borderColor: "grey.400",
                  borderRadius: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (isAnswer) {
                    fileref?.current?.[optionIndex]?.click();
                  }
                }}
              >
                <input
                  ref={(el) => (fileref.current[optionIndex] = el)}
                  onChange={async (e) => {
                    new Promise((resolve, reject) => {
                      const file = e?.target?.files?.[0];
                      if (file) {
                        // Get allowed file types
                        let allowedExtensions: string[] = [];
                        const acceptedType = image?.acceptedType;
                        
                        if (acceptedType === "All") {
                          // Get all allowed extensions from constants
                          const allOption = fileuploadDropdownOptions.find(
                            (opt) => opt.name === "All"
                          );
                          if (allOption) {
                            allowedExtensions = allOption.value
                              .split(",")
                              .map((ext) => ext.trim().toLowerCase());
                          }
                        } else if (acceptedType) {
                          // Get extensions from the selected file type
                          allowedExtensions = acceptedType
                            .split(",")
                            .map((ext: string) => ext.trim().toLowerCase());
                        }

                        // Validate file extension
                        const fileExtension = file.name
                          .split(".")
                          .pop()
                          ?.toLowerCase();
                        
                        if (
                          !fileExtension ||
                          !allowedExtensions.includes(fileExtension)
                        ) {
                          toast.error(t("toast.fileTypeNotSupported"), {
                            autoClose: 2000,
                          });
                          fileref.current[optionIndex].value = null;
                          resolve("Invalid file type");
                          return;
                        }

                        if (file.size > 1 * 1024 * 1024) {
                          toast.error(`File size exceeds ${1}MB`);
                          fileref.current[optionIndex].value = null;
                          resolve("File size exceeds limit");
                          return;
                        }
                        setUploadProgress((prevProgress) => {
                          const newProgress = [...prevProgress];
                          newProgress[optionIndex] = true;
                          return newProgress;
                        });
                        const reader = new FileReader();
                        reader.readAsDataURL(file);

                        reader.onload = (e) => {
                          helperUpload?.({
                            buffer: e.target?.result,
                            fileType: file.type,
                            fileExtension: file.name.split(".")[1],
                            name: file.name,
                          })
                            .then((val) => {
                              const newControl = {
                                ...control,
                                options: [
                                  ...control?.options?.slice(0, optionIndex),
                                  {
                                    ...val,
                                    acceptedType: image?.acceptedType,
                                    description: image?.description,
                                  },
                                  ...control?.options?.slice(optionIndex + 1),
                                ],
                              };

                              onChange?.(newControl);
                            })
                            .finally(() => {
                              resolve("Files set");
                              setUploadProgress((prevProgress) => {
                                const newProgress = [...prevProgress];
                                newProgress[optionIndex] = false;
                                return newProgress;
                              });
                            });
                        };
                      } else {
                        resolve("No file");
                      }
                    });
                    fileref.current[optionIndex].value = null;
                  }}
                  type="file"
                  hidden
                  accept={
                    image?.acceptedType !== "All"
                      ? image?.acceptedType
                          ?.split(",")
                          .map((val: any) => `.${val.trim()}`)
                          .join(",")
                      : fileuploadDropdownOptions.find((opt) => opt.name === "All")?.value
                          ?.split(",")
                          .map((val: string) => `.${val.trim()}`)
                          .join(",") || ""
                  }
                />
                <Box sx={{ pt: 1 }}>
                  <p style={{ color: "#6b7280", margin: 0, fontSize: "24px" }}>+</p>
                </Box>
                {uploadProgress[optionIndex] && (
                  <Box key={optionIndex} sx={{ width: "100%", px: 2 }}>
                    <LinearProgress />
                  </Box>
                )}
                <Tooltip
                  arrow
                  placement="top"
                  title={`${t("common.fileType")}: ${image?.acceptedType}`}
                >
                  <IconButton sx={{ mt: 2 }}>
                    <Info size={12} strokeWidth={1} color="#000" />
                  </IconButton>
                </Tooltip>
                {/* <p style={{ fontSize: 12 }}>({image?.acceptedType})</p> */}
              </Box>

              <p
                style={{
                  marginTop: "8px",
                  textAlign: "center",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  width: "120px",
                }}
              >
                {image?.description}
              </p>

            </Grid>
          )
        )}
      </Grid>
    </Box>
  );
};
