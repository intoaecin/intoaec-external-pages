import { ControlType } from "@/types";
import { Box, Chip, FormControl, Select, Stack } from "@mui/material";

import CancelIcon from "@/assets/icons/cancel-icon";
import CheckIcon from "@mui/icons-material/Check";
import { MenuItem } from "@mui/material";
import { useEffect, useState } from "react";

export const RenderDropDownMulti = ({
  control,
  isAnswer,
  onChange,
}: {
  control: ControlType;
  isAnswer?: boolean;
  onChange?: ((optionIndex: number, checked: boolean) => void) | undefined;
}) => {
   // Initialize multiSelectValues with the initially selected options
   const initialSelectedValues = control?.options
   ?.filter((val) => val.isSelected)
   .map((val) => val.value) || [];
  const [multiSelectValues, setMultiSelectValues] = useState<string[]>(initialSelectedValues);

  useEffect(() => {
    // Create a set of currently selected values for efficient comparison
    const currentSelectedValues = new Set(multiSelectValues);
  
    // Iterate over options and trigger onChange based on current values
    control?.options?.forEach((option, optionIndex) => {
      const isSelected = currentSelectedValues.has(option?.value);
  
      if (isSelected !== option.isSelected) {
        onChange?.(optionIndex, isSelected);
      }
    });
  }, [multiSelectValues, onChange, control?.options]);
  
  return (
    <FormControl className="mb-1" sx={{  width: 500 }}>
      <Select
        multiple
        MenuProps={{
          disableScrollLock: true,
        }}
        value={multiSelectValues}
        disabled={!isAnswer}
        onChange={(e) => {
          setMultiSelectValues(e?.target?.value as string[]);
        }}
        renderValue={(selected) => (
          <Stack gap={1} direction="row" flexWrap="wrap">
            {selected.map((value) => (
              <Chip
                key={value}
                label={value}
                onDelete={() =>
                  setMultiSelectValues(
                    multiSelectValues.filter((item) => item !== value)
                  )
                }
                deleteIcon={
                  <Box
                    onMouseDown={(event) => event.stopPropagation()}
                    sx={{
                      "& svg": {
                        width: "18px",
                        height: "18px",
                        borderRadius: "10px",
                        padding: "3px",
                        background: "#979797",
                      },
                    }}
                  >
                    <CancelIcon />
                  </Box>
                }
              />
            ))}
          </Stack>
        )}
      >
        {control?.options?.map(
          (value: any, valueIndex) =>
            !value?.isOther && (
              <MenuItem
                key={valueIndex}
                value={value?.value}
                sx={{ justifyContent: "space-between" }}
              >
                {value?.value}
                {multiSelectValues.includes(value?.value) ? (
                  <CheckIcon color="info" />
                ) : null}
              </MenuItem>
            )
        )}
      </Select>
    </FormControl>
  );
};
