import { ControlType } from "@/types";
import { getAnswerTranslationKey } from "@/utils/helpers";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";

export const RenderRadio = ({
  control,
  isAnswer,
  onChange,
}: {
  control: ControlType;
  isAnswer?: boolean;
  onChange?: ((control: ControlType) => void) | undefined;
}) => {
  const { t } = useTranslation();
  return (
    <div>
      <RadioGroup
        aria-labelledby="radio-buttons-group"
        name="controlled-radio-buttons-group"
        // value={value}
      >
        {control?.options?.map(
          (value: any, optionIndex) =>
            !value?.isOther && (
              <FormControlLabel
                key={optionIndex}
                disabled={!isAnswer}
                value={value?.value}
                onChange={(e, c) => {
                  const newControl = {
                    ...control,
                    options: control?.options?.map(
                      (currentOption, currentOptionIndex) => {
                        if (currentOptionIndex == optionIndex) {
                          return {
                            ...currentOption,
                            isSelected: c,
                          };
                        } else {
                          return {
                            ...currentOption,
                            isSelected: false,
                          };
                        }
                      }
                    ),
                  };
                  onChange?.(newControl);
                }}
                checked={value?.isSelected}
                control={<Radio />}
                label={
                  getAnswerTranslationKey(value?.value) === value?.value
                    ? value?.value
                    : t(
                        `questionnaire.answers.${getAnswerTranslationKey(
                          value?.value
                        )}`,
                        { defaultValue: value?.value }
                      )
                }
              />
            )
        )}
      </RadioGroup>
    </div>
  );
};
