import { getLocalizationValue } from "@/lib/helpers";
import type { OrganizationLocalizationType } from "@/types";

export const getReportCurrency = (
  localizationValue?: OrganizationLocalizationType[],
): string => {
  if (!localizationValue) {
    return "";
  }

  return (
    getLocalizationValue(localizationValue, "CURRENCY", "SYMBOL") ??
    getLocalizationValue(localizationValue, "CURRENCY", "CODE") ??
    ""
  );
};

export const convertToUTC = ({ timestamp, timezone }: { timestamp: number; timezone: string }): number => {
  try {
    const date = new Date(timestamp);
    const targetDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const targetOffset = targetDate.getTime() - date.getTime();
    const utcTimestamp = timestamp - targetOffset;
    return utcTimestamp;
  } catch (error) {
    console.error('Error converting to UTC:', error);
    return timestamp;
  }
};

export const convertFromUTC = ({ timestamp, timezone }: { timestamp: number; timezone: string }): number => {
  try {
    const utcDate = new Date(timestamp);
    const targetDate = new Date(utcDate.toLocaleString('en-US', { timeZone: timezone }));
    const targetOffset = targetDate.getTime() - utcDate.getTime();
    const localTimestamp = timestamp + targetOffset;
    return localTimestamp;
  } catch (error) {
    console.error('Error converting from UTC:', error);
    return timestamp;
  }
};
  
  
