import { formatSeedValues } from "@/lib/helpers";
import { toCamelNoSpace, toLowerNoSpace } from "@/utils/string";

/** Legacy permission keys that do not follow camelCase in locale files. */
const LEGACY_FEATURE_KEY_PARTS: Record<string, string> = {
  moneyMatters: "moneymatters",
  workOrder: "workorder",
};

const getPermissionLabelModule = (module: string) => {
  if (module.startsWith("FEATURES/")) {
    return module.replace("FEATURES/", "");
  }
  return module;
};

export function getUserHubPermissionTranslationKey(module: string): string {
  if (module.startsWith("FEATURES/")) {
    const suffix = module.slice("FEATURES/".length);
    const featurePart =
      LEGACY_FEATURE_KEY_PARTS[toCamelNoSpace(suffix)] ??
      toCamelNoSpace(suffix);
    return `features/${featurePart}`;
  }

  return toLowerNoSpace(formatSeedValues(getPermissionLabelModule(module)));
}

export function getUserHubPermissionLabel(module: string): string {
  return formatSeedValues(getPermissionLabelModule(module));
}
