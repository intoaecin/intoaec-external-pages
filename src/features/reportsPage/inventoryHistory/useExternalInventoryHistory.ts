import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";

export interface InventoryHistoryLog {
  inventoryLogId: string;
  logDescription: string;
  receivedQuantity: number | string;
  pendingQuantity: number | string;
  usedQuantity: number | string;
  damagedQuantity: number | string;
  replacedQuantity: number | string;
  movedQuantity: number | string;
  remarks: string | null;
  usedByName: string | null;
  usedByType: string | null;
  createdBy: string;
  createdAt: number | string;
  itemName: string;
  projectName: string;
  groupName: string | null;
}

interface InventoryHistoryResponse {
  code?: string;
  body?: { result?: InventoryHistoryLog[]; totalCount?: number };
}

/**
 * Inventory history for the emailed report link. Uses Procurement's public
 * /session route, scoped by the organization resolved from the subdomain and
 * the date range carried in the link.
 */
export const useExternalInventoryHistory = (args: {
  startDate?: string;
  endDate?: string;
  page: number;
  rowsPerPage: number;
}) => {
  const { startDate, endDate, page, rowsPerPage } = args;
  const { organizationId, organizationType } = useOrganization();
  const { i18n } = useTranslation();
  const { NEXT_PUBLIC_PROCUREMENT_ENDPOINT } = useEnv();
  const { post } = useAxios<InventoryHistoryResponse>(
    `${NEXT_PUBLIC_PROCUREMENT_ENDPOINT}/session`,
  );

  return useQuery({
    queryKey: [
      "external-inventory-history-report",
      organizationId,
      startDate,
      endDate,
      page,
      rowsPerPage,
      i18n.language,
    ],
    queryFn: async () => {
      const res = await post({
        eventType: "GET_INVENTORY_LOGS_FOR_REPORTS",
        organizationId,
        organizationType,
        startDate: startDate ? Number(startDate) : null,
        endDate: endDate ? Number(endDate) : null,
        page,
        rowsPerPage,
        language: i18n.language,
      });
      if (res?.code === "INVENTORY_ITEMS_FOUND") {
        return {
          logs: res.body?.result ?? [],
          totalCount: Number(res.body?.totalCount ?? 0),
        };
      }
      return { logs: [] as InventoryHistoryLog[], totalCount: 0 };
    },
    enabled: Boolean(organizationId),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
};
