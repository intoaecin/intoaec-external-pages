import {
  CLIENT_PROFILE_PREFIX,
  isClientProfilePathname,
  isLeadManagerProfilePathname,
  LEAD_MANAGER_PROFILE_PREFIX,
} from "@/lib/profileRoutes";
import { useMemo } from "react";
import { useRouter } from "next/router";
import type { ParsedUrlQueryInput } from "querystring";

const pickFirstQueryParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/** Treats `"undefined"` / `"null"` / empty as absent. */
const normalizeQueryParam = (value: string | string[] | undefined) => {
  const normalized = pickFirstQueryParam(value)?.trim();

  if (!normalized || normalized === "undefined" || normalized === "null") {
    return undefined;
  }

  return normalized;
};

type QueryValue = string | string[] | undefined;
type QueryRecord = Record<string, QueryValue>;

/** Drop empty / placeholder query values */
export function getSanitizedQueryRecord(
  query: QueryRecord,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => normalizeQueryParam(value)),
  ) as Record<string, string>;
}

export const useQueryParams = () => {
  const router = useRouter();

  return useMemo(() => {
    const pathname = router.pathname;
    const onLeadProfilePath = isLeadManagerProfilePathname(pathname);
    const onClientProfilePath = isClientProfilePathname(pathname);

    /** Matches `ProfileRouteQuerySync`: canonical lead slug is `leadId` or legacy `client`. */
    const effectiveLead =
      normalizeQueryParam(
        router.query.leadId as string | string[] | undefined,
      ) ??
      normalizeQueryParam(router.query.client as string | string[] | undefined);
    const clientIdNormalized = normalizeQueryParam(
      router.query.clientId as string | string[] | undefined,
    );

    let isLeadManagerProfile: boolean;
    let isClientProfileRoute: boolean;

    if (onLeadProfilePath) {
      isLeadManagerProfile = true;
      isClientProfileRoute = false;
    } else if (onClientProfilePath) {
      isLeadManagerProfile = false;
      isClientProfileRoute = true;
    } else {
      /** Standalone nested modules: infer from query like the previous hook */
      isClientProfileRoute = Boolean(clientIdNormalized);
      isLeadManagerProfile = !isClientProfileRoute;
    }

    const profilePathname = isLeadManagerProfile
      ? LEAD_MANAGER_PROFILE_PREFIX
      : CLIENT_PROFILE_PREFIX;

    const entityIdKey: "leadId" | "clientId" = isLeadManagerProfile
      ? "leadId"
      : "clientId";
    const entityIdValue =
      entityIdKey === "leadId"
        ? effectiveLead
        : clientIdNormalized ?? effectiveLead;

    const resolvedClientId = entityIdValue ?? "";

    const getSanitizedQuery = (query: QueryRecord) =>
      getSanitizedQueryRecord(query);

    /** Merge profile navigation query: strips mixed ids, emits the correct `leadId` / `clientId`. */
    const buildProfileQuery = (
      baseOrExtra?: ParsedUrlQueryInput,
      maybeExtra?: ParsedUrlQueryInput,
    ): ParsedUrlQueryInput => {
      const mergedRaw =
        maybeExtra !== undefined
          ? {
              ...(baseOrExtra as ParsedUrlQueryInput),
              ...maybeExtra,
            }
          : ({
              ...(router.query as ParsedUrlQueryInput),
              ...(baseOrExtra ?? {}),
            } as ParsedUrlQueryInput);

      const {
        clientId: _dropClientId,
        leadId: _dropLeadId,
        client: _dropClientLegacy,
        ...rest
      } = mergedRaw as ParsedUrlQueryInput & {
        clientId?: QueryValue;
        leadId?: QueryValue;
        client?: QueryValue;
      };

      void _dropClientId;
      void _dropLeadId;
      void _dropClientLegacy;

      return {
        ...rest,
        ...(entityIdValue ? { [entityIdKey]: entityIdValue } : {}),
      };
    };

    return {
      isClientProfileRoute,
      isLeadManagerProfile,
      resolvedClientId,
      profilePathname,
      entityIdKey,
      getSanitizedQuery,
      buildProfileQuery,
    };
  }, [router.pathname, router.query]);
};
