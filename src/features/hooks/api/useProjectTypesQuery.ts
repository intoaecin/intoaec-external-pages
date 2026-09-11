import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useQuery } from "@tanstack/react-query";
import {
  PROJECT_TYPES_API_PATH,
  type GetProjectTypesRequest,
  type ProjectType,
  type ProjectTypesApiEnvelope,
  isProjectTypesApiSuccess,
} from "./projectTypesApi.types";

export const projectTypesQueryKey = (
  organizationId: string | undefined,
  organizationType: string | undefined,
  isGetAll = false,
) => ["projectTypes", organizationId, organizationType, isGetAll] as const;

export type UseProjectTypesQueryParams = Partial<GetProjectTypesRequest> & {
  enabled?: boolean;
};

export function useProjectTypesQuery(params: UseProjectTypesQueryParams = {}) {
  const { enabled = true, isGetAll = false, ...requestOverrides } = params;
  const {
    organizationId: themeOrganizationId,
    organizationType: themeOrganizationType,
  } = useOrganization();
  const { VITE_LEADMANAGER_ENDPOINT } = useEnv();
  const { post } = useAxios(
    `${VITE_LEADMANAGER_ENDPOINT}${PROJECT_TYPES_API_PATH}`,
  );

  const organizationId =
    requestOverrides.organizationId ?? themeOrganizationId;
  const organizationType =
    requestOverrides.organizationType ?? themeOrganizationType;

  const hasOrganization = Boolean(organizationId && organizationType);

  return useQuery({
    queryKey: projectTypesQueryKey(
      organizationId,
      organizationType,
      isGetAll,
    ),
    queryFn: async (): Promise<ProjectType[]> => {
      if (!organizationId || !organizationType) return [];

      const data = (await post({
        eventType: "GET_CUSTOMIZED_PROJECT_TYPES",
        organizationId,
        organizationType,
        isGetAll,
      })) as ProjectTypesApiEnvelope<ProjectType[]>;

      if (!isProjectTypesApiSuccess(data)) {
        throw new Error(
          typeof data?.message === "string"
            ? data.message
            : "Failed to load project types",
        );
      }

      return Array.isArray(data.body) ? data.body : [];
    },
    enabled: enabled && hasOrganization,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
