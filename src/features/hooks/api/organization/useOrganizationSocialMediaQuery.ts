import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

export type OrganizationSocialMediaDetails = {
  organizationName?: string;
  organizationWebsite?: string;
  organizationLogo?: string;
  taxId?: string;
  taxName?: string;
};

type Options = {
  organizationId?: string;
  withAuth?: boolean;
  enabled?: boolean;
};

export const organizationSocialMediaQueryKey = (
  organizationId: string,
) => ["organization", "FETCH_ORGANIZATION_SOCIAL_MEDIA", organizationId] as const;

export function useOrganizationSocialMediaQuery({
  organizationId,
  withAuth = true,
  enabled = true,
}: Options) {
  const { VITE_USERHUB_ENDPOINT } = useEnv();
  const { post } = useAxios(
    `${VITE_USERHUB_ENDPOINT}/myorganization`,
    withAuth,
  );
  const postRef = useRef(post);
  postRef.current = post;

  return useQuery({
    queryKey: organizationSocialMediaQueryKey(organizationId ?? ""),
    queryFn: async (): Promise<OrganizationSocialMediaDetails | null> => {
      const data = await postRef.current({
        eventType: "FETCH_ORGANIZATION_SOCIAL_MEDIA",
        organizationId,
      });

      if (data?.code === "ORGANIZATION_SOCIAL_MEDIA_FETCH_SUCCESS") {
        return {
          organizationName: data.body?.organizationName,
          organizationWebsite:
            data.body?.websiteOrBlog ?? data.body?.org_websiteUrl,
          organizationLogo:
            data.body?.Organizations_logoUrl ?? data.body?.org_logoUrl,
          taxId: data.body?.taxId,
          taxName: data.body?.taxName,
        };
      }

      return null;
    },
    enabled: Boolean(organizationId) && enabled,
    refetchOnWindowFocus: false,
  });
}
