import { useMemo } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { getLocalizationValue } from "@/lib/helpers";

dayjs.extend(utc);
dayjs.extend(timezone);

export type DayjsInput =
  | number
  | string
  | Date
  | dayjs.Dayjs
  | null
  | undefined;

export const useLocalizedDayjs = () => {
  const { localizationValue } = useOrganizationLocalization();

  const languageCode = useMemo(
    () =>
      localizationValue
        ? getLocalizationValue(localizationValue, "LANGUAGE", "CODE") || "en"
        : "en",
    [localizationValue]
  );

  const organizationTimezone = useMemo(
    () =>
      localizationValue
        ? getLocalizationValue(localizationValue, "TIMEZONE", "ID") || undefined
        : undefined,
    [localizationValue]
  );

  const dateFormat = useMemo(
    () =>
      localizationValue
        ? getLocalizationValue(localizationValue, "DATE", "FORMAT") ||
          "MM/DD/YYYY"
        : "MM/DD/YYYY",
    [localizationValue]
  );

  const toLocalizedDayjs = (value?: DayjsInput) => {
    if (value == null || value === "") return null;

    const parsedValue = dayjs.isDayjs(value) ? value : dayjs(value);
    if (!parsedValue.isValid()) return null;

    return organizationTimezone
      ? parsedValue.tz(organizationTimezone)
      : parsedValue;
  };

  const dateStringToLocalizedDayjs = (value?: string | null) => {
    if (!value) return null;

    const parsedValue = organizationTimezone
      ? dayjs.tz(`${value}T00:00:00`, organizationTimezone)
      : dayjs(value, "YYYY-MM-DD", true);

    return parsedValue.isValid() ? parsedValue : null;
  };

  const getCurrentLocalizedDay = () =>
    organizationTimezone ? dayjs().tz(organizationTimezone) : dayjs();

  const startOfLocalizedDayTimestamp = (
    value: Exclude<DayjsInput, null | undefined>
  ) => {
    const parsedValue = dayjs.isDayjs(value) ? value : dayjs(value);
    if (!parsedValue.isValid()) return 0;

    return organizationTimezone
      ? parsedValue.tz(organizationTimezone).startOf("day").valueOf()
      : parsedValue.startOf("day").valueOf();
  };

  const endOfLocalizedDayTimestamp = (
    value: Exclude<DayjsInput, null | undefined>
  ) => {
    const parsedValue = dayjs.isDayjs(value) ? value : dayjs(value);
    if (!parsedValue.isValid()) return 0;

    return organizationTimezone
      ? parsedValue.tz(organizationTimezone).endOf("day").valueOf()
      : parsedValue.endOf("day").valueOf();
  };

  const minutesToLocalizedTime = (
    minutes: number | null,
    baseDate?: DayjsInput
  ) => {
    if (minutes === null) return null;

    const resolvedBaseDate = baseDate
      ? toLocalizedDayjs(baseDate)
      : getCurrentLocalizedDay();

    return resolvedBaseDate
      ? resolvedBaseDate
          .hour(Math.floor(minutes / 60))
          .minute(minutes % 60)
          .second(0)
          .millisecond(0)
      : null;
  };

  const buildLocalizedDateTime = (dateValue: DayjsInput, minutes: number) => {
    const baseDate = toLocalizedDayjs(dateValue);
    if (!baseDate) return 0;

    return baseDate
      .hour(Math.floor(minutes / 60))
      .minute(minutes % 60)
      .second(0)
      .millisecond(0)
      .valueOf();
  };

  return {
    localizationValue,
    languageCode,
    dateFormat,
    organizationTimezone,
    toLocalizedDayjs,
    dateStringToLocalizedDayjs,
    getCurrentLocalizedDay,
    startOfLocalizedDayTimestamp,
    endOfLocalizedDayTimestamp,
    minutesToLocalizedTime,
    buildLocalizedDateTime,
  };
};

