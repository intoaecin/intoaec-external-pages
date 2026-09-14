import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { fetchContentFromS3 } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import type { PublicCreditNote } from "../types";

interface CreditNoteResponse {
  code?: string;
  body?: { result?: PublicCreditNote[] };
}

export const useClientCreditNote = (creditNoteId?: string) => {
  const { NEXT_PUBLIC_PAYMASTER_ENDPOINT } = useEnv();
  const { post } = useAxios<CreditNoteResponse>(`${NEXT_PUBLIC_PAYMASTER_ENDPOINT}/invoice`, false);

  return useQuery<PublicCreditNote>({
    queryKey: ["public-client-credit-note", creditNoteId],
    enabled: Boolean(creditNoteId),
    retry: false,
    queryFn: async () => {
      const response = (await post({ eventType: "FETCH_CREDIT_NOTE_BY_ID", creditNoteId })) as CreditNoteResponse;
      const creditNote = response?.body?.result?.[0];
      if (response?.code !== "CREDIT_NOTES_RETRIEVED" || !creditNote) throw new Error("CREDIT_NOTE_NOT_FOUND");

      if (!creditNote.termsAndConditionsUrl) return creditNote;
      try {
        const content = await fetchContentFromS3(creditNote.termsAndConditionsUrl);
        return { ...creditNote, termsAndConditionData: JSON.parse(content) };
      } catch {
        // The credit note can still be viewed if its separate terms file fails.
        return creditNote;
      }
    },
  });
};
