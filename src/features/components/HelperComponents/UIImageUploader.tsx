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
import { UIHoverTitle } from "./UIHoverTitle";
import CloseIcon from "@/assets/icons/close-icon";
import ImageUploadIcon from "@/assets/icons/imageupload-icon";
import { LoadingButton, TabContext, TabList, TabPanel } from "@mui/lab";
import { toast } from "react-toastify";
import axios from "axios";
import UploadIcon from "@/assets/icons/upload-icon";
import { useTranslation } from "react-i18next";

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
  const theme = useTheme();
  return (
    <Box className="px-2">
      <Grid
        container
        className=" px-2 pb-2   border"
        style={{ minHeight: "20vh" }}
      >
        {images?.map((image: any, imageIndex: number) => {
          return (
            <Grid key={"image-" + imageIndex} item>
              <div className="image-box px-1 mx-1  flex-box fs-2 color-gray fw-200 position-relative">
                <IconButton
                  onClick={() => {
                    onRemove(imageIndex);
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
                      width: "20px",
                      height: "20px",
                      fill: theme?.palette?.error?.main,
                    }}
                  />
                </IconButton>
                <img
                  // src={
                  //   image?.url
                  //     ? image?.url
                  //     : `data:${
                  //         image?.fileType || "image/jpeg"
                  //       };base64,${Buffer.from(image?.buffer).toString("base64")}`
                  // }
                  src={image?.url ?? image?.buffer}
                  // key={index}
                  alt="image"
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
                {/* <img src = {`data:${image?.type};base64,${Buffer.from(image?.buffer).toString('base64')}`}  key={index} alt = "image" style={{ maxWidth: '100%', maxHeight:"100%" }}/> */}
              </div>
              {showChoice && (
                <TextField
                  placeholder="Choices"
                  style={{
                    width: "6rem",
                  }}
                  value={image?.description ?? ""}
                  className="mx-1 mt-1"
                  onChange={(e) => {
                    console.log("newquestionerForm:::::", e.target.value);

                    changeDescription(imageIndex, e.target.value);
                  }}
                />
              )}
            </Grid>
          );
        })}
      </Grid>
    </Box>
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
    }>
  ) => Promise<void>;
  onRemove?: (index: number) => void;
  onClose?: () => void;
}

export const UIImageUploader = forwardRef(
  (props: UIImageUploaderProps, ref) => {
    const { t } = useTranslation();
    const [openModal, setOpenModal] = useState(false);
    const fileInputRef = useRef<any>(null);
    const URLInputRef = useRef<any>(null);
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
      props?.maxFileSize || 1
    );
    const [loading, setLoading] = useState(false);
    const [urlValue, setUrlValue] = useState("");

    const [maxFiles, setMaxFiles] = useState<number>(props?.maxFiles || 20);
    const [tabValue, setTabValue] = useState<"GALLERY" | "URL">("GALLERY");

    const downloadImage = async (imageUrl: string) => {
      try {
        const data = await axios.get(imageUrl, {
          responseType: "blob",
        });

        const blob = data.data;

        if (blob.size > maxFileSize * 1024 * 1024) {
          toast.error(`File size exceeds ${maxFileSize}MB`);
          return;
        }
        if (selectedImages.length >= maxFiles) {
          toast.error(`You can select maximum ${maxFiles} images`);
          return;
        }

        // Convert the blob to a buffer or base64 string
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = (e) => {
          setSelectedImages((prev) => [
            ...prev,
            {
              buffer: e.target?.result,
              fileType: blob.type,
              fileExtension: blob?.name?.split(".")?.[1],
            },
          ]);
          // Clear the URL input after successful download
          setUrlValue("");
        };
      } catch (error: any) {
        toast.error(error?.message || "Failed to download image from URL");
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
      setSelectedImages((prev) => [...(props?.images ?? prev)]);
      setMaxFileSize(props?.maxFileSize ?? 1);
      setMaxFiles(props?.maxFiles ?? 20);
    }, [openModal]);

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
      []
    );

    return (
      <Dialog disableScrollLock open={openModal} fullWidth maxWidth={"lg"}>
        <DialogContent className="px-0">
          <Box>
            <div className="border-bottom text-center  ">
              <UIHoverTitle
                title={t(
                  "templateCenter.questionnaire.controllers.addImage.selectImage"
                )}
              />
              <div>
                <Button
                  onClick={() => {
                    setSelectedImages([]);
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
                "templateCenter.questionnaire.controllers.addImage.uploadAMaximumOf20Files"
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
                        "templateCenter.questionnaire.controllers.addImage.imageGallery"
                      ),
                      value: "GALLERY",
                    },
                    {
                      label: t(
                        "templateCenter.questionnaire.controllers.addImage.imageUrl"
                      ),
                      value: "URL",
                    },
                  ].map((val) => (
                    <Tab
                      key={val?.value}
                      label={val?.label}
                      value={val?.value}
                    />
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
                        await new Promise((resolve, reject) => {
                          const files = e?.target?.files;
                          for (let i = 0; i < (files?.length || 0); i++) {
                            const file = files?.[i];
                            if (file) {
                              if (file.size > maxFileSize * 1024 * 1024) {
                                toast.error(
                                  `File size exceeds ${maxFileSize}MB`
                                );
                                return;
                              }
                              if (selectedImages.length >= maxFiles) {
                                toast.error(
                                  `You can select maximum ${maxFiles} images`
                                );
                                return;
                              }
                              const reader = new FileReader();
                              reader.readAsDataURL(file);

                              reader.onload = (e) => {
                                setSelectedImages((prev) => [
                                  ...prev,
                                  {
                                    buffer: e.target?.result,
                                    fileType: file.type,
                                    fileExtension: file.name.split(".")[1],
                                  },
                                ]);

                                if (i === files.length - 1) {
                                  resolve("Files set"); // Resolve the promise after the last file is processed
                                }
                              };
                            }
                          }
                        });
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
                        "templateCenter.questionnaire.controllers.addImage.clickHereToUploadPhotosOrDropThemHere"
                      )}
                    </p>
                    <p className="color-gray">
                      {/* Upload limit: {maxFiles}{" "}
                       */}
                      {/* {maxFiles == 1 ? "Image" : "Images"} */}
                      {t(
                        "templateCenter.questionnaire.controllers.addImage.uploadAMaximumOf20Files"
                      )}{" "}
                    </p>
                    <p className="color-gray">
                      {t(
                        "templateCenter.questionnaire.controllers.addImage.maxFileSize"
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
                        label="Enter URL"
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
                        disabled={selectedImages.length == maxFiles || !urlValue.trim()}
                      >
                        {" "}
                        Insert{" "}
                      </Button>
                    </div>
                  </Box>
                </Paper>
              </TabPanel>
            </TabContext>

            <div className="d-flex align-items-center justify-content-between px-2">
              <p className="fw-500">
                {t(
                  "templateCenter.questionnaire.controllers.addImage.allImages"
                )}
              </p>

              <div>
                <span className="mr-3">
                  {t(
                    "templateCenter.questionnaire.controllers.addImage.totalFilesToUpload"
                  )}
                  : {`${selectedImages.length}`}
                </span>
                <LoadingButton
                  sx={{ textTransform: "none" }}
                  variant="contained"
                  loading={loading}
                  onClick={async () => {
                    setLoading(true);
                    props?.onUpload(selectedImages).finally(() => {
                      setLoading(false);
                      setSelectedImages([]);
                      handleCloseModal();
                    });
                  }}
                  className=" px-4 py-1 my-2"
                  disabled={selectedImages.length === 0 ? true : false}
                  startIcon={
                    <UploadIcon
                      style={{
                        width: "16px",
                        height: "16px",
                        fill:
                          selectedImages.length === 0
                            ? "rgba(0, 0, 0, 0.26)"
                            : "#fff",
                      }}
                    />
                  }
                >
                  {t("common.upload")}
                </LoadingButton>
              </div>
            </div>
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

            <div className="imgDialogBody">
              <div></div>
            </div>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }
);
UIImageUploader.displayName = "UIImageUploader";
