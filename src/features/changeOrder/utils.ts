/**
 * Ported from intoaec-UI `src/features/changeOrder/utils.ts` — only the two
 * helpers actually needed by the client-facing accept/sign header. The rest
 * of that source file (estimate-source normalization, admin builder return
 * tabs, etc.) belongs to the admin change-order builder, which stays in
 * intoaec-UI and is out of scope here.
 */

export const CHANGE_ORDER_MODE_SETTING_REQUEST = {
  eventType: "GET_ORGANIZATION_SETTINGS_BY_NAME",
  settingName: "CHANGE_ORDER_MODE",
} as const;

const recordValue = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};

export const isIndependentChangeOrderMode = (response: unknown): boolean => {
  const result = recordValue(response);
  const body = recordValue(result.body);

  return body.settingValue1 === "INDEPENDENT";
};
