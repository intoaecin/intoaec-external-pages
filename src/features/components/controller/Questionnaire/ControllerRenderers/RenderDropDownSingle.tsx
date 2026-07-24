import { ControlType } from "@/types";
import { MenuItem, TextField } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

export const RenderDropDownSingle = ({
  control,
  isAnswer,
  onChange,
}: {
  control: ControlType;
  isAnswer?: boolean;
  onChange?:
    | ((
        event: React.MouseEvent<HTMLLIElement, MouseEvent>,
        value: any,
        optionIndex: number
      ) => void)
    | undefined;
}) => {
  const selectedOption = control?.options?.find(
    (option) => option.isSelected && !option?.isOther
  );
  const { t } = useTranslation();

  return (
    <div className="mb-2">
      <TextField
        sx={{ "& .MuiSelect-select ": { padding: "10px 5px " } }}
        select
        fullWidth
        disabled={!isAnswer}
        SelectProps={{
          MenuProps: {
            disableScrollLock: true,
          },
        }}
        value={selectedOption ? selectedOption?.value : "Select"}
      >
        {" "}
        <MenuItem disabled value={"Select"}>
          {t("common.select")}
        </MenuItem>
        {control?.options?.map(
          (value: any, valueIndex) =>
            !value?.isOther && (
              <MenuItem
                onClick={(e) => {
                  onChange?.(e, true, valueIndex);
                }}
                selected={value?.isSelected}
                key={valueIndex}
                value={value?.value}
              >
                {value?.value}
              </MenuItem>
            )
        )}
      </TextField>
    </div>
  );
};
