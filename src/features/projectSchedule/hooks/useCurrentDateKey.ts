import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import { getDateKeyInTimezone } from "../helpers/dateUtil";

dayjs.extend(utc);
dayjs.extend(timezone);

export function useCurrentDateKey(organizationTimezone: string): string {
  const timezoneId = organizationTimezone || "UTC";
  const [currentDateKey, setCurrentDateKey] = useState(() =>
    getDateKeyInTimezone(new Date(), timezoneId),
  );

  useEffect(() => {
    const updateCurrentDate = () => {
      setCurrentDateKey(getDateKeyInTimezone(new Date(), timezoneId));
    };

    updateCurrentDate();

    const now = dayjs().tz(timezoneId);
    const millisecondsUntilTomorrow = now.endOf("day").diff(now) + 1;
    const timer = window.setTimeout(updateCurrentDate, millisecondsUntilTomorrow);

    return () => window.clearTimeout(timer);
  }, [timezoneId, currentDateKey]);

  return currentDateKey;
}
