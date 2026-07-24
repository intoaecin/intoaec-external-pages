import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Paper,
  Tab,
  TextField,
  useTheme,
} from "@mui/material";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { UIHoverTitle } from "../features/components/HelperComponents/UIHoverTitle";
import CloseIcon from "@/assets/icons/close-icon";
import ImageUploadIcon from "@/assets/icons/imageupload-icon";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { toast } from "react-toastify";
import axios from "axios";
import { useTranslation } from "react-i18next";
import useAddImage from "@/features/CustomLeadCapture/hooks/useAddImage";
import useDeleteImage from "@/features/CustomLeadCapture/hooks/useDeleteImage";
import useFetchImage from "@/features/CustomLeadCapture/hooks/useFetchImage";

const ShowSelectedImages = ({
  images,
  changeDescription,
  onRemove,
  showChoice,
}: {
  images: Array<any>;
  changeDescription: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  showChoice?: boolean;
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <>
      {images?.map((image: any, imageIndex: number) => {
        return (
          <Grid key={"image-" + imageIndex} item>
            <div
              className="flex-box fs-2 color-gray fw-200 position-relative"
              style={{
                width: "110px",
                height: "110px",
                border: "1.5px dashed #C8D3E0",
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
              }}
            >
              <IconButton
                onClick={() => {
                  onRemove(imageIndex);
                }}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  background: "rgba(255, 255, 255, 0.92)",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  padding: 4,
                  width: 26,
                  height: 26,
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.18)",
                  backdropFilter: "blur(2px)",
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
              <img
                src={image?.url ?? image?.buffer}
                alt="image"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            {showChoice && (
              <TextField
                placeholder={t("common.choices", { defaultValue: "Choices" })}
                style={{
                  width: "6rem",
                }}
                value={image?.description ?? ""}
                className="mx-1 mt-1"
                onChange={(e) => {
                  changeDescription(imageIndex, e.target.value);
                }}
              />
            )}
          </Grid>
        );
      })}
    </>
  );
};

interface UIImageUploaderProps {
  accept?: string;
  maxFiles?: number;
  maxFileSize?: number;
  images?: any[];
  showChoice?: boolean;
  onUpload: (
    files: Array<{
      buffer?: string | ArrayBuffer | null;
      fileType?: string;
      fileExtension?: string;
      url?: string;
      desciption?: string;
    }>,
  ) => Promise<string[] | Array<{ url?: string }> | void>;
  onSelectExisting?: (imageUrl: string) => void | Promise<void>;
  onRemove?: (index: number) => void;
  onClose?: () => void;
}

export const ImageUploader = forwardRef((props: UIImageUploaderProps, ref) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(false);
  const fileInputRef = useRef<any>(null);
  const URLInputRef = useRef<any>(null);
  const postCloseActionRef = useRef<null | (() => void | Promise<void>)>(null);
  const [acceptedFileTypes, setAcceptedFileTypes] = useState<
    string | undefined
  >(props?.accept);
  const [selectedImages, setSelectedImages] = useState<
    Array<{
      buffer?: string | ArrayBuffer | null;
      fileType?: string;
      fileExtension?: string;
      url?: string;
      desciption?: string;
    }>
  >([]);
  const [maxFileSize, setMaxFileSize] = useState<number>(
    props?.maxFileSize || 1,
  );
  const [loading, setLoading] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const {
    data: organizationImages = [],
    refetch: refetchOrganizationImages,
    isFetching: isFetchingOrganizationImages,
  } = useFetchImage();
  const { addImage, isLoading: isSavingImage } = useAddImage();
  const { deleteImage, isLoading: isDeletingImage } = useDeleteImage();

  const [maxFiles, setMaxFiles] = useState<number>(props?.maxFiles || 20);
  const [tabValue, setTabValue] = useState<"GALLERY" | "URL">("GALLERY");

  const uploadSelectedImages = async (
    imagesToUpload: Array<{
      buffer?: string | ArrayBuffer | null;
      fileType?: string;
      fileExtension?: string;
      url?: string;
      desciption?: string;
    }>,
  ) => {
    if (loading || isSavingImage || imagesToUpload.length === 0) return;
    setLoading(true);
    try {
      const uploadResult = await props?.onUpload(imagesToUpload);
      const uploadedUrls = normalizeUploadResult(uploadResult);
      if (uploadedUrls.length > 0) {
        await addImage({ imageUrls: uploadedUrls });
        postCloseActionRef.current = async () => {
          await refetchOrganizationImages();
        };
      }
      handleCloseModal();
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async (imageUrl: string) => {
    try {
      const data = await axios.get(imageUrl, {
        responseType: "blob",
      });

      const blob = data.data;

      if (blob.size > maxFileSize * 1024 * 1024) {
        toast.error(
          t("leadCapture.imageUploader.fileSizeExceeds", {
            defaultValue: "File size exceeds {{size}}MB",
            size: maxFileSize,
          }),
        );
        return;
      }
      if (selectedImages.length >= maxFiles) {
        toast.error(
          t("leadCapture.imageUploader.maxImages", {
            defaultValue: "You can select maximum {{count}} images",
            count: maxFiles,
          }),
        );
        return;
      }

      // Convert the blob to a buffer or base64 string
      const buffer = await new Promise<string | ArrayBuffer | null>(
        (resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = (e) => resolve(e.target?.result ?? null);
          reader.onerror = () =>
            reject(
              new Error(
                t("leadCapture.imageUploader.readFileFailed", {
                  defaultValue: "Failed to read file",
                }),
              ),
            );
        },
      );
      const image = {
        buffer,
        fileType: blob.type,
        fileExtension: imageUrl.split(".").pop()?.split("?")[0],
        url: imageUrl,
      };
      setSelectedImages([image]);
      setUrlValue("");
      await uploadSelectedImages([image]);
    } catch (error: any) {
      toast.error(
        error?.message ||
          t("leadCapture.imageUploader.downloadFailed", {
            defaultValue: "Failed to download image from URL",
          }),
      );
    }
  };

  const handleCloseModal = () => {
    props?.onClose?.();
    setOpenModal(false);
  };
  const handleOpenModal = () => {
    setOpenModal(true);
  };
  const setFileTypesToAccept = (value: string) => {
    setAcceptedFileTypes(value);
  };

  useEffect(() => {
    if (!openModal) return;
    setSelectedImages(props?.images ?? []);
    setUrlValue("");
    setMaxFileSize(props?.maxFileSize ?? 1);
    setMaxFiles(props?.maxFiles ?? 20);
  }, [openModal]);

  const normalizeUploadResult = (
    result: string[] | Array<{ url?: string }> | void,
  ) => {
    if (!result) return [];
    if (Array.isArray(result)) {
      if (result.length === 0) return [];
      return result
        .map((item) => (typeof item === "string" ? item : item?.url))
        .filter(Boolean) as string[];
    }
    return [];
  };

  const uploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      handleOpenModal,
      setFileTypesToAccept,
    }),
    [],
  );

  return (
    <Dialog
      disableScrollLock
      open={openModal}
      fullWidth
      maxWidth={"sm"}
      PaperProps={{ sx: { height: "80vh" } }}
      TransitionProps={{
        onExited: () => {
          setSelectedImages([]);
          setUrlValue("");
          const postCloseAction = postCloseActionRef.current;
          postCloseActionRef.current = null;
          void postCloseAction?.();
        },
      }}
    >
      <DialogContent className="px-0">
        <Box>
          <div className="border-bottom text-center  ">
            <UIHoverTitle
              title={t(
                "templateCenter.questionnaire.controllers.addImage.selectImage",
              )}
            />
            <div>
              <Button
                onClick={() => {
                  handleCloseModal();
                }}
                style={{
                  position: "relative",
                  float: "right",
                  top: "-50px",
                }}
              >
                <CloseIcon
                  style={{
                    width: "20px",
                    height: "20px",
                    fill: "#d1d1d1",
                  }}
                />
              </Button>
            </div>
          </div>
          <p className="mt-2 mx-2 fw-400">
            {/* Upload a maximum of {maxFiles} files.  */}
            {t(
              "templateCenter.questionnaire.controllers.addImage.uploadAMaximumOf20Files",
            )}
          </p>
          <TabContext value={tabValue}>
            <Box
              sx={{
                "& .Mui-selected": {
                  color: "#192A3E !important",
                },

                bgcolor: "background.paper",
                borderBottom: 1,
                borderColor: "divider",
              }}
              className="mx-3  "
            >
              <TabList
                onChange={(e, val) => {
                  setTabValue(val);
                }}
              >
                {[
                  {
                    label: t(
                      "templateCenter.questionnaire.controllers.addImage.imageGallery",
                    ),
                    value: "GALLERY",
                  },
                  {
                    label: t(
                      "templateCenter.questionnaire.controllers.addImage.imageUrl",
                    ),
                    value: "URL",
                  },
                ].map((val) => (
                  <Tab key={val?.value} label={val?.label} value={val?.value} />
                ))}
              </TabList>
            </Box>
            <TabPanel value="GALLERY">
              <Paper
                style={{
                  border: "1px dashed grey",
                  boxShadow: "none",

                  backgroundImage: 'url("/images/Questionnaire BG Img.svg")',
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div
                  className="imgDialogBody text-center pointer py-2"
                  onClick={uploadClick}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const files = Array.from(e?.target?.files ?? []);
                      const incomingImages: Array<{
                        buffer?: string | ArrayBuffer | null;
                        fileType?: string;
                        fileExtension?: string;
                      }> = [];

                      for (const file of files) {
                        if (file.size > maxFileSize * 1024 * 1024) {
                          toast.error(
                            t("leadCapture.imageUploader.fileSizeExceeds", {
                              defaultValue: "File size exceeds {{size}}MB",
                              size: maxFileSize,
                            }),
                          );
                          return;
                        }
                        if (selectedImages.length + incomingImages.length >= maxFiles) {
                          toast.error(
                            t("leadCapture.imageUploader.maxImages", {
                              defaultValue:
                                "You can select maximum {{count}} images",
                              count: maxFiles,
                            }),
                          );
                          return;
                        }
                        const buffer = await new Promise<
                          string | ArrayBuffer | null
                        >((resolve, reject) => {
                          const reader = new FileReader();
                          reader.readAsDataURL(file);
                          reader.onload = (event) =>
                            resolve(event.target?.result ?? null);
                          reader.onerror = () =>
                            reject(
                              new Error(
                                t("leadCapture.imageUploader.readFileFailed", {
                                  defaultValue: "Failed to read file",
                                }),
                              ),
                            );
                        });
                        incomingImages.push({
                          buffer,
                          fileType: file.type,
                          fileExtension: file.name.split(".")[1],
                        });
                      }
                      setSelectedImages(incomingImages);
                      await uploadSelectedImages(incomingImages);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = null;
                      }
                    }}
                    accept={acceptedFileTypes}
                    multiple={maxFiles !== 1}
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
                  <p>
                    {t(
                      "templateCenter.questionnaire.controllers.addImage.clickHereToUploadPhotosOrDropThemHere",
                    )}
                  </p>
                  <p className="color-gray">
                    {/* Upload limit: {maxFiles}{" "}
                     */}
                    {/* {maxFiles == 1 ? "Image" : "Images"} */}
                    {t(
                      "templateCenter.questionnaire.controllers.addImage.uploadAMaximumOf20Files",
                    )}{" "}
                  </p>
                  <p className="color-gray">
                    {t(
                      "templateCenter.questionnaire.controllers.addImage.maxFileSize",
                    )}{" "}
                    {/* {maxFileSize} mb */}
                  </p>
                </div>
              </Paper>
            </TabPanel>
            <TabPanel value="URL">
              <Paper
                className="d-flex align-item-center "
                style={{
                  width: "100%",
                  padding: 16,
                  margin: "auto",
                  border: "1px dashed grey",
                  minHeight: "210px",
                  boxShadow: "none",
                  backgroundImage: 'url("/images/Questionnaire BG Img.svg")',
                  backgroundRepeat: "no-repeat",
                }}
              >
                <Box className="row align-items-center justify-content-center w-100">
                  <div className="col-lg-6">
                    <TextField
                      id="outlined-basic"
                      label={t(
                        "templateCenter.questionnaire.controllers.addImage.enterUrl",
                      )}
                      variant="outlined"
                      onMouseEnter={(e) => {
                        e.preventDefault();
                      }}
                      onSelect={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      inputRef={URLInputRef}
                      value={urlValue}
                      onChange={(e) => setUrlValue(e.target.value)}
                      fullWidth
                    />
                  </div>
                  <div className="col-lg-2 pl-2">
                    <Button
                      size="large"
                      variant="contained"
                      onClick={() => {
                        downloadImage(urlValue);
                      }}
                      disabled={
                        selectedImages.length == maxFiles || !urlValue.trim()
                      }
                    >
                      {t("leadCapture.insert", { defaultValue: "Insert" })}
                    </Button>
                  </div>
                </Box>
              </Paper>
            </TabPanel>
          </TabContext>

          <div className="d-flex align-items-center justify-content-between px-2">
            <p className="fw-500">
              {t("templateCenter.questionnaire.controllers.addImage.allImages")}
            </p>

            <div />
          </div>
          <Box className="px-2">
            <Grid
              container
              spacing={2}
              className="px-2 pb-2"
              style={{ minHeight: "20vh" }}
            >
              <ShowSelectedImages
                changeDescription={(index, description) => {
                  setSelectedImages((prev) => [
                    ...prev.slice(0, index),
                    { ...prev[index], description },
                    ...prev.slice(index + 1),
                  ]);
                }}
                showChoice={props.showChoice}
                onRemove={(index) => {
                  setSelectedImages((prev) => [
                    ...prev.slice(0, index),
                    ...prev.slice(index + 1),
                  ]);
                  props?.onRemove?.(index);
                }}
                images={selectedImages}
              />
              {isFetchingOrganizationImages ? null : organizationImages.length === 0 &&
                selectedImages.length === 0 ? (
                <Grid item xs={12}>
                  <div className="d-flex justify-content-center align-items-center w-100 py-4 color-gray">
                    {t("common.noImage")}
                  </div>
                </Grid>
              ) : (
                organizationImages.map((imageUrl: string, index: number) => (
                  <Grid key={`org-image-${index}`} item>
                    <div
                      className="position-relative"
                      style={{
                        width: "110px",
                        height: "110px",
                        border: "1.5px dashed #C8D3E0",
                        borderRadius: "12px",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#fff",
                        cursor: "pointer",
                      }}
                      onClick={async () => {
                        if (!props?.onSelectExisting) return;
                        await props.onSelectExisting(imageUrl);
                        handleCloseModal();
                      }}
                    >
                      <IconButton
                        onClick={async (event) => {
                          event.stopPropagation();
                          if (isDeletingImage) return;
                          await deleteImage({ imageUrl });
                          await refetchOrganizationImages();
                        }}
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          background: "rgba(255, 255, 255, 0.92)",
                          border: "1px solid rgba(0, 0, 0, 0.08)",
                          padding: 4,
                          width: 26,
                          height: 26,
                          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.18)",
                          backdropFilter: "blur(2px)",
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
                      <img
                        src={imageUrl}
                        alt="organization image"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>

          <div className="imgDialogBody">
            <div></div>
          </div>
        </Box>
      </DialogContent>
    </Dialog>
  );
});
ImageUploader.displayName = "ImageUploader";
