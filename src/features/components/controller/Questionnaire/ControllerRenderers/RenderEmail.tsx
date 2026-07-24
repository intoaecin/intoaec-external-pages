import { emailPattern } from "@/lib/regex";
import { ControlType } from "@/types";
import { TextField } from "@mui/material";
import React, { ChangeEventHandler, useState } from "react";
import { useTranslation } from "react-i18next";

export const RenderEmail = ({
  isAnswer,
  onChange,
  control,
}: {
  isAnswer?: boolean;
  onChange?: (value: any) => void;
  control: ControlType;
}) => {
  const [error, setError] = useState(false);
  const [value, setValue] = useState(control?.value);

  const { t } = useTranslation();
  return (
    <TextField
      disabled={!isAnswer}
      fullWidth
      error={error}
      value={value}
      placeholder={t("leadCapture.enterYourEmail")}
      onChange={(e) => {
        setValue(e.target.value);
        if (emailPattern.test(e.target?.value)) {
          onChange?.(e?.target?.value);
          setError(false);
        } else {
          onChange?.(undefined);
          setError(true);
        }
      }}
      helperText={error ? "Please enter valid email" : ""}
    />
  );
};
