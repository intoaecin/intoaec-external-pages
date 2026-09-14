import React, { createContext, useContext, useEffect, useState } from "react";
import { useEnv } from "@/features/hooks/useEnv";
import { useAxios } from "@/features/hooks/useAxios";
import { useOrganization } from "../OrganizationThemeProvider";
import { useRouter } from "next/router";

interface ClientPoDataContextType {
  clientPoData: any;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ClientPoDataContext = createContext<ClientPoDataContextType>({
  clientPoData: null,
  loading: true,
  error: null,
  refetch: async () => {},
});

export const useClientPoData = () => {
  const context = useContext(ClientPoDataContext);
  if (!context) {
    throw new Error(
      "useClientPoData must be used within a ClientPoDataProvider"
    );
  }
  return context;
};

interface ClientPoDataProviderProps {
  children: React.ReactNode;
  poId: string;
}

export const ClientPoDataProvider: React.FC<ClientPoDataProviderProps> = ({
  children,
  poId,
}) => {
  const [clientPoData, setClientPoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { VITE_PROCUREMENT_ENDPOINT } = useEnv();
  const { post: fetchPo } = useAxios(
    `${VITE_PROCUREMENT_ENDPOINT}/session`
  );
const router = useRouter()

  const { organizationId, organizationName, organizationType, logoUrl } =
    useOrganization();

  const refetch = async () => {
    if (!poId) return;

    try {
      setLoading(true);
      setError(null);

      const requestData = {
        eventType: "FETCH_PURCHASE_ORDER",
        poId: poId,
        organizationId: organizationId,
        organizationType: organizationType,
        receiverId: router?.query?.receiverId
      };

      const response = await fetchPo(requestData);

      if (response.code === "PURCHASE_ORDER_RETRIEVED") {
        // The API returns an array of POs, we need the first one
        const poData = response.body?.result?.[0];
        if (poData) {
          setClientPoData(poData);
        } else {
          setError("Purchase Order not found");
        }
      } else {
        setError("Failed to fetch PO data");
      }
    } catch (err: any) {
      console.error("Error fetching PO data:", err);
      setError(err.message || "An error occurred while fetching PO data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poId]);

  const value: ClientPoDataContextType = {
    clientPoData,
    loading,
    error,
    refetch,
  };

  return (
    <ClientPoDataContext.Provider value={value}>
      {children}
    </ClientPoDataContext.Provider>
  );
};
