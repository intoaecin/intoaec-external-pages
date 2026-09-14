import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useQuery } from "@tanstack/react-query";
import { buildReceiptResult } from "./useClientReceipt";
import type { ClientReceiptResult, PublicReceipt } from "../types";

interface VendorReceiptResponse {
  code?: string;
  body?: PublicReceipt[];
}

export const useVendorReceipt = (receiptId?: string) => {
  const { NEXT_PUBLIC_PAYMASTER_ENDPOINT } = useEnv();
  const { post } = useAxios<VendorReceiptResponse>(`${NEXT_PUBLIC_PAYMASTER_ENDPOINT}/invoice`, false);

  return useQuery<ClientReceiptResult>({
    queryKey: ["public-vendor-receipt", receiptId],
    enabled: Boolean(receiptId),
    retry: false,
    queryFn: async () => {
      const response = (await post({ eventType: "FETCH_RECEIPT_DETAILS_BY_SENDER_ID_AND_RECEIVER_ID", receiptId })) as VendorReceiptResponse;
      const receipt = Array.isArray(response?.body) ? response.body[0] : undefined;
      if (response?.code !== "PAYMENT_RECEIPTS_FOUND" || !receipt) throw new Error("RECEIPT_NOT_FOUND");
      return buildReceiptResult(receipt);
    },
  });
};
