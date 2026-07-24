import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { SkeletonTableGrid } from "@/features/lead/master/skeleton";
import { DeleteCategoryIcon } from "@/assets/icons/delete-category-icon";
import DeleteIcon from "@/assets/icons/delete-icon";
import EditIcon from "@/assets/icons/edit-icon";
import { RenameIcon } from "@/assets/icons/rename-icon";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Modal,
  OutlinedInput,
  Slide,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";

import { UIHoverTitle } from "@/features/components/HelperComponents/UIHoverTitle";
import { useDialog } from "@/features/components/providers/DialogProvider";
import CloseIcon from "@/assets/icons/close-icon";
import CustomTablePagination from "@/features/components/customTablePagination/customTablePagination";
import { FormLabel } from "react-bootstrap";
import { SingleSelectSearchDropDown } from "@/features/components/SingleSelectSearchDropdown";
import ProductImageUpload from "./ProductImageUpload";
import { useProdcutData } from "@/features/components/providers/ProductandServiceProvider/CreateProductProvider";
import { productTags } from "@/features/constants/constant";
import axios from "axios";
import { useSession } from "next-auth/react";
import { LoadingButton } from "@mui/lab";
import { AntSwitch } from "../../userHub/userInvite/UserInviteForm";
import ProductsTermsAndConditions from "./ProductTermsAndCondition";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { formatNumberITL, getLocalizationValue } from "@/lib/helpers";
import NumberInputField from "@/features/components/HelperComponents/NumberInputField";
import { useTranslation } from "react-i18next";
import { te } from "date-fns/locale";
import { roundNumber } from "@/utils/numbers";

export interface AddOrEditProductModalType {
  open: boolean;
  isEdit?: boolean;
  handleClose: () => void;
  fetchData: () => void;
}
export interface ProdcutCategoriesType {
  displayName: string;
  productCategoryId: string;
  productCategoryName: string;
}
export interface ProdcutSubCategoriesType {
  displayName: string;
  productSubCategoryId: string;
  productSubCategoryName: string;
  productCategoryName: string;
}
export const AddOrEditProductModal = ({
  open,
  isEdit,
  handleClose,
  fetchData,
}: AddOrEditProductModalType) => {
  const { popup, closeModal, setCustomButton } = useDialog();
  const { t: tr } = useTranslation();
  const {
    NEXT_PUBLIC_PROPOSAL_ENDPOINT,
    NEXT_PUBLIC_PROCUREMENT_ENDPOINT,
    NEXT_PUBLIC_MEETANDNOTE_ENDPOINT,
  } = useEnv();
  const { data: session } = useSession();
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const t = useTheme();
  const {
    handleUpdateProductDetails,
    createProductData,
    setCreateProductData,
  } = useProdcutData();
  const [newTag, setNewTag] = useState<string>();
  const [pageCount, setPageCount] = useState<number>(1);
  const subCategoriesRef = useRef<any>();
  const [totalCount, setTotalCount] = useState<number>();
  const [unitTypes, setUnitTypes] = useState<any>();
  const [formatTypes, setFormatTypes] = useState<any>();
  const [productCategories, setProductCategories] = useState<any[]>();
  const [intialLoad, setInitialLoad] = useState<boolean>(true);
  const [selectedProductCategory, setSelectedProductCategory] =
    useState<ProdcutCategoriesType>();
  const [productSubCategories, setProductSubCategories] =
    useState<Array<any>>();
  const [selectedProductSubCategory, setSelectedProductSubCategory] =
    useState<ProdcutCategoriesType>();
  const [expandProductInformation, setExpandProductInformation] =
    useState<boolean>(true);
  const [expandDimension, setExpandDimension] = useState<boolean>(true);
  const [expandProductVariant, setExpandProductVariant] =
    useState<boolean>(true);

  const [displayType, setDisplayType] = useState<any>();
  const [expandProductImage, setExpandProductImage] = useState<boolean>(true);
  const [expandPriceInformation, setExpandPriceInformation] =
    useState<boolean>(true);
  const [isLengthDisabled, setIsLengthDisabled] = useState<boolean>(false);
  const [isWidthDisabled, setIsWidthDisabled] = useState<boolean>(false);
  const [isHeightDisabled, setIsHeightDisabled] = useState<boolean>(false);
  const { post: getProductDetails } = useAxiosWithAuth(
    NEXT_PUBLIC_PROCUREMENT_ENDPOINT + "/products"
  );
  const { post: addProductDetails } = useAxiosWithAuth(
    NEXT_PUBLIC_PROCUREMENT_ENDPOINT + "/products"
  );
  const { post, response } = useAxiosWithAuth<any>(
    NEXT_PUBLIC_PROPOSAL_ENDPOINT + "/boq-templates"
  );
  const [currency, setCurrency] = useState<string>();
  const { localizationValue } = useOrganizationLocalization();
  const isEmptyFieldValue = (value: unknown) => {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim() === "";
    return false;
  };
  useEffect(() => {
    if (localizationValue) {
      const curr =
        getLocalizationValue(localizationValue, "CURRENCY", "SYMBOL") ?? "";
      if (curr) {
        setCurrency(curr);
      }
    }
  }, [localizationValue]);
  const fetchUnitTypeData = async () => {
    try {
      const requestData = {
        eventType: "GET_LIBRARY_ITEM_UNIT_TYPES",
      };
      const data = await post(requestData);
      if (data.code === "BOQ_UNIT_TYPE_FETCH_SUCCESSFUL") {
        setUnitTypes(data.body);
      }
    } catch (error: any) {
      console.log(error);
    }
  };
  const fetchFormatTypesData = async () => {
    try {
      const requestData = {
        eventType: "GET_LIBRARY_ITEM_FORMATS",
      };
      const data = await post(requestData);
      if (data.code === "BOQ_FORMAT_TYPE_FETCH_SUCCESSFUL") {
        setFormatTypes(data.body);
      }
    } catch (error: any) {
      console.log(error);
    }
  };
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

  const handleLengthChange = (category: any) => {
    // const newArea =
    //   (createProductData?.productWidth ? createProductData?.productWidth : 1) *
    //   (createProductData?.productHeight
    //     ? createProductData?.productHeight
    //     : 1) *
    //   category;

    setCreateProductData?.((prev) => ({
      ...(prev || {}),
      productLength: category,
    }));
  };

  const handleWidthChange = (category: any) => {
    // const newArea =
    //   (createProductData?.productLength
    //     ? createProductData?.productLength
    //     : 1) *
    //   (createProductData?.productHeight
    //     ? createProductData?.productHeight
    //     : 1) *
    //   category;

    setCreateProductData?.((prev) => ({
      ...(prev || {}),
      productWidth: category,
    }));
  };
  const handleUnitTypeChange = (category: any) => {
    // setBoqLibraryItemData?.((prev: any) => ({
    //   ...prev,
    //   unit: {
    //     ...prev.unit,
    //     unitType: {
    //       unitTypeId: category?._id,
    //       unitTypeName: category?.itemUnitName,
    //       unitTypeValue: category?.itemUnitValue,
    //     },
    //   },
    setDisplayType((prev: any) => ({
      ...prev,
      unitType: {
        unitTypeId: category?._id,
        unitTypeName: category?.itemUnitName,
        unitTypeValue: category?.itemUnitValue,
      },
    }));
    setCreateProductData?.((prev) => ({
      ...(prev || {}),
      productUnitType: category?.itemUnitName,
    }));
  };
  const handleHeightChange = (category: any) => {
    const newArea =
      (createProductData?.productLength
        ? createProductData?.productLength
        : 1) *
      (createProductData?.productWidth ? createProductData?.productWidth : 1) *
      category;

    setCreateProductData?.((prev) => ({
      ...(prev || {}),
      productHeight: category,
    }));
  };
  const handleFormatTypeChange = (category: any) => {
    // setBoqLibraryItemData?.((prev: any) => ({
    //   ...prev,
    //   unit: {
    //     ...prev.unit,
    //     unitFormat: {
    //       unitFormatId: category?._id,
    //       unitFormatName: category?.formatValue,
    //       unitFormatValue: category?.powerName,
    //       unitFormatPower: category?.powerValue,
    //     },
    //   },
    // }));
    setDisplayType((prev: any) => ({
      ...prev,
      unitFormat: {
        unitFormatId: category?._id,
        unitFormatName: category?.formatValue,
        unitFormatValue: category?.powerName,
        unitFormatPower: category?.powerValue,
      },
    }));
    setCreateProductData?.((prev) => ({
      ...(prev || {}),
      productDimensionFormat: category?.formatValue,
    }));
  };
  const handleTags = (e: any, value: any) => {
    setCreateProductData?.((prev) => ({
      ...(prev || {}),
      productTags: [...value],
    }));
  };

  const handleRemoveTags = (tagToRemove: string | number) => {
    // const updatedLanguages = languages.filter(
    //   (languages) => languages !== languageToRemove
    // );
    // setLanguages(updatedLanguages);

    const updatedTags = createProductData?.productTags?.filter(
      (tags) => tags != tagToRemove
    );

    setCreateProductData?.((prev) => ({
      ...(prev || {}),
      productTags: updatedTags,
    }));
    console.log(updatedTags, createProductData?.productTags, "updated tags");
  };
  const handleTagInputChange = (event: any) => {
    console.log(event.target.name, event.target.value, "textevent");
    setNewTag(event.target.value);
  };
  const handleEnterPress = (event: any) => {
    if (event.key === "Enter" && newTag?.trim() !== "") {
      console.log("enter press");
      setCreateProductData?.((prev) => ({
        ...(prev || {}),
        productTags: [...(prev?.productTags || []), newTag ?? ""], // Spread existing tags and add newTag
      }));
      setNewTag("");
    }
    console.log(createProductData, "entered new data");
  };

  const helperUpload = async (file: any) => {
    const filePath: any =
      session?.["custom:organization_id"] +
      `/${session?.["custom:organization_type"]}/PROCUREMENT/PRODUCT/${createProductData?.productId}`;

    // Ensure the blob is properly handled
    const blob = file.blob;

    const formData = new FormData();
    const filename = (file?.fileName as string) || "file";
    formData.append("file", blob, filename);

    if (file?.fileName?.split(".")[1]) {
      formData.append("fileExtension", file?.fileName?.split(".")[1]);
    } else {
      formData.append("fileExtension", file?.fileExtension);
    }

    formData.append("filePath", filePath);
    formData.append("eventType", "ADD_MEDIA");
    formData.append("eventSource", "PROCUREMENT");

    try {
      const { data } = await axios.post(
        NEXT_PUBLIC_MEETANDNOTE_ENDPOINT + "/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${session?.IdToken}`,
          },
        }
      );

      if (data) {
        return data?.body[0]?.uri ?? "";
        // return {
        //   fileName: file?.fileName || "file",
        //   fileType: file?.fileType || "images/jpeg",
        //   url: data?.body[0]?.uri ?? "",
        //   description: file?.description ?? "",
        // };
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fromatDsiplayType = `${
      displayType?.unitFormat?.unitFormatValue || ""
    } ${displayType?.unitType?.unitTypeName || ""} ${
      displayType?.unit?.unitFormat?.unitFormatPower &&
      displayType?.unit?.unitFormat?.unitFormatPower > 1
        ? `(${displayType?.unit?.unitType?.unitTypeValue || ""}${
            displayType?.unit?.unitFormat?.unitFormatPower &&
            displayType?.unit?.unitFormat?.unitFormatPower > 1
              ? String.fromCharCode(
                  displayType?.unitFormat?.unitFormatPower === 2 ? 178 : 179
                )
              : ""
          })`
        : ""
    }`;
    const area =
      (createProductData?.productLength
        ? createProductData?.productLength
        : 1) *
      (createProductData?.productWidth ? createProductData?.productWidth : 1) *
      (createProductData?.productHeight ? createProductData?.productHeight : 1);
    setDisplayType((prev: any) => ({
      ...prev,
      productArea: area,
    }));
    if (!isEdit) {
      setCreateProductData?.((prev) => ({
        ...(prev || {}),
        productUnitDisplayType: fromatDsiplayType,
      }));
    }
  }, [
    displayType?.unitFormat,
    displayType?.unitType,
    createProductData?.productLength,
    createProductData?.productWidth,
    createProductData?.productHeight,
  ]);
  const handleSave = async () => {
    setLoading(true);
    if (!createProductData?.productName) {
      toast.error(tr("toast.pleaseFillAllTheMandatoryFields"));
      setLoading(false);
      return;
    }

    try {
      let imageUrls = [];
      let productNotesUrl;
      if (
        createProductData?.productImages &&
        createProductData?.productImages.length > 0
      ) {
        const blobs = createProductData?.productImages.filter(
          (image: any) => typeof image !== "string" && image.blob
        );
        if (blobs.length > 0) {
          const uploadPromises = blobs.map((image: any) => helperUpload(image));
          imageUrls = await Promise.all(uploadPromises);
        }
        const urlString = createProductData?.productImages.filter(
          (image: any) => typeof image === "string"
        );
        if (urlString.length > 0) {
          imageUrls = [...urlString, ...imageUrls];
        }
      }

      if (
        createProductData?.productNotes &&
        typeof createProductData?.productNotes != "string"
      ) {
        const jsonValue = await JSON.stringify(createProductData?.productNotes);
        const utf8Bytes = await new TextEncoder().encode(jsonValue);
        const base64Encoded = await btoa(
          String.fromCharCode.apply(null, utf8Bytes as any)
        );
        const decodedString = atob(base64Encoded ?? "");
        const decodedValue = Buffer.from(decodedString);
        // console.log(base64Encoded, "base64encoded for prdocut");
        const file = new Blob([decodedValue], {
          type: "application/json",
        });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileExtension", "json");
        formData.append(
          "filePath",
          session?.["custom:organization_id"] +
            `/${session?.["custom:organization_type"]}/PROCUREMENT/PRODUCT/NOTES/${createProductData?.productId}`
        );
        formData.append("eventType", "ADD_MEDIA");
        formData.append("eventSource", "NOTES");

        const response = await axios.post(
          NEXT_PUBLIC_MEETANDNOTE_ENDPOINT + "/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${session?.IdToken}`,
            },
          }
        );

        if (response.data) {
          const s3Url = response.data.body[0]?.uri;
          if (s3Url) {
            console.log("Uploaded notes to S3:", s3Url);
            productNotesUrl = s3Url;
          } else {
            console.log("Failed to upload notes to S3.");
            throw new Error("Failed to upload notes to S3.");
          }
        }
      }
      const createRequestData = {
        organizationId: session?.["custom:organization_id"],
        organizationType: session?.["custom:organization_type"],
        products: [
          {
            ...createProductData,
            ...(createProductData?.productTags != null ||
            createProductData?.productTags != undefined
              ? {
                  productTags: JSON.stringify(createProductData?.productTags),
                }
              : {}),
            ...(isEmptyFieldValue(createProductData?.productQuantity)
              ? {
                  productQuantity: null,
                }
              : {}),

            productImages: imageUrls
              ? JSON.stringify(imageUrls)
              : JSON.stringify(createProductData?.productImages),
            productNotes: productNotesUrl
              ? productNotesUrl
              : createProductData?.productNotes
              ? createProductData?.productNotes
              : null,
          },
        ],
      };
      const editRequestData = {
        organizationId: session?.["custom:organization_id"],
        organizationType: session?.["custom:organization_type"],
        ...Object.fromEntries(
          Object.entries(createProductData || {}).filter(
            ([key, value]) =>
              key !== "createdBy" &&
              key !== "createdAt" &&
              key !== "updatedAt" &&
              // key != "productArea" &&
              !(typeof value === "string" && value.trim() === "") &&
              value !== null &&
              value !== undefined
          )
        ),
        ...(isEmptyFieldValue(createProductData?.productQuantity)
          ? {
              productQuantity: null,
            }
          : {}),
        ...(createProductData?.productTags != null ||
        createProductData?.productTags != undefined
          ? { productTags: JSON.stringify(createProductData?.productTags) }
          : {}),
        productImages: imageUrls
          ? JSON.stringify(imageUrls)
          : JSON.stringify(createProductData?.productImages),
        productNotes: productNotesUrl
          ? productNotesUrl
          : createProductData?.productNotes
          ? createProductData?.productNotes
          : null,
      };
      const data = await addProductDetails({
        eventType: `${isEdit ? "UPDATE_PRODUCT" : "CREATE_PRODUCT"}`,
        ...(isEdit ? editRequestData : createRequestData),
      });

      console.log(data, "data after clicking submit");

      if (data?.code == `${isEdit ? "PRODUCTS_UPDATED" : "PRODUCTS_CREATED"}`) {
        toast.success(
          `${
            isEdit
              ? tr("toast.productUpdatedSuccessfully")
              : tr("toast.productCreatedSuccessfully")
          }`
        );
        fetchData();
        handleClose();
      }
    } catch (error) {
      toast.error("error while creating product");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductCategories();
    fetchFormatTypesData();
    fetchUnitTypeData();
  }, []);
  useEffect(() => {
    const unitFormatName = createProductData?.productDimensionFormat;

    if (unitFormatName) {
      setIsLengthDisabled(false);
      setIsWidthDisabled(false);
      setIsHeightDisabled(false);
      if (unitFormatName === "L") {
        setIsWidthDisabled(true);
        setIsHeightDisabled(true);
      } else if (unitFormatName === "W x H") {
        setIsLengthDisabled(true);
      } else if (unitFormatName === "L x W") {
        setIsHeightDisabled(true);
      } else if (unitFormatName === "L x H") {
        setIsWidthDisabled(true);
      } else if (unitFormatName === "L x W x H") {
        setIsLengthDisabled(false);
        setIsWidthDisabled(false);
        setIsHeightDisabled(false);
      }
      //   console.log("SADKJHASD", boqLibraryItemData?.unit);

      //   setBoqLibraryItemData?.((prevState) => ({
      //     ...(prevState ?? {}),
      //     unit: {
      //       ...prevState?.unit,
      //       unitFormat: prevState?.unit?.unitFormat,
      //       height: undefined,
      //       width: undefined,
      //       length: undefined,
      //     },
      // unit: {
      //   ...prevState?.unit,
      //   length: null,
      //   width: null,
      //   height: null,
      // },
      //   }));
      // boqLibraryItemData?.unit?.unitFormat?.unitFormatName
    }
  }, [createProductData?.productDimensionFormat]);
  useEffect(() => {
    const foramted = createProductData?.productCategory
      ?.toUpperCase()
      .replace(/&/g, "AND")
      .replace(/\s+/g, "_");
    if (isEdit && intialLoad && foramted) {
      setInitialLoad(false);
      fetchProductSubCategories(foramted ?? "");
    }
  }, [createProductData?.productCategory]);

  return (
    <Modal open={open}>
      <Slide direction="left" in={open} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: "absolute",
            top: "0",
            right: "0",
            width: "70vw",
            height: "100vh",
            bgcolor: "background.paper",
            boxShadow: 24,
            // p: 4,
            overflowY: "scroll",
          }}
          className="boqUI prodandserviceUI"
        >
          {/* <DialogTitle> */}
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1000,
              background: "#fff",
            }}
          >
            <div className="d-flex justify-content-between my-1">
              <div
                style={{
                  fontSize: "20px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Button
                  onClick={() => {
                    handleClose();
                  }}
                >
                  <CloseIcon
                    style={{ width: "20px", height: "20px", fill: "#ccc" }}
                  />
                </Button>
              </div>
              <UIHoverTitle
                title={`${
                  isEdit
                    ? tr("myInventory.editProduct")
                    : tr("myInventory.createNewProduct")
                }`}
              />
              <LoadingButton
                loading={loading}
                disabled={loading}
                variant="contained"
                className="btnPrimaryUI"
                onClick={handleSave}
                sx={{
                  maxWidth: "100px",
                }}
              >
                {`${isEdit ? tr("common.update") : tr("common.save")}`}
              </LoadingButton>
            </div>
            <Divider className="my-2" />
          </Box>
          <div></div>
          <Box className="p-2">
            <Box
              sx={{
                background: "#fbfdff",
              }}
              className="py-1 px-1"
            >
              <Box component={"section"} id="product information">
                <Box className="d-flex justify-content-between align-items-center">
                  <Typography
                    className="ml-2 mt-3 mb-2 fs-7 fw-600"
                    sx={{ color: (theme) => theme.palette.primary.main }}
                  >
                    {tr("myInventory.productInformation.productInformation")}
                  </Typography>
                  <Box
                    sx={{
                      border: "1px solid #d1d1d1",
                      // borderBottom: "none",
                      borderRadius: "3px 3px 0px 0px",
                      padding: "3px 15px",
                      color: "#32acff",
                      background: "white",
                      cursor: "pointer",
                      display: "flex ",
                      alignItems: "center",
                    }}
                    onClick={() => {
                      //   handleAccordionChange(section?.sectionId ?? "");
                      setExpandProductInformation((prev) => !prev);
                    }}
                  >
                    <span className="fs-8 d-flex align-items-center">
                      {expandProductInformation ? "Collapse" : "Expand"}
                      {expandProductInformation ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </span>
                    {/* {expandedSections[section?.sectionId ?? ""] ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )} */}
                  </Box>
                </Box>
                <Box
                  sx={{
                    height: expandProductInformation ? "370px" : "0px",
                    overflowY: expandProductInformation ? "auto" : "hidden",
                    transition: "height 1s",
                    transitionTimingFunction: "ease",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                      backgroundColor: "#fbfdff",
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb":
                      {
                        borderRadius: "0.7rem",
                        backgroundColor: "#fbfdff",
                        minHeight: 24,
                        border: `7px solid #fbfdff`,
                        width: "0px",
                      },
                  }}
                >
                  <Grid container spacing={2} className="pl-2">
                    <Grid item xs={12} sm={6} lg={6} xl={4}>
                      <Box className="d-flex column">
                        <FormLabel className=" fw-500 mb-1">
                          {tr("myInventory.productInformation.productName")}{" "}
                          <span className="requiredUI fs-8">{"*"}</span>
                        </FormLabel>
                        <TextField
                          placeholder={tr("common.EgSquareShoeRack")}
                          name="productName"
                          value={createProductData?.productName ?? ""}
                          onChange={handleUpdateProductDetails}
                          sx={{
                            bgcolor: "white",
                          }}
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} lg={6} xl={4}>
                      <Box className="d-flex column">
                        <FormLabel className="mb-1 fw-500">
                          {tr("common.category")}{" "}
                        </FormLabel>
                        <SingleSelectSearchDropDown
                          data={productCategories ?? []}
                          // isDisabled={type === "LIBRARY" ? true : false}
                          selectedValue={
                            selectedProductCategory ?? {
                              productCategoryId: "",
                              displayName: createProductData?.productCategory,
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
                            setCreateProductData?.((prev) => ({
                              ...(prev || {}),
                              productCategory: val?.displayName,
                              productSubCategory: "",
                            }));
                            setSelectedProductCategory(val);
                            setSelectedProductSubCategory({
                              displayName: "",
                              productCategoryName: "",
                              productCategoryId: "",
                            });
                          }}
                          isHideAddNewItem={true}
                          disableAddNew={true}
                          updateLatestFetchedValue={true}
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} lg={6} xl={4}>
                      <Box className="d-flex column">
                        <FormLabel className="mb-1 fw-500">
                          {tr("common.subCategory")}{" "}
                        </FormLabel>
                        <SingleSelectSearchDropDown
                          data={productSubCategories ?? []}
                          // isDisabled={type === "LIBRARY" ? true : false}
                          selectedValue={
                            selectedProductSubCategory ?? {
                              productSubCategoryId: "",
                              displayName:
                                createProductData?.productSubCategory,
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
                            setCreateProductData?.((prev) => ({
                              ...(prev || {}),
                              productSubCategory: val?.displayName,
                            }));

                            setSelectedProductSubCategory(val);
                          }}
                          isHideAddNewItem={true}
                          updateLatestFetchedValue={true}
                          disableAddNew={true}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6} xl={4}>
                      <Box className="d-flex column">
                        <FormLabel className=" fw-500 mb-1">
                          {tr("myInventory.productInformation.productQuantity")}{" "}
                          {/* <span className="requiredUI fs-8">{"*"}</span> */}
                        </FormLabel>
                        <NumberInputField
                          value={createProductData?.productQuantity ?? ""}
                          onChange={(e) => handleUpdateProductDetails?.(e)}
                          name="productQuantity"
                          placeholder="Eg. 1"
                          sx={{
                            bgcolor: "white",
                          }}
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} lg={6} xl={4}>
                      <Box className="d-flex column">
                        <FormLabel className=" fw-500 mb-1">
                          {tr("myInventory.productInformation.productBrand")}{" "}
                          {/* <span className="requiredUI fs-8">{"*"}</span> */}
                        </FormLabel>
                        <TextField
                          placeholder="E.g. Godrej"
                          sx={{
                            bgcolor: "white",
                          }}
                          name="productBrand"
                          value={createProductData?.productBrand ?? ""}
                          onChange={handleUpdateProductDetails}
                        />
                      </Box>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      lg={12}
                      justifyContent={"center"}
                    >
                      <Box className="d-flex column">
                        <FormLabel className=" fw-500 mb-1">
                          {tr(
                            "myInventory.productInformation.productDescription"
                          )}
                        </FormLabel>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          sx={{
                            bgcolor: "white",
                          }}
                          variant="outlined"
                          placeholder={tr("common.providing&MakingWardrobeWithOpenableShuttersAsPerDesignInPly&Laminates")}
                          name="productDescription"
                          value={createProductData?.productDescription ?? ""}
                          onChange={handleUpdateProductDetails}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
              <Divider className="my-2" />
              <Box component={"section"} id="Dimension">
                <Box className="d-flex justify-content-between align-items-center">
                  <Typography
                    className="ml-2 mt-3 mb-2 fs-7 fw-600"
                    sx={{ color: (theme) => theme.palette.primary.main }}
                  >
                    {tr("myInventory.dimension")}
                  </Typography>
                  <Box
                    sx={{
                      border: "1px solid #d1d1d1",
                      // borderBottom: "none",
                      borderRadius: "3px 3px 0px 0px",
                      padding: "3px 15px",
                      color: "#32acff",
                      background: "white",
                      cursor: "pointer",
                      display: "flex ",
                      alignItems: "center",
                    }}
                    onClick={() => {
                      //   handleAccordionChange(section?.sectionId ?? "");
                      setExpandDimension((prev) => !prev);
                    }}
                  >
                    <span className="fs-8 d-flex align-items-center ">
                      {expandDimension ? "Collapse" : "Expand"}
                      {expandDimension ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </span>
                    {/* {expandedSections[section?.sectionId ?? ""] ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )} */}
                  </Box>
                </Box>
                <Grid
                  container
                  spacing={2}
                  className="pl-2"
                  sx={{
                    height: expandDimension ? "270px" : "0px",
                    overflowY: expandDimension ? "auto" : "hidden",
                    transition: "height 1s",
                    transitionTimingFunction: "ease",
                    "& .Mui-disabled, .MuiInputBase-root.Mui-disabled": {
                      background: "#f1f1f1 !important",
                    },
                    "& .MuiInputAdornment-root p": {
                      fontSize: "0.8rem",
                      color: "#C2CFE0",
                      paddingLeft: "6px",
                      borderLeft: "1px solid #C2CFE0",
                    },
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                      backgroundColor: "#fbfdff",
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb":
                      {
                        borderRadius: "0.7rem",
                        backgroundColor: "#fff",
                        minHeight: 24,
                        border: `7px solid #fbfdff`,
                        width: "0px",
                      },
                  }}
                >
                  <Grid item xs={12} sm={6} lg={6} xl={4}>
                    <Box className="d-flex column">
                      <FormLabel className=" fw-500 mb-1">
                        {tr("dimensions.unitType")}{" "}
                      </FormLabel>

                      <TextField
                        select
                        fullWidth
                        variant="outlined"
                        placeholder="Meter"
                        SelectProps={{
                          MenuProps: {
                            disableScrollLock: true,
                            anchorOrigin: {
                              vertical: "bottom",
                              horizontal: "left",
                            },
                            transformOrigin: {
                              vertical: "top",
                              horizontal: "left",
                            },
                            PaperProps: {
                              style: {
                                maxHeight: 250, // limit height
                                width: "auto",
                              },
                            },
                          },
                        }}
                        sx={{
                          bgcolor: "white",
                          // marginLeft: "20px",
                        }}
                        // value={boqLibraryItemData?.unit?.unitType?.unitTypeName}
                        value={createProductData?.productUnitType ?? ""}
                      >
                        {unitTypes?.map((unit: any, index: any) => (
                          <MenuItem
                            key={unit?.itemUnitName}
                            value={unit?.itemUnitName}
                            onClick={() => handleUnitTypeChange(unit)}
                          >
                               {tr(`boq.libraryUnits.${unit?.itemUnitName}`)}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} lg={6} xl={4}>
                    <Box className="d-flex column">
                      <FormLabel className=" fw-500 mb-1">
                        {tr("dimensions.format")}{" "}
                      </FormLabel>

                      <TextField
                        fullWidth
                        select
                        variant="outlined"
                        placeholder="L X W X H"
                        SelectProps={{
                          MenuProps: {
                            disableScrollLock: true,
                          },
                        }}
                        // value={
                        //   boqLibraryItemData?.unit?.unitFormat?.unitFormatName
                        // }
                        value={createProductData?.productDimensionFormat ?? ""}
                        sx={{
                          bgcolor: "white",
                          // marginLeft: "20px",
                        }}
                      >
                        {formatTypes?.map((format: any, index: any) => (
                          <MenuItem
                            key={format?.formatValue}
                            value={format?.formatValue}
                            onClick={() => handleFormatTypeChange(format)}
                          >
                            {format?.formatValue}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} lg={6} xl={4}>
                    <Box className="d-flex column">
                      <FormLabel className=" fw-500 mb-1">
                        {tr("dimensions.displayType")}{" "}
                      </FormLabel>
                      <TextField
                        fullWidth
                        rows={4}
                        variant="outlined"
                        placeholder="Square meter (M)"
                        disabled
                        value={createProductData?.productUnitDisplayType}
                        sx={{
                          bgcolor: "white",
                          // marginLeft: "20px",
                        }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} lg={6} xl={4}>
                    {/* <Box className="d-flex column"> */}
                    <FormControl variant="outlined" fullWidth>
                      <FormLabel className=" fw-500 mb-1">
                        {tr("dimensions.length")}
                      </FormLabel>
                      <OutlinedInput
                        id="outlined-adornment-weight"
                        type="number"
                        // value={boqLibraryItemData?.unit?.length ?? 0}
                        value={createProductData?.productLength}
                        sx={{
                          bgcolor: "white",
                          // marginLeft: "20px",
                        }}
                        disabled={isLengthDisabled}
                        onChange={(e) =>
                          handleLengthChange(parseFloat(e.target.value))
                        }
                        onKeyDown={(e) => {
                          const target = e.target as HTMLInputElement;

                          if (
                            (target.value === "" && e.key === "0") ||
                            (target.value === "" && e.key === "-") ||
                            e.key === "-"
                          ) {
                            e.preventDefault();
                          }
                        }}
                        endAdornment={
                          <InputAdornment position="end">
                            {/* {boqLibraryItemData?.unit?.unitType?.unitTypeValue} */}
                            {displayType?.unitType?.unitTypeValue}
                          </InputAdornment>
                        }
                        aria-describedby="outlined-weight-helper-text"
                        inputProps={{
                          "aria-label": "weight",
                          min: "0",
                        }}
                      />
                    </FormControl>
                    {/* </Box> */}
                  </Grid>
                  <Grid item xs={12} sm={6} lg={6} xl={4}>
                    <FormControl variant="outlined" fullWidth>
                      <FormLabel className="fw-500 mb-1 ">
                        {tr("dimensions.width")}
                      </FormLabel>
                      <OutlinedInput
                        id="outlined-adornment-weight"
                        type="number"
                        sx={{
                          bgcolor: "white",
                          // marginLeft: "20px",
                        }}
                        // value={boqLibraryItemData?.unit?.width ?? 0}
                        value={createProductData?.productWidth}
                        onChange={(e) =>
                          handleWidthChange(parseFloat(e.target.value))
                        }
                        onKeyDown={(e) => {
                          const target = e.target as HTMLInputElement;

                          if (
                            (target.value === "" && e.key === "0") ||
                            (target.value === "" && e.key === "-") ||
                            e.key === "-"
                          ) {
                            e.preventDefault();
                          }
                        }}
                        disabled={isWidthDisabled}
                        endAdornment={
                          <InputAdornment position="end">
                            {/* {boqLibraryItemData?.unit?.unitType?.unitTypeValue} */}
                            {displayType?.unitType?.unitTypeValue}
                          </InputAdornment>
                        }
                        fullWidth
                        aria-describedby="outlined-weight-helper-text"
                        inputProps={{
                          "aria-label": "weight",
                          min: "0",
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} lg={6} xl={4}>
                    <FormControl variant="outlined" fullWidth>
                      <FormLabel className="fw-500 mb-1 ">
                        {tr("dimensions.height")}
                      </FormLabel>
                      <OutlinedInput
                        id="outlined-adornment-weight"
                        type="number"
                        // value={boqLibraryItemData?.unit?.height ?? 0}
                        value={createProductData?.productHeight}
                        sx={{
                          bgcolor: "white",
                          // marginLeft: "20px",
                        }}
                        disabled={isHeightDisabled}
                        onChange={(e) =>
                          handleHeightChange(parseFloat(e.target.value))
                        }
                        onKeyDown={(e) => {
                          const target = e.target as HTMLInputElement;

                          if (
                            (target.value === "" && e.key === "0") ||
                            (target.value === "" && e.key === "-") ||
                            e.key === "-"
                          ) {
                            e.preventDefault();
                          }
                        }}
                        endAdornment={
                          <InputAdornment position="end">
                            {/* {boqLibraryItemData?.unit?.unitType?.unitTypeValue} */}
                            {displayType?.unitType?.unitTypeValue}
                          </InputAdornment>
                        }
                        aria-describedby="outlined-weight-helper-text"
                        inputProps={{
                          "aria-label": "weight",
                          min: "0",
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} lg={6} xl={4}>
                    <FormControl variant="outlined" fullWidth>
                      <FormLabel className="fw-500 mb-1 ">
                        {tr("dimensions.area")}
                      </FormLabel>

                      <OutlinedInput
                        id="outlined-adornment-area"
                        sx={{
                          bgcolor: "white",
                          // marginLeft: "20px",
                        }}
                        endAdornment={
                          <InputAdornment position="end">
                            {displayType?.unitType?.unitTypeValue}
                            {displayType?.unitFormat?.unitFormatPower &&
                            displayType?.unitFormat?.unitFormatPower > 1
                              ? String.fromCharCode(
                                  displayType?.unitFormat?.unitFormatPower === 2
                                    ? 178
                                    : 179
                                )
                              : ""}
                          </InputAdornment>
                        }
                        value={displayType?.productArea ?? 0}
                        disabled
                        fullWidth
                        aria-describedby="outlined-weight-helper-text"
                        inputProps={{
                          "aria-label": "weight",
                        }}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
              <Divider className="my-2" />
              <Box component={"section"} id="Product variant">
                <Box className="d-flex justify-content-between align-items-center">
                  <Typography
                    className="ml-2 mt-3 mb-2 fs-7 fw-600"
                    sx={{ color: (theme) => theme.palette.primary.main }}
                  >
                    {tr("myInventory.productVariant.productVariant")}
                  </Typography>
                  <Box
                    sx={{
                      border: "1px solid #d1d1d1",
                      // borderBottom: "none",
                      borderRadius: "3px 3px 0px 0px",
                      padding: "3px 15px",
                      color: "#32acff",
                      background: "white",
                      cursor: "pointer",
                      display: "flex ",
                      alignItems: "center",
                    }}
                    onClick={() => {
                      //   handleAccordionChange(section?.sectionId ?? "");
                      setExpandProductVariant((prev) => !prev);
                    }}
                  >
                    <span className="fs-8 d-flex align-items-center ">
                      {expandProductVariant ? "Collapse" : "Expand"}
                      {expandDimension ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </span>
                    {/* {expandedSections[section?.sectionId ?? ""] ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )} */}
                  </Box>
                </Box>

                <Grid
                  container
                  spacing={2}
                  className="pl-2"
                  sx={{
                    height: expandProductVariant ? "250px" : "0px",
                    overflowY: expandProductVariant ? "auto" : "hidden",
                    transition: "height 1s",
                    transitionTimingFunction: "ease",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                      backgroundColor: "#fbfdff",
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb":
                      {
                        borderRadius: "0.7rem",
                        backgroundColor: "#fff",
                        minHeight: 24,
                        border: `7px solid #fbfdff`,
                        width: "0px",
                      },
                  }}
                >
                  <Grid item xs={12} sm={6} lg={6} xl={4}>
                    <Box className="d-flex column">
                      <FormLabel className=" fw-500 mb-1">
                        {tr("myInventory.productVariant.colour")}{" "}
                      </FormLabel>
                      <TextField
                        placeholder={`E.g. ${tr("color.brown")}`}
                        name="productColour"
                        value={createProductData?.productColour ?? ""}
                        onChange={handleUpdateProductDetails}
                        sx={{
                          bgcolor: "white",
                          // marginLeft: "20px",
                        }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} lg={6} xl={4}>
                    <Box className="d-flex column">
                      <FormLabel className=" fw-500 mb-1">
                        {tr("myInventory.productVariant.finish")}{" "}
                      </FormLabel>
                      <TextField
                        placeholder={`E.g. ${tr("common.smooth")}`}
                        name="productFinish"
                        value={createProductData?.productFinish ?? ""}
                        onChange={handleUpdateProductDetails}
                        sx={{
                          bgcolor: "white",
                          // marginLeft: "20px",
                        }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} lg={6} xl={4}>
                    <Box className="d-flex column">
                      <FormLabel className="fw-500 mb-1">
                        {tr("myInventory.productVariant.material")}{" "}
                      </FormLabel>
                      <TextField
                        placeholder={`E.g. ${tr("common.plywoodlamination")}`}
                        name="productMaterials"
                        value={createProductData?.productMaterials ?? ""}
                        onChange={handleUpdateProductDetails}
                        sx={{
                          bgcolor: "white",
                          // marginLeft: "20px",
                        }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} lg={6} xl={4}>
                    <Box className="d-flex column">
                      <FormLabel className="fw-500 mb-1">
                        {tr("myInventory.productVariant.manufacturer")}{" "}
                      </FormLabel>
                      <TextField
                        placeholder={`E.g.${tr("common.Quickzeroar")}`}
                        name="productManufacturer"
                        value={createProductData?.productManufacturer ?? ""}
                        onChange={handleUpdateProductDetails}
                        sx={{
                          bgcolor: "white",
                          // marginLeft: "20px",
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} lg={6} xl={4}>
                    <Box className="d-flex column">
                      <FormLabel className="fw-500 mb-1">
                        {tr("myInventory.productVariant.tag")}{" "}
                      </FormLabel>

                      <Stack spacing={3}>
                        <Autocomplete
                          multiple
                          id="tags-filled"
                          // className="ml-3"
                          // options={productTags?.map((option) => option)}
                          options={[]}
                          freeSolo
                          value={createProductData?.productTags || []} // Ensure it's not undefined
                          onChange={handleTags}
                          renderTags={(value: readonly string[], getTagProps) =>
                            value?.map((option: string, index: number) => (
                              // eslint-disable-next-line react/jsx-key
                              <Chip
                                variant="outlined"
                                label={option}
                                id="removeTag"
                                {...getTagProps({ index })}
                                onDelete={() => handleRemoveTags(option)}
                              />
                            ))
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              value={newTag}
                              name="tagChange"
                              onChange={handleTagInputChange}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleEnterPress(e);
                                }
                              }}
                            />
                          )}
                        />
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              <Divider className="my-2" />
              <Box component={"section"} id="Price Information">
                <Box className="d-flex justify-content-between align-items-center">
                  <Typography
                    className="ml-2 mt-3 mb-2 fs-7 fw-600"
                    sx={{ color: (theme) => theme.palette.primary.main }}
                  >
                    {tr("myInventory.priceInformation.priceInformation")}
                  </Typography>
                  <Box
                    sx={{
                      border: "1px solid #d1d1d1",
                      // borderBottom: "none",
                      borderRadius: "3px 3px 0px 0px",
                      padding: "3px 15px",
                      color: "#32acff",
                      background: "white",
                      cursor: "pointer",
                      display: "flex ",
                      alignItems: "center",
                    }}
                    onClick={() => {
                      //   handleAccordionChange(section?.sectionId ?? "");
                      setExpandPriceInformation((prev) => !prev);
                    }}
                  >
                    <span className=" d-flex fs-8 align-items-center ">
                      {expandPriceInformation ? "Collapse" : "Expand"}
                      {expandDimension ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </span>
                    {/* {expandedSections[section?.sectionId ?? ""] ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )} */}
                  </Box>
                </Box>

                <Grid
                  container
                  spacing={2}
                  className="pl-2"
                  sx={{
                    height: expandPriceInformation ? "250px" : "0px",
                    overflowY: expandPriceInformation ? "auto" : "hidden",
                    transition: "height 1s",
                    transitionTimingFunction: "ease",
                    "& .Mui-disabled, .MuiInputBase-root.Mui-disabled": {
                      background: "#f1f1f1 !important",
                    },
                    "& .MuiInputAdornment-root p": {
                      fontSize: "0.8rem",
                      color: "#C2CFE0",
                      paddingRight: "10px",
                      borderRight: "1px solid #C2CFE0",
                    },
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                      backgroundColor: "#fbfdff",
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb":
                      {
                        borderRadius: "0.7rem",
                        backgroundColor: "#fff",
                        minHeight: 24,
                        border: `7px solid #fbfdff`,
                        width: "0px",
                      },
                  }}
                >
                  <Grid item xs={12} sm={6} lg={6} xl={4}>
                    <FormControl variant="outlined" fullWidth>
                      <FormLabel className=" fw-500 mb-1">
                        {tr("myInventory.priceInformation.unitCost")}
                      </FormLabel>
                      <OutlinedInput
                        id="outlined-adornment-weight"
                        type="number"
                        // value={boqLibraryItemData?.unit?.length ?? 0}

                        placeholder="E.g. 100.00"
                        sx={{
                          bgcolor: "white",
                          // marginLeft: "20px",
                        }}
                        // disabled={isLengthDisabled}
                        name="unitCost"
                        value={createProductData?.unitCost ?? 0}
                        onChange={handleUpdateProductDetails}
                        // onChange={(e) => {
                        //   const value = e.target.value;

                        //   if (/^[1-9]\d*$/.test(value) || value === "") {
                        //     handleUpdateProductDetails?.(e);
                        //   }
                        // }}
                        onKeyDown={(e) => {
                          const target = e.target as HTMLInputElement;

                          if (
                            (target.value === "" && e.key === "0") ||
                            (target.value === "" && e.key === "-") ||
                            e.key === "-"
                          ) {
                            e.preventDefault();
                          }
                        }}
                        startAdornment={
                          <InputAdornment position="end" className="mr-2">
                            {/* {boqLibraryItemData?.unit?.unitType?.unitTypeValue} */}
                            {currency}
                          </InputAdornment>
                        }
                        aria-describedby="outlined-weight-helper-text"
                        inputProps={{
                          "aria-label": "weight",
                          min: "0",
                        }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} lg={6} xl={4}>
                    <FormControl variant="outlined" fullWidth>
                      <FormLabel className=" fw-500 mb-1">
                        {tr("myInventory.priceInformation.markup")}
                      </FormLabel>
                      <OutlinedInput
                        id="outlined-adornment-weight"
                        type="number"
                        // value={boqLibraryItemData?.unit?.length ?? 0}

                        placeholder="E.g. 5"
                        sx={{
                          bgcolor: "white",
                          // marginLeft: "20px",
                        }}
                        // disabled={isLengthDisabled}
                        name="markup"
                        value={createProductData?.markup ?? 0}
                        onChange={handleUpdateProductDetails}
                        onKeyDown={(e) => {
                          const target = e.target as HTMLInputElement;

                          if (
                            (target.value === "" && e.key === "0") ||
                            (target.value === "" && e.key === "-") ||
                            e.key === "-"
                          ) {
                            e.preventDefault();
                          }
                        }}
                        startAdornment={
                          <InputAdornment position="end" className="mr-2">
                            {/* {boqLibraryItemData?.unit?.unitType?.unitTypeValue} */}
                            %
                          </InputAdornment>
                        }
                        aria-describedby="outlined-weight-helper-text"
                        inputProps={{
                          "aria-label": "weight",
                          min: "0",
                        }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} lg={6} xl={4}>
                    <FormControl variant="outlined" fullWidth>
                      <FormLabel className=" fw-500 mb-1">
                        {tr("myInventory.priceInformation.unitSellingPrice")}
                      </FormLabel>
                      <OutlinedInput
                        id="outlined-adornment-weight"
                        type="number"
                        // value={boqLibraryItemData?.unit?.length ?? 0}

                        placeholder="E.g. 5"
                        sx={{
                          bgcolor: "white",
                          // marginLeft: "20px",
                        }}
                        disabled={true}
                        name="sellingPrice"
                        value={roundNumber(Number(createProductData?.sellingPrice))}
                        onChange={handleUpdateProductDetails}
                        onKeyDown={(e) => {
                          const target = e.target as HTMLInputElement;

                          if (
                            (target.value === "" && e.key === "0") ||
                            (target.value === "" && e.key === "-") ||
                            e.key === "-"
                          ) {
                            e.preventDefault();
                          }
                        }}
                        startAdornment={
                          <InputAdornment position="end" className="mr-2">
                            {/* {boqLibraryItemData?.unit?.unitType?.unitTypeValue} */}
                            {currency}
                          </InputAdornment>
                        }
                        aria-describedby="outlined-weight-helper-text"
                        inputProps={{
                          "aria-label": "weight",
                          min: "0",
                        }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} lg={6} xl={4}>
                    <FormControl variant="outlined" fullWidth>
                      <FormLabel className=" fw-500 mb-1">
                        {tr("myInventory.priceInformation.msrpListPrice")}
                      </FormLabel>
                      <OutlinedInput
                        id="outlined-adornment-weight"
                        type="number"
                        // value={boqLibraryItemData?.unit?.length ?? 0}

                        placeholder="E.g. 5"
                        sx={{
                          bgcolor: "white",
                          // marginLeft: "20px",
                        }}
                        name="msrp"
                        value={createProductData?.msrp ?? 0}
                        onChange={handleUpdateProductDetails}
                        onKeyDown={(e) => {
                          const target = e.target as HTMLInputElement;

                          if (
                            (target.value === "" && e.key === "0") ||
                            (target.value === "" && e.key === "-") ||
                            e.key === "-"
                          ) {
                            e.preventDefault();
                          }
                        }}
                        startAdornment={
                          <InputAdornment position="end" className="mr-2">
                            {/* {boqLibraryItemData?.unit?.unitType?.unitTypeValue} */}
                            {currency}
                          </InputAdornment>
                        }
                        aria-describedby="outlined-weight-helper-text"
                        inputProps={{
                          "aria-label": "weight",
                          min: "0",
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} lg={6} xl={4}>
                    <FormControl variant="outlined" fullWidth>
                      <FormLabel className=" fw-500 mb-1">
                        {tr("myInventory.priceInformation.sku")}
                      </FormLabel>
                      <OutlinedInput
                        id="outlined-adornment-weight"
                        // value={boqLibraryItemData?.unit?.length ?? 0}

                        placeholder="E.g. #AEC-001"
                        sx={{
                          bgcolor: "white",
                          // marginLeft: "20px",
                        }}
                        name="sku"
                        value={createProductData?.sku ?? ""}
                        onChange={handleUpdateProductDetails}
                        aria-describedby="outlined-weight-helper-text"
                        inputProps={{
                          "aria-label": "weight",
                          min: "0",
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} lg={6} xl={4}>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={8} lg={8} xl={8}>
                        <Box className="d-flex column">
                          <FormLabel className=" fw-500 ">
                            {tr("myInventory.priceInformation.leadTime")}
                          </FormLabel>
                          <Box className="d-flex align-items-center">
                            <TextField
                              id="outlined-basic"
                              type="number"
                              fullWidth
                              name="leadTime"
                              placeholder={tr("common.enterYourProjectArea")+"..."}
                              variant="outlined"
                              style={{
                                paddingBlock: "10px",
                                boxSizing: "border-box",
                                paddingRight: 0,
                              }}
                              value={
                                createProductData?.leadTime == 0
                                  ? ""
                                  : createProductData?.leadTime
                              }
                              inputProps={{ maxLength: 10, min: 1 }}
                              // onChange={(e) =>
                              //   handleProjectArea(Number(e.target.value))
                              // }
                              onChange={(e) => {
                                const value = e.target.value;

                                if (/^[1-9]\d*$/.test(value) || value === "") {
                                  // handleProjectArea(Number(e.target.value));
                                  handleUpdateProductDetails?.(e);
                                }
                              }}
                              onKeyDown={(e) => {
                                const target = e.target as HTMLInputElement;

                                if (
                                  (target.value === "" && e.key === "0") ||
                                  (target.value === "" && e.key === "-") ||
                                  e.key === "-"
                                ) {
                                  e.preventDefault();
                                }
                              }}
                              InputProps={{
                                endAdornment: (
                                  <div
                                    style={{
                                      marginLeft: "10px",
                                    }}
                                  >
                                    <TextField
                                      select
                                      name="leadTimeType"
                                      value={createProductData?.leadTimeType}
                                      onChange={(e) =>
                                        // handleProjectAreaUnit(e.target.value)
                                        handleUpdateProductDetails?.(e)
                                      }
                                      variant="standard"
                                      SelectProps={{
                                        MenuProps: {
                                          disableScrollLock: true,
                                        },
                                      }}
                                      sx={{
                                        "& .MuiInput-root:before": {
                                          borderBottom: "none",
                                        },
                                      }}
                                    >
                                    
                                      {[tr("common.timePeriod.day"),tr("common.timePeriod.hr"),tr("common.timePeriod.week")].map((option) => (
                                        <MenuItem key={option} value={option}>
                                          {option}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  </div>
                                ),
                              }}
                            />
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={4} lg={4} xl={4}>
                        <Box className="d-flex justify-content-around align-items-center h-100">
                          <FormLabel className=" fw-500 ">
                            {tr("myInventory.priceInformation.taxable")}
                          </FormLabel>
                          <AntSwitch
                            defaultChecked
                            inputProps={{ "aria-label": "ant design" }}
                            checked={createProductData?.isTaxApplicable}
                            name="isTaxApplicable"
                            onChange={
                              (e) =>
                                // setShowUnReadMessage(!showUnReadMessage)
                                handleUpdateProductDetails?.(e)
                              // console.log()
                            }
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                {Boolean(createProductData?.unitCost) &&
                  Boolean(createProductData?.markup) && (
                    <Box className="pl-2">
                      <Typography component={"p"} className="fs-7 fw-500">
                        {tr("myInventory.priceInformation.yourProfit")}:{" "}
                        <Typography
                          component={"span"}
                          color={"#2ED47A"}
                          className="fs-7 fw-500"
                        >
                          {currency}
                          {formatNumberITL(
                            localizationValue,
                            roundNumber(
                              Number(createProductData?.sellingPrice || 0) -
                                Number(createProductData?.unitCost || 0)
                            )
                          )}
                        </Typography>
                      </Typography>
                    </Box>
                  )}
              </Box>
              <Divider className="my-2" />
              <Box component={"section"} id="product image">
                <Box className="d-flex justify-content-between align-items-center">
                  <Typography
                    className="ml-2 mt-3 mb-2 fs-7 fw-600"
                    sx={{ color: (theme) => theme.palette.primary.main }}
                  >
                    {tr("myInventory.productImage")}
                  </Typography>
                  <Box
                    sx={{
                      border: "1px solid #d1d1d1",
                      // borderBottom: "none",
                      borderRadius: "3px 3px 0px 0px",
                      padding: "3px 15px",
                      color: "#32acff",
                      background: "white",
                      cursor: "pointer",
                      display: "flex ",
                      alignItems: "center",
                    }}
                    onClick={() => {
                      //   handleAccordionChange(section?.sectionId ?? "");
                      setExpandProductImage((prev) => !prev);
                    }}
                  >
                    <span className=" fs-8 d-flex align-items-center ">
                      {expandProductImage ? "Collapse" : "Expand"}
                      {expandDimension ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </span>
                    {/* {expandedSections[section?.sectionId ?? ""] ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )} */}
                  </Box>
                </Box>
                <Box
                  sx={{
                    height: expandProductImage ? "350px" : "0px",
                    overflowY: expandProductImage ? "scroll" : "hidden",
                    transition: "height 1s",
                    transitionTimingFunction: "ease",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                      backgroundColor: "#fbfdff",
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb":
                      {
                        borderRadius: "0.7rem",
                        backgroundColor: "#fff",
                        minHeight: 24,
                        border: `7px solid #fbfdff`,
                        width: "0px",
                      },
                  }}
                >
                  <Grid container spacing={2} className="pl-2">
                    <Grid item xs={12} sm={12} lg={12}>
                      <ProductImageUpload isEdit={isEdit ?? false} />
                    </Grid>
                    <Grid item xs={12} sm={12} lg={12}>
                      <ProductsTermsAndConditions isEdit={isEdit ?? false} />
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Box>
          </Box>
          {/* <CustomTablePagination
            currentPage={currentPage}
            onChangePage={(page) => {
              setCurrentPage(page);
            }}
            onChangeRowsperPage={(e) => {
              setRowsPerPage(Number(e.target.value));
            }}
            rowsPerPage={rowsPerPage}
            totalPage={pageCount}
          /> */}
        </Box>
      </Slide>
    </Modal>
  );
};
AddOrEditProductModal.displayName = "AddOrEditProductModal";
