import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { fetchContentFromS3 } from "@/lib/helpers";
import { base64Decode } from "@/utils/string";
import { useQuery } from "@tanstack/react-query";
import type { InvoiceResult, PublicInvoice } from "../types";

interface InvoiceResponse {
  code?: string;
  body?: {
    result?: PublicInvoice[];
    invoicePayments?: InvoiceResult["payments"];
    invoiceCreditNotes?: InvoiceResult["credits"];
  };
}

const parseTerms = (value: unknown): unknown => {
  if (Array.isArray(value) || (value && typeof value === "object")) return value;
  if (typeof value !== "string") return undefined;
  try {
    return JSON.parse(value);
  } catch {
    try {
      return JSON.parse(base64Decode(value));
    } catch {
      return undefined;
    }
  }
};

export const useClientInvoice = (invoiceId?: string) => {
  const { NEXT_PUBLIC_PAYMASTER_ENDPOINT } = useEnv();
  const { post } = useAxios<InvoiceResponse>(`${NEXT_PUBLIC_PAYMASTER_ENDPOINT}/invoice`, false);

  return useQuery<InvoiceResult>({
    queryKey: ["public-client-invoice", invoiceId],
    enabled: Boolean(invoiceId),
    retry: false,
    queryFn: async () => {
      const response = (await post({ eventType: "FETCH_INVOICE_BY_INVOICE_ID", invoiceId })) as InvoiceResponse;
      const invoice = response?.body?.result?.[0];
      if (response?.code !== "INVOICE_FOUND" || !invoice) throw new Error("INVOICE_NOT_FOUND");

      let termsAndConditionData = parseTerms(invoice.termsAndConditionData);
      if (invoice.termsAndConditionsUrl) {
        try {
          termsAndConditionData = parseTerms(await fetchContentFromS3(invoice.termsAndConditionsUrl));
        } catch {
          // The invoice remains viewable if its separate terms document fails.
        }
      }
      return {
        invoice: { ...invoice, termsAndConditionData },
        payments: response.body?.invoicePayments ?? [],
        credits: response.body?.invoiceCreditNotes ?? [],
      };
    },
  });
};
