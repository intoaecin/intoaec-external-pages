/**
 * Lightweight pathname formatter for middleware/Edge.
 * Extracted from helpers to avoid pulling heavy deps (moment, XLSX, etc.) into Edge bundle.
 */
export const formatPathname = (currentPath: string) => {
  const pathParts = currentPath.split("/");
  return pathParts.length > 1
    ? currentPath.substring(1).replaceAll("-", "")
    : currentPath ?? "/";
};
