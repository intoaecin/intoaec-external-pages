import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

export type OrganizationAddressInfoBody = {
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zipCode?: string | null;
};

export type OrganizationAddressDetails = OrganizationAddressInfoBody & {
  /** Legacy alias used across previews/PO — city only. */
  organizationLocation?: string;
  /** Full address string for display / form binding. */
  formattedAddress?: string;
};

type Options = {
  organizationId?: string;
  withAuth?: boolean;
  enabled?: boolean;
};

export const organizationAddressQueryKey = (organizationId: string) =>
  ["organization", "GET_ORGANIZATION_ADDRESS_INFO", organizationId] as const;

export function formatOrganizationAddress(
  address: OrganizationAddressInfoBody | null | undefined,
): string {
  if (!address) return "";
  return [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.zipCode,
    address.country,
  ]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(", ");
}

export function useOrganizationAddressQuery({
  organizationId,
  withAuth = true,
  enabled = true,
}: Options) {
  const { VITE_USERHUB_ENDPOINT } = useEnv();
  const { post } = useAxios(
    `${VITE_USERHUB_ENDPOINT}/organization`,
    withAuth,
  );
  const postRef = useRef(post);
  postRef.current = post;

  return useQuery({
    queryKey: organizationAddressQueryKey(organizationId ?? ""),
    queryFn: async (): Promise<OrganizationAddressDetails | null> => {
      const data = await postRef.current({
        eventType: "GET_ORGANIZATION_ADDRESS_INFO",
        organizationId,
      });

      if (data?.code === "ORGANIZATION_DETAILS_RETRIEVED") {
        const body = (data.body ?? null) as OrganizationAddressInfoBody | null;
        if (!body) return null;

        return {
          addressLine1: body.addressLine1 ?? undefined,
          addressLine2: body.addressLine2 ?? undefined,
          city: body.city ?? undefined,
          state: body.state ?? undefined,
          country: body.country ?? undefined,
          zipCode: body.zipCode ?? undefined,
          organizationLocation: body.city ?? undefined,
          formattedAddress: formatOrganizationAddress(body),
        };
      }

      // Address missing / soft failure — do not throw (avoids TanStack retries)
      return null;
    },
    enabled: Boolean(organizationId) && enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
