import { LeadDataContext } from "@/features/components/providers/LeadProfileProvider";
import { isProfilePathSection } from "@/lib/profileRoutes";
import { useRouter } from "next/router";
import { useContext, useMemo } from "react";

const pickFirstQueryParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/** Normalize query id; treats empty / `"undefined"` / `"null"` as absent. */
const normalizeQueryId = (value: string | string[] | undefined) => {
  const normalized = pickFirstQueryParam(value)?.trim();
  if (!normalized || normalized === "undefined" || normalized === "null") {
    return undefined;
  }
  return normalized;
};

/**
 * Returns the current profile project name and id for PageLayout title suffixes.
 * Only populated on client/lead profile routes with a `projectId` and loaded lead data.
 */
export function useProfilePageLayoutProjectName(enabled = true) {
  const router = useRouter();
  const { projectName } = useContext(LeadDataContext);

  return useMemo(() => {
    if (!enabled || !router.isReady) {
      return undefined;
    }

    const projectId = normalizeQueryId(
      router.query.projectId as string | string[] | undefined,
    );
    if (!projectId || !isProfilePathSection(router.pathname)) {
      return undefined;
    }

    const name = projectName?.trim();
    if (!name) {
      return undefined;
    }

    return { name, projectId };
  }, [enabled, projectName, router.isReady, router.pathname, router.query.projectId]);
}
