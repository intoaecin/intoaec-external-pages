import { useState } from "react";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";

interface GetProjectTypePayload {
  organizationId?: string;
  organizationType?: string;
  isGetAll?: boolean;
  showLoader?: boolean;
}

const useGetProjectType = () => {
  const { VITE_LEADMANAGER_ENDPOINT } = useEnv();
  const { post } = useAxiosWithAuth(
    `${VITE_LEADMANAGER_ENDPOINT}/customized-project-types`,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getProjectTypes = async ({
    organizationId,
    organizationType,
    isGetAll = false,
    showLoader = true,
  }: GetProjectTypePayload) => {
    if (!organizationId || !organizationType) {
      return { success: false, data: [] };
    }
    if (showLoader) {
      setLoading(true);
    }
    setError(null);
    try {
      const requestData = {
        eventType: "GET_CUSTOMIZED_PROJECT_TYPES",
        organizationId,
        organizationType,
        isGetAll
      };
      const data = await post(requestData);
      return { success: true, data: data?.body || [] };
    } catch (err) {
      setError(err as Error);
      return { success: false, data: [] };
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  return { getProjectTypes, loading, error };
};

export default useGetProjectType;
export type { GetProjectTypePayload };
