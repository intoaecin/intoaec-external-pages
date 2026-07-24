import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
} from "@mui/material";

import CustomDropdownExport from "@/features/components/customDropdownBtn/customDropdownExport";
// import SearchIcon from '@mui/icons-material/Search';

import { useDialog } from "@/features/components/providers/DialogProvider";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { useUsersData } from "@/features/hooks/useUsersData";
import { fileHeaderDataForLead } from "@/lib/constants";
import { jsonParse } from "@/lib/helpers";
import { LeadsMasterTypes } from "@/types";
import "jspdf-autotable";
import router from "next/router";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useSession } from "next-auth/react";
import CustomEstimateMoreActionActive from "@/features/components/customDropdownBtn/customEstimateMoreActionActive";
import CustomEstimateMoreActionArchive from "@/features/components/customDropdownBtn/customEstimateMoreActionArchive";
import DeleteProductDialog from "./DeleteProductDialog";
import {
  UpdateCategoryModal,
  UpdateCategoryModalType,
} from "./UpdateCategoryModal";
import { fetchData } from "next-auth/client/_utils";
import { useTranslation } from "react-i18next";

interface ProductSearchGridProps {
  productNameSearch: (searchParam: string) => void;
  selectedProducts: string[];
  isLoading: boolean;
  fetchData: () => void;
  setSelectedProducts: React.Dispatch<
    React.SetStateAction<string[] | undefined>
  >;
  showSearch?: boolean;
}

const ProductSearchGrid = ({
  productNameSearch,
  isLoading,
  fetchData,
  selectedProducts,
  setSelectedProducts,
  showSearch = true,
}: ProductSearchGridProps) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const { NEXT_PUBLIC_PROPOSAL_ENDPOINT, NEXT_PUBLIC_PROCUREMENT_ENDPOINT } =
    useEnv();
  const { t } = useTranslation();
  const {
    popup: deleteProductPopup,
    setPreventClose: preventCloseDeleteProductPopup,
    closeModal: closeDeleteProductPopup,
  } = useDialog();
  const deleteProductRef = useRef<string | undefined>();
  const { post: deleteProductDetails } = useAxiosWithAuth(
    NEXT_PUBLIC_PROCUREMENT_ENDPOINT + "/products"
  );
  const { localizationLoading, localizationValue, refetch } =
    useOrganizationLocalization();
  const updateCategoryModalRef = useRef<UpdateCategoryModalType>();
  const { data: session } = useSession();
  const deleteProduct = async () => {
    try {
      const requestData = {
        eventType: "UPDATE_MULTIPLE_PRODUCTS",
        organizationId: session?.["custom:organization_id"],
        organizationType: session?.["custom:organization_type"],
        products: selectedProducts,
        isActive: false,
      };
      const response = await deleteProductDetails(requestData);
      console.log(response, "response after updagin");
      if (response.code == "PRODUCTS_UPDATED") {
        toast.success(t("toast.productsDeletedSuccessfully"));
        // updateCategoryModalRef?.current?.handleClose();
        setSelectedProducts([]);
        fetchData();
        closeDeleteProductPopup();
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleDeleteProduct = async () => {
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
        await deleteProduct();
      },
      onNo: async () => {
        console.log("No button clicked");
      },
    });
  };
  if (!showSearch && selectedProducts.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        flexWrap: "wrap",
        gap: 1,
        mb: selectedProducts.length > 0 || showSearch ? 1 : 0,
      }}
    >
      {selectedProducts?.length > 0 && (
        <>
          <Button
            variant="contained"
            sx={{
              color: "white",
            }}
            onClick={() => updateCategoryModalRef.current?.handleOpen()}
          >
            {t("myInventory.updateCategory")}
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteProduct}
          >
            {t("common.delete")}
          </Button>
        </>
      )}
      {showSearch ? (
        <TextField
          sx={{
            flex: "1 1 240px",
            maxWidth: 400,
            "& .MuiOutlinedInput-root": {
              padding: "0px",
            },
            "& .MuiInputBase-input": {
              padding: "14px",
            },
          }}
          value={searchValue}
          placeholder={t("myInventory.searchProduct")}
          onChange={(e) => {
            setSearchValue(e.target.value);
            productNameSearch(e.target.value);
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Box display={"flex"} sx={{ paddingRight: 1 }}>
                  {isLoading && (
                    <CircularProgress disableShrink={true} size={20} />
                  )}
                </Box>
              </InputAdornment>
            ),
          }}
        />
      ) : null}
      <UpdateCategoryModal
        ref={updateCategoryModalRef}
        selectedProducts={selectedProducts}
        onClose={() => {
          fetchData();
          setSelectedProducts([]);
        }}
      />
    </Box>
  );
};
export default ProductSearchGrid;
