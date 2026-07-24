import { useQuery } from "@tanstack/react-query";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useSession } from "next-auth/react";

export interface ProductSubCategoryOption {
  displayName: string;
  productSubCategoryName: string;
}

export const useProductSubCategories = (productCategories: string[]) => {
  const { NEXT_PUBLIC_PROCUREMENT_ENDPOINT } = useEnv();
  const { post } = useAxiosWithAuth<any>(
    NEXT_PUBLIC_PROCUREMENT_ENDPOINT + "/products",
  );
  const { data: session } = useSession();

  const {
    data: subCategories = [],
    isLoading,
    refetch: fetchProductSubCategories,
  } = useQuery({
    queryKey: [
      "product-subcategories",
      session?.["custom:organization_id"],
      productCategories,
    ],
    queryFn: async () => {
      const data = await post({
        eventType: "FETCH_PRODUCT_SUBCATEGORIES_BY_PRODUCT_CATEGORIES",
        productCategories,
      });

      if (data?.code === "PRODUCT_SUB_CATEGORIES_FOUND") {
        return (
          data?.body?.result?.map((product: any) => ({
            displayName: product?.displayName,
            productSubCategoryName: product?.productSubCategoryName,
          })) ?? []
        );
      }
      return [];
    },
    enabled:
      !!session?.["custom:organization_id"] && productCategories.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return {
    subCategories: subCategories as ProductSubCategoryOption[],
    isLoading,
    fetchProductSubCategories,
  };
};
