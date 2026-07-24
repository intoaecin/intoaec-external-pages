import FilterListIcon from "@mui/icons-material/FilterList";
import {
  Box,
  Divider,
  IconButton,
  type IconButtonProps,
  Popover,
  type PopoverProps,
  type SxProps,
  type Theme,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import AutocompleteComponent from "@/components_v2/Autocomplete";
import FilterApplyButton from "@/components_v2/FilterApplyButton";
import { filterStandardUnderlineFieldSx } from "./filterStandardFieldSx";

const FIELD_WRAPPER_SX = {
  width: "100%",
  minWidth: 0,
  "& .MuiAutocomplete-root": { width: "100%" },
  "& .MuiTextField-root": { width: "100%" },
  /** Matches project name / project type multi-selects (`FormControl` + `Select`) to text fields in the same menu. */
  "& .MuiFormControl-root": { width: "100%", minWidth: 0, maxWidth: "100%" },
} as const;

type FilterMenuAutocompleteCommon = {
  kind: "autocomplete";
  id: string;
  label: React.ReactNode;
  options: Array<{ value: string; label: string }>;
  disableSearch?: boolean;
  disableClearable?: boolean;
  showSelectedInList?: boolean;
  disabled?: boolean;
  /** Passed through to shared `Autocomplete` (filter row search). */
  placeholder?: string;
  disablePortal?: boolean;
  maxVisibleOptions?: number;
  /** Max chips shown before a "+N" overflow chip (multiselect only). Use `null` to show all selected chips. */
  maxVisibleTags?: number | null;
};

type FilterMenuAutocompleteSingleField = FilterMenuAutocompleteCommon & {
  multiselect?: false;
  value: string;
  onChange: (value: string | null) => void;
};

type FilterMenuAutocompleteMultiField = FilterMenuAutocompleteCommon & {
  multiselect: true;
  value: string[];
  onChange: (value: string[]) => void;
};

export type FilterMenuAutocompleteField =
  | FilterMenuAutocompleteSingleField
  | FilterMenuAutocompleteMultiField;

export type FilterMenuDateField = {
  kind: "date";
  id: string;
  label: React.ReactNode;
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  disabled?: boolean;
};

export type FilterMenuCustomField = {
  kind: "custom";
  id: string;
  /** When set, renders the control in the same standard underline row as autocomplete filters. */
  label?: React.ReactNode;
  render: () => React.ReactNode;
};

export type FilterMenuField =
  | FilterMenuAutocompleteField
  | FilterMenuDateField
  | FilterMenuCustomField;

export type FilterMenuProps = {
  /** Accessible name for the filter toggle. */
  ariaLabel: string;
  /** Visible trigger label; defaults to `common.filter`. */
  triggerLabel?: React.ReactNode;
  /** Declarative filter rows; each row uses the same layout and control sizing. */
  filters: FilterMenuField[];
  /** Commits the current filter field values (shared Apply control). */
  onApply: () => void;
  /** Optional content next to Apply (e.g. Clear filters). */
  footer?: React.ReactNode;
  /** When true, highlights the whole trigger to show committed / active filters. */
  applied?: boolean;
  paperSx?: SxProps<Theme>;
  iconButtonProps?: Partial<IconButtonProps>;
} & Pick<PopoverProps, "anchorOrigin" | "transformOrigin">;

const defaultAnchorOrigin: PopoverProps["anchorOrigin"] = {
  vertical: "bottom",
  horizontal: "right",
};

const defaultTransformOrigin: PopoverProps["transformOrigin"] = {
  vertical: "top",
  horizontal: "right",
};

function renderField(field: FilterMenuField) {
  if (field.kind === "custom") {
    return field.render();
  }

  if (field.kind === "autocomplete") {
    return (
      <AutocompleteComponent
        label={field.label}
        underline
        size="small"
        disableSearch={field.disableSearch}
        disableClearable={field.disableClearable}
        showSelectedInList={field.showSelectedInList}
        multiselect={field.multiselect}
        options={field.options}
        value={field.value}
        onChange={field.onChange}
        disabled={field.disabled}
        placeholder={field.placeholder}
        disablePortal={field.disablePortal}
        maxVisibleOptions={field.maxVisibleOptions}
        maxVisibleTags={
          field.multiselect
            ? field.maxVisibleTags === null
              ? undefined
              : field.maxVisibleTags ?? 1
            : undefined
        }
      />
    );
  }

  return (
    <DatePicker
      label={field.label}
      value={field.value}
      onChange={field.onChange}
      minDate={field.minDate}
      maxDate={field.maxDate}
      disabled={field.disabled}
      slotProps={{
        textField: {
          variant: "standard",
          size: "small",
          fullWidth: true,
          InputLabelProps: { shrink: true },
          sx: filterStandardUnderlineFieldSx,
        },
      }}
    />
  );
}

/**
 * Filter icon + popover: vertical filter fields, built-in Apply, optional `footer` (e.g. Clear).
 */
export default function FilterMenu({
  ariaLabel,
  triggerLabel,
  filters,
  onApply,
  footer,
  applied = false,
  paperSx,
  iconButtonProps,
  anchorOrigin = defaultAnchorOrigin,
  transformOrigin = defaultTransformOrigin,
}: FilterMenuProps) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const { sx: iconButtonSx, ...restIconButtonProps } = iconButtonProps ?? {};

  const handleOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const filterTrigger = (
    <IconButton
      {...restIconButtonProps}
      aria-label={ariaLabel}
      aria-expanded={open}
      aria-haspopup="true"
      size="small"
      onClick={handleOpen}
      sx={
        [
          {
            display: "inline-flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 0.5,
            px: 0.75,
            py: 0.5,
            borderRadius: 1,
            color: "text.primary",
          },
          iconButtonSx,
          applied
            ? (theme: Theme) => ({
                bgcolor: alpha(theme.palette.primary.main, 0.14),
                color: theme.palette.primary.dark,
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.22),
                },
              })
            : undefined,
        ] as SxProps<Theme>
      }
    >
      <FilterListIcon fontSize="small" />
      <Typography component="span" variant="body2" sx={{ lineHeight: 1 }}>
        {triggerLabel ?? t("common.filter")}
      </Typography>
    </IconButton>
  );

  return (
    <>
      {filterTrigger}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableScrollLock
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              maxWidth: "min(100vw - 24px, 360px)",
              minWidth: 280,
              px: 2,
              overflow: "visible",
              boxSizing: "border-box",
              ...paperSx,
            },
          },
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box
            sx={{
              pt: 3,
              pb: 1,
              display: "flex",
              flexDirection: "column",
              gap: 0,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: "100%",
              }}
            >
              {filters.map((field) => (
                <Box key={field.id} sx={FIELD_WRAPPER_SX}>
                  {renderField(field)}
                </Box>
              ))}
              <Divider
                role="presentation"
                sx={{
                  borderColor: "divider",
                  my: 0,
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "flex-end",
                alignItems: "center",
                columnGap: 1,
                rowGap: 0.75,
                pt: 1,
                width: "100%",
              }}
            >
              {footer}
              <FilterApplyButton
                onClick={async () => {
                  await onApply();
                  handleClose();
                }}
              />
            </Box>
          </Box>
        </LocalizationProvider>
      </Popover>
    </>
  );
}
