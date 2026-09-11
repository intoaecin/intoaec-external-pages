import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";

interface ReportUser {
  userId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  emailId?: string;
  profileImageUrl?: string;
}

interface OrganizationUsersResponse {
  code?: string;
  body?: Array<Omit<ReportUser, "name"> & { name?: string }>;
}

export const useUsersData = (_filter?: unknown) => {
  const { VITE_USERHUB_ENDPOINT } = useEnv();
  const { organizationId, organizationType } = useOrganization();
  const { post } = useAxios<OrganizationUsersResponse>(
    `${VITE_USERHUB_ENDPOINT}/userhub`,
    false,
  );
  const { data: usersData = [] } = useQuery({
    queryKey: ["external-report-users", organizationId, organizationType],
    queryFn: async (): Promise<ReportUser[]> => {
      const response = await post({
        eventType: "GET_USERS_OF_ORGANIZATION",
        organizationId,
        organizationType,
        filters: { userStatus: ["ACCEPTED"] },
      });
      if (!Array.isArray(response?.body)) return [];
      return response.body.map((user) => ({
        ...user,
        name:
          (user.name ??
            [user.firstName, user.lastName].filter(Boolean).join(" ")) ||
          "",
      }));
    },
    enabled: Boolean(organizationId && organizationType),
    staleTime: 5 * 60 * 1000,
  });
  return { usersData };
};
