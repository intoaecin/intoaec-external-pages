import { UIDropDown } from "@/features/components/HelperComponents/UIDropDown";
import { useDialog } from "@/features/components/providers/DialogProvider";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import DeleteIcon from "@/assets/icons/delete-icon";
import EditIcon from "@/assets/icons/edit-icon";
import DeleteProductDialog from "./DeleteProductDialog";
import {
  Box,
  Checkbox,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  useTheme,
} from "@mui/material";
import { MoreVerticalIcon } from "lucide-react";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { ProductType } from "./ManageProductHome";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import MenuItem from "@mui/material/MenuItem";
import { LoadingButton } from "@mui/lab";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import {
  formatToCamelCaseWithAmpersand,
  formatNumberITL,
  getLocalizationValue,
} from "@/lib/helpers";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { TruncatedText } from "@/components_v2/TruncatedText";
import { roundNumber } from "@/utils/numbers";
export interface ProductMasterGridPropsType {
  inLineEdit?: boolean;
  data: ProductType[];
  fetchData: () => void;
  onEdit?: (product: Partial<ProductType> | undefined) => void;
  selectedProducts: string[];
  setSelectedProducts: React.Dispatch<
    React.SetStateAction<string[] | undefined>
  >;
  isVendorProducts?: boolean;
  isPreview?: boolean;
}
export const dropdownStyle = {
  "& .MuiPaper-root": {
    width: "140px !important",
    left: "calc(100% - 180px) !important",
  },
  "& .MuiTypography-root": {
    fontSize: "13px",
  },
};

// Add new interface for editable cell state
export interface EditableCellState {
  rowIndex: number;
  field: keyof ProductType;
  value: any;
}

const ProductMasterGrid = ({
  data,
  isVendorProducts = false,
  inLineEdit = false,
  onEdit,
  fetchData,
  selectedProducts,
  setSelectedProducts,
  isPreview,
}: ProductMasterGridPropsType) => {
  const DECIMAL_PRECISION = 2;
  const categoryMenuProps = {
    PaperProps: {
      sx: {
        maxHeight: 250,
      },
    },
  };
  const { localizationValue } = useOrganizationLocalization();
  const theme = useTheme();
  const { t } = useTranslation();
  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);
  const {
    popup: deleteProductPopup,
    setPreventClose: preventCloseDeleteProductPopup,
    closeModal: closeDeleteProductPopup,
  } = useDialog();

  const currency = useMemo(() => {
    if (localizationValue) {
      console.log(localizationValue, "localizationValue");
      return (
        getLocalizationValue(localizationValue, "CURRENCY", "SYMBOL") ?? ""
      );
    } else {
      return "";
    }
  }, [localizationValue]);

  const { NEXT_PUBLIC_PROPOSAL_ENDPOINT, NEXT_PUBLIC_PROCUREMENT_ENDPOINT } =
    useEnv();
  const { post: deleteProductDetails } = useAxiosWithAuth(
    NEXT_PUBLIC_PROCUREMENT_ENDPOINT + "/products"
  );
  const router = useRouter();
  const deleteProductRef = useRef<string | undefined>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProduct, setselectedProduct] =
    useState<Partial<ProductType>>();
  const [editableCell, setEditableCell] = useState<EditableCellState | null>(
    null
  );
  const [editValue, setEditValue] = useState<any>(null);
  const [productCategories, setProductCategories] = useState<any[]>();
  const [productSubCategories, setProductSubCategories] =
    useState<Array<any>>();
  const [isSaving, setIsSaving] = useState(false);

  const isOutOfStockSelected = useMemo(() => {
    if (!selectedProducts?.length) return false;

    return data?.some(
      (product) =>
        selectedProducts.includes(product.productId ?? "") &&
        (product.productQuantity === 0 || product.productQuantity < 1)
    );
  }, [data, selectedProducts]);

  const uiDropDownData = [
    {
      text: t("common.edit"),
      type: "Edit",
      icon: (
        <EditIcon style={{ width: "15px", height: "15px", fill: "#000000" }} />
      ),
    },

    {
      text: t("common.delete"),
      type: "Delete",
      icon: (
        <DeleteIcon
          style={{
            width: "18px",
            height: "18px",
            fill: theme?.palette?.error?.main,
          }}
        />
      ),
    },
  ];
  const handleMenuClose = () => {
    setAnchorEl(null);
    // setSelectedProposalData(undefined);
    setHoveredRow(null);
  };
  const deleteProduct = async (productId: string) => {
    const requestData = {
      eventType: "UPDATE_PRODUCT",
      productId,
      // reason: deleteProductRef.current,
      isActive: false,
    };
    const response = await deleteProductDetails(requestData);
    if (response?.code === "PRODUCTS_UPDATED") {
      toast.success("Product deleted successfully", { autoClose: 1000 });
      deleteProductRef.current = "";
      fetchData();
      closeDeleteProductPopup();
    } else {
      if (response?.error) {
        toast.error(response?.error?.message ?? response?.error);
      } else {
        toast.error("Some error occured");
      }
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    preventCloseDeleteProductPopup();
    deleteProductPopup({
      content: (
        <DeleteProductDialog
          onReasonChange={(value) => {
            deleteProductRef.current = value;
          }}
        />
      ),
      onYes: async () => {
        if (!deleteProductRef?.current?.trim()) {
          preventCloseDeleteProductPopup();
          toast.error(t("toast.pleaseEnterTheReasonToProceed"));
          return;
        }
        await deleteProduct(productId);
      },
      onNo: async () => {
        console.log("No button clicked");
      },
    });
  };

  const handleRowSelection = (value: string) => {
    if (value === "Select All" && data) {
      setSelectedProducts((prev) => [
        ...(prev ?? []),
        ...(data
          ?.map((row) => row.productId)
          .filter((id): id is string => !!id) ?? []),
      ]);
    } else if (value == "Clear All") {
      setSelectedProducts([]);
    } else {
      setSelectedProducts((prev) => [...(prev ?? []), value]);
    }
  };

  const buttonStyle: React.CSSProperties = {
    borderRadius: "4px 0px 0px 4px",
    backgroundColor: theme?.palette?.primary?.main,
    border: "none",
    padding: " 10px 0px",
    color: "#ffffff",
    margin: "1px -3px",
  };

  // Add handler for cell click
  const handleCellClick = (
    rowIndex: number,
    field: keyof ProductType,
    value: any
  ) => {
    setEditableCell({ rowIndex, field, value });
    const normalizedInitialValue =
      (field === "unitCost" || field === "markup" || field === "productQuantity") &&
      value !== "" &&
      value !== null &&
      value !== undefined
        ? roundNumber(value, DECIMAL_PRECISION)
        : value;
    setEditValue(normalizedInitialValue);
  };

  // Modified handleSaveEdit function
  const handleSaveEdit = async () => {
    if (!editableCell) return;

    setIsSaving(true);
    try {
      const product = data[editableCell.rowIndex];
      const isNumericField =
        editableCell.field === "unitCost" ||
        editableCell.field === "markup" ||
        editableCell.field === "productQuantity";
      const normalizedEditValue =
        isNumericField &&
        editValue !== ""
          ? roundNumber(editValue, DECIMAL_PRECISION)
          : editValue;

      let updatedProduct = {
        ...product,
        [editableCell.field]: normalizedEditValue,
      };

      const productName = String(updatedProduct.productName ?? "").trim();
      const productQuantityRaw: unknown = updatedProduct.productQuantity;
      const unitCostRaw: unknown = updatedProduct.unitCost;
      const markupRaw: unknown = updatedProduct.markup;

      const productQuantity = Number(productQuantityRaw);
      const unitCost = Number(unitCostRaw);
      const markup = Number(markupRaw);

      const isMissingOrInvalidNumber = (value: unknown, parsed: number) => {
        if (value === null || value === undefined) return true;
        if (typeof value === "string" && value.trim() === "") return true;
        return !Number.isFinite(parsed);
      };

      if (!productName) {
        toast.error(t("toast.pleaseEnterProductName"));
        return;
      }

      if (editableCell.field === "productQuantity") {
        if (isMissingOrInvalidNumber(productQuantityRaw, productQuantity)) {
          toast.error(t("toast.pleaseEnterValidQuantity"));
          return;
        }
      }

      if (editableCell.field === "unitCost") {
        if (isMissingOrInvalidNumber(unitCostRaw, unitCost)) {
          toast.error(t("toast.pleaseEnterValidUnitCost"));
          return;
        }
      }

      if (editableCell.field === "markup") {
        if (isMissingOrInvalidNumber(markupRaw, markup)) {
          toast.error(t("toast.pleaseEnterValidMarkup"));
          return;
        }
      }

      // Calculate new selling price if unit cost or markup is changed
      if (
        editableCell.field === "unitCost" ||
        editableCell.field === "markup"
      ) {
        const newUnitCost =
          editableCell.field === "unitCost"
            ? Number(normalizedEditValue) || 0
            : product.unitCost || 0;
        const newMarkup =
          editableCell.field === "markup"
            ? Number(normalizedEditValue) || 0
            : product.markup || 0;

        updatedProduct.sellingPrice = calculateSellingPrice(
          newUnitCost,
          newMarkup
        );
      }

      // If we're editing the category, set the first available subcategory
      if (
        editableCell.field === "productCategory" &&
        productSubCategories?.length
      ) {
        updatedProduct = {
          ...updatedProduct,
          productSubCategory: productSubCategories[0].displayName,
        };
      }

      // Filter out unnecessary fields
      const filteredProduct = Object.fromEntries(
        Object.entries(updatedProduct).filter(
          ([key, value]) =>
            key !== "createdBy" &&
            key !== "createdAt" &&
            key !== "updatedAt" &&
            value !== null &&
            value !== undefined
        )
      );

      const requestData = {
        eventType: "UPDATE_PRODUCT",
        ...filteredProduct,
      };

      const response = await deleteProductDetails(requestData);

      if (response?.code === "PRODUCTS_UPDATED") {
        toast.success(t("toast.productUpdatedSuccessfully"), {
          autoClose: 1000,
        });
        fetchData();
      } else {
        toast.error(t("toast.failedToUpdateProduct"));
      }
    } catch (error) {
      toast.error(t("toast.errorUpdatingProduct"));
    } finally {
      setIsSaving(false);
      setEditableCell(null);
      setEditValue(null);
    }
  };

  // Add function to fetch categories
  const fetchProductCategories = async () => {
    const data = await deleteProductDetails({
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

  // Add function to fetch subcategories
  const fetchProductSubCategories = async (productCategoryName: string) => {
    try {
      const data = await deleteProductDetails({
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

  // Fetch categories on component mount
  useEffect(() => {
    fetchProductCategories();
  }, []);

  // Modified renderCellContent function
  const renderCellContent = (
    rowIndex: number,
    field: keyof ProductType,
    value: any
  ) => {
    const isEditing =
      editableCell?.rowIndex === rowIndex && editableCell?.field === field;

    if (isEditing) {
      return (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {field === "productCategory" ? (
            <TextField
              select
              value={editValue}
              SelectProps={{ MenuProps: categoryMenuProps }}
              onChange={(e) => {
                setEditValue(e.target.value);
                const category = productCategories?.find(
                  (cat) => cat.displayName === e.target.value
                );
                if (category) {
                  fetchProductSubCategories(category.productCategoryName);
                }
              }}
              size="small"
              fullWidth
            >
              {productCategories?.map((category) => (
                <MenuItem
                  key={category.productCategoryId}
                  value={category.displayName}
                >
                  {category.displayName}
                </MenuItem>
              ))}
            </TextField>
          ) : field === "productSubCategory" ? (
            <TextField
              select
              value={editValue}
              SelectProps={{ MenuProps: categoryMenuProps }}
              onChange={(e) => setEditValue(e.target.value)}
              size="small"
              fullWidth
              disabled={!productSubCategories}
            >
              {productSubCategories?.map((subCategory) => (
                <MenuItem
                  key={subCategory.productSubCategoryId}
                  value={subCategory.displayName}
                >
                  {subCategory.displayName}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              value={editValue}
              onChange={(e) => {
                const newValue = e.target.value;

                if (
                  (field === "unitCost" ||
                    field === "markup" ||
                    field === "productQuantity") &&
                  !/^\d*\.?\d*$/.test(newValue)
                ) {
                  return;
                }

                if (
                  (field === "unitCost" ||
                    field === "markup" ||
                    field === "productQuantity") &&
                  newValue.includes(".")
                ) {
                  const decimalPart = newValue.split(".")[1] ?? "";
                  if (decimalPart.length > DECIMAL_PRECISION) {
                    return;
                  }
                }

                if (
                  (field === "unitCost" ||
                    field === "markup" ||
                    field === "productQuantity") &&
                  parseFloat(newValue) < 0
                ) {
                  return; // Prevent negative values
                }
                setEditValue(newValue);

                // Update selling price when unit cost or markup changes
                if (
                  field === "unitCost" ||
                  field === "markup" ||
                  field === "productQuantity"
                ) {
                  const currentProduct = data[rowIndex];
                  const newUnitCost =
                    field === "unitCost"
                      ? parseFloat(newValue) || 0
                      : currentProduct.unitCost || 0;
                  const newMarkup =
                    field === "markup"
                      ? parseFloat(newValue) || 0
                      : currentProduct.markup || 0;

                  const newSellingPrice = calculateSellingPrice(
                    newUnitCost,
                    newMarkup
                  );

                  // Update the product with new selling price
                  const updatedProduct = {
                    ...currentProduct,
                    [field]: parseFloat(newValue),
                    sellingPrice: newSellingPrice,
                  };

                  // Update the data array
                  const newData = [...data];
                  newData[rowIndex] = updatedProduct;
                }
              }}
              onBlur={() => {
                if (
                  (field === "unitCost" ||
                    field === "markup" ||
                    field === "productQuantity") &&
                  editValue !== "" &&
                  editValue !== null &&
                  editValue !== undefined
                ) {
                  setEditValue(roundNumber(editValue, DECIMAL_PRECISION));
                }
              }}
              size="small"
              sx={{ width: "120px" }}
              fullWidth
              type={
                field === "unitCost" ||
                field === "markup" ||
                field === "sellingPrice" ||
                field === "productQuantity"
                  ? "number"
                  : "text"
              }
            />
          )}
          <LoadingButton
            loading={isSaving}
            size="small"
            onClick={handleSaveEdit}
            sx={{ minWidth: "auto", p: 0.5 }}
          >
            <CheckIcon fontSize="small" color="success" />
          </LoadingButton>
          <LoadingButton
            loading={false}
            size="small"
            onClick={() => setEditableCell(null)}
            sx={{ minWidth: "auto", p: 0.5 }}
          >
            <CloseIcon fontSize="small" color="error" />
          </LoadingButton>
        </Box>
      );
    }

    const formattedValue = value
      ? field === "productQuantity"
        ? value <= 0
          ? t("myInventory.outOfStock")
          : Number(value).toFixed(DECIMAL_PRECISION)
        : field === "markup"
        ? Number(value).toFixed(DECIMAL_PRECISION)
        : field === "unitCost" || field === "sellingPrice"
        ? currency + " " + formatNumberITL(localizationValue, value)
        : value
      : field === "productQuantity"
      ? t("myInventory.outOfStock")
      : "-";

    const shouldUseTruncatedText =
      !isEditing &&
      typeof formattedValue === "string" &&
      ["productName", "productCategory", "productSubCategory", "productBrand"]
        .includes(field);

    const content = (
      <Box
        onClick={() => {
          if (inLineEdit) {
            handleCellClick(rowIndex, field, value);
            if (field === "productCategory" || field === "productSubCategory") {
              const categoryValue = data[rowIndex].productCategory;
              if (categoryValue) {
                const formatted = categoryValue
                  .toUpperCase()
                  .replace(/&/g, "AND")
                  .replace(/\s+/g, "_");
                fetchProductSubCategories(formatted);
              }
            }
          }
        }}
        sx={{
          cursor: inLineEdit ? "pointer" : "default",
          "&:hover": { bgcolor: inLineEdit ? "action.hover" : "inherit" },
          p: 1,
          ...(field === "productQuantity" &&
            (value <= 0 || !value) && {
              color: "error.main",
              "&:hover": {
                bgcolor: "error.light",
                opacity: 0.9,
              },
            }),
        }}
      >
        {shouldUseTruncatedText ? (
          <TruncatedText text={formattedValue} limit={14} />
        ) : (
          formattedValue
        )}
      </Box>
    );

    // if (field === "productQuantity" && (value <= 0 || !value)) {
    //   return (
    //     <Tooltip title="Out of Stock" placement="top" arrow>
    //       {content}
    //     </Tooltip>
    //   );
    // }

    return content;
  };

  const calculateSellingPrice = (unitCost: number, markup: number) => {
    return unitCost * (1 + markup / 100);
  };

  return (
    <>
      {
        <Box>
          <TableContainer
            component={Paper}
            sx={{
              height: "auto",
            }}
          >
            <Table
              sx={{
                tableLayout: "fixed",
                width: "100%",
              }}
            >
              <TableHead
                sx={{
                  backgroundColor: "primary.main",
                  "& .MuiTableCell-head": { color: "#FFFFFF" },
                  "& .MuiTableCell-Root": { padding: "8px" },
                }}
              >
                <TableRow
                  sx={{
                    "& .MuiTableCell-root": {
                      color: "#ffffff",
                    },
                    "& .MuiCheckbox-root.Mui-checked": {
                      color: "#ffffff !important",
                    },
                  }}
                >
                  {!isVendorProducts && (
                    <TableCell
                      padding="checkbox"
                      align="center"
                      sx={{
                        width: 56,
                        px: 1,
                        "& .MuiCheckbox-root": { p: 0.5 },
                      }}
                    >
                      <Checkbox
                        checked={data?.every((product) =>
                          selectedProducts?.includes(product?.productId ?? "")
                        )}
                        onChange={(e, c) => {
                          if (c) {
                            handleRowSelection("Select All");
                          } else {
                            handleRowSelection("Clear All");
                          }
                        }}
                      />
                    </TableCell>
                  )}
                  <TableCell>{t("table.productName")}</TableCell>
                  <TableCell
                    //   style={{
                    //     width: "35%",
                    //     textAlign: "center",
                    //   }}
                    className="text-center"
                  >
                    {t("table.category")}
                  </TableCell>
                  <TableCell
                    //   style={{
                    //     width: "30%",
                    //     textAlign: "center",
                    //   }}
                    className="text-center"
                  >
                    {t("table.subCategory")}
                  </TableCell>
                  <TableCell
                    //   style={{
                    //     width: "30%",
                    //     textAlign: "center",
                    //   }}
                    sx={
                      {
                        minWidth: { xs: "200px", lg: "auto" },
                        "& .MuiInputBase-input": {
                          padding: "8px",
                        },
                      } as const
                    }
                    className="text-center"
                  >
                    {t("table.brand")}
                  </TableCell>
                  <TableCell
                    //   style={{
                    //     width: "30%",
                    //     textAlign: "center",
                    //   }}
                    className="text-center"
                  >
                    {isVendorProducts || isPreview
                      ? t("table.stock")
                      : t("table.quantity")}
                  </TableCell>
                  {isVendorProducts || isPreview ? (
                    <>
                      <TableCell
                        //   style={{
                        //     width: "30%",
                        //     textAlign: "center",
                        //   }}
                        className="text-center"
                      >
                        {t("table.totalPrice")}
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell
                        //   style={{
                        //     width: "30%",
                        //     textAlign: "center",
                        //   }}
                        className="text-center"
                      >
                        {t("table.unitCost")}
                      </TableCell>
                      <TableCell
                        //   style={{
                        //     width: "30%",
                        //     textAlign: "center",
                        //   }}
                        className="text-center"
                      >
                        {t("table.markUp")}(%)
                      </TableCell>
                      <TableCell
                        //   style={{
                        //     width: "30%",
                        //     textAlign: "center",
                        //   }}
                        className="text-center"
                      >
                        {t("table.sellingPrice")}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>

              <TableBody
              >
                {data?.map((product, rowIndex: any) => (
                  <TableRow
                    onBlur={(e) => {
                      setHoveredRow(rowIndex);
                    }}
                    component={"tr"}
                    key={product?.productId}
                    sx={{
                      "&:hover td > div > button": {
                        visibility: "visible !important",
                      },
                      height: "50px",
                    }}
                  >
                      {!isVendorProducts && (
                        <TableCell
                          padding="checkbox"
                          align="center"
                          sx={{
                            width: 56,
                            px: 1,
                            "& .MuiCheckbox-root": { p: 0.5 },
                          }}
                        >
                          <Checkbox
                            checked={selectedProducts?.includes(
                              product?.productId ?? ""
                            )}
                            onChange={(e, c) => {
                              if (c) {
                                handleRowSelection(product?.productId ?? "");
                              } else {
                                setSelectedProducts((prev) =>
                                  prev?.filter(
                                    (val) => val !== product?.productId
                                  )
                                );
                              }
                            }}
                          />
                        </TableCell>
                      )}

                      <TableCell>
                        {renderCellContent(
                          rowIndex,
                          "productName",
                          product?.productName
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {renderCellContent(
                          rowIndex,
                          "productCategory",
                          product?.productCategory
                            ? t(
                                `myInventory.productCategory.${formatToCamelCaseWithAmpersand(
                                  product.productCategory
                                )}`
                              )
                            : "-"
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {renderCellContent(
                          rowIndex,
                          "productSubCategory",
                          product?.productSubCategory
                            ? t(
                                `myInventory.productSubCategory.${formatToCamelCaseWithAmpersand(
                                  product.productSubCategory
                                )}`
                              )
                            : "-"
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {renderCellContent(
                          rowIndex,
                          "productBrand",
                          product?.productBrand
                        )}
                      </TableCell>
                      {/* <TableCell className="text-center">
                        {renderCellContent(
                          rowIndex,
                          "productDescription",
                          product?.productDescription
                        )}
                      </TableCell> */}
                      <TableCell className="text-center">
                        {renderCellContent(
                          rowIndex,
                          "productQuantity",
                          product?.productQuantity
                        )}
                      </TableCell>
                      {isVendorProducts || isPreview ? (
                        <></>
                      ) : (
                        <>
                          <TableCell className="text-center">
                            {renderCellContent(
                              rowIndex,
                              "unitCost",
                              product?.unitCost
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {renderCellContent(
                              rowIndex,
                              "markup",
                              product?.markup
                            )}
                          </TableCell>
                        </>
                      )}
                      <TableCell
                        style={{ position: "relative" }}
                        className="text-center"
                      >
                        {currency +
                          " " +
                          formatNumberITL(
                            localizationValue,
                            product.sellingPrice
                          )}
                        {/* {parseFloat(
                          String(product.sellingPrice ?? "0")
                        ).toFixed(2)} */}
                        {router?.pathname.includes(
                          "/my-vendor/manage-products"
                        ) &&
                          !isVendorProducts && (
                            <Box
                              component={"div"}
                              sx={{
                                position: "absolute",
                                right: 5,
                                top: "0",
                              }}
                              className="menu-button-container"
                            >
                              <IconButton
                                style={{
                                  ...buttonStyle,
                                  position: "absolute",
                                  right: 0,
                                  top: "15%",
                                  visibility:
                                    hoveredRow === rowIndex
                                      ? "visible"
                                      : "hidden",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // setSelectedProposalData(proposalData);
                                  setselectedProduct(product);
                                  setAnchorEl(e.currentTarget);
                                }}
                                color="primary"
                              >
                                <MoreVerticalIcon />
                              </IconButton>
                            </Box>
                          )}
                      </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      }
      {anchorEl && (
        <UIDropDown
          data={uiDropDownData}
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          dropdownStyle={dropdownStyle}
          //  onClick={function (value: any): void {
          //   throw new Error("Function not implemented.");
          // } }
          onClick={(value: (typeof uiDropDownData)[0]) => {
            if (value.type == "Edit") {
              //   push({
              //     pathname: "/template-center/proposal/edit",
              //     query: {
              //       proposalId: selectedProposalData?.proposalId,
              //     },
              //   });
              onEdit?.(selectedProduct);
            } else if (value.type == "Delete") {
              handleDeleteProduct(selectedProduct?.productId ?? "");
              //   movetoTrash(selectedProposalData?.proposalId);
            }
            // setSelectedProposalData(undefined);
            setAnchorEl(null);
            setHoveredRow(null);
          }}
        />
      )}
    </>
  );
};

export default ProductMasterGrid;
