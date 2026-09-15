import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import type {
  PricingBillingPeriod,
  PricingResponseBody,
} from "./pricing.types";

type UsePricingQueryOptions = {
  countryCode?: string | null;
  billingPeriod: PricingBillingPeriod;
  enabled?: boolean;
};

export const pricingQueryKey = (
  countryCode: string,
  billingPeriod: PricingBillingPeriod,
) => ["pricing", "GET_PRICING", countryCode, billingPeriod] as const;

export function usePricingQuery({
  countryCode,
  billingPeriod,
  enabled = true,
}: UsePricingQueryOptions) {
  const { NEXT_PUBLIC_PAYMASTER_ENDPOINT } = useEnv();
  const { post } = useAxiosWithAuth(
    `${NEXT_PUBLIC_PAYMASTER_ENDPOINT}/pricing`,
  );
  const postRef = useRef(post);
  postRef.current = post;

  const resolvedCountryCode = (countryCode || "GLOBAL").trim().toUpperCase();

  return useQuery({
    queryKey: pricingQueryKey(resolvedCountryCode, billingPeriod),
    queryFn: async (): Promise<PricingResponseBody> => {
      const res = await postRef.current({
        eventType: "GET_PRICING",
        countryCode: resolvedCountryCode,
        billingPeriod,
      });

      if (res?.code !== "PRICING_RETRIEVED_SUCCESSFULLY" || !res?.body) {
        throw new Error(res?.message || "Failed to retrieve pricing");
      }

      return res.body as PricingResponseBody;
    },
    enabled: Boolean(resolvedCountryCode) && enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
