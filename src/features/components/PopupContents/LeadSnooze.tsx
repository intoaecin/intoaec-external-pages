import { useOrganizationLocalization } from "@/features/hooks/useOrganizationLocalization";
import { getLocalizationValue } from "@/lib/helpers";
import {
  DialogContent,
  DialogTitle,
  Divider,
  FormHelperText,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

export const LeadSnooze = ({
  snoozeDate,
  count,
  onChange,
  onReasonChange,
}: {
  snoozeDate: number | null;
  count: number;
  onChange: (e: any) => void;
  onReasonChange?: (e: any) => void;
}) => {
  const { localizationLoading, localizationValue, refetch } =
    useOrganizationLocalization();
  const { t } = useTranslation();
  return (
    <>
      <DialogTitle id="alert-dialog-title" className="d-inline-block mb-2 mt-1">
        {count == 1 ? (
          <>
            <span className="underline-on-hover">
              {t("leadManager.SnoozeLead")}
            </span>
          </>
        ) : (
          <>
            <span>{`${t("modal.areYouSure")} ${t(
              "leadManager.Snooze"
            )} `}</span>
            <span
              style={{
                color: "#109CF1",
              }}
            >
              {count}
            </span>
            <span>{` ${t("leadManager.leads")}?`}</span>
          </>
        )}
      </DialogTitle>
      <Divider />
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            className="my-2"
            slotProps={{
              textField: {
                fullWidth: true,
                helperText: "",
                required: true,
              },
              popper: {
                sx: {
                  zIndex: (theme) => theme.zIndex.modal + 2,
                },
              },
              dialog: {
                sx: {
                  zIndex: (theme) => theme.zIndex.modal + 2,
                },
              },
            }}
            format={
              (localizationValue &&
                getLocalizationValue(localizationValue, "DATE", "FORMAT")) ??
              undefined
            }
            minDate={dayjs() as any}
            value={snoozeDate ? new Date(snoozeDate) : null}
            onChange={(date) => {
              if (date) {
                // Calculate the end of the day timestamp
                const endDateTimestamp = dayjs(date).endOf("day").valueOf();
                onChange(endDateTimestamp);
              }
            }}
            label={t("modal.chooseADate")}
          />
        </LocalizationProvider>

        <TextField
          label={t("common.reason")}
          name="projectDescription"
          multiline
          rows={4}
          onChange={(e) => {
            onReasonChange?.(e.target.value);
          }}
          fullWidth
        />
        {/* <FormHelperText style={{ color: "red" }}>
          Note: Maximum character limit is 250.
        </FormHelperText> */}
      </DialogContent>
    </>
  );
};
