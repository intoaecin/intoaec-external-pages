import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";

interface DeleteOrganizationImagePayload {
  imageUrl: string;
}

const useDeleteImage = () => {
  const { organizationId, organizationType } = useOrganization();
  const { NEXT_PUBLIC_PROPOSAL_ENDPOINT } = useEnv();
  const { post } = useAxios(`${NEXT_PUBLIC_PROPOSAL_ENDPOINT}/delete`);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ imageUrl }: DeleteOrganizationImagePayload) => {
      if (!organizationId || !organizationType || !imageUrl) {
        return { success: false };
      }
      const payload = {
        eventType: "DELETE_ORGANIZATION_IMAGE",
        organizationId,
        organizationType,
        imageUrl,
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
    deleteImage: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

export default useDeleteImage;
export type { DeleteOrganizationImagePayload };
