import { ControlType } from "@/types";
import { TextField } from "@mui/material";
import { ChangeEventHandler } from "react";
import { useTranslation } from "react-i18next";

export const RenderTextLong = ({
  isAnswer,
  onChange,
  control,
}: {
  isAnswer?: boolean;
  onChange?:
    | ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
    | undefined;
  control: ControlType;
}) => {
  const { t } = useTranslation();
  return (
    <TextField
      disabled={!isAnswer}
      rows={4}
      maxRows={10}
      fullWidth
      onChange={onChange}
      multiline
      value={control?.value}
      placeholder={t("common.typeYourAnswerHere")}
    />
  );
};
