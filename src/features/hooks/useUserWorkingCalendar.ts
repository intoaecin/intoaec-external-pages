import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useSession } from "next-auth/react";
import {
  DEFAULT_ORGANIZATION_WORKING_HOURS,
  normalizeOrganizationWorkingHours,
} from "@/features/projectSchedule/utils/workloadCapacity";

export type UserWorkingDays = {
  sunday: boolean;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
};

export type UserWorkingCalendarHoliday = {
  name: string;
  date: string;
};

export type UserWorkingCalendarData = {
  userId: string;
  workingDays: UserWorkingDays;
  workingHours: number;
  rate: number;
  overTimeRate: number;
  rateType: "Hour";
  overTimeType: "Hour";
  holidays: UserWorkingCalendarHoliday[];
};

type UserWorkingCalendarResponse = {
  body?: Partial<UserWorkingCalendarData>;
};

export const DEFAULT_USER_WORKING_DAYS: UserWorkingDays = {
  sunday: true,
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: true,
};

export const USER_WORKING_CALENDAR_QUERY_KEY = (
  organizationId: string | undefined,
  userId: string | null | undefined,
) => ["userWorkingCalendar", organizationId, userId ?? null];

const normalizeWorkingDays = (raw: unknown): UserWorkingDays => {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_USER_WORKING_DAYS };
  }
  const record = raw as Partial<Record<keyof UserWorkingDays, unknown>>;
  return {
    sunday:
      typeof record.sunday === "boolean"
        ? record.sunday
        : DEFAULT_USER_WORKING_DAYS.sunday,
    monday:
      typeof record.monday === "boolean"
        ? record.monday
        : DEFAULT_USER_WORKING_DAYS.monday,
    tuesday:
      typeof record.tuesday === "boolean"
        ? record.tuesday
        : DEFAULT_USER_WORKING_DAYS.tuesday,
    wednesday:
      typeof record.wednesday === "boolean"
        ? record.wednesday
        : DEFAULT_USER_WORKING_DAYS.wednesday,
    thursday:
      typeof record.thursday === "boolean"
        ? record.thursday
        : DEFAULT_USER_WORKING_DAYS.thursday,
    friday:
      typeof record.friday === "boolean"
        ? record.friday
        : DEFAULT_USER_WORKING_DAYS.friday,
    saturday:
      typeof record.saturday === "boolean"
        ? record.saturday
        : DEFAULT_USER_WORKING_DAYS.saturday,
  };
};

const normalizeHolidays = (raw: unknown): UserWorkingCalendarHoliday[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((holiday) => {
      if (!holiday || typeof holiday !== "object") return null;
      const record = holiday as Record<string, unknown>;
      const name = typeof record.name === "string" ? record.name.trim() : "";
      const date = typeof record.date === "string" ? record.date.trim() : "";
      return name && /^\d{4}-\d{2}-\d{2}$/.test(date) ? { name, date } : null;
    })
    .filter(
      (holiday): holiday is UserWorkingCalendarHoliday => holiday !== null,
    );
};

const normalizeNumericValue = (raw: unknown) => {
  if (typeof raw === "number") {
    return Number.isFinite(raw) ? raw : 0;
  }

  if (typeof raw === "string") {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const normalizeCalendar = (
  body: Partial<UserWorkingCalendarData> | undefined,
  userId: string,
): UserWorkingCalendarData => ({
  userId,
  workingDays: normalizeWorkingDays(body?.workingDays),
  workingHours: normalizeOrganizationWorkingHours(body?.workingHours),
  rate: normalizeNumericValue(body?.rate),
  overTimeRate: normalizeNumericValue(body?.overTimeRate),
  rateType: "Hour",
  overTimeType: "Hour",
  holidays: normalizeHolidays(body?.holidays),
});

export function useUserWorkingCalendar(userId: string | null) {
  const { NEXT_PUBLIC_USERHUB_ENDPOINT } = useEnv();
  const { post } = useAxiosWithAuth<UserWorkingCalendarResponse>(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/settings",
  );
  const { data: session } = useSession();
  const organizationId = session?.["custom:organization_id"];

  const query = useQuery({
    queryKey: USER_WORKING_CALENDAR_QUERY_KEY(organizationId, userId),
    queryFn: async () => {
      if (!userId) {
        return normalizeCalendar(undefined, "");
      }
      const response = await post({
        eventType: "GET_USER_WORKING_CALENDAR",
        userId,
      });
      return normalizeCalendar(response?.body, userId);
    },
    enabled: Boolean(organizationId && userId),
    staleTime: 5 * 60 * 1000,
  });

  return {
    calendar:
      query.data ??
      normalizeCalendar(
        {
          workingHours: DEFAULT_ORGANIZATION_WORKING_HOURS,
          rate: 0,
          overTimeRate: 0,
          rateType: "Hour",
          overTimeType: "Hour",
        },
        userId ?? "",
      ),
    loading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useSaveUserWorkingCalendar() {
  const { NEXT_PUBLIC_USERHUB_ENDPOINT } = useEnv();
  const { post } = useAxiosWithAuth<UserWorkingCalendarResponse>(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/settings",
  );
  const { data: session } = useSession();
  const organizationId = session?.["custom:organization_id"];
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (calendar: UserWorkingCalendarData) =>
      post({
        eventType: "UPSERT_USER_WORKING_CALENDAR",
        userId: calendar.userId,
        workingDays: calendar.workingDays,
        workingHours: calendar.workingHours,
        rate: calendar.rate,
        overTimeRate: calendar.overTimeRate,
        rateType: calendar.rateType,
        overTimeType: calendar.overTimeType,
        holidays: calendar.holidays,
      }),
    onSuccess: (_, calendar) => {
      queryClient.invalidateQueries({
        queryKey: USER_WORKING_CALENDAR_QUERY_KEY(
          organizationId,
          calendar.userId,
        ),
      });
    },
  });

  return {
    loading: mutation.isPending,
    saveCalendar: mutation.mutateAsync,
  };
}
