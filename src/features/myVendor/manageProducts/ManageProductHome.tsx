import AddProductIcon from "@/assets/icons/add-product-icon";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import ChooseAddProductDialog from "./ChooseAddProductDialog";
import {
  AddOrEditProductModal,
  AddOrEditProductModalType,
} from "./AddProductModal";
import TripOriginIcon from "@mui/icons-material/TripOrigin";
import { ToastContainer } from "react-toastify";
import { ProductProvider } from "@/features/components/providers/ProductandServiceProvider/CreateProductProvider";
import { useProductCategories } from "./hooks/api/useProductCategories";
import { useProductSubCategories } from "./hooks/api/useProductSubCategories";
import {
  useProducts,
  type ProductFilters,
  type ProductTab,
} from "./hooks/api/useProducts";
import CustomTablePagination from "@/features/components/customTablePagination/customTablePagination";
import ProductSearchGrid from "./ProductSearchGrid";
import { SkeletonMasterGrid } from "../../lead/master/skeleton";
import ProductMasterGrid from "./ProductMasterGrid";
import { useTranslation } from "react-i18next";
import ExpandableSearch from "@/components_v2/ExpandableSearch";
import FilterMenu, { type FilterMenuField } from "@/components_v2/FilterMenu";
import FilterClearButton from "@/components_v2/FilterClearButton";
import NoDataFound from "@/components_v2/NoDataFound";
import {
  PageLayout,
  PAGE_LAYOUT_PRIMARY_ACTION_BUTTON_SX,
  VIEWPORT_OVERFLOW_BUFFER_PX,
} from "@/components/layout/PageLayout";
import { Package, PackageSearch, Store } from "lucide-react";

const APP_HEADER_HEIGHT_PX = 56;

export interface ProductType {
  organizationId?: string;
  organizationType?: string;
  productId?: string;
  productName: string;
  productCategory?: string;
  productSubCategory?: string;
  productQuantity?: any;
  productBrand?: string;
  productDescription?: string;

  markup?: number;
  sellingPrice?: number;
  productUnitType?: string;
  productDimensionFormat?: string;
  productUnitDisplayType?: string;
  productLength?: number;
  productWidth?: number;
  productHeight?: number;
  // productArea?: number;
  productColour?: string;
  productFinish?: string;
  productMaterials?: string;
  productManufacturer?: string;
  productTags?: string[];
  unitCost?: number;
  leadTime?: number;
  leadTimeType?: string;
  msrp?: number;
  sku?: string;
  isTaxApplicable?: boolean;
  productImages?: string[];
  productNotes?: string | null;
}
const ManageProductHome = () => {
  const { t } = useTranslation();
  const [chooseDialogOpen, setChooseDialogOpen] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>();
  const [activeTab, setActiveTab] = useState<ProductTab>("myProducts");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(
    [],
  );
  const [committedFilters, setCommittedFilters] = useState<ProductFilters>({});
  const [openAddorEditProductModal, setOpenAddorEditProductModal] =
    useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editSelectedProduct, setEditSelectedProduct] =
    useState<Partial<ProductType>>();
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [gridSearchValue, setGridSearchValue] = useState<string>("");

  const { categories: productCategories } = useProductCategories();
  const { subCategories: productSubCategories } = useProductSubCategories(
    selectedCategories,
  );

  const getCategoryDisplayNames = (categoryValues: string[]) =>
    categoryValues
      .map(
        (value) =>
          productCategories.find(
            (product) => product.productCategoryName === value,
          )?.displayName,
      )
      .filter((value): value is string => Boolean(value));

  const getSubCategoryDisplayNames = (subCategoryValues: string[]) =>
    subCategoryValues
      .map(
        (value) =>
          productSubCategories.find(
            (product) => product.productSubCategoryName === value,
          )?.displayName,
      )
      .filter((value): value is string => Boolean(value));

  const buildProductFilters = (
    searchParam?: string,
    categoryValues: string[] = selectedCategories,
    subCategoryValues: string[] = selectedSubCategories,
  ): ProductFilters => ({
    ...(categoryValues.length > 0
      ? { category: getCategoryDisplayNames(categoryValues) }
      : {}),
    ...(subCategoryValues.length > 0
      ? { subCategory: getSubCategoryDisplayNames(subCategoryValues) }
      : {}),
    ...(searchParam ? { searchParam: searchParam.trim() } : {}),
  });

  const {
    products: product,
    pageCount,
    totalCount,
    isLoading: fetchLoading,
    isFetching: serachLoading,
    fetchProductsData,
  } = useProducts({
    activeTab,
    page: currentPage,
    rowsPerPage,
    filters: committedFilters,
  });

  const fetchData = async () => {
    await fetchProductsData();
  };

  const onProductGridSearch = (searchParam: string) => {
    setGridSearchValue(searchParam);
    if (searchParam.length >= 3 || searchParam.length === 0) {
      setCurrentPage(1);
      setCommittedFilters(buildProductFilters(searchParam));
    }
  };

  const handleRowsPerPageChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const nextRowsPerPage = Number(e.target.value);
    if (!Number.isFinite(nextRowsPerPage) || nextRowsPerPage <= 0) return;

    setRowsPerPage(nextRowsPerPage);
    setCurrentPage(1);
  };

  const handleClose = () => {
    setOpenAddorEditProductModal(false);
    setIsEdit(false);
  };
  const handleOpen = () => {
    setOpenAddorEditProductModal(true);
  };

  const committedHasFilters =
    selectedCategories.length > 0 || selectedSubCategories.length > 0;
  const hasSearchQuery = gridSearchValue.trim().length > 0;
  const hasVisibleFilters = committedHasFilters || hasSearchQuery;

  const filterFields: FilterMenuField[] = [
    {
      kind: "autocomplete",
      id: "category",
      label: t("common.category"),
      multiselect: true,
      showSelectedInList: true,
      options: productCategories.map((product) => ({
        value: product.productCategoryName,
        label: product.displayName,
      })),
      value: selectedCategories,
      onChange: (value: string[]) => {
        setSelectedCategories(value);
        setSelectedSubCategories([]);
      },
      placeholder: t("common.search"),
      disableSearch: false,
      disablePortal: true,
    },
    {
      kind: "autocomplete",
      id: "subCategory",
      label: t("common.subCategory"),
      multiselect: true,
      showSelectedInList: true,
      options: productSubCategories.map((product) => ({
        value: product.productSubCategoryName,
        label: product.displayName,
      })),
      value: selectedSubCategories,
      onChange: (value: string[]) => setSelectedSubCategories(value),
      placeholder: t("common.search"),
      disableSearch: false,
      disablePortal: true,
      disabled: selectedCategories.length === 0,
    },
  ];

  const handleFilterApply = () => {
    setCurrentPage(1);
    setCommittedFilters(buildProductFilters(gridSearchValue));
  };

  const handleFilterClear = () => {
    setCurrentPage(1);
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setCommittedFilters(buildProductFilters(gridSearchValue, [], []));
  };

  const emptyStateText =
    activeTab === "myProducts" || activeTab === "vendorProducts"
      ? t("myInventory.noProductsFound")
      : t("svg.noClippedProducts");
  const noDataText = hasVisibleFilters
    ? t("common.noDataFound")
    : emptyStateText;
  const pageShellHeight = `calc(100dvh - ${
    APP_HEADER_HEIGHT_PX + VIEWPORT_OVERFLOW_BUFFER_PX + 16
  }px)`;

  return (
    <>
      <Box
        sx={{
          height: pageShellHeight,
          maxHeight: pageShellHeight,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <PageLayout
          title={
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
              <span>
                {activeTab === "myProducts"
                  ? t("myInventory.allProducts")
                  : activeTab === "clippedItems"
                    ? t("myInventory.allClippedProducts")
                    : t("myInventory.allVendorProducts")}
              </span>
              <Chip
                size="small"
                icon={<TripOriginIcon style={{ color: "#3CA2FF" }} />}
                label={
                  <span style={{ color: "rgb(10 27 129)" }}>
                    {` ${totalCount ?? 0} ${
                      totalCount === 1
                        ? t("myInventory.product.one")
                        : t("myInventory.product.other")
                    }`}
                  </span>
                }
                sx={(theme) => ({
                  borderRadius: "3px",
                  boxShadow: "0px 0px 4px 1px rgb(10 27 129)00029 !important",
                  color: "#fff",
                  backgroundColor: theme.palette.primary.light,
                  "& .MuiChip-icon": {
                    color: "#3CA2FF",
                  },
                })}
              />
            </Box>
          }
          tabs
          tabItems={[
            {
              label: t("myInventory.myProducts"),
              icon: <Package size={16} strokeWidth={2} />,
            },
            {
              label: t("myInventory.clippedProducts"),
              icon: <PackageSearch size={16} strokeWidth={2} />,
            },
            {
              label: t("myInventory.vendorProducts"),
              icon: <Store size={16} strokeWidth={2} />,
            },
          ]}
          tabValue={
            activeTab === "myProducts" ? 0 : activeTab === "clippedItems" ? 1 : 2
          }
          onTabChange={(index) => {
            const nextTab: ProductTab =
              index === 0
                ? "myProducts"
                : index === 1
                  ? "clippedItems"
                  : "vendorProducts";
            setActiveTab(nextTab);
            setCurrentPage(1);
            setCommittedFilters({});
            setSelectedCategories([]);
            setSelectedSubCategories([]);
            setGridSearchValue("");
          }}
          tabAriaLabel={t("myInventory.productTabs", {
            defaultValue: "Product tabs",
          })}
          actions={
            activeTab === "myProducts" ? (
              <Button
                variant="contained"
                startIcon={
                  <AddProductIcon
                    style={{
                      width: "15px",
                      height: "15px",
                      fill: "#323C47",
                      marginLeft: "10px",
                    }}
                  />
                }
                onClick={() => {
                  setChooseDialogOpen(true);
                  setEditSelectedProduct(undefined);
                }}
                sx={PAGE_LAYOUT_PRIMARY_ACTION_BUTTON_SX}
              >
                <span style={{ textTransform: "capitalize" }}>
                  {t("myInventory.addProduct")}
                </span>
              </Button>
            ) : null
          }
          secondaryActions={
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
              sx={{ justifyContent: "flex-end" }}
            >
              <ExpandableSearch
                value={gridSearchValue}
                onChange={onProductGridSearch}
                placeholder={t("myInventory.searchProduct")}
                ariaLabel={t("myInventory.searchProduct")}
              />
              <FilterMenu
                ariaLabel={t("common.filter")}
                filters={filterFields}
                onApply={() => {
                  void handleFilterApply();
                }}
                footer={
                  <FilterClearButton
                    onClick={() => {
                      void handleFilterClear();
                    }}
                  />
                }
                applied={committedHasFilters}
                paperSx={{
                  maxWidth: "min(100vw - 24px, 400px)",
                }}
              />
            </Stack>
          }
          gutterBottom={false}
          sx={{
            flex: 1,
            minHeight: 0,
            height: "auto",
            maxHeight: "none",
          }}
          contentSx={{
            p: 0,
            py: 0,
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              py: 2,
              px: 2,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {fetchLoading ? (
              <SkeletonMasterGrid />
            ) : product && product.length > 0 ? (
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {(selectedProducts?.length ?? 0) > 0 ? (
                  <Box sx={{ flexShrink: 0 }}>
                    <ProductSearchGrid
                      productNameSearch={onProductGridSearch}
                      selectedProducts={selectedProducts ?? []}
                      isLoading={serachLoading}
                      fetchData={fetchData}
                      setSelectedProducts={setSelectedProducts}
                      showSearch={false}
                    />
                  </Box>
                ) : null}
                <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
                  <ProductMasterGrid
                    isVendorProducts={activeTab === "vendorProducts"}
                    inLineEdit={activeTab === "myProducts"}
                    data={product ?? []}
                    onEdit={(product) => {
                      if (product) {
                        setEditSelectedProduct(product);
                        setIsEdit(true);
                        handleOpen();
                      } else {
                        setEditSelectedProduct(undefined);
                        setIsEdit(false);
                      }
                    }}
                    selectedProducts={selectedProducts ?? []}
                    setSelectedProducts={setSelectedProducts}
                    fetchData={fetchData}
                  />
                </Box>
                <Box sx={{ mt: 1, flexShrink: 0 }}>
                  {totalCount > 0 && (
                    <CustomTablePagination
                      totalPage={pageCount}
                      onChangeRowsperPage={handleRowsPerPageChange}
                      rowsPerPage={rowsPerPage}
                      currentPage={currentPage}
                      onChangePage={(page) => {
                        setCurrentPage(page);
                      }}
                    />
                  )}
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1.5,
                }}
              >
                <NoDataFound text={noDataText} size="large" sx={{ px: 0 }} />
              </Box>
            )}
          </Box>
        </PageLayout>
      </Box>
      <ToastContainer />

      <ChooseAddProductDialog
        isCreateDialogOpen={chooseDialogOpen}
        onClose={() => {
          setChooseDialogOpen(false);
        }}
        handleStartFromScratch={() => {
          handleOpen();
        }}
        fetchData={fetchData}
      />

      {openAddorEditProductModal && (
        <ProductProvider defaultData={editSelectedProduct}>
          <AddOrEditProductModal
            open={openAddorEditProductModal}
            handleClose={handleClose}
            isEdit={isEdit}
            fetchData={fetchData}
          />
        </ProductProvider>
      )}
    </>
  );
};

export default ManageProductHome;
