import React from "react";
import { TextField, TextFieldProps } from "@mui/material";

interface NumberInputFieldProps extends Omit<TextFieldProps, "onChange"> {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  minValue?: number;
  width?: string | number;
  disabled?: boolean;
  placeholder?: string;
}

const NumberInputField: React.FC<NumberInputFieldProps> = ({
  value,
  onChange,
  name,
  minValue = 0,
  width = "100%",
  disabled = false,
  placeholder = "",
  ...props
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;

    if (e.key === "-") {
      e.preventDefault();
      return;
    }

    if (
      /^[0-9]$/.test(e.key) ||
      ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
    ) {
      return;
    }

    e.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (newValue === "") {
      onChange(e);
      return;
    }

    const numericValue = parseFloat(newValue);

    if (!isNaN(numericValue) && numericValue >= minValue) {
      onChange(e);
    }
  };

  return (
    <TextField
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      name={name}
      disabled={disabled}
      type="number"
      inputProps={{
        min: minValue,
        "aria-label": "number-input",
      }}
      placeholder={placeholder}
      {...props}
    />
  );
};

export default NumberInputField;
