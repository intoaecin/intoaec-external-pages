import { useQuery } from "@tanstack/react-query";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useSession } from "@/features/reportsPage/publicRuntime";

const EMPTY_PROJECT_NAMES: any[] = [];

export const useProjectNames = (orgId?: string) => {
    const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
    const { post } = useAxiosWithAuth<any>(NEXT_PUBLIC_LEADMANAGER_ENDPOINT + "/fetch");
    const { data: session } = useSession();

    const organizationId = orgId || session?.["custom:organization_id"];

    const { 
        data: projectNames = EMPTY_PROJECT_NAMES,
        isLoading: loading, 
        refetch: fetchProjectNames 
    } = useQuery({
        queryKey: ["projectNames", organizationId],
        queryFn: async () => {
            if (!organizationId) return [];

            const requestData = {
                eventType: "GET_PROJECT_NAMES",
                organizationId, // Pass orgId to API if needed
            };
            
            const response = await post(requestData);
            if (response.code === "PROJECTS_RETRIEVED") {
                return response.body || [];
            }
            return [];
        },
        enabled: !!organizationId,
        staleTime: 10 * 60 * 1000, 
    });

    return { projectNames, loading, fetchProjectNames };
};

