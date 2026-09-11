import { ReactNode } from "react";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/es";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  DatePicker,
  DatePickerProps,
} from "@mui/x-date-pickers/DatePicker";
import {
  TimePicker,
  TimePickerProps,
} from "@mui/x-date-pickers/TimePicker";
import {
  DateTimePicker,
  DateTimePickerProps,
} from "@mui/x-date-pickers/DateTimePicker";
import { useTranslation } from "react-i18next";

import { useLocalizedDayjs } from "@/features/hooks/useLocalizedDayjs";

const SUPPORTED_PICKER_LOCALES = new Set(["en", "es"]);

const getDayjsAdapterLocale = (language?: string) => {
  const normalizedLanguage = language?.toLowerCase();
  const baseLanguage = normalizedLanguage?.split("-")[0];

  if (baseLanguage && SUPPORTED_PICKER_LOCALES.has(baseLanguage)) {
    return baseLanguage;
  }

  return "en";
};

export const LocalizedPickerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { i18n } = useTranslation();
  const { languageCode } = useLocalizedDayjs();
  const adapterLocale = getDayjsAdapterLocale(languageCode || i18n.language);

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale={adapterLocale}
    >
      {children}
    </LocalizationProvider>
  );
};

export const LocalizedDatePicker = (
  props: DatePickerProps<dayjs.Dayjs>
) => {
  const { organizationTimezone, dateFormat } = useLocalizedDayjs();

  return (
    <LocalizedPickerProvider>
      <DatePicker
        {...props}
        timezone={props.timezone ?? organizationTimezone}
        format={props.format ?? dateFormat}
      />
    </LocalizedPickerProvider>
  );
};

export const LocalizedTimePicker = (
  props: TimePickerProps<dayjs.Dayjs>
) => {
  const { organizationTimezone } = useLocalizedDayjs();

  return (
    <LocalizedPickerProvider>
      <TimePicker
        {...props}
        timezone={props.timezone ?? organizationTimezone}
        // MUI defaults ampmInClock to false on mobile (meridiem lives in the toolbar).
        // When the toolbar is hidden, AM/PM disappears on touch devices — keep it in the clock.
        ampmInClock={props.ampmInClock ?? true}
      />
    </LocalizedPickerProvider>
  );
};

export const LocalizedDateTimePicker = (
  props: DateTimePickerProps<dayjs.Dayjs>
) => {
  const { organizationTimezone } = useLocalizedDayjs();

  return (
    <LocalizedPickerProvider>
      <DateTimePicker
        {...props}
        timezone={props.timezone ?? organizationTimezone}
        ampmInClock={props.ampmInClock ?? true}
      />
    </LocalizedPickerProvider>
  );
};

