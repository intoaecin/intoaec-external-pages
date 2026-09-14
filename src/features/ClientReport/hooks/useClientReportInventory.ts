import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useLeadData } from "@/features/components/providers/LeadProfileProvider";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Ported from intoaec-UI `src/features/ClientReport/hooks/useClientReportInventory.ts`.
 * See `useClientReportSchedules.ts` in this same folder for why the source's
 * `next-auth` `useSession()` organization-id/type fallback was dropped in
 * favor of `useOrganization()` alone.
 */

export type ClientReportInventoryItem = {
  inventoryItemId: string;
  groupName?: string;
  itemName?: string;
  orderedQuantity?: number | string;
  receivedQuantity?: number | string;
  usedQuantity?: number | string;
};

type InventoryGroup = {
  name?: string;
  inventoryItems?: ClientReportInventoryItem[];
};

type FetchInventoryResponse = {
  code?: string;
  body?: {
    result?: InventoryGroup[];
  };
};

type ClientReportDateRange = {
  startDate?: number;
  endDate?: number;
};

type UseClientReportInventoryOptions = {
  enabled?: boolean;
};

const getDefaultInventoryDateRange = () => {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate: startDate.getTime(),
    endDate: endDate.getTime(),
  };
};

export const useClientReportInventory = (
  dateRange?: ClientReportDateRange,
  options: UseClientReportInventoryOptions = {},
) => {
  const { enabled = true } = options;
  const { NEXT_PUBLIC_PROCUREMENT_ENDPOINT } = useEnv();
  const { post } = useAxios<FetchInventoryResponse>(
    NEXT_PUBLIC_PROCUREMENT_ENDPOINT + "/session",
  );
  const postRef = useRef(post);
  const { organizationId, organizationType } = useOrganization();
  const { leadData } = useLeadData();
  const [inventoryItems, setInventoryItems] = useState<
    ClientReportInventoryItem[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const resolvedOrganizationId = organizationId;
  const resolvedOrganizationType = organizationType;
  const projectId = leadData?.projectId ?? "";

  const projectIds = useMemo(
    () => (leadData?.projectId ? [leadData.projectId] : []),
    [leadData?.projectId],
  );
  const inventoryDateRange = useMemo(() => {
    if (dateRange?.startDate && dateRange?.endDate) {
      return dateRange;
    }

    return getDefaultInventoryDateRange();
  }, [dateRange]);

  useEffect(() => {
    postRef.current = post;
  }, [post]);

  const fetchInventory = useCallback(async () => {
    if (!enabled || !resolvedOrganizationId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await postRef.current({
        eventType: "GET_INVENTORY_FOR_REPORTS",
        organizationId: resolvedOrganizationId,
        organizationType: resolvedOrganizationType,
        page: 1,
        rowsPerPage: 100,
        projectId,
        projectIds,
        filters: {
          startDate: inventoryDateRange.startDate,
          endDate: inventoryDateRange.endDate,
        },
      });

      if (response?.code === "INVENTORY_ITEMS_FOUND") {
        const items =
          response.body?.result?.flatMap((group: InventoryGroup) =>
            (group.inventoryItems ?? []).map((item: ClientReportInventoryItem) => ({
              ...item,
              groupName: group.name,
            })),
          ) ?? [];

        setInventoryItems(items);
      } else {
        setInventoryItems([]);
      }
    } catch (inventoryError) {
      setInventoryItems([]);
      setError(inventoryError);
    } finally {
      setLoading(false);
    }
  }, [
    inventoryDateRange.endDate,
    inventoryDateRange.startDate,
    enabled,
    projectId,
    projectIds,
    resolvedOrganizationId,
    resolvedOrganizationType,
  ]);

  useEffect(() => {
    void fetchInventory();
  }, [fetchInventory]);

  return {
    inventoryItems,
    loading,
    error,
    refetch: fetchInventory,
  };
};
