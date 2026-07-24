import { ControlType } from "@/types";
import { Box } from "@mui/material";
import { MuiTelInput } from "mui-tel-input";
import { ChangeEventHandler, useState } from "react";
import { useTranslation } from "react-i18next";

export const RenderPhoneNumber = ({
  control,
  isAnswer,
  onChange,
}: {
  control: ControlType;
  isAnswer?: boolean;
  onChange?: (e: string) => void;
}) => {
  const [value, setValue] = useState<string>(control?.value);
  const { t } = useTranslation();
  return (
    <Box
      className="my-2  "
      sx={{
        "& .MuiInputBase-root": {
          marginTop: "7px",
        },
        "& .MuiFormLabel-root": {
          left: "-11px",
        },
      }}
    >
      <MuiTelInput
        forceCallingCode
        label={
          <div>
            {t("templateCenter.questionnaire.controllerLabel.phoneNumber")}{" "}
            {control?.isRequired && <span className="requiredUI">*</span>}
          </div>
        }
        name="mobileNumber"
        fullWidth
        sx={{
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#131313",
            color: "#131313",
            borderRadius: "12px !important",
          },
        }}
        disabled={!isAnswer}
        defaultCountry="IN"
        value={value}
        onChange={(mobileNumber: string) => {
          const value = mobileNumber.replaceAll(" ", "");
          setValue(value);
          const pattern =
            /^(\+[0-9]{1,3}[-\s]?)?(\([0-9]{1,3}\)[-.\s]?)?([0-9]{1,4}[-.\s]?)?([0-9]{6,})$/;
          const error = !pattern.test(value);
          if (!error) {
            onChange?.(value);
          }
        }}
        // value={mobileNumber.value}

        inputProps={{
          maxLength: 20, // Set the maximum length here
        }}
      />
    </Box>
  );
};
