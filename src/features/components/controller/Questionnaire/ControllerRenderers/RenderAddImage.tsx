import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useRef, useState } from "react";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import CloseIcon from "@/assets/icons/close-icon";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { UIImageUploader } from "@/features/components/HelperComponents/UIImageUploader";
import { base64ToBlob } from "@/lib/helpers";
import axios from "axios";
import { useEnv } from "@/features/hooks/useEnv";
import { useTranslation } from "react-i18next";
import { TruncatedText } from "@/components_v2/TruncatedText";

const getImageSource = (image: any) => {
  if (!image) {
    return "";
  }

  if (typeof image?.url === "string" && image.url.trim()) {
    return image.url;
  }

  if (typeof image?.buffer === "string" && image.buffer.trim()) {
    return image.buffer;
  }

  if (typeof image?.value?.url === "string" && image.value.url.trim()) {
    return image.value.url;
  }

  if (typeof image?.value?.buffer === "string" && image.value.buffer.trim()) {
    return image.value.buffer;
  }

  return "";
};
export const RenderAddImage = ({
  control,
  isAnswer,
  onChange,
  organizationId,
  organizationType,
  pageId,
  questionnaireId,
}: {
  control: any;
  isAnswer?: boolean;
  onChange?: (value: any) => void;
  organizationId?: string;
  organizationType?: string;
  questionnaireId?: string;
  pageId?: string;
}) => {
  const { VITE_MEETANDNOTE_ENDPOINT, VITE_APIKEY } = useEnv();
  const [zoomedImage, setZoomedImage] = useState<any>(null);

  const handleImageClick = (image: any) => {
    setZoomedImage(image);
  };

  const handleCloseZoom = () => {
    setZoomedImage(null);
  };
  const imageUploaderRef = useRef<any>(null);
  const { t } = useTranslation();
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
    <>
      <Grid container>
        <FormControl>
          {!isAnswer && (
            <FormLabel id="demo-controlled-radio-buttons-group">
              {t(
                "templateCenter.questionnaire.controllers.addImage.choiceFormat"
              )}
            </FormLabel>
          )}
          <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            sx={{ flexDirection: "row", flexWrap: "wrap" }}
          >
            {control?.options?.map(
              (image: any, optionIndex: number) =>
                !image?.isOther &&
                getImageSource(image) && (
                  <Grid item key={optionIndex}>
                    {/* <Tooltip title={image?.description}> */}
                      <div className="add-image-box ">
                        <div className="image-box-1 flex-box fs-2 color-gray  fw-200 border-bottom">
                          <img
                            src={getImageSource(image)}
                            key={optionIndex}
                            alt="image"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              cursor: "zoom-in",
                            }}
                            onClick={() => handleImageClick(image)}
                          />
                          <ZoomInIcon
                            sx={{
                              position: "absolute",
                              transform: "scale(1.5)",
                              opacity: "0.3",
                              cursor: "zoom-in",
                            }}
                            className="zoom-icon"
                            onClick={() => handleImageClick(image)}
                          />
                        </div>
                        <div className="pb-1 d-flex justify-content-center text-center text-break mx-1">
                          {control?.selectionValue === "single_selection" ? (
                            <FormControlLabel
                              value={image?.description}
                              className="m-0"
                              control={
                                <Radio
                                  checked={image?.isSelected}
                                  disabled={!isAnswer}
                                  size="small"
                                />
                              }
                              label={
                                <TruncatedText
                                  text={image?.description}
                                  limit={5}
                                />
                              }
                              onChange={(e, checked) => {
                                const newControl = {
                                  ...control,
                                  options: control?.options?.map(
                                    (option: any, currentOptionIndex: number) =>
                                      currentOptionIndex == optionIndex
                                        ? { ...option, isSelected: checked }
                                        : { ...option, isSelected: false }
                                  ),
                                };
                                onChange?.(newControl);
                              }}
                            />
                          ) : (
                            <FormControlLabel
                              disabled={!isAnswer}
                              className="m-0"
                              control={<Checkbox checked={image?.isSelected} />}
                              label={
                                <TruncatedText
                                  text={image?.description}
                                  limit={5}
                                />
                              }
                              onChange={(e, checked) => {
                                const newControl = {
                                  ...control,
                                  options: [
                                    ...control?.options?.slice(0, optionIndex),
                                    {
                                      ...image,
                                      isSelected: checked,
                                    },

                                    ...control?.options?.slice(optionIndex + 1),
                                  ],
                                };
                                onChange?.(newControl);
                              }}
                            />
                          )}
                        </div>
                      </div>
                    {/* </Tooltip> */}
                  </Grid>
                )
            )}
            {control?.options?.map(
              (image: any, optionIndex: number) =>
                image?.isOther &&
                getImageSource(image) && (
                  <Grid item key={"render-add-image-" + optionIndex}>
                    {/* <Tooltip title={image?.description}> */}
                      <div className="add-image-box">
                        <div className="image-box-1 flex-box fs-2 color-gray  fw-200">
                          <img
                            src={getImageSource(image)}
                            key={optionIndex}
                            alt="image"
                            style={{ maxWidth: "100%", maxHeight: "100%" }}
                          />
                        </div>
                        <div className="pb-1 d-flex justify-content-center text-center text-break mx-1">
                          {control?.selectionValue === "single_selection" ? (
                            <FormControlLabel
                              value={image?.description}
                              className="m-0"
                              control={
                                <Radio
                                  checked={image?.isSelected}
                                  disabled={!isAnswer}
                                  size="small"
                                />
                              }
                              label={
                                <TruncatedText
                                  text={image?.description}
                                  limit={5}
                                />
                              }
                              onChange={(e, checked) => {
                                const newControl = {
                                  ...control,
                                  options: control?.options?.map(
                                    (option: any, currentOptionIndex: number) =>
                                      currentOptionIndex == optionIndex
                                        ? { ...option, isSelected: checked }
                                        : { ...option, isSelected: false }
                                  ),
                                };
                                onChange?.(newControl);
                              }}
                            />
                          ) : (
                            <FormControlLabel
                              disabled={!isAnswer}
                              className="m-0"
                              control={<Checkbox checked={image?.isSelected} />}
                              label={
                                <TruncatedText
                                  text={image?.description}
                                  limit={5}
                                />
                              }
                              onChange={(e, checked) => {
                                const newControl = {
                                  ...control,
                                  options: [
                                    ...control?.options?.slice(0, optionIndex),
                                    {
                                      ...image,
                                      isSelected: checked,
                                    },
                                    ...control?.options?.slice(optionIndex + 1),
                                  ],
                                };
                                onChange?.(newControl);
                              }}
                            />
                          )}
                        </div>
                      </div>
                    {/* </Tooltip> */}
                  </Grid>
                )
            )}
          </RadioGroup>
        </FormControl>
        {isAnswer && (
            <Grid item>
              <div
                className="image-box flex-box fs-2 color-gray fw-200 pointer"
                onClick={() => {
                  imageUploaderRef?.current?.handleOpenModal();
                }}
              >
                +
              </div>
              <TextField
                placeholder="Choices"
                disabled
                style={{
                  width: "6rem",
                }}
              />
            </Grid>
          )}
        <UIImageUploader
          ref={imageUploaderRef}
          images={
            Array.isArray(control?.options)
              ? control?.options?.filter((val: any) => val?.isOther == true)
              : []
          }
          showChoice={true}
          onRemove={(optionIndex) => {
            const newControl = {
              ...control,
              options: control?.options?.filter((opt: any, index: number) => {
                if (
                  index !==
                  control?.options?.filter((val: any) => !val?.isOther)
                    ?.length +
                    optionIndex
                ) {
                  return opt;
                }
              }),
            };

            onChange?.(newControl);
          }}
          onUpload={async (files) => {
            const result = await Promise.all(
              files.map(async (file, fileIndex) => {
                if (file?.buffer) {
                  const val = await helperUpload(file);

                  return {
                    ...val,
                    isOther: true,
                  };
                } else {
                  return { ...file, isOther: true };
                }
              })
            );
            const options = [
              ...control?.options?.filter((val: any) => !val.isOther),
              ...result,
            ];
            onChange?.({
              ...control,
              options,
            });
          }}
          accept=".jpg,.png,.jpeg"
        />

        {/* Dialog for Zoomed Image */}

        <Dialog maxWidth={"lg"} open={!!zoomedImage} onClose={handleCloseZoom}>
          <DialogContent>
            <img
              src={getImageSource(zoomedImage)}
              alt="Zoomed In Image"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          </DialogContent>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseZoom}
            aria-label="close"
            sx={{
              position: "fixed",
              top: 0,
              right: "30px",
              background: "#f1f1f126",
              padding: "10px",
            }}
          >
            <CloseIcon
              style={{ width: "16px", height: "16px", fill: "#d1d1d1" }}
            />
          </IconButton>
        </Dialog>
      </Grid>
    </>
  );
};
