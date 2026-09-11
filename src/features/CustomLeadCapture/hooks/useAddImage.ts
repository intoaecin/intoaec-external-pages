import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";

interface AddOrganizationImagePayload {
  imageUrls: string[];
}

const useAddImage = () => {
  const { organizationId, organizationType } = useOrganization();
  const { VITE_PROPOSAL_ENDPOINT } = useEnv();
  const { post } = useAxios(`${VITE_PROPOSAL_ENDPOINT}/create`);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ imageUrls }: AddOrganizationImagePayload) => {
      if (!organizationId || !organizationType || imageUrls.length === 0) {
        return { success: false };
      }
      const payload = {
        eventType: "CREATE_ORGANIZATION_IMAGE",
        organizationId,
        organizationType,
        imageUrls,
      };
      const response = await post(payload);
      return { success: !response?.error, data: response };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizationImages", organizationId, organizationType],
      });
    },
  });

  return {
    addImage: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

export default useAddImage;
export type { AddOrganizationImagePayload };
