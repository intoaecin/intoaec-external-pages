import { useQuery } from "@tanstack/react-query";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { formatError } from "@/lib/helpers";
import type { UserHubDataTypes } from "@/types";
import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

type GetUsersOfOrganizationResponse = {
  code?: string;
  body?: UserHubDataTypes[];
  error?: unknown;
};

export const USERHUB_ORGANIZATION_USERS_QUERY_KEY = [
  "userhub",
  "organization-users",
] as const;

export function mapOrganizationUserEmails(
  users: UserHubDataTypes[],
  excludeEmail?: string,
): string[] {
  const exclude = excludeEmail?.toLowerCase();
  return users
    .map((user) => user.emailId)
    .filter((emailAddr): emailAddr is string => {
      if (!emailAddr) return false;
      if (exclude && emailAddr.toLowerCase() === exclude) return false;
      return true;
    });
}

export const useGetUsersOfOrganization = (enabled = true) => {
  const { t } = useTranslation();
  const { VITE_USERHUB_ENDPOINT } = useEnv();
  const { post } = useAxiosWithAuth<GetUsersOfOrganizationResponse>(
    `${VITE_USERHUB_ENDPOINT}/userhub`,
  );
  const postRef = useRef(post);
  postRef.current = post;

  const fetchOrganizationUsers = useCallback(async (): Promise<UserHubDataTypes[]> => {
    const response = await postRef.current({
      eventType: "GET_USERS_OF_ORGANIZATION",
    });
    if (response?.code === "USERS_RETRIEVED" && Array.isArray(response.body)) {
      return response.body;
    }
    if (response?.error) {
      toast.error(formatError(response));
    } else {
      toast.error(t("common.someErrorOccurred"));
    }
    return [];
  }, [t]);

  const {
    data: users = [],
    isPending,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: USERHUB_ORGANIZATION_USERS_QUERY_KEY,
    queryFn: fetchOrganizationUsers,
    enabled,
  });

  return {
    users,
    isUsersLoading: isPending,
    isUsersFetching: isFetching,
    refetchUsers: refetch,
  };
};
