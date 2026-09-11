import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";

type QueryValue = string | string[];
type RouterDestination =
  | string
  | {
      pathname: string;
      query?: Record<string, unknown>;
    };

const normalizeReportPath = (path: string) => {
  if (path === "/reports") return "/reportsPage";
  if (path.startsWith("/reports/")) {
    return path.replace("/reports/", "/reportsPage/");
  }
  return path;
};

const destinationToPath = (destination: RouterDestination) => {
  if (typeof destination === "string") return normalizeReportPath(destination);

  const search = new URLSearchParams();
  Object.entries(destination.query ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, String(item)));
    } else if (value !== undefined && value !== null) {
      search.set(key, String(value));
    }
  });
  const queryString = search.toString();
  return `${normalizeReportPath(destination.pathname)}${queryString ? `?${queryString}` : ""}`;
};

export const useRouter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = useMemo<Record<string, QueryValue>>(() => {
    const values: Record<string, QueryValue> = {};
    const params = new URLSearchParams(location.search);
    params.forEach((value, key) => {
      const current = values[key];
      values[key] = current
        ? Array.isArray(current)
          ? [...current, value]
          : [current, value]
        : value;
    });
    return values;
  }, [location.search]);

  return {
    asPath: `${location.pathname}${location.search}`,
    pathname: location.pathname,
    query,
    isReady: true,
    push: (destination: RouterDestination) => navigate(destinationToPath(destination)),
    back: () => navigate(-1),
  };
};

export const useSession = () => {
  const { organizationId, organizationType } = useOrganization();
  const data = organizationId
    ? {
        "custom:organization_id": organizationId,
        "custom:organization_type": organizationType,
      }
    : undefined;
  return {
    data,
    status: data ? ("authenticated" as const) : ("loading" as const),
  };
};
