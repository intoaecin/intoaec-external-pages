import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { clientDetailsTypes, LeadDetailsTypes } from "@/types";
import { useRouter } from "next/router";
import React, { createContext, useContext, useEffect, useState } from "react";
import PageLoader from "../Loader/PageLoader";
import { useQuery } from "@tanstack/react-query";

// Define the context type
interface LeadDataContextType {
  leadData?: clientDetailsTypes | LeadDetailsTypes;
  setLeadData: React.Dispatch<
    React.SetStateAction<LeadDetailsTypes | undefined>
  >;
  refetchLeadData: () => void;
  loading: boolean;
  projectId?: string;
  projectName?: string;
}

// Create the context
export const LeadDataContext = createContext<LeadDataContextType>({
  setLeadData: () => { },
  leadData: undefined,
  refetchLeadData: () => { },
  loading: false,
  projectId: undefined,
  projectName: undefined,
});

// Create a custom hook to consume the context
export const useLeadData = () => {
  const context = useContext(LeadDataContext);

  if (!context) {
    throw new Error("useLeadData must be used within a LeadDataProvider");
  }

  return context;
};

// Define a component to wrap your application with the context provider
export const LeadDataProvider = ({ children }: { children: any }) => {
  const [leadData, setLeadData] = useState<
    clientDetailsTypes | LeadDetailsTypes
  >();

  const { VITE_LEADMANAGER_ENDPOINT } = useEnv();
  const router = useRouter();

  const projectId = router.isReady
    ? (router.query.projectId as string | undefined)
    : undefined;

  const { post, response } = useAxiosWithAuth<any>(
    VITE_LEADMANAGER_ENDPOINT + "/fetch"
  );

  // Use React Query to fetch lead data
  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ["lead", projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const data = await post({ eventType: "GET_LEAD_BY_ID", projectId });
      if (response()?.ok && data.code === "LEAD_RETRIEVED") {
        return data.body;
      }
      return null;
    },
    enabled: !!projectId, // Only fetch when projectId is available
  });

  // Expose refetch function for manual data refresh
  const refetchLeadData = () => {
    if (projectId) {
      refetch();
    }
  };
  // Update leadData when query data changes
  useEffect(() => {
    if (data) {
      setLeadData(data);
    }
  }, [data]);

  return (
    <LeadDataContext.Provider
      value={{
        leadData,
        setLeadData,
        refetchLeadData,
        loading,
        projectId,
        projectName: leadData?.projectName,
      }}
    >
      {loading ? <PageLoader /> : children}
    </LeadDataContext.Provider>
  );
};
