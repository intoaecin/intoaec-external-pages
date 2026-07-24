import {
  Autocomplete,
  Box,
  Tooltip,
  Divider,
  Chip,
  type SxProps,
  type Theme,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { PlusIcon } from "intoaec-react-icons";
import React, { useState, useMemo } from "react";
import { Popper, type PopperProps } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { CircularProgress } from "@mui/material";
import { TruncatedText } from "./TruncatedText";

const EMPTY_SELECTED_OPTIONS: Array<{ label: string; value: string }> = [];

interface AutocompleteProps {
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  label?: React.ReactNode;
  required?: boolean;
  value?: string | string[];
  onChange?: (value: any) => void;
  isAddNewItem?: boolean;
  onAddItem?: (text: string) => void;
  onInputChange?: (value: string) => void;
  disableClearable?: boolean;
  disabled?: boolean;
  showSelectedInList?: boolean;
  addItemText?: string;
  onHandleFocus?: () => void;
  maxDisplayLength?: number;
  isLoading?: boolean;
  inputValue?: string;
  disablePortal?: boolean;
  size?: "small" | "medium";
  underline?: boolean;
  className?: string;
  mb2?: boolean;
  multiselect?: boolean;
  /** When set, only this many chips are shown; remaining selections appear as "+N". */
  maxVisibleTags?: number;
  maxVisibleOptions?: number;
  optionHeight?: number;
  disableSearch?: boolean;
  /** Auto-focus the inner input on mount (useful for inline-edit cells). */
  autoFocus?: boolean;
  /** Open the dropdown as soon as the input gains focus. */
  openOnFocus?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  /** Merged after default multiselect layout styles when `multiselect` is true. */
  sx?: SxProps<Theme>;
  /** Do not notify external search state when MUI resets input after selecting a value. */
  ignoreResetInputChange?: boolean;
  placement?: PopperProps["placement"];
}

const AutocompleteComponent: React.FC<AutocompleteProps> = ({
  options,
  placeholder,
  label,
  required,
  value,
  onChange,
  isAddNewItem,
  onInputChange,
  onAddItem,
  disableClearable = false,
  disabled = false,
  showSelectedInList = false,
  addItemText = "",
  onHandleFocus,
  maxDisplayLength,
  isLoading = false,
  inputValue: externalInputValue,
  disablePortal = false,
  size = "medium",
  underline = false,
  className = "",
  mb2 = false,
  multiselect = false,
  maxVisibleTags,
  maxVisibleOptions,
  optionHeight = 40,
  disableSearch = false,
  autoFocus = false,
  openOnFocus = false,
  error = false,
  helperText,
  sx: sxProp,
  ignoreResetInputChange = false,
  placement,
}) => {
  const [internalInputValue, setInternalInputValue] = React.useState("");
  const inputValue = externalInputValue !== undefined ? externalInputValue : internalInputValue;
  const setInputValue = externalInputValue !== undefined ? (val: string) => onInputChange?.(val) : setInternalInputValue;
  const [open, setOpen] = useState<boolean>(false);

  const { t } = useTranslation();

  // Find the selected option based on value prop
  const selectedValues = Array.isArray(value) ? value : [];
  const selectedOption = useMemo(() => {
    if (multiselect) {
      if (selectedValues.length === 0) {
        return EMPTY_SELECTED_OPTIONS;
      }
      return options.filter((option) => selectedValues.includes(option.value));
    }
    return options.find((option) => option.value === value) || null;
  }, [multiselect, options, selectedValues, value]);
  const singleSelectedOption = !Array.isArray(selectedOption) ? selectedOption : null;

  // Filter options based on showSelectedInList prop
  const baseFilteredOptions = showSelectedInList
    ? options
    : multiselect
      ? options.filter((option) => !selectedValues.includes(option.value))
      : options.filter((option) => option.value !== value);

  // Add "Add new item" option to the list if enabled and there's input
  const filteredOptions = useMemo(() => {
    if (isAddNewItem && inputValue.trim()) {
      // Check if input doesn't exactly match any existing option
      const exactMatch = baseFilteredOptions.some(
        (option) => option.label.toLowerCase() === inputValue.trim().toLowerCase()
      );

      // Only show "Add new item" if there's no exact match
      if (!exactMatch) {
        return [
          ...baseFilteredOptions,
          {
            label: `${addItemText || t("common.addNewItem")}: "${inputValue.trim()}"`,
            value: "__ADD_NEW_ITEM__",
          },
        ];
      }
    }
    return baseFilteredOptions;
  }, [baseFilteredOptions, isAddNewItem, inputValue, addItemText, t]);

  const handleAddNewItem = () => {
    setOpen(false);
    if (inputValue.trim()) {
      onAddItem?.(inputValue.trim());
      setInputValue("");
      if (externalInputValue === undefined) {
        onInputChange?.("");
      }
    }
  };

  const listboxMaxHeight =
    maxVisibleOptions && maxVisibleOptions > 0
      ? maxVisibleOptions * optionHeight
      : undefined;

  const compactMultiselectTags = multiselect && maxVisibleTags != null;
  const hideCompactInput =
    compactMultiselectTags && selectedValues.length > 0;

  const multiselectRootSx: SxProps<Theme> | undefined = multiselect
    ? {
        ...(compactMultiselectTags ? {} : { maxHeight: 160 }),
        maxWidth: "100%",
        "& .MuiAutocomplete-inputRoot": {
          display: "flex",
          ...(compactMultiselectTags
            ? {
                flexWrap: "nowrap",
                alignItems: "center",
                overflow: "hidden",
              }
            : {
                maxHeight: 120,
                flexWrap: "wrap",
              }),
          gap: "6px",
          "& .MuiInputBase-input": {
            fontSize: "0.75rem",
            minWidth: 0,
            ...(hideCompactInput
              ? {
                  width: 0,
                  flex: "0 0 0",
                  padding: 0,
                  opacity: 0,
                }
              : compactMultiselectTags
                ? {
                    width: 0,
                    flex: "1 1 0",
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }
                : {
                    width: "auto",
                  }),
          },
          "& .MuiAutocomplete-option": {
            fontSize: "0.75rem",
          },
        },
      }
    : undefined;

  const multiselectChipSx: SxProps<Theme> = {
    maxWidth: "100%",
    flexShrink: 1,
    minWidth: 0,
    height: 24,
    borderRadius: "12px",
    fontSize: "0.75rem",
    m: 0,
    "& .MuiChip-label": {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      px: 1,
      textTransform: "none",
      display: "block",
      minWidth: 0,
    },
    "& .MuiChip-deleteIcon": {
      fontSize: 16,
      color: "text.secondary",
      "&:hover": {
        color: "text.primary",
      },
    },
  };

  const overflowChipSx: SxProps<Theme> = {
    flexShrink: 0,
    height: 24,
    borderRadius: "12px",
    fontSize: "0.75rem",
    m: 0,
    "& .MuiChip-label": {
      px: 1,
      fontWeight: 500,
    },
  };

  const renderCompactChipLabel = (label: string) =>
    maxDisplayLength ? (
      <TruncatedText text={label} limit={maxDisplayLength} />
    ) : (
      label
    );

  const CustomPopper = React.useCallback(
    (props: any) => (
      <Popper
        {...props}
        placement={placement || "bottom-start"}
        popperOptions={{
          ...props?.popperOptions,
          placement: placement || "bottom-start",
          modifiers: [
            ...(props?.popperOptions?.modifiers || []),
            { name: "preventOverflow", options: { rootBoundary: "viewport", padding: 8 } },
          ],
        }}
      />
    ),
    [placement],
  );

  return (
    <Autocomplete
      size={size}
      className={`${className} ${mb2 ? "mb-2" : ""}`.trim()}
      sx={
        multiselectRootSx
          ? ([multiselectRootSx, ...(sxProp ? [sxProp] : [])] as SxProps<Theme>)
          : sxProp
      }
      disablePortal={disablePortal}
      disabled={disabled}
      multiple={multiselect}
      disableCloseOnSelect={multiselect}
      openOnFocus={openOnFocus}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={selectedOption}
      inputValue={inputValue}
      options={filteredOptions}
      getOptionLabel={(option) => {
        if (option?.value === "__ADD_NEW_ITEM__") {
          return option.label;
        }
        return option?.label || "";
      }}
      renderOption={(props, option) => {
        if (option.value === "__ADD_NEW_ITEM__") {
          return (
            <Box key="__ADD_NEW_ITEM__">
              <Divider sx={{ my: 0.5 }} />
              <Box
                {...props}
                key="__ADD_NEW_ITEM__"
                component="li"
                sx={{
                  px: 2,
                  py: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  borderRadius: 1,
                  mx: 0.5,
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "action.hover",
                    "& .icon-box": {
                      bgcolor: "primary.main",
                      transform: "scale(1.1)",
                      "& svg": { fill: "#fff" },
                    },
                  },
                }}
              >
                <Box
                  className="icon-box"
                  sx={(theme) => ({
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: "1.5px solid",
                    borderColor: "primary.main",
                    bgcolor: theme.palette.mode === "dark"
                      ? "rgba(144, 202, 249, 0.16)"
                      : "rgba(25, 118, 210, 0.08)",
                    transition: "all 0.2s",
                    "& svg": { fill: theme.palette.primary.main },
                  })}
                >
                  <PlusIcon width="14px" height="14px" />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, flex: 1 }}>
                  <Box component="span" sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                    {addItemText || t("common.addNewItem")}
                  </Box>
                  <Box component="span" sx={{ fontSize: "0.75rem", color: "text.secondary", fontStyle: "italic" }}>
                    "{inputValue.trim()}"
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        }
        return (
          <Box
            component="li"
            {...props}
            key={option.value || option.label}
            sx={{ fontSize: "0.875rem" }}
          >
            <TruncatedText text={option.label} limit={maxDisplayLength || 25} />
          </Box>
        );
      }}
      isOptionEqualToValue={(option, value) => {
        if (!option || !value) return false;
        return option.value === value.value;
      }}
      renderInput={(params) => (
        <Tooltip
          title={
            singleSelectedOption?.label &&
              maxDisplayLength &&
              singleSelectedOption.label.length > maxDisplayLength
              ? singleSelectedOption.label
              : null
          }
        >
          <Box sx={{ position: "relative" }}>
            <TextField
              {...params}
              size={size}
              variant={underline ? "standard" : "outlined"}
              label={label}
              required={required}
              placeholder={
                multiselect && selectedValues.length > 0 ? "" : placeholder
              }
              autoFocus={autoFocus}
              error={error}
              helperText={helperText}
              sx={{
                "& .MuiInput-underline.Mui-disabled:before": {
                  borderBottomStyle: "solid",
                },
              }}
              inputProps={{
                ...params.inputProps,
                readOnly: disableSearch,
              }}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isLoading && (
                      <CircularProgress
                        size={20}
                        style={{
                          position: "absolute",
                          right: 10,
                          transform: "translateY(-50%)",
                        }}
                        sx={{ color: "grey.500" }}
                      />
                    )}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          </Box>
        </Tooltip>
      )}
      ListboxProps={{
        onWheel: (event) => {
          event.stopPropagation();
        },
        onTouchMove: (event) => {
          event.stopPropagation();
        },
        style: {
          ...(listboxMaxHeight
            ? { maxHeight: listboxMaxHeight, overflowY: "auto" }
            : {}),
          overscrollBehavior: "contain",
        },
      }}
      renderTags={
        multiselect
          ? (selected, getTagProps) => {
              const tagContainerSx = compactMultiselectTags
                ? {
                    display: "flex",
                    flexWrap: "nowrap" as const,
                    alignItems: "center",
                    gap: "2px",
                    overflow: "hidden",
                    flex: 1,
                    minWidth: 0,
                  }
                : {
                    display: "flex",
                    flexWrap: "wrap" as const,
                    maxHeight: 50,
                    overflowY: "auto" as const,
                    alignItems: "center",
                    gap: "2px",
                  };

              if (compactMultiselectTags) {
                const visibleItems = selected.slice(0, maxVisibleTags);
                const hiddenItems = selected.slice(maxVisibleTags);
                const hiddenCount = hiddenItems.length;

                return (
                  <Box sx={tagContainerSx}>
                    {visibleItems.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          {...tagProps}
                          size="small"
                          label={renderCompactChipLabel(option.label)}
                          sx={multiselectChipSx}
                        />
                      );
                    })}
                    {hiddenCount > 0 ? (
                      <Tooltip
                        title={hiddenItems.map((item) => item.label).join(", ")}
                      >
                        <Chip
                          key="selected-overflow"
                          size="small"
                          label={`+${hiddenCount}`}
                          sx={overflowChipSx}
                        />
                      </Tooltip>
                    ) : null}
                  </Box>
                );
              }

              return (
                <Box sx={tagContainerSx}>
                  {selected.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.value}
                      size="small"
                      label={renderCompactChipLabel(option.label)}
                      sx={multiselectChipSx}
                    />
                  ))}
                </Box>
              );
            }
          : undefined
      }
      onChange={(event, option) => {
        if (multiselect) {
          const selectedOptions = (option as Array<{ label: string; value: string }>) || [];
          if (selectedOptions.some((selected) => selected?.value === "__ADD_NEW_ITEM__")) {
            handleAddNewItem();
            return;
          }
          onChange?.(selectedOptions.map((selected) => selected.value));
          setInputValue("");
        } else {
          const selectedOptionValue = option as { label: string; value: string } | null;
          if (selectedOptionValue?.value === "__ADD_NEW_ITEM__") {
            handleAddNewItem();
          } else {
            onChange?.(selectedOptionValue ? selectedOptionValue.value : null);
          }
        }
      }}
      onInputChange={(event, newInputValue, reason) => {
        if (disableSearch && reason === "input") {
          return;
        }
        if (multiselect && reason === "reset") {
          return;
        }
        if (ignoreResetInputChange && reason === "reset") {
          if (externalInputValue === undefined) {
            setInternalInputValue(newInputValue);
          }
          return;
        }
        setInputValue(newInputValue);
        onInputChange?.(newInputValue);
      }}
      filterOptions={disableSearch ? (opts) => opts : undefined}
      PopperComponent={CustomPopper}
      popupIcon={
        !isLoading && !disabled ? (
          <ChevronDown
            size={16}
            style={{ color: '#64748B' }}
          />
        ) : null
      }
      componentsProps={{
        popper: {
          placement: placement || "bottom-start",
        },
        paper: {
          elevation: 8,
          style: {
            marginTop: (placement || "bottom").startsWith("top") ? 0 : 8,
            marginBottom: (placement || "bottom").startsWith("top") ? 8 : 0,
            width: "100%",
            boxSizing: "border-box",
            minWidth: 0,
            overflowY: "auto",
          },
        },
        popupIndicator: {
          title: "",
        },
      }}
      noOptionsText={
        isAddNewItem && inputValue ? ( // Only show "Add new item" if there's input
          <div
            style={{
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onClick={handleAddNewItem}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "14px",
              }}
            >
              <div
                style={{
                  border: "1px solid grey",
                  borderRadius: "50%",
                  padding: "1px",
                  display: "flex",
                }}
              >
                <PlusIcon width={"13px"} height={"13px"} fill="grey" />
              </div>{" "}
              {addItemText ? addItemText : t("common.addNewItem")}
            </span>
          </div>
        ) : (
          t("common.noOptions")
        )
      }
      disableClearable={disableClearable}
      onFocus={() => {
        onHandleFocus?.();
      }}
    />
  );
};

export default AutocompleteComponent;
