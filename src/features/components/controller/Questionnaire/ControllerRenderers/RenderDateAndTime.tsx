import { DateTimeType } from "@/types";
import { Box } from "@mui/material";
import {
  DatePicker,
  DateTimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

export const RenderDateAndTime = ({
  control,
  isAnswer,
  onChange,
}: {
  control: DateTimeType;
  isAnswer?: boolean;
  onChange?: (value: any) => void;
}) => {
  const { t } = useTranslation();
  return (
    <Box
      className="my-2"
      sx={{
        display: "flex",
        justifyContent: !isAnswer ? "flex-start" : "center",
        alignItems: "center",
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {control?.options?.isTimeEnable ? (
          <DateTimePicker
            format={
              control?.options?.format &&
              (control?.options?.format).toUpperCase() +
                (control?.options?.isTimeEnable ? " h:mm A" : "")
            }
            onChange={(value) => {
              onChange?.(value);
            }}
            value={dayjs(new Date(control?.value))}
            disabled={!isAnswer}
            label={t(
              "templateCenter.questionnaire.controllerLabel.dateAndTime"
            )}
            shouldDisableDate={(day: any) => {
              if (control?.options?.dateRange === "BEFORE") {
                if (
                  day?.toDate()?.getTime() >
                  new Date(control?.options?.end as string).getTime()
                ) {
                  return true;
                } else {
                  return false;
                }
              } else if (control?.options?.dateRange === "AFTER") {
                if (
                  day?.toDate()?.getTime() <
                  new Date(control?.options?.start as string).getTime()
                ) {
                  return true;
                } else {
                  return false;
                }
              } else if (control?.options?.dateRange === "IN_BETWEEN") {
                if (
                  day?.toDate()?.getTime() >
                    new Date(control?.options?.start as string).getTime() &&
                  day?.toDate()?.getTime() <
                    new Date(control?.options?.end as string).getTime()
                ) {
                  return false;
                } else {
                  return true;
                }
              } else {
                return true;
              }
            }}
          />
        ) : (
          <DatePicker
            format={
              control?.options?.format &&
              (control?.options?.format).toUpperCase()
            }
            // shouldDisableTime={()=>true}
            label={t(
              "templateCenter.questionnaire.controllerLabel.dateAndTime"
            )}
            disabled={!isAnswer}
            onChange={(value: any) => {
              onChange?.(value);
            }}
            value={dayjs(new Date(control?.value))}
            shouldDisableDate={(day: any) => {
              if (control?.options?.dateRange === "BEFORE") {
                if (
                  day?.toDate()?.getTime() >
                  new Date(control?.options?.end as string).getTime()
                ) {
                  return true;
                } else {
                  return false;
                }
              } else if (control?.options?.dateRange === "AFTER") {
                if (
                  day?.toDate()?.getTime() <
                  new Date(control?.options?.start as string).getTime()
                ) {
                  return true;
                } else {
                  return false;
                }
              } else if (control?.options?.dateRange === "IN_BETWEEN") {
                if (
                  day?.toDate()?.getTime() >
                    new Date(control?.options?.start as string).getTime() &&
                  day?.toDate()?.getTime() <
                    new Date(control?.options?.end as string).getTime()
                ) {
                  return false;
                } else {
                  return true;
                }
              } else {
                return true;
              }
            }}
          />
        )}
      </LocalizationProvider>
    </Box>
  );
};
