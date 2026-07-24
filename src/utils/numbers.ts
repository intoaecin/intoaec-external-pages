import type { KeyboardEvent } from "react";

export const roundNumber = (value: any, precision: number = 2): number => {
  try {
    const number = Number(
      typeof value === "string" ? value.replace(/[^0-9.-]+/g, "") : value
    );

    if (isNaN(number) || !isFinite(number)) {
      return 0;
    }

    return Math.round(number * Math.pow(10, precision)) / Math.pow(10, precision);
  } catch {
    return value;
  }
};

/**
 * Parses a numeric input string. Returns null for empty or invalid input so
 * callers can treat "cleared" separately from 0.
 */
export function parseNumericInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
}

/**
 * Formats a numeric value for display in an input. Returns empty string for
 * null/undefined so the field can be fully cleared.
 */
export function formatNumericForInput(
  value: number | null | undefined
): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

/**
 * Parses a numeric input string and clamps negative values to 0.
 * Returns null for empty or invalid input so callers can distinguish "cleared".
 */
export function parseNonNegativeInput(raw: string): number | null {
  const parsed = parseNumericInput(raw);
  if (parsed === null) return null;
  return parsed < 0 ? 0 : parsed;
}

/**
 * Prevents typing of minus keys so inputs cannot become negative via keyboard.
 */
export function preventNegativeKeyDown(
  event: KeyboardEvent<HTMLElement>,
): void {
  if (event.key === "-" || event.key === "Subtract") {
    event.preventDefault();
  }
}
