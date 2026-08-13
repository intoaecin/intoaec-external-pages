import { useCallback, useMemo } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  type NavigateOptions,
} from "react-router-dom";

export type QueryValue = string | string[] | number | boolean | null | undefined;
export type RouterQuery = Record<string, string | string[] | undefined>;

interface UrlObject {
  pathname?: string;
  query?: Record<string, QueryValue>;
  hash?: string;
}

type Url = string | UrlObject;

const toQueryRecord = (
  params: Readonly<Record<string, string | undefined>>,
  search: string,
): RouterQuery => {
  const query: RouterQuery = { ...params };

  for (const [key, value] of new URLSearchParams(search)) {
    const existing = query[key];
    if (existing === undefined) {
      query[key] = value;
    } else if (Array.isArray(existing)) {
      query[key] = [...existing, value];
    } else {
      query[key] = [existing, value];
    }
  }

  return query;
};

const interpolatePath = (pathname: string, query: Record<string, QueryValue>) =>
  pathname.replace(/\[([^\]]+)\]|:([A-Za-z0-9_]+)/g, (match, bracket, colon) => {
    const key = bracket ?? colon;
    const value = query[key];
    const firstValue = Array.isArray(value) ? value[0] : value;
    return firstValue === undefined || firstValue === null
      ? match
      : encodeURIComponent(String(firstValue));
  });

const toHref = (
  url: Url,
  currentPathname: string,
  currentParams: Readonly<Record<string, string | undefined>> = {},
): string => {
  if (typeof url === "string") return url;

  const query = url.query ?? {};
  const pathname = interpolatePath(url.pathname ?? currentPathname, query);
  const search = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(query)) {
    const routeValue = currentParams[key];
    const firstRawValue = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    if (
      pathname === currentPathname &&
      routeValue !== undefined &&
      String(firstRawValue) === routeValue
    ) {
      continue;
    }
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    for (const value of values) {
      if (value !== undefined && value !== null && !pathname.includes(`[${key}]`)) {
        search.append(key, String(value));
      }
    }
  }

  const queryString = search.toString();
  const hash = url.hash
    ? url.hash.startsWith("#")
      ? url.hash
      : `#${url.hash}`
    : "";
  return `${pathname}${queryString ? `?${queryString}` : ""}${hash}`;
};

const isExternalHref = (href: string) => {
  try {
    const resolved = new URL(href, window.location.href);
    return resolved.origin !== window.location.origin;
  } catch {
    return false;
  }
};

export const useRouter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const query = useMemo(
    () => toQueryRecord(params, location.search),
    [location.search, params],
  );

  const changeLocation = useCallback(
    async (url: Url, options?: NavigateOptions) => {
      const href = toHref(url, location.pathname, params);
      if (isExternalHref(href)) {
        window.location.assign(href);
      } else {
        navigate(href, options);
      }
      return true;
    },
    [location.pathname, navigate, params],
  );

  const push = useCallback(
    (url: Url) => changeLocation(url),
    [changeLocation],
  );
  const replace = useCallback(
    (url: Url) => changeLocation(url, { replace: true }),
    [changeLocation],
  );

  return {
    query,
    pathname: location.pathname,
    asPath: `${location.pathname}${location.search}${location.hash}`,
    isReady: true,
    push,
    replace,
    back: () => navigate(-1),
    locale: undefined as string | undefined,
  };
};

const notifyRouter = () => window.dispatchEvent(new PopStateEvent("popstate"));

const imperativeRouter = {
  get pathname() {
    return window.location.pathname;
  },
  get asPath() {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
  },
  get query() {
    return toQueryRecord({}, window.location.search);
  },
  isReady: true,
  locale: undefined as string | undefined,
  async push(url: Url) {
    const href = toHref(url, window.location.pathname);
    if (isExternalHref(href)) window.location.assign(href);
    else {
      window.history.pushState({}, "", href);
      notifyRouter();
    }
    return true;
  },
  async replace(url: Url) {
    const href = toHref(url, window.location.pathname);
    if (isExternalHref(href)) window.location.replace(href);
    else {
      window.history.replaceState({}, "", href);
      notifyRouter();
    }
    return true;
  },
  back() {
    window.history.back();
  },
};

export default imperativeRouter;
