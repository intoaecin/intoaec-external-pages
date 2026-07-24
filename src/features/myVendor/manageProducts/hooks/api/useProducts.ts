import { useQuery } from "@tanstack/react-query";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useSession } from "next-auth/react";
import type { ProductType } from "../../ManageProductHome";

export type ProductTab = "myProducts" | "clippedItems" | "vendorProducts";

export interface ProductFilters {
  category?: string[];
  subCategory?: string[];
  searchParam?: string;
}

export interface UseProductsParams {
  activeTab: ProductTab;
  page: number;
  rowsPerPage: number;
  filters: ProductFilters;
}

const buildApiFilters = (filters: ProductFilters) => ({
  ...(filters.category && filters.category.length > 0
    ? { productCategories: filters.category }
    : {}),
  ...(filters.subCategory && filters.subCategory.length > 0
    ? { productSubCategories: filters.subCategory }
    : {}),
  ...(filters.searchParam ? { searchParam: filters.searchParam } : {}),
});

export const useProducts = ({
  activeTab,
  page,
  rowsPerPage
  ,
  filters,
}: UseProductsParams) => {
  const {
    NEXT_PUBLIC_PROCUREMENT_ENDPOINT,
    NEXT_PUBLIC_USERHUB_ENDPOINT,
  } = useEnv();
  const { post: fetchProducts } = useAxiosWithAuth<any>(
    NEXT_PUBLIC_PROCUREMENT_ENDPOINT + "/products",
  );
  const { post: fetchVendors } = useAxiosWithAuth<any>(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/userhub",
  );
  const { data: session } = useSession();
  const organizationId = session?.["custom:organization_id"] as
    | string
    | undefined;
  const organizationType = session?.["custom:organization_type"] as
    | string
    | undefined;

  const {
    data,
    isLoading,
    isFetching,
    refetch: fetchProductsData,
  } = useQuery({
    queryKey: [
      "products",
      organizationId,
      organizationType,
      activeTab,
      page,
      rowsPerPage,
      filters,
    ],
    queryFn: async () => {
      const apiFilters = buildApiFilters(filters);

      if (activeTab === "vendorProducts") {
        const vendorResult = await fetchVendors({
          eventType: "GET_CONNECTED_ORGANIZATIONS",
          type: "SOURCE",
        });

        if (vendorResult.code !== "CONNECTED_ORGANIZATIONS_RETRIEVED") {
          return { result: [] as ProductType[], pageCount: 0, totalCount: 0 };
        }

        const response = await fetchProducts({
          eventType: "FETCH_PRODUCTS_BY_VENDOR_IDS",
          organizationId,
          organizationType,
          vendorIds: vendorResult?.body?.map(
            (val: any) => val?.destinationOrganizationId,
          ),
          pageNumber: page,
          rowsPerPage,
          filters: apiFilters,
        });

        if (response.code === "PRODUCTS_FOUND") {
          return {
            result: (response?.body?.result ?? []) as ProductType[],
            pageCount: response?.body?.pageCount ?? 0,
            totalCount: response?.body?.totalCount ?? 0,
          };
        }

        return { result: [] as ProductType[], pageCount: 0, totalCount: 0 };
      }

      const response = await fetchProducts({
        eventType: "FETCH_PRODUCTS",
        organizationId,
        organizationType,
        pageNumber: page,
        rowsPerPage,
        filters: {
          isClipped: activeTab === "clippedItems",
          ...apiFilters,
        },
      });

      if (response.code === "PRODUCTS_FOUND") {
        return {
          result: (response?.body?.result ?? []) as ProductType[],
          pageCount: response?.body?.pageCount ?? 0,
          totalCount: response?.body?.totalCount ?? 0,
        };
      }

      return { result: [] as ProductType[], pageCount: 0, totalCount: 0 };
    },
    enabled: !!organizationId && !!organizationType,
    staleTime: 1 * 60 * 1000,
  });

  return {
    products: data?.result ?? [],
    pageCount: data?.pageCount ?? 0,
    totalCount: data?.totalCount ?? 0,
    isLoading,
    isFetching,
    fetchProductsData,
  };
};
