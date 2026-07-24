import { ControlType } from "@/types";
import { getAnswerTranslationKey } from "@/utils/helpers";
import { Checkbox } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

export const RenderCheckBox = ({
  isAnswer,
  onChange,
  control,
}: {
  isAnswer?: boolean;
  onChange?: ((control: ControlType) => void) | undefined;
  control: ControlType;
}) => {
  const { t } = useTranslation();
  return (
    <div>
      {control?.options?.map(
        (value: any, optionIndex) =>
          !value?.isOther && (
            <div key={optionIndex}>
              <Checkbox
                disabled={!isAnswer}
                checked={value?.isSelected}
                className="pl-0 mr-3"
                onChange={(e, c) => {
                  const newControl = {
                    ...control,
                    options: [
                      ...(control?.options?.slice(0, optionIndex) ??
                        ({} as any)),
                      { ...value, isSelected: c },
                      ...(control?.options?.slice(optionIndex + 1) ??
                        ({} as any)),
                    ],
                  };
                  onChange?.(newControl);
                }}
              />
              <span>
                {getAnswerTranslationKey(value?.value) === value?.value
                  ? value?.value
                  : t(
                      `questionnaire.answers.${getAnswerTranslationKey(
                        value?.value
                      )}`,
                      { defaultValue: value?.value }
                    )}
              </span>
            </div>
          )
      )}
    </div>
  );
};
