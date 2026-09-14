import React from "react";
import {
  Box,
  IconButton,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { getLocalizationValue } from "@/lib/helpers";
import type { Column } from "./types";

interface EditableCellProps {
  column: Column;
  editValue: string;
  localizationValue: any;
  onEditValueChange: (value: string) => void;
  onComplete: () => void;
  onCancel: () => void;
}

export const EditableCell = React.memo(function EditableCell({
  column,
  editValue,
  localizationValue,
  onEditValueChange,
  onComplete,
  onCancel,
}: EditableCellProps) {
  if (column.datepicker) {
    return (
      <div onClick={(event) => event.stopPropagation()}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={dayjs(editValue)}
            onChange={(newValue) => {
              onEditValueChange(newValue ? newValue.format("YYYY-MM-DD") : "");
            }}
            slotProps={{
              textField: {
                size: "small",
                autoFocus: true,
                fullWidth: true,
                onKeyDown: (event) => {
                  if (event.key === "Enter") onComplete();
                  if (event.key === "Escape") onCancel();
                },
              },
              popper: {
                onClick: (event) => event.stopPropagation(),
                placement: "bottom-start",
                modifiers: [
                  { name: "flip", enabled: false },
                  {
                    name: "preventOverflow",
                    enabled: true,
                    options: { altAxis: true, tether: false },
                  },
                ],
              },
            }}
            format={
              localizationValue
                ? (getLocalizationValue(localizationValue, "DATE", "FORMAT") ??
                  "MM/DD/YYYY")
                : "MM/DD/YYYY"
            }
            onClose={onComplete}
          />
        </LocalizationProvider>
      </div>
    );
  }

  if (column.selectOptions) {
    return (
      <Select
        value={editValue}
        onChange={(event) => onEditValueChange(event.target.value)}
        onBlur={onComplete}
        autoFocus
        size="small"
        fullWidth
        sx={{ minWidth: 120 }}
      >
        {column.selectOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <TextField
        value={editValue}
        onChange={(event) => onEditValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onComplete();
          if (event.key === "Escape") onCancel();
        }}
        size="small"
        autoFocus
        fullWidth
        variant="standard"
      />
      <Box sx={{ display: "flex" }}>
        <IconButton size="small" onClick={onComplete} color="success">
          <CheckIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={onCancel} color="error">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
});
