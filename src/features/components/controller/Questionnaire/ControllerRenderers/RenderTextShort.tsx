import { ControlType } from "@/types";
import { TextField } from "@mui/material";
import { ChangeEventHandler } from "react";
import { useTranslation } from "react-i18next";

export const RenderTextShort = ({
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
      fullWidth
      value={control?.value}
      onChange={onChange}
      placeholder={t('common.typeYourAnswerHere')}
    />
  );
};
