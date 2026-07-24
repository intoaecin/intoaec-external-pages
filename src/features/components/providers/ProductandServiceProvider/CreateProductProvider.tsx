import { ProductType } from "@/features/myVendor/manageProducts/ManageProductHome";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { v4 } from "uuid";
import PageLoader from "../../Loader/PageLoader";
import { fetchContentFromS3 } from "@/lib/helpers";

interface ProductContextType {
  createProductData?: ProductType;

  setCreateProductData?: Dispatch<SetStateAction<ProductType>>;
  handleUpdateProductDetails?: (e: React.SyntheticEvent<EventTarget>) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({
  children,
  defaultData,
}: {
  children: ReactNode;
  defaultData?: Partial<ProductType> | undefined;

  // | "NEW"
  // | "PROPOSAL"
  // | "ESTIMATE"
  // | "PURCHASE_ORDER"
  // | "CHANGE_ORDER"
  // | "INVOICE";
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const { data: session } = useSession();
  const router = useRouter();

  const [createProductData, setCreateProductData] = useState<ProductType>({
    productId: v4(),
    productName: "",
    productCategory: "",
    productSubCategory: "",
    productQuantity: 1,
    unitCost: 0,
    markup: 0,
    sellingPrice: 0,
    isTaxApplicable: false,
  });
  const sellingPrice = useMemo(() => {
    const unitCost = Number(createProductData?.unitCost || 0);
    const markup = Number(createProductData?.markup || 0);

    return markup ? (markup / 100) * unitCost + unitCost : unitCost;
  }, [createProductData?.unitCost, createProductData?.markup]);

  useEffect(() => {
    setCreateProductData((prev) => ({
      ...(prev || {}),
      sellingPrice: sellingPrice,
    }));
  }, [sellingPrice]);
  const handleUpdateProductDetails = (e: React.SyntheticEvent<EventTarget>) => {
    const { name, value } = e.target as HTMLInputElement;

    if (name === "isTaxApplicable") {
      setCreateProductData((prev) => ({
        ...(prev || {}),
        [name]: !prev?.isTaxApplicable,
      }));
      return;
    }
    setCreateProductData((prev) => ({
      ...(prev || {}),
      [name]: value,
    }));
  };
  useEffect(() => {
    console.log(createProductData, "prdouct details");
  }, [createProductData]);
  useEffect(() => {
    console.log(defaultData, "default data in product provider");
    const fetchData = async () => {
      if (defaultData) {
        if (defaultData?.productNotes) {
          console.log("inside fetch");
          const data = await fetchContentFromS3(defaultData?.productNotes);

          const termsData = await JSON.parse(data);

          setCreateProductData((prev) => ({
            ...(prev || {}),
            productNotes: termsData,
          }));
        }
      }
    };
    if (defaultData) {
      setCreateProductData((prev) => ({
        ...(prev || {}),
        ...defaultData,
        productTags: JSON.parse(`${defaultData?.productTags}`),
        productImages: JSON.parse(`${defaultData?.productImages}`),
      }));
    }

    fetchData();
  }, [defaultData]);

  return (
    <>
      {loading ? (
        <PageLoader />
      ) : (
        <ProductContext.Provider
          value={{
            createProductData,
            setCreateProductData,
            handleUpdateProductDetails,
          }}
        >
          {children}
        </ProductContext.Provider>
      )}
    </>
  );
};

export const useProdcutData = () => {
  const context = useContext(ProductContext);

  if (!context) {
    return {} as ProductContextType;
  }

  return context;
};
