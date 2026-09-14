import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useQuery } from "@tanstack/react-query";
import type { ClientReceiptResult, PublicReceipt, ReceiptRefund } from "../types";

interface ReceiptResponse {
  code?: string;
  body?: { result?: PublicReceipt | PublicReceipt[]; refund?: ReceiptRefund[] };
}

export const buildReceiptResult = (receipt: PublicReceipt, refunds: ReceiptRefund[] = []): ClientReceiptResult => {
  const invoicePayments = Array.isArray(receipt.invoicePayments) ? receipt.invoicePayments : [];
  const paymentRows = invoicePayments.flatMap((payment) => {
    const schedules = payment.invoicePaymentSchedules?.length
      ? payment.invoicePaymentSchedules
      : payment.invoicePaymentTerms?.length
        ? payment.invoicePaymentTerms
        : [undefined];
    return schedules.map((schedule) => ({
      invoiceSerial: payment.invoiceSerial || schedule?.invoiceSerial,
      thirdPartyInvoiceSerial: payment.thirdPartyInvoiceSerial || schedule?.thirdPartyInvoiceSerial,
      paymentName: schedule?.paymentName || "Scheduled Payment",
      amount: Number(payment.amountPaid) || 0,
      paidOn: receipt.paidOn,
      paymentTerms: schedule?.paymentTerms || "CUSTOM",
      dueDate: schedule?.paymentScheduleDueDate || receipt.paidOn || receipt.createdAt,
      paymentStatus: schedule?.paymentSchedulestatus || schedule?.paymentTermStatus || receipt.paymentStatus,
    }));
  });
  return { receipt, paymentRows, invoicePayments, refunds };
};

export const useClientReceipt = (receiptId?: string) => {
  const { NEXT_PUBLIC_PAYMASTER_ENDPOINT } = useEnv();
  const { post } = useAxios<ReceiptResponse>(`${NEXT_PUBLIC_PAYMASTER_ENDPOINT}/invoice`, false);

  return useQuery<ClientReceiptResult>({
    queryKey: ["public-client-receipt", receiptId],
    enabled: Boolean(receiptId),
    retry: false,
    queryFn: async () => {
      const response = (await post({ eventType: "FETCH_RECEIPT_DETAILS_BY_RECEIPT_ID", receiptId })) as ReceiptResponse;
      const result = response?.body?.result;
      const receipt = (Array.isArray(result) ? result : result ? [result] : [])[0];
      if (response?.code !== "PAYMENT_RECEIPTS_FOUND" || !receipt) throw new Error("RECEIPT_NOT_FOUND");

      return buildReceiptResult(receipt, Array.isArray(response.body?.refund) ? response.body.refund : []);
    },
  });
};
