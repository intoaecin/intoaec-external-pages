import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormLabel,
  IconButton,
  Modal,
  Typography,
} from "@mui/material";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

import { useEnv } from "@/features/hooks/useEnv";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { LoadingButton } from "@mui/lab";
import CloseRoundIcon from "@/assets/icons/close-round-icon";

import { toast } from "react-toastify";
import useDebounce from "@/features/hooks/useDebounce";
import CloseIcon from "@/assets/icons/close-icon";
import { UIHoverTitle } from "@/features/components/HelperComponents/UIHoverTitle";
import { SingleSelectSearchDropDown } from "@/features/components/SingleSelectSearchDropdown";
import { Transition } from "@/features/components/Transition";
import { ProdcutCategoriesType } from "./AddProductModal";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";

export interface UpdateCategoryModalType {
  handleOpen: () => any;
  handleClose: () => any;
}

export const UpdateCategoryModal = forwardRef<
  UpdateCategoryModalType | undefined,
  { selectedProducts: string[]; onClose: () => void }
>((props, ref) => {
  const [open, setOpen] = useState(false);
  const { NEXT_PUBLIC_PROPOSAL_ENDPOINT, NEXT_PUBLIC_PROCUREMENT_ENDPOINT } =
    useEnv();
  const { post: getProductDetails } = useAxiosWithAuth(
    NEXT_PUBLIC_PROCUREMENT_ENDPOINT + "/products"
  );
  const { data: session } = useSession();
  const [productCategories, setProductCategories] = useState<any[]>();
  const [isCreateCategoryPending, setCreateCategoryPending] = useState(false);
  const [productSubCategories, setProductSubCategories] =
    useState<Array<any>>();
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<Array<any>>();
  const [subCategories, setSubCategories] = useState<Array<any>>();
  const [selectedProductCategory, setSelectedProductCategory] =
    useState<ProdcutCategoriesType>();
  const [isCategoryGroupExists, setCategoryGroupExists] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<any>();
  const [selectedSubCategory, setSelectedSubCategory] = useState<any>();
  const [selectedTypeOfWork, setSelectedTypeOfWork] = useState<any>();

  const debouncedCategory = useDebounce<any>(selectedCategory, 2000);
  const debouncedSubCategory = useDebounce<any>(selectedSubCategory, 2000);
  const debouncedTypeOfWork = useDebounce<any>(selectedTypeOfWork, 2000);
  const [selectedProductSubCategory, setSelectedProductSubCategory] =
    useState<ProdcutCategoriesType>();
  const fetchProductCategories = async () => {
    const data = await getProductDetails({
      eventType: "FETCH_PRODUCT_CATEGORIES",
    });

    if (data?.code == "PRODUCT_CATEGORIES_FOUND") {
      setProductCategories(
        data?.body?.result?.map((product: any) => ({
          displayName: product?.displayName,
          productCategoryId: product?.productCategoryId,
          productCategoryName: product?.productCategoryName,
        }))
      );
    }
  };
  const fetchProductSubCategories = async (productCategoryName: string) => {
    try {
      const data = await getProductDetails({
        eventType: "FETCH_PRODUCT_SUBCATEGORIES_BY_CATEGORY_NAME",
        productCategoryName,
      });

      if (data?.code == "PRODUCT_SUB_CATEGORIES_FOUND") {
        setProductSubCategories(
          data?.body?.result?.map((product: any) => ({
            displayName: product?.displayName,
            productSubCategoryId: product?.productSubCategoryId,
            productCategoryName: product?.productCategoryName,
            productSubCategoryName: product?.productSubCategoryName,
          }))
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleOpen = () => {
    setSelectedCategory(undefined);
    setSelectedSubCategory(undefined);

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    props?.onClose?.();
  };

  useEffect(() => {
    fetchProductCategories();
  }, []);

  useImperativeHandle(ref, () => ({
    handleOpen,
    handleClose,
  }));

  const { t } = useTranslation(); 

  return (
    <Dialog
      disableScrollLock
      open={open}
      maxWidth={"lg"}
      TransitionComponent={Transition}
      onClose={handleClose}
      // PaperProps={{
      //   sx: {
      //     width: { lg: "25vw", md: "50vw", sm: "60%", xs: "100%" },
      //     height: { lg: "55vh", md: "55vh", sm: "70%", xs: "100%" },
      //     overflow: "hidden",
      //     display: "flex",
      //     borderRadius: 5,
      //     position: "relative",
      //   },
      // }}
      // scroll="paper"
      sx={{
        "& .MuiFormControl-root": {
          width: "400px",
        },
        "& .MuiAutocomplete-popper": {
          position: "fixed",
          marginBottom: "40px",
        },
      }}
    >
      <DialogTitle>
        <UIHoverTitle title="Update Categories" />
        <Button
          disableRipple
          sx={{ position: "absolute", right: 10, top: "25px" }}
          onClick={() => {
            setSelectedProductCategory(undefined);
            setSelectedProductSubCategory(undefined);
            handleClose();
          }}
        >
          <CloseIcon fill={"#C2CFE0"} width={20} />
        </Button>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            px: { lg: 10, md: 6, xs: 5, sm: 5 },
          }}
        >
          <Box
            sx={{
              bgcolor: "paper",
              display: "flex",
              flexDirection: "column",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* <Typography variant="h6">Add Categories</Typography> */}
            </Box>

            <Box className="my-1">
              <FormLabel>{"Category"}</FormLabel>
              <SingleSelectSearchDropDown
                data={productCategories ?? []}
                // isDisabled={type === "LIBRARY" ? true : false}
                selectedValue={
                  selectedProductCategory ?? {
                    productCategoryId: "",
                    displayName: "",
                  }
                }
                idKey="productCategoryId"
                labelKey="displayName"
                onChange={(val) => {
                  fetchProductSubCategories(val?.productCategoryName);
                  //   setBoqLibraryItemData?.((prev: any) => ({
                  //     ...prev,
                  //     category: val
                  //       ? {
                  //           categoryId: val?.categoryId,
                  //           categoryValue: val?.categoryValue,
                  //         }
                  //       : undefined,
                  //   }));

                  setSelectedProductCategory(val);
                  setSelectedProductSubCategory(undefined);
                }}
                isHideAddNewItem={true}
                disableAddNew={true}
              />
            </Box>
            <Box className="my-1">
              <FormLabel>{"Sub Category"}</FormLabel>
              <SingleSelectSearchDropDown
                data={productSubCategories ?? []}
                // isDisabled={type === "LIBRARY" ? true : false}
                selectedValue={
                  selectedProductSubCategory ?? {
                    productSubCategoryId: "",
                    displayName: "",
                  }
                }
                idKey="productSubCategoryId"
                labelKey="displayName"
                onChange={(val) => {
                  //   setBoqLibraryItemData?.((prev: any) => ({
                  //     ...prev,
                  //     subCategory: val
                  //       ? {
                  //           subCategoryId: val?.subCategoryId,
                  //           subCategoryValue: val?.subCategoryValue,
                  //         }
                  //       : undefined,
                  //   }));

                  setSelectedProductSubCategory(val);
                }}
                isHideAddNewItem={true}
                disableAddNew={true}
              />
            </Box>

            {isCategoryGroupExists && (
              <Typography
                textAlign={"center"}
                variant="caption"
                sx={{ color: (theme) => theme.palette.error.main }}
              >
                Category already exists
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions className="px-5 py-1">
        <LoadingButton
          className="mx-5 my-1"
          fullWidth
          loading={loading}
          variant="contained"
          onClick={async () => {
            // setCreateCategoryPending(true);
            console.log(
              props.selectedProducts,
              selectedProductCategory,
              selectedProductSubCategory,
              "update categpry"
            );
            setLoading(true);
            try {
            const requestData = {
              eventType: "UPDATE_MULTIPLE_PRODUCTS",
              organizationId: session?.["custom:organization_id"],
              organizationType: session?.["custom:organization_type"],
              products: props.selectedProducts,
              productCategory: selectedProductCategory?.displayName,
              productSubCategory: selectedProductSubCategory?.displayName,
            };
              const response = await getProductDetails(requestData);
              console.log(response, "response after updagin");
              if (response.code == "PRODUCTS_UPDATED") {
                toast.success("Products updated successfully");
                setSelectedProductCategory(undefined);
                setSelectedProductSubCategory(undefined);
                handleClose();
              }
            } catch (err) {
              console.log(err);
            } finally {
              setLoading(false);
            }
          }}
        >
          {t("common.updateCategory", {
            defaultValue: "Update Category",
          })}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});

UpdateCategoryModal.displayName = "UpdateCategoryModal";
