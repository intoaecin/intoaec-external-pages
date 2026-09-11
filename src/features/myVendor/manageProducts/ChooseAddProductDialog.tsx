// ChooseAddProductDialog.jsx
import { UIHoverTitle } from "@/features/components/HelperComponents/UIHoverTitle";
import { useEnv } from "@/features/hooks/useEnv";
import ProdcutScratchIcon from "@/assets/icons/productScratch";
import ProposalScratchIcon from "@/assets/icons/proposalScratch";
import UploadProposalIcon from "@/assets/icons/uploadProposal";
import { readexcelAndReturnProducts } from "@/lib/helpers";
import { VisuallyHiddenInput } from "@/pages/leadmanager/upload";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Typography,
  LinearProgress,
} from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { ProductType } from "./ManageProductHome";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
interface ChooseAddProductDialogProps {
  isCreateDialogOpen: any;
  onClose: () => void;
  handleStartFromScratch: () => void;
  fetchData: () => void;
}

const cardStyle = {
  margin: "0 10px",
  cursor: "pointer",
  transition: "box-shadow 0.3s",
  width: "270px",
  height: "320px",
};

const selectedCardStyle = {
  boxShadow: "rgb(33 150 243) 0px 0px 10px",
};

const ChooseAddProductDialog: React.FC<ChooseAddProductDialogProps> = ({
  isCreateDialogOpen,
  onClose,
  handleStartFromScratch,
  fetchData,
}) => {
  // const [selectedValue, setSelectedValue] = useState<null | string>(null);
  const { t } = useTranslation();
  const { push } = useRouter();
  const { data: session, status } = useSession();
  const { VITE_AEC_CHATBOT_ENDPOINT, VITE_PROCUREMENT_ENDPOINT } =
    useEnv();
  const { post: getProductDetails } = useAxiosWithAuth(
    VITE_PROCUREMENT_ENDPOINT + "/products"
  );
  const [productCategories, setProductCategories] = useState<string[]>();
  const proposalId = uuid();
  const { post: addProductDetails } = useAxiosWithAuth(
    VITE_PROCUREMENT_ENDPOINT + "/products"
  );
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  // const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setSelectedValue(event.target.value);
  // };
  const handleImportButtonClick = () => {
    fileInputRef.current?.click();
  };
  const handleProceed = () => {
    setIsLoadingBtn(true);
    if (selectedValue == "scratch") {
      //   push("/template-center/proposal/create");
      handleStartFromScratch();

      onClose();
      setSelectedValue("");
      setIsLoadingBtn(false);
    } else {
      handleImportButtonClick();
      setIsLoadingBtn(false);
      setSelectedValue("");
      onClose();
    }
  };
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>("");

  // Add new state for category-subcategory mapping
  const [categorySubcategoryMap, setCategorySubcategoryMap] = useState<
    Record<string, string[]>
  >({});

  // Add new state for upload progress
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleCardClick = (value: string) => {
    if (value == "upload") {
      setSelectedValue("");
      handleImportButtonClick();
      // onClose();
    }
    setSelectedValue(value);
  };

  const fetchProductCategories = async () => {
    const data = await getProductDetails({
      eventType: "FETCH_PRODUCT_CATEGORIES",
    });

    if (data?.code == "PRODUCT_CATEGORIES_FOUND") {
      const categories = data?.body?.result?.map(
        (product: any) => product?.displayName
      );
      setProductCategories(categories);

      // Fetch subcategories for all categories at once
      const subcategoryMap: Record<string, string[]> = {};
      await Promise.all(
        categories.map(async (category: string) => {
          const subData = await getProductDetails({
            eventType: "FETCH_PRODUCT_SUBCATEGORIES_BY_CATEGORY_NAME",
            productCategoryName: await convertStringToEnumFormat(category),
          });
          if (subData?.code == "PRODUCT_SUB_CATEGORIES_FOUND") {
            subcategoryMap[category] = subData?.body?.result?.map(
              (subCategory: any) => subCategory?.displayName
            );
          }
        })
      );
      setCategorySubcategoryMap(subcategoryMap);
    }
  };

  async function convertStringToEnumFormat(str: string) {
    return str
      .toUpperCase() // Convert to uppercase
      .replace(/&/g, "AND") // Replace '&' with 'AND'
      .replace(/\s+/g, "_"); // Replace spaces with underscores
  }

  // Replace validateSubCategories with a simpler version using the map
  const validateSubCategories = (product: any) => {
    if (!product?.productSubCategory) {
      return true;
    }

    if (!product?.productCategory) {
      return false;
    }

    const validSubCategories =
      categorySubcategoryMap[product.productCategory] || [];
    return validSubCategories.includes(product.productSubCategory);
  };

  const uploadProduct = async (queryParameters: Partial<ProductType>[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Validate all products using the local categorySubcategoryMap
    const validProducts: Partial<ProductType>[] = [];
    const invalidProducts: Partial<ProductType & { error: string }>[] = [];

    // Process validation in chunks
    const chunkSize = 100;
    for (let i = 0; i < queryParameters.length; i += chunkSize) {
      const chunk = queryParameters.slice(i, i + chunkSize);
      setUploadProgress((i / queryParameters.length) * 30); // First 30% for validation

      chunk.forEach((product) => {
        const isValidCategory =
          !product?.productCategory ||
          productCategories?.includes(product.productCategory);

        const isValidSubCategory = validateSubCategories(product);

        if (isValidCategory && isValidSubCategory) {
          validProducts.push(product);
        } else {
          invalidProducts.push({
            ...product,
            error: !isValidCategory
              ? "Invalid product category"
              : "Invalid product subcategory",
          });
        }
      });
    }

    if (validProducts.length === 0) {
      setIsUploading(false);
      handleInvalidProducts(invalidProducts);
      return;
    }

    // Upload products in smaller chunks
    try {
      const uploadChunkSize = 500;
      for (let i = 0; i < validProducts.length; i += uploadChunkSize) {
        const chunk = validProducts.slice(i, i + uploadChunkSize);
        // Calculate progress (30-100%)
        setUploadProgress(30 + (i / validProducts.length) * 70);

        try {
          await addProductDetails({
            eventType: "CREATE_PRODUCT",
            products: chunk,
          });
        } catch (error) {
          console.error(
            `Failed to upload chunk ${i}-${i + uploadChunkSize}:`,
            error
          );
          chunk.forEach((product) => {
            invalidProducts.push({
              ...product,
              error: "Failed to upload - server error",
            });
          });
        }
      }

      setUploadProgress(100);
      handleInvalidProducts(invalidProducts);

      if (validProducts.length > invalidProducts.length) {
        toast.success(t("toast.productAddedSuccessfully"));
      }

      setSelectedValue("");
      fetchData();
      onClose();
    } catch (error) {
      console.error("Error while uploading products:", error);
      toast.error(t("toast.errorWhileUploadingValidProducts"));
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to handle invalid products
  const handleInvalidProducts = (
    invalidProducts: Array<Partial<ProductType & { error: string }>>
  ) => {
    if (invalidProducts.length > 0) {
      // Split invalid products into smaller chunks if needed
      const maxChunkSize = 100; // Adjust based on URL length limitations
      const chunks = [];

      for (let i = 0; i < invalidProducts.length; i += maxChunkSize) {
        chunks.push(invalidProducts.slice(i, i + maxChunkSize));
      }

      // Store chunks in session storage instead of URL
      sessionStorage.setItem(
        "invalidProducts",
        JSON.stringify(invalidProducts)
      );

      push({
        pathname: "/my-vendor/products/upload",
        query: {
          hasInvalidProducts: "true",
          totalInvalid: invalidProducts.length.toString(),
        },
      });
    }
  };

  const handleFileUpload = async (e: any) => {
    if (e.target) {
      const transformedData: any = await readexcelAndReturnProducts(
        e.target.files[0]
      );
      console.log("Uploaded Data:", transformedData);
      await uploadProduct(transformedData).finally(() => {
        // e.currentTarget.value = undefined;
      });
    }
  };

  useEffect(() => {
    fetchProductCategories();
  }, []);

  return (
    <div>
      <Dialog
        open={isCreateDialogOpen}
        disableScrollLock
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <DialogTitle id="alert-dialog-title">
            {/* {"Select Proposal Type"} */}
            <UIHoverTitle title={t("myInventory.selectProductType")} />
          </DialogTitle>
        </div>
        <Divider />
        <DialogContent className="border-bottom">
          {isUploading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1,
                bgcolor: "rgba(255, 255, 255, 0.9)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t("common.uploadingProducts")}
              </Typography>
              <Box sx={{ width: "80%", mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
            </Box>
          )}
          <div>
            <div className="mb-2 text-center">
              <Typography variant="body2">
                {t("myInventory.welcomeToTheProductAddWizard")}
              </Typography>
            </div>
            <div className="d-flex justify-content-center align-items-center">
              <Card
                style={{
                  ...cardStyle,
                  ...(selectedValue === "scratch" && selectedCardStyle),
                }}
                onClick={() => {
                  handleCardClick("scratch");
                }}
              >
                <CardContent className="d-flex column justify-content-center align-items-center">
                  <Typography className="fw-500 fs-7" variant="body1">
                    {t("myInventory.startFromScratch")}
                  </Typography>
                  <ProdcutScratchIcon
                    style={{ width: "160px", height: "200px" }}
                  />
                  <Typography className="text-center fs-8" variant="body2">
                    {t("myInventory.addYourOwnProductWithOurWizard")}
                  </Typography>
                </CardContent>
              </Card>

              <Card
                style={{
                  ...cardStyle,
                  ...(selectedValue === "upload" && selectedCardStyle),
                }}
                onClick={() => handleCardClick("upload")}
              >
                <VisuallyHiddenInput
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  onChange={(e) => {
                    handleFileUpload(e);
                  }}
                />
                <CardContent className="d-flex column justify-content-center align-items-center">
                  <Typography className="fw-500 fs-7" variant="body1">
                    {t("myInventory.importProduct")}
                  </Typography>
                  <UploadProposalIcon
                    style={{ width: "160px", height: "200px" }}
                  />
                  <Typography className="text-center fs-8" variant="body2">
                    {t(
                      "myInventory.dragAndDropYourFileOrUploadFromYourComputer"
                    )}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    variant="inherit"
                    sx={{ fontSize: "11px" }}
                  >
                    {t("myInventory.uploadACSVFileAccordingToThis")}
                    <Box
                      component={"a"}
                      href={"/template/productUpload.xlsx"}
                      download="productUpload.xlsx"
                      sx={{
                        ":hover": { textDecoration: "underline" },
                        textDecoration: "none",
                        display: "block",
                        textAlign: "center",
                      }}
                      onClick={(e) => {
                        e?.stopPropagation();
                      }}
                    >
                      {t("common.template")}
                    </Box>
                    <Typography
                      color="text.secondary"
                      variant="caption"
                    ></Typography>
                  </Typography>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
        <DialogActions style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "20px 0",
            }}
          >
            <div>
              <Button
                variant="outlined"
                sx={{
                  color: "red",
                  "&.MuiButton-outlined": {
                    borderRadius: "0",
                    boxShadow: "none",
                    width: "200px",
                    height: "50px",
                    borderColor: "red",
                  },
                }}
                onClick={() => {
                  setSelectedValue("");
                  onClose();
                }}
              >
                {t("common.cancel")}
              </Button>
              <LoadingButton
                variant="contained"
                loading={isLoadingBtn}
                disabled={selectedValue === "" ? true : false}
                // style={{

                // }}
                sx={{
                  marginLeft: "20px",
                  ...(selectedValue === "" && {
                    backgroundColor: "#C2CFE0",
                    color: "white",
                  }),
                  ...(selectedValue != "" && {
                    backgroundColor: "rgb(60, 162, 255)",
                  }),
                  "&.MuiButton-contained": {
                    borderRadius: "0",
                    boxShadow: "none",
                    width: "200px",
                    height: "50px",
                  },
                }}
                onClick={handleProceed}
              >
                {t("common.proceed")}
              </LoadingButton>
            </div>
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ChooseAddProductDialog;
