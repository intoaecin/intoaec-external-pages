/**
 * Maps legacy permission module paths to canonical `PathsKeyForPermission`-style
 * tokens (flat `FEATURES/...` for client + lead CRM feature modules).
 */
const LEGACY_FEATURE_ROOTS = new Set([
  "CLIENT",
  "CLIENTS",
  "LEAD_MANAGER",
  "LEAD_MANAGEMENT",
  "FEATURES/CLIENT",
  "FEATURES/CLIENTS",
  "FEATURES/LEAD_MANAGER",
  "FEATURES/LEAD_MANAGEMENT",
]);

/** Maps seeded permission paths before consolidation (preferences + localization). */
const LEGACY_PREFERENCES_MODULE_MAP: Record<string, string> = {
  "PREFERENCES/LEAD": "PREFERENCES/ORGANIZATIONS_PREFERENCES",
  "PREFERENCES/WEBSITE": "PREFERENCES/ORGANIZATIONS_PREFERENCES",
  "PREFERENCES/LEAD_CAPTURE": "PREFERENCES/ORGANIZATIONS_PREFERENCES",
  "PREFERENCES/ADMIN": "PREFERENCES/PROJECT_CRM",
  LOCALIZATION: "PREFERENCES/ORGANIZATIONS_PREFERENCES",
  "LOCALIZATION/TIME_ZONE_&_CURRENCY":
    "PREFERENCES/ORGANIZATIONS_PREFERENCES",
  "LOCALIZATION/TAXES": "PREFERENCES/ORGANIZATIONS_PREFERENCES",
  "LOCALIZATION/DISCOUNT": "PREFERENCES/ORGANIZATIONS_PREFERENCES",
};

const LEGACY_FEATURE_PREFIXES = [
  "CLIENT/",
  "CLIENTS/",
  "LEAD_MANAGER/",
  "LEAD_MANAGEMENT/",
  "FEATURES/CLIENT/",
  "FEATURES/CLIENTS/",
  "FEATURES/LEAD_MANAGER/",
  "FEATURES/LEAD_MANAGEMENT/",
] as const;

export function normalizeUserHubPermissionPath(module: string): string {
  if (LEGACY_FEATURE_ROOTS.has(module)) {
    return "FEATURES";
  }

  for (const prefix of LEGACY_FEATURE_PREFIXES) {
    if (module.startsWith(prefix)) {
      const parts = module.split("/");
      const featureName = parts[parts.length - 1] ?? "";
      return `FEATURES/${featureName}`;
    }
  }

  const mappedPrefs = LEGACY_PREFERENCES_MODULE_MAP[module];
  if (mappedPrefs) {
    return mappedPrefs;
  }

  return module;
}

/** Normalize each path, dedupe, and ensure `FEATURES` parent when any sub-feature is granted. */
export function normalizeUserHubPermissionList(permissions: string[]): string[] {
  const normalized = permissions.map(normalizeUserHubPermissionPath);
  const next = new Set(normalized);
  if ([...next].some((p) => p.startsWith("FEATURES/"))) {
    next.add("FEATURES");
  }
  return [...next];
}
