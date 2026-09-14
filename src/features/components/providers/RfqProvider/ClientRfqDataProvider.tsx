import React, { createContext, useContext, useEffect, useState } from "react";
import { useEnv } from "@/features/hooks/useEnv";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useOrganization } from "../OrganizationThemeProvider";
import { useRouter } from "next/router";

interface ClientRfqDataContextType {
  clientRfqData: any;
  loading: boolean;
  error: string | null;
  // Expose a refetch function so views can refresh after updates
  refetch: () => Promise<void>;
}

const ClientRfqDataContext = createContext<ClientRfqDataContextType>({
  clientRfqData: null,
  loading: true,
  error: null,
  refetch: async () => {},
});

export const useClientRfqData = () => {
  const context = useContext(ClientRfqDataContext);
  if (!context) {
    throw new Error(
      "useClientRfqData must be used within a ClientRfqDataProvider"
    );
  }
  return context;
};

interface ClientRfqDataProviderProps {
  children: React.ReactNode;
  rfqId: string;
}

export const ClientRfqDataProvider: React.FC<ClientRfqDataProviderProps> = ({
  children,
  rfqId,
}) => {
  const [clientRfqData, setClientRfqData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { VITE_PROCUREMENT_ENDPOINT } = useEnv();
  const { post: fetchRfq } = useAxiosWithAuth(
    `${VITE_PROCUREMENT_ENDPOINT}/session`
  );
  const router = useRouter();
  const { organizationId, organizationName, organizationType, logoUrl } =
    useOrganization();

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchRfq({
        eventType: "FETCH_VENDOR_RFQ",
        rfqId: rfqId,
        organizationId,
        receiverId: router.query.receiverId,
      });

      if (response?.code === "RFQ_RETRIEVED" && response?.body?.result) {
        setClientRfqData(response.body.result[0] || response.body.result);
      } else {
        setError("Failed to fetch RFQ data");
      }
    } catch (err: any) {
      console.error("Error fetching RFQ data:", err);
      setError(err?.message || "An error occurred while fetching RFQ data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rfqId) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rfqId, organizationId, organizationName, organizationType, logoUrl]);

  const value: ClientRfqDataContextType = {
    clientRfqData,
    loading,
    error,
    refetch,
  };

  return (
    <ClientRfqDataContext.Provider value={value}>
      {children}
    </ClientRfqDataContext.Provider>
  );
};
