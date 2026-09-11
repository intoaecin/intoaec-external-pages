/** Public configuration loaded from `/runtime-env.json` before routes render. */

export const PUBLIC_ENV_KEYS = [
  "VITE_LEADMANAGER_ENDPOINT",
  "VITE_USERHUB_ENDPOINT",
  "VITE_MEETANDNOTE_ENDPOINT",
  "VITE_PROPOSAL_ENDPOINT",
  "VITE_AECPOSTMAN_ENDPOINT",
  "VITE_AEC_AUTOPILOT_ENDPOINT",
  "VITE_AEC_CHATBOT_ENDPOINT",
  "VITE_BOTSYNC_AI",
  "VITE_PROCUREMENT_ENDPOINT",
  "VITE_PAYMASTER_ENDPOINT",
  "VITE_ROOT_DOMAIN_NAME",
  "VITE_WEBSITE_URL",
  "VITE_APP_URL",
  "VITE_VENDOR_URL",
  "VITE_CLIPPER_EXTENSION_URL",
  "VITE_AUTH_URL",
  "VITE_AEC_BUCKET_NAME",
  "VITE_CUSTOMER_PORTAL_BUCKET_NAME",
  "VITE_ORGANIZATIONS_BUCKET_NAME",
  "VITE_REGION",
  "VITE_INTOAEC_LOGO",
  "VITE_DEFAULT_ORGANIZATION_TYPE",
  "VITE_PRIVACY_POLICY_URL",
  "VITE_REFUND_POLICY_URL",
  "VITE_TERMS_OF_SERVICES_URL",
  "VITE_CURRENT_ENV",
  "VITE_GOOGLE_MAP_APIKEY",
  "VITE_ACCESS_KEY",
  "VITE_RECAPTCHA_KEY",
  "VITE_CLARITY_KEY",
  "VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID",
  "VITE_GOOGLE_TAG_MANAGER_ID",
  "VITE_RUN_POD_API_KEY",
  "VITE_APIKEY",
  "VITE_WHITELISTED_DOMAINS",
  "VITE_INTOAEC_ORG_EMAIL",
  "VITE_INTOAEC_SALES_EMAIL",
  "VITE_GRACE_PERIOD_DAYS",
  "VITE_ORGANIZATION_TYPE",
  "HELP_CENTER_URL",
  "VITE_HELP_CENTER_URL",
  "VITE_MODEL_URI",
  "VITE_AUTH_PREVIEW_VIDEO_URL",
  "VITE_CHAT_VAPID_PUBLIC_KEY",
] as const;

type PublicEnvKey = (typeof PUBLIC_ENV_KEYS)[number];
export type EnvConfig = Record<PublicEnvKey, string>;

export const EMPTY_ENV_CONFIG = PUBLIC_ENV_KEYS.reduce((acc, key) => {
  acc[key] = "";
  return acc;
}, {} as EnvConfig);

export const createEnvConfig = (value: unknown): EnvConfig => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...EMPTY_ENV_CONFIG };
  }

  const source = value as Record<string, unknown>;
  const config = { ...EMPTY_ENV_CONFIG };
  for (const key of PUBLIC_ENV_KEYS) {
    if (typeof source[key] === "string") config[key] = source[key] as string;
  }
  config.VITE_ORGANIZATION_TYPE ||= config.VITE_DEFAULT_ORGANIZATION_TYPE;
  return config;
};
