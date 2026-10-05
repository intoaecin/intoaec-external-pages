import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";

export interface BusinessDetails {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  taxName?: string;
  taxId?: string;
}

export interface ClientDetails {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
}

interface UseBusinessAndClientDetailsArgs {
  organizationId?: string;
  projectId?: string;
  /** False on session-less (client-facing) pages; the apiKey header is used instead. */
  withAuth: boolean;
  enabled?: boolean;
}

/**
 * The organization ("Business Info") and the project's client ("Client Info") —
 * the same sources `BusinessAndClientInfo` reads, as data, for exports and
 * other non-visual uses.
 */
export const useBusinessAndClientDetails = ({
  organizationId,
  projectId,
  withAuth,
  enabled = true,
}: UseBusinessAndClientDetailsArgs) => {
  const { NEXT_PUBLIC_USERHUB_ENDPOINT, NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
  const { post: fetchSocialMedia } = useAxios(`${NEXT_PUBLIC_USERHUB_ENDPOINT}/myorganization`, withAuth);
  const { post: fetchOrganization } = useAxios(`${NEXT_PUBLIC_USERHUB_ENDPOINT}/organization`, withAuth);
  const { post: fetchSession } = useAxios(`${NEXT_PUBLIC_USERHUB_ENDPOINT}/session`, withAuth);
  const { post: fetchLead } = useAxios(`${NEXT_PUBLIC_LEADMANAGER_ENDPOINT}/fetch`, withAuth);

  // No session here, so `organizationId` is sent explicitly alongside
  // `senderId` (same as this app's `BusinessAndClientInfo`).
  const businessQuery = useQuery({
    queryKey: ["business-details", organizationId, withAuth],
    queryFn: async (): Promise<BusinessDetails> => {
      const [profile, address, superUser] = await Promise.all([
        fetchSocialMedia({ eventType: "FETCH_ORGANIZATION_SOCIAL_MEDIA", senderId: organizationId, organizationId }),
        fetchOrganization({ eventType: "GET_ORGANIZATION_ADDRESS_INFO", senderId: organizationId, organizationId }),
        fetchSession({ eventType: "GET_ORGANIZATION_SUPER_USER", organizationId }),
      ]);
      const profileBody =
        profile?.code === "ORGANIZATION_SOCIAL_MEDIA_FETCH_SUCCESS" ? profile.body : undefined;
      const addressBody =
        address?.code === "ORGANIZATION_DETAILS_RETRIEVED" ? address.body : undefined;
      const admin =
        superUser?.code === "ORGANIZATION_SUPER_USER_DETAILS_RETRIEVED" ? superUser.body?.[0] : undefined;

      return {
        name: profileBody?.organizationName,
        website: profileBody?.websiteOrBlog,
        taxName: profileBody?.taxName,
        taxId: profileBody?.taxId,
        location: addressBody?.city,
        email: admin?.emailId,
        phone: admin?.mobileNumber,
      };
    },
    enabled: enabled && Boolean(organizationId),
  });

  const clientQuery = useQuery({
    queryKey: ["client-details", projectId, withAuth],
    queryFn: async (): Promise<ClientDetails> => {
      const response = await fetchLead({ eventType: "GET_LEAD_BY_ID", projectId });
      const lead = response?.code === "LEAD_RETRIEVED" ? response.body?.lead : undefined;
      return {
        name: lead?.leadName,
        email: lead?.leadEmail,
        phone: lead?.leadMobile,
        location: lead?.leadCity,
      };
    },
    enabled: enabled && Boolean(projectId),
  });

  return {
    business: businessQuery.data,
    client: clientQuery.data,
    loading: businessQuery.isLoading || clientQuery.isLoading,
  };
};
