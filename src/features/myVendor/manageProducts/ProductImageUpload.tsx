import { useProdcutData } from "@/features/components/providers/ProductandServiceProvider/CreateProductProvider";
import {
  BOQImageUploadIcon,
  BOQNoImageUploadIcon,
} from "@/assets/icons/boqImageUploadIcon";
import CloseIcon from "@/assets/icons/close-icon";
import { Box, Grid, IconButton, Paper } from "@mui/material";
import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const ProductImageUpload = ({ isEdit }: { isEdit: boolean }) => {
  const [images, setImages] = useState<any[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const { t } = useTranslation();
  const [imageInitalLoad, setImageInitalLoad] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createProductData, setCreateProductData } = useProdcutData();
  useEffect(() => {
    if (createProductData?.productImages && isEdit && imageInitalLoad) {
      setImageInitalLoad(false);
      setImages((prev) => [
        // ...prev,
        ...(createProductData?.productImages || []),
      ]);
      if (createProductData?.productImages?.length >= 1) {
        setSelectedImageIndex(0);
      }
    }
  }, [createProductData?.productImages]);

  const getImageUrl = (image: any) => {
    if (!image) return "";
    if (typeof image === "string") return image;
    if (image instanceof Blob || image instanceof File) {
      try {
        return URL.createObjectURL(image);
      } catch (error) {
        console.error("Error creating object URL:", error);
        return "";
      }
    }
    if (image && typeof image === "object" && image.blob) {
      if (image.blob instanceof Blob || image.blob instanceof File) {
        try {
          return URL.createObjectURL(image.blob);
        } catch (error) {
          console.error("Error creating object URL from blob object:", error);
          return "";
        }
      }
    }
    return "";
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (files && images.length < 4) {
      const newImages = Array.from(files).slice(0, 4 - images.length);
      const newBlobs = await Promise.all(
        newImages.map((file) => {
          return new Promise<Blob>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (reader.result) {
                resolve(new Blob([reader.result], { type: file.type }));
              } else {
                reject(new Error("Failed to read file"));
              }
            };
            reader.readAsArrayBuffer(file);
          });
        })
      );

      setImages((prevImages) => [...prevImages, ...newImages]);
      setCreateProductData?.((prev: any) => ({
        ...prev,
        productImages: [
          ...(prev.productImages || []),
          ...newImages.map((image, index) => ({
            fileName: image.name,
            fileType: image.type,
            blob: newBlobs[index],
          })),
        ],
      }));
    }
  };

  const handleRemove = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setCreateProductData?.((prev: any) => ({
      ...prev,
      productImages: prev.productImages
        ? prev.productImages.filter((_: any, i: any) => i !== index)
        : [],
    }));
    if (selectedImageIndex === index) {
      setSelectedImageIndex(null);
    } else if (selectedImageIndex !== null && selectedImageIndex > index) {
      setSelectedImageIndex((prev) => (prev !== null ? prev - 1 : null));
    }
  };

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleEmptyBoxClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Grid container>
        <Grid item xs={12} sm={12} lg={4} xl={3}>
          <Paper
            sx={{
              border: "4px dashed #32acff",
              boxShadow: "none",
              p: 2,
              backgroundRepeat: "no-repeat",
              height: "250px",
              borderRadius: "10px",
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileUpload(e.dataTransfer.files);
            }}
          >
            {selectedImageIndex !== null && images[selectedImageIndex] ? (
              <div
                className="imgDialogBody text-center pointer my-0"
                onClick={() => {
                  console.log("on file clike");
                  fileInputRef.current?.click();
                }}
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={(e) => handleFileUpload(e.target.files)}
                  accept="image/*"
                  multiple={true}
                />

                <img
                  src={getImageUrl(images[selectedImageIndex])}
                  alt="Selected"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    objectPosition: "center",
                  }}
                />
              </div>
            ) : (
              <div
                className="imgDialogBody text-center pointer py-2 my-5"
                onClick={() => {
                  console.log("on file clike");
                  fileInputRef.current?.click();
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={(e) => handleFileUpload(e.target.files)}
                  accept="image/*"
                  multiple={true}
                />

                <span>
                  <BOQImageUploadIcon
                    style={{ width: "61px", height: "54px" }}
                  />
                </span>
                <p>{t("myInventory.dragYourFileToStartUploading")}</p>
                <p className="color-gray fs-8">
                  {t("myInventory.uploadOnly4Images")}
                </p>

                {/* <div className="mb-3">
                  <div
                    className="border-bottom position-relative mx-auto"
                    style={{ maxWidth: "200px" }}
                  >
                    <span
                      className="px-2 position-relative mb-3"
                      style={{ bottom: "-10px", background: "#ffffff" }}
                    >
                      OR
                    </span>
                  </div>
                </div>

                <p
                  className="py-1 mx-auto mt-3"
                  style={{
                    maxWidth: "120px",
                    border: "1px solid #32acff",
                    borderRadius: "15px",
                    boxSizing: "content-box",
                    color: "#32acff",
                  }}
                >
                  {" Browse files"}
                </p> */}
              </div>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12} lg={5} xl={4}>
          <Box
            className="d-flex row justify-content-start px-3 h-100 "
            sx={{
              gap: "1rem",
              rowGap: "2rem",
            }}
          >
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className=" image-box px-1 mx-1 flex-box fs-2 color-gray fw-200 position-relative"
                style={{
                  border: `3px dashed ${
                    selectedImageIndex == index ? "#32acff" : "rgb(207 207 207)"
                  } `,
                }}
              >
                {index < images.length ? (
                  <>
                    <IconButton
                      onClick={() => handleRemove(index)}
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
                          width: "14px",
                          height: "14px",
                          fill: "red",
                        }}
                      />
                    </IconButton>
                    <img
                      src={getImageUrl(images[index])}
                      alt={`image-${index}`}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        cursor: "pointer",
                      }}
                      onClick={() => handleImageSelect(index)}
                    />
                  </>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      // minHeight: "100px",

                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={handleEmptyBoxClick}
                  >
                    <BOQNoImageUploadIcon
                      style={{ width: "41px", height: "41px" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default ProductImageUpload;

