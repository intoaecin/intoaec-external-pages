import { useQuery } from "@tanstack/react-query";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";

const normalizeImageUrls = (response: any): string[] => {
  const body = response?.body ?? response?.data?.body ?? response?.data ?? null;
  if (Array.isArray(body)) {
    return body.filter(Boolean);
  }
  if (Array.isArray(body?.imageUrls)) {
    return body.imageUrls.filter(Boolean);
  }
  if (Array.isArray(body?.images)) {
    return body.images.filter(Boolean);
  }
  return [];
};

const useFetchImage = () => {
  const { organizationId, organizationType } = useOrganization();
  const { VITE_PROPOSAL_ENDPOINT } = useEnv();
  const { post } = useAxios(`${VITE_PROPOSAL_ENDPOINT}/fetch`);

  return useQuery({
    queryKey: ["organizationImages", organizationId, organizationType],
    enabled: Boolean(organizationId && organizationType),
    queryFn: async () => {
      const payload = {
        eventType: "FETCH_ORGANIZATION_IMAGE",
        organizationId,
        organizationType,
      };
      const response = await post(payload);
      return normalizeImageUrls(response);
    },
  });
};

export default useFetchImage;
