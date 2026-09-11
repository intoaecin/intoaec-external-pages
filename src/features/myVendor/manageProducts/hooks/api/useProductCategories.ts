import { useQuery } from "@tanstack/react-query";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useSession } from "next-auth/react";

export interface ProductCategoryOption {
  displayName: string;
  productCategoryName: string;
}

export const useProductCategories = () => {
  const { VITE_PROCUREMENT_ENDPOINT } = useEnv();
  const { post } = useAxiosWithAuth<any>(
    VITE_PROCUREMENT_ENDPOINT + "/products",
  );
  const { data: session } = useSession();

  const {
    data: categories = [],
    isLoading,
    refetch: fetchProductCategories,
  } = useQuery({
    queryKey: [
      "product-categories",
      session?.["custom:organization_id"],
    ],
    queryFn: async () => {
      const data = await post({
        eventType: "FETCH_PRODUCT_CATEGORIES",
      });

      if (data?.code === "PRODUCT_CATEGORIES_FOUND") {
        return (
          data?.body?.result?.map((product: any) => ({
            displayName: product?.displayName,
            productCategoryName: product?.productCategoryName,
          })) ?? []
        );
      }
      return [];
    },
    enabled: !!session?.["custom:organization_id"],
    staleTime: 5 * 60 * 1000,
  });

  return {
    categories: categories as ProductCategoryOption[],
    isLoading,
    fetchProductCategories,
  };
};
