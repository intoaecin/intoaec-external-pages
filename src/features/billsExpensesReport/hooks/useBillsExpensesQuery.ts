import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAxios, useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { useTranslation } from "react-i18next";
import {
  billsExpensesFiltersForRequest,
  buildBillsExpensesRequest,
} from "../utils/buildRequest";
import { mapApiRowToRow } from "../utils/mapRow";
import type { BillsExpensesFilters, BillsExpensesRow } from "../types";

export interface UseBillsExpensesQueryArgs {
  withAuth: boolean;
  organizationId?: string;
  /** When set, sent as filters.projectIds (overrides filters.projectIds). */
  projectIds?: string[];
  organizationType?: string;
  page: number;
  rowsPerPage: number;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
  filters: BillsExpensesFilters;
  usersData?: any[];
  vendorData?: any[];
  leadData?: any;
  /** When false, the list query does not run (e.g. until authenticated report scope is ready). */
  queryEnabled?: boolean;
}

export interface BillsExpensesQueryResult {
  rows: BillsExpensesRow[];
  rawRows: any[];
  pageCount: number;
  totalCount: number;
}

export const billsExpensesListKey = (args: UseBillsExpensesQueryArgs) =>
  [
    "billsExpenses",
    "list",
    args.withAuth ? "auth" : "public",
    args.organizationId ?? null,
    args.projectIds ?? null,
    args.organizationType ?? null,
    args.page,
    args.rowsPerPage,
    args.sortBy,
    args.sortOrder,
    args.filters,
  ] as const;

const EXPORT_FETCH_PAGE_SIZE = 1000000;

export interface UseBillsExpensesAllRowsFetcherArgs {
  withAuth: boolean;
  organizationId?: string;
  projectIds?: string[];
  organizationType?: string;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
  filters: BillsExpensesFilters;
  usersData?: any[];
  vendorData?: any[];
  leadData?: any;
}

/** Imperative fetch of every row for the current filters/sort (paged API), for export. */
export const useBillsExpensesAllRowsFetcher = (
  args: UseBillsExpensesAllRowsFetcherArgs,
) => {
  const { NEXT_PUBLIC_PAYMASTER_ENDPOINT } = useEnv();
  const authPath = `${NEXT_PUBLIC_PAYMASTER_ENDPOINT}/bills-and-expenses`;
  const publicPath = `${NEXT_PUBLIC_PAYMASTER_ENDPOINT}/session`;
  const authClient = useAxiosWithAuth<any>(authPath);
  const publicClient = useAxios<any>(publicPath);
  const { post } = args.withAuth ? authClient : publicClient;
  const { t } = useTranslation();
  const { localizationValue } = useOrganizationLocalization();

  return useCallback(
    async (totalCount: number): Promise<BillsExpensesRow[]> => {
      if (
        !args.organizationId ||
        !args.organizationType ||
        totalCount <= 0
      ) {
        return [];
      }
      const pageSize = Math.min(EXPORT_FETCH_PAGE_SIZE, totalCount);
      const pageCount = Math.ceil(totalCount / pageSize);
      const all: BillsExpensesRow[] = [];
      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        const requestData = buildBillsExpensesRequest({
          organizationId: args.organizationId,
          organizationType: args.organizationType,
          pageNumber,
          rowsPerPage: pageSize,
          sortBy: args.sortBy,
          sortOrder: args.sortOrder,
          filters: billsExpensesFiltersForRequest(
            args.filters,
            args.projectIds,
          ),
        });
        const res = await post(requestData);
        if (res?.code !== "BILLS_AND_EXPENSES_RETRIEVED") {
          throw new Error(
            res?.message || "Failed to fetch bills and expenses",
          );
        }
        const rawRows: any[] = res.body?.result ?? [];
        const offset = all.length;
        for (let i = 0; i < rawRows.length; i += 1) {
          all.push(
            mapApiRowToRow(rawRows[i], offset + i, {
              t,
              localizationValue,
              usersData: args.usersData ?? [],
              vendorData: args.vendorData ?? [],
              leadData: args.leadData,
            }),
          );
        }
      }
      return all;
    },
    [
      post,
      args.organizationId,
      args.projectIds,
      args.organizationType,
      args.sortBy,
      args.sortOrder,
      args.filters,
      args.usersData,
      args.vendorData,
      args.leadData,
      t,
      localizationValue,
    ],
  );
};

export const useBillsExpensesQuery = (args: UseBillsExpensesQueryArgs) => {
  const { NEXT_PUBLIC_PAYMASTER_ENDPOINT } = useEnv();
  const authPath = `${NEXT_PUBLIC_PAYMASTER_ENDPOINT}/bills-and-expenses`;
  const publicPath = `${NEXT_PUBLIC_PAYMASTER_ENDPOINT}/session`;
  const authClient = useAxiosWithAuth<any>(authPath);
  const publicClient = useAxios<any>(publicPath);
  const { post } = args.withAuth ? authClient : publicClient;
  const { t, i18n } = useTranslation();
  const { localizationValue } = useOrganizationLocalization();

  return useQuery({
    queryKey: [
      ...billsExpensesListKey(args),
      i18n.language,
    ] as unknown as readonly unknown[],
    queryFn: async (): Promise<BillsExpensesQueryResult> => {
      const requestData = buildBillsExpensesRequest({
        organizationId: args.organizationId,
        organizationType: args.organizationType,
        pageNumber: args.page,
        rowsPerPage: args.rowsPerPage,
        sortBy: args.sortBy,
        sortOrder: args.sortOrder,
        filters: billsExpensesFiltersForRequest(
          args.filters,
          args.projectIds,
        ),
      });

      const res = await post(requestData);
      if (res?.code !== "BILLS_AND_EXPENSES_RETRIEVED") {
        throw new Error(
          res?.message || "Failed to fetch bills and expenses",
        );
      }

      const rawRows: any[] = res.body?.result ?? [];
      const rows = rawRows.map((raw, index) =>
        mapApiRowToRow(raw, index, {
          t,
          localizationValue,
          usersData: args.usersData ?? [],
          vendorData: args.vendorData ?? [],
          leadData: args.leadData,
        }),
      );

      return {
        rows,
        rawRows,
        pageCount: Number(res.body?.pageCount ?? 0),
        totalCount: Number(res.body?.totalCount ?? 0),
      };
    },
    enabled:
      (args.queryEnabled ?? true) &&
      !!args.organizationId &&
      !!args.organizationType,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

