import { useState, type FC, type ReactNode } from "react";
import type { TextFieldProps } from "@mui/material";
import { TextField } from "@mui/material";
import { preventNegativeKeyDown } from "@/utils/numbers";

export type NumberInputBoxValue = number | "";

export interface NumberInputBoxProps {
  value: number | string | null | undefined;
  onChange: (value: NumberInputBoxValue) => void;
  /** When set, numeric values are clamped to this minimum. */
  min?: number;
  /** When set, numeric values are clamped to this maximum. */
  max?: number;
  /** Max digits before the decimal separator (e.g. 3 for 0–100). */
  maxIntegerDigits?: number;
  /** Max digits after the decimal separator (0 = integers only). */
  maxFractionDigits?: number;
  /** When true, the user can clear the field (Backspace); `onChange("")` is emitted. */
  allowEmpty?: boolean;
  placeholder?: string;
  error?: boolean;
  helperText?: ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: TextFieldProps["size"];
  variant?: TextFieldProps["variant"];
  sx?: TextFieldProps["sx"];
  endAdornment?: ReactNode;
  inputProps?: TextFieldProps["inputProps"];
  InputProps?: TextFieldProps["InputProps"];
  id?: string;
  name?: string;
  onKeyDown?: TextFieldProps["onKeyDown"];
  onEnter?: () => void;
  onBlur?: TextFieldProps["onBlur"];
  autoFocus?: boolean;
  "aria-label"?: string;
}

const buildPartialDecimalPattern = (
  maxIntegerDigits: number,
  maxFractionDigits: number
): RegExp =>
  new RegExp(
    maxFractionDigits > 0
      ? `^\\d{0,${maxIntegerDigits}}(\\.\\d{0,${maxFractionDigits}})?$`
      : `^\\d{0,${maxIntegerDigits}}$`
  );

const valueToDisplayString = (
  value: number | string | null | undefined
): string => {
  if (value === "" || value === null || value === undefined) {
    return "";
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }
  return String(value).trim();
};

const clampToBounds = (n: number, min?: number, max?: number): number => {
  let next = n;
  if (typeof min === "number" && Number.isFinite(min)) {
    next = Math.max(min, next);
  }
  if (typeof max === "number" && Number.isFinite(max)) {
    next = Math.min(max, next);
  }
  return next;
};

export const NumberInputBox: FC<NumberInputBoxProps> = ({
  value,
  onChange,
  min,
  max,
  maxIntegerDigits = 9,
  maxFractionDigits = 0,
  allowEmpty = true,
  placeholder,
  error = false,
  helperText,
  disabled = false,
  fullWidth = false,
  size = "small",
  variant = "outlined",
  sx,
  endAdornment,
  inputProps,
  InputProps,
  id,
  name,
  onKeyDown,
  onEnter,
  onBlur,
  autoFocus = false,
  "aria-label": ariaLabel,
}) => {
  const pattern = buildPartialDecimalPattern(maxIntegerDigits, maxFractionDigits);
  // The text being typed. `onChange` only carries a number, so without this a
  // half-typed decimal ("2.") would be redrawn as "2" and the next digit would
  // make "25". It's shown only while it still stands for the current value —
  // a value the parent clamped or changed takes over.
  const [draft, setDraft] = useState<string | null>(null);
  const valueText = valueToDisplayString(value);
  const isDraftCurrent =
    draft !== null &&
    (draft === ""
      ? valueText === ""
      : Number.parseFloat(draft) === Number.parseFloat(valueText));

  const handleChange: TextFieldProps["onChange"] = (e) => {
    const input = e.target.value.trim();

    if (input === "") {
      if (allowEmpty) {
        setDraft("");
        onChange("");
      }
      return;
    }

    if (!pattern.test(input)) {
      return;
    }

    const numeric = Number.parseFloat(input);
    if (!Number.isFinite(numeric)) {
      return;
    }

    setDraft(input);
    onChange(clampToBounds(numeric, min, max));
  };

  const mergedEndAdornment = endAdornment ?? InputProps?.endAdornment;

  return (
    <TextField
      id={id}
      name={name}
      aria-label={ariaLabel}
      value={isDraftCurrent ? draft : valueText}
      onChange={handleChange}
      onKeyDown={(e) => {
        preventNegativeKeyDown(e);
        onKeyDown?.(e);
        if (
          e.key === "Enter" &&
          !e.defaultPrevented &&
          !e.nativeEvent.isComposing
        ) {
          e.preventDefault();
          onEnter?.();
        }
      }}
      onBlur={(e) => {
        setDraft(null);
        onBlur?.(e);
      }}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      disabled={disabled}
      fullWidth={fullWidth}
      size={size}
      variant={variant}
      autoFocus={autoFocus}
      sx={sx}
      inputProps={inputProps}
      InputProps={{
        ...InputProps,
        ...(mergedEndAdornment
          ? { endAdornment: mergedEndAdornment }
          : {}),
      }}
    />
  );
};
