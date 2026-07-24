import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import AutocompleteComponent from "@/components_v2/Autocomplete";
import {
  DEFAULT_USER_WORKING_DAYS,
  UserWorkingCalendarData,
  useSaveUserWorkingCalendar,
  useUserWorkingCalendar,
} from "@/features/hooks/useUserWorkingCalendar";
import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import {
  MAX_ORGANIZATION_WORKING_HOURS,
  MIN_ORGANIZATION_WORKING_HOURS,
  normalizeOrganizationWorkingHours,
} from "@/features/projectSchedule/utils/workloadCapacity";
import { useGetUsersOfOrganization } from "@/features/userHub/hooks/useGetUsersOfOrganization";
import { getLocalizationValue } from "@/lib/helpers";

type UserWorkingCalendarPreferenceProps = {
  userId?: string;
  hideUserSelector?: boolean;
  hideSelectedUserLabel?: boolean;
  hideActions?: boolean;
  embeddedLayout?: boolean;
  onStateChange?: (state: {
    calendar: UserWorkingCalendarData;
    isValid: boolean;
    hasChanges: boolean;
  }) => void;
};

const cloneCalendar = (
  data: UserWorkingCalendarData,
): UserWorkingCalendarData => ({
  ...data,
  workingDays: { ...data.workingDays },
  holidays: data.holidays.map((holiday) => ({ ...holiday })),
});

const calendarsEqual = (
  left: UserWorkingCalendarData,
  right: UserWorkingCalendarData,
) => JSON.stringify(left) === JSON.stringify(right);

const formatUserName = (user: any) =>
  `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
  user?.emailId ||
  "";

const UserWorkingCalendarPreference = ({
  userId,
  hideUserSelector = false,
  hideSelectedUserLabel = false,
  hideActions = false,
  embeddedLayout = false,
  onStateChange,
}: UserWorkingCalendarPreferenceProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { localizationValue } = useOrganizationLocalization();
  const safeLocalizationValue = localizationValue ?? [];
  const { users, isUsersLoading } = useGetUsersOfOrganization(!hideUserSelector);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    userId ?? null,
  );
  const effectiveUserId = userId ?? selectedUserId ?? null;
  const { calendar, loading } = useUserWorkingCalendar(effectiveUserId);
  const { loading: saving, saveCalendar } = useSaveUserWorkingCalendar();
  const [draft, setDraft] = useState<UserWorkingCalendarData>({
    userId: "",
    workingDays: { ...DEFAULT_USER_WORKING_DAYS },
    workingHours: 8,
    rate: 0,
    overTimeRate: 0,
    rateType: "Hour",
    overTimeType: "Hour",
    holidays: [],
  });
  const [hoursInput, setHoursInput] = useState("8");
  const [rateInput, setRateInput] = useState("0");
  const [overTimeRateInput, setOverTimeRateInput] = useState("0");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const currencySymbol =
    getLocalizationValue(safeLocalizationValue, "CURRENCY", "SYMBOL") ?? "";
  const hourUnit =
    t("preferences.userWorkingCalendar.hourUnit", { defaultValue: "Hour" });

  const userOptions = useMemo(
    () =>
      (users ?? [])
        .filter((user) => user.userStatus === "ACCEPTED" || user.isSuperAdmin)
        .map((user) => ({
          label: formatUserName(user),
          value: user.userId,
        }))
        .filter((option) => option.label && option.value),
    [users],
  );

  useEffect(() => {
    if (userId) {
      setSelectedUserId(userId);
      return;
    }
    if (!router.isReady || hideUserSelector) return;
    const queryUserId =
      typeof router.query.userId === "string" ? router.query.userId : undefined;
    if (!queryUserId) return;
    const matchingUser = userOptions.find((option) => option.value === queryUserId);
    if (matchingUser) {
      setSelectedUserId(matchingUser.value);
    }
  }, [hideUserSelector, router.isReady, router.query.userId, userId, userOptions]);

  useEffect(() => {
    const clonedCalendar = cloneCalendar(calendar);
    setDraft(clonedCalendar);
    setHoursInput(String(clonedCalendar.workingHours));
    setRateInput(String(clonedCalendar.rate ?? 0));
    setOverTimeRateInput(String(clonedCalendar.overTimeRate ?? 0));
    setSubmitAttempted(false);
  }, [calendar]);

  const selectedUser = userOptions.find(
    (option) => option.value === effectiveUserId,
  );
  const draftHoursNumber = Number(hoursInput);
  const rateValue = Number(rateInput);
  const overTimeRateValue = Number(overTimeRateInput);
  const isHoursInvalid =
    hoursInput.trim() === "" ||
    !Number.isFinite(draftHoursNumber) ||
    draftHoursNumber < MIN_ORGANIZATION_WORKING_HOURS ||
    draftHoursNumber > MAX_ORGANIZATION_WORKING_HOURS;
  const isHourlyRateInvalid = !Number.isFinite(rateValue) || rateValue < 0;
  const isOvertimeRateInvalid =
    !Number.isFinite(overTimeRateValue) || overTimeRateValue < 0;
  const hasHoursError = hideActions ? isHoursInvalid : submitAttempted && isHoursInvalid;
  const hasRateError = hideActions
    ? isHourlyRateInvalid || isOvertimeRateInvalid
    : submitAttempted && (isHourlyRateInvalid || isOvertimeRateInvalid);
  const hasChanges = effectiveUserId
    ? hoursInput.trim() !== String(calendar.workingHours) ||
      rateInput.trim() !== String(calendar.rate ?? 0) ||
      overTimeRateInput.trim() !== String(calendar.overTimeRate ?? 0) ||
      !calendarsEqual(
        {
          ...draft,
          workingHours: isHoursInvalid
            ? draft.workingHours
            : normalizeOrganizationWorkingHours(draftHoursNumber),
        },
        calendar,
      )
    : false;
  const currentCalendar = useMemo(
    () => ({
      ...draft,
      userId: effectiveUserId ?? "",
      workingHours: normalizeOrganizationWorkingHours(draftHoursNumber),
      rate: rateValue,
      overTimeRate: overTimeRateValue,
      rateType: "Hour" as const,
      overTimeType: "Hour" as const,
      holidays: draft.holidays.map((holiday) => ({
        name: holiday.name.trim(),
        date: holiday.date,
      })),
    }),
    [draft, draftHoursNumber, effectiveUserId, overTimeRateValue, rateValue],
  );
  const isCurrentCalendarValid =
    Boolean(effectiveUserId) &&
    !isHoursInvalid &&
    !isHourlyRateInvalid &&
    !isOvertimeRateInvalid;

  useEffect(() => {
    onStateChange?.({
      calendar: currentCalendar,
      isValid: isCurrentCalendarValid,
      hasChanges,
    });
  }, [currentCalendar, hasChanges, isCurrentCalendarValid, onStateChange]);

  const handleHoursChange = (value: string) => {
    if (!/^\d{0,2}(\.\d{0,2})?$/.test(value.trim())) return;
    setHoursInput(value.trim());
  };

  const handleRateChange = (
    value: string,
    setValue: (next: string) => void,
  ) => {
    if (!/^\d{0,8}(\.\d{0,2})?$/.test(value.trim())) return;
    setValue(value.trim());
  };

  const handleDiscard = () => {
    const clonedCalendar = cloneCalendar(calendar);
    setDraft(clonedCalendar);
    setHoursInput(String(clonedCalendar.workingHours));
    setRateInput(String(clonedCalendar.rate ?? 0));
    setOverTimeRateInput(String(clonedCalendar.overTimeRate ?? 0));
    setSubmitAttempted(false);
  };

  const handleSave = async () => {
    setSubmitAttempted(true);
    if (
      !effectiveUserId ||
      isHoursInvalid ||
      isHourlyRateInvalid ||
      isOvertimeRateInvalid
    ) {
      return;
    }
    await saveCalendar(currentCalendar);
    toast.success(t("toast.userWorkingCalendarUpdatedSuccessfully"));
  };

  if (!hideUserSelector && !effectiveUserId) {
    return (
      <Box sx={{ width: "100%", maxWidth: "none", p: { xs: 2, md: 2.5 } }}>
        <Box sx={{ maxWidth: 420, mb: 3 }}>
          <AutocompleteComponent
            options={userOptions}
            value={selectedUserId ?? ""}
            onChange={(value) => setSelectedUserId(value || null)}
            label={t("preferences.userWorkingCalendar.selectUser")}
            placeholder={t("preferences.userWorkingCalendar.selectUser")}
            isLoading={isUsersLoading}
            size="small"
            openOnFocus
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {t("preferences.userWorkingCalendar.selectUserEmptyState")}
        </Typography>
      </Box>
    );
  }

  if (!effectiveUserId) {
    return null;
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "none",
        p: embeddedLayout ? 0 : { xs: 2, md: 2.5 },
      }}
    >
      {!hideUserSelector ? (
        <Box sx={{ maxWidth: 420, mb: 3 }}>
          <AutocompleteComponent
            options={userOptions}
            value={selectedUserId ?? ""}
            onChange={(value) => setSelectedUserId(value || null)}
            label={t("preferences.userWorkingCalendar.selectUser")}
            placeholder={t("preferences.userWorkingCalendar.selectUser")}
            isLoading={isUsersLoading}
            size="small"
            openOnFocus
          />
        </Box>
      ) : null}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <>
          {!hideSelectedUserLabel && selectedUser?.label ? (
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, mb: embeddedLayout ? 0.5 : 1 }}
            >
              {selectedUser.label}
            </Typography>
          ) : null}

          <Box sx={{ mb: embeddedLayout ? 1 : 2.5 }}>
            <div className="row">
              <div className="col-lg-3 px-3 mb-3">
                <TextField
                  label={t("preferences.workingHours")}
                  value={hoursInput}
                  onChange={(event) => handleHoursChange(event.target.value)}
                  fullWidth
                  error={hasHoursError}
                  helperText={
                    hasHoursError
                      ? t("preferences.organizationWorkingHours.helperText", {
                          min: MIN_ORGANIZATION_WORKING_HOURS,
                          max: MAX_ORGANIZATION_WORKING_HOURS,
                        })
                      : embeddedLayout
                        ? undefined
                        : " "
                  }
                  inputProps={{ inputMode: "decimal" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {hourUnit}
                      </InputAdornment>
                    ),
                  }}
                  variant="standard"
                  defaultValue={""}
                />
              </div>
              <div className="col-lg-3 px-3 mb-3">
                <TextField
                  label={t("preferences.userWorkingCalendar.rate", {
                    hourUnit,
                    defaultValue: "Rate",
                  })}
                  value={rateInput}
                  onChange={(event) =>
                    handleRateChange(event.target.value, setRateInput)
                  }
                  fullWidth
                  error={hasRateError && isHourlyRateInvalid}
                  helperText={
                    hasRateError && isHourlyRateInvalid
                      ? t("preferences.userWorkingCalendar.rateHelperText", {
                          defaultValue: "Enter a valid hourly rate.",
                        })
                      : embeddedLayout
                        ? undefined
                        : " "
                  }
                  inputProps={{ inputMode: "decimal" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {currencySymbol}
                      </InputAdornment>
                    ),
                  }}
                  variant="standard"
                  defaultValue={""}
                />
              </div>
              <div className="col-lg-3 px-3 mb-3">
                <TextField
                  label={t("preferences.userWorkingCalendar.overTimeRate", {
                    hourUnit,
                    defaultValue: "Overtime Rate",
                  })}
                  value={overTimeRateInput}
                  onChange={(event) =>
                    handleRateChange(event.target.value, setOverTimeRateInput)
                  }
                  fullWidth
                  error={hasRateError && isOvertimeRateInvalid}
                  helperText={
                    hasRateError && isOvertimeRateInvalid
                      ? t("preferences.userWorkingCalendar.rateHelperText", {
                          defaultValue: "Enter a valid hourly rate.",
                        })
                      : embeddedLayout
                        ? undefined
                        : " "
                  }
                  inputProps={{ inputMode: "decimal" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {currencySymbol}
                      </InputAdornment>
                    ),
                  }}
                  variant="standard"
                  defaultValue={""}
                />
              </div>
            </div>
          </Box>

          {hideActions ? null : (
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
              <Button
                variant="outlined"
                onClick={handleDiscard}
                disabled={saving || !hasChanges}
              >
                {t("preferences.discard")}
              </Button>
              <LoadingButton
                variant="contained"
                loading={saving}
                disabled={saving || !hasChanges}
                onClick={handleSave}
              >
                {t("preferences.saveCalendar")}
              </LoadingButton>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default UserWorkingCalendarPreference;
