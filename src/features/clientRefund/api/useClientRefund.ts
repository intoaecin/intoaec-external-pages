import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useQuery } from "@tanstack/react-query";
import type { PublicClientRefund } from "../types";

interface ClientRefundResponse {
  code?: string;
  body?: PublicClientRefund | PublicClientRefund[];
}

export const useClientRefund = (refundId?: string) => {
  const { NEXT_PUBLIC_PAYMASTER_ENDPOINT } = useEnv();
  const { post } = useAxios<ClientRefundResponse>(`${NEXT_PUBLIC_PAYMASTER_ENDPOINT}/invoice`, false);

  return useQuery<PublicClientRefund>({
    queryKey: ["public-client-refund", refundId],
    enabled: Boolean(refundId),
    retry: false,
    queryFn: async () => {
      const response = (await post({ eventType: "FETCH_REFUND_BY_ID", refundId })) as ClientRefundResponse;
      const refund = Array.isArray(response?.body) ? response.body[0] : response?.body;
      if (response?.code !== "FETCHED_REFUND_LIST_SUCCESSFUL" || !refund) throw new Error("REFUND_NOT_FOUND");
      return refund;
    },
  });
};
