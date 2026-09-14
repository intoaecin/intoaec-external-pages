import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";

export type OrganizationSuperAdminDetails = {
  emailId?: string;
  mobileNumber?: string;
  userId?: string;
  taxId?: string;
  taxName?: string;
};

type Options = {
  organizationId?: string;
  withAuth?: boolean;
  enabled?: boolean;
};

export const organizationSuperAdminQueryKey = (organizationId: string) =>
  ["organization", "GET_ORGANIZATION_SUPER_USER", organizationId] as const;

async function fetchOrganizationSuperAdmin(
  post: (payload: Record<string, unknown>) => Promise<any>,
  organizationId: string,
): Promise<OrganizationSuperAdminDetails | null> {
  const data = await post({
    eventType: "GET_ORGANIZATION_SUPER_USER",
    organizationId,
  });

  if (data?.code === "ORGANIZATION_SUPER_USER_DETAILS_RETRIEVED") {
    const superUser = data.body?.[0];
    return {
      emailId: superUser?.emailId,
      mobileNumber: superUser?.mobileNumber,
      userId: superUser?.userId,
      taxId: superUser?.taxId,
      taxName: superUser?.taxName,
    };
  }

  return null;
}

export function useOrganizationSuperAdminQuery({
  organizationId,
  withAuth = true,
  enabled = true,
}: Options) {
  const { VITE_USERHUB_ENDPOINT } = useEnv();
  const { post } = useAxios(
    `${VITE_USERHUB_ENDPOINT}/session`,
    withAuth,
  );
  const postRef = useRef(post);
  postRef.current = post;

  return useQuery({
    queryKey: organizationSuperAdminQueryKey(organizationId ?? ""),
    queryFn: () =>
      fetchOrganizationSuperAdmin(postRef.current, organizationId as string),
    enabled: Boolean(organizationId) && enabled,
    refetchOnWindowFocus: false,
  });
}

/** Imperative fetch (e.g. WorkOrderCard) backed by the same TanStack cache. */
export function useFetchOrganizationSuperAdminDetails(withAuth = true) {
  const { VITE_USERHUB_ENDPOINT } = useEnv();
  const queryClient = useQueryClient();
  const { post } = useAxios(
    `${VITE_USERHUB_ENDPOINT}/session`,
    withAuth,
  );
  const postRef = useRef(post);
  postRef.current = post;

  const fetchOrganizationSuperAdminDetails = useCallback(
    async (
      organizationId: string,
      onSuccess?: (data: {
        taxId?: string;
        taxName?: string;
        receiverMobile?: string;
      }) => void,
    ) => {
      try {
        const details = await queryClient.fetchQuery({
          queryKey: organizationSuperAdminQueryKey(organizationId),
          queryFn: () =>
            fetchOrganizationSuperAdmin(postRef.current, organizationId),
        });

        if (!details) return null;

        const adminDetails = {
          taxId: details.taxId,
          taxName: details.taxName,
          receiverMobile: details.mobileNumber,
        };

        onSuccess?.(adminDetails);
        return adminDetails;
      } catch (error) {
        console.log("Error fetching organization super admin details:", error);
        return null;
      }
    },
    [queryClient],
  );

  return { fetchOrganizationSuperAdminDetails };
}
