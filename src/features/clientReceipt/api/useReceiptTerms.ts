import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { fetchContentFromS3 } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";

interface ReceiptSettingsResponse {
  body?: { settingValue2?: string };
}

export const useReceiptTerms = (organizationId?: string) => {
  const { NEXT_PUBLIC_USERHUB_ENDPOINT } = useEnv();
  const { post } = useAxios<ReceiptSettingsResponse>(`${NEXT_PUBLIC_USERHUB_ENDPOINT}/settings`, false);

  return useQuery<unknown[]>({
    queryKey: ["public-receipt-terms", organizationId],
    enabled: Boolean(organizationId),
    retry: false,
    queryFn: async () => {
      const response = (await post({
        eventType: "GET_ORGANIZATION_SETTINGS_BY_NAME",
        settingName: "RECEIPT_TERMS_AND_CONDITIONS",
        organizationId,
        organizationType: "AEC",
      })) as ReceiptSettingsResponse;
      const url = response?.body?.settingValue2;
      if (!url) return [];
      const content = JSON.parse(await fetchContentFromS3(url));
      return Array.isArray(content) ? content : [];
    },
  });
};
