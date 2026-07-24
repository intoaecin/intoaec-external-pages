import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { InputAdornment } from "@mui/material";
import { ArrowDropDownIcon } from "@mui/x-date-pickers/icons";
import { CircularProgress, FormLabel, Stack, Typography } from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material";
import * as React from "react";
import {
  SearchDropDownStyledInput,
  SearchDropdownPopperComponent,
} from "./SearchDropDownComponents";
import { UIHighLightMatchComponent } from "./UIHighLightMatchComponent";
import { useTranslation } from "react-i18next";
import { formatToCamelCaseWithAmpersand } from "@/lib/helpers";

function GradientCircularProgress() {
  const t = useTheme();
  return (
    <React.Fragment>
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={t.palette.primary.dark} />
            <stop offset="100%" stopColor="#00c3c4" />
          </linearGradient>
        </defs>
      </svg>
      <CircularProgress
        size={20}
        sx={{ "svg circle": { stroke: "url(#my_gradient)" } }}
      />
    </React.Fragment>
  );
}

const getTranslatedLabel = (
  option: any,
  idKey: string,
  labelKey: string,
  t: any
) => {
  if (!option || !option[labelKey]) return "";

  let translationKey = "";
  let translatedValue = "";

  if (idKey === "productCategoryId") {
    translationKey = `myInventory.productCategory.${formatToCamelCaseWithAmpersand(
      option?.[labelKey]
    )}`;
  } else if (idKey === "productSubCategoryId") {
    translationKey = `myInventory.productSubCategory.${formatToCamelCaseWithAmpersand(
      option?.[labelKey]
    )}`;
  } else if (idKey === "serviceCategoryId") {
    translationKey = `myServices.serviceCategory.${formatToCamelCaseWithAmpersand(
      option?.[labelKey]
    )}`;
  } else if (idKey === "serviceSubCategoryId") {
    translationKey = `myServices.serviceSubCategory.${formatToCamelCaseWithAmpersand(
      option?.[labelKey]
    )}`;
  } else if (idKey === "categoryId") {
    translationKey = `boq.itemCategory.${formatToCamelCaseWithAmpersand(
      option?.[labelKey]
    )}`;
  } else if (idKey === "subCategoryId") {
    translationKey = `boq.itemSubCategory.${formatToCamelCaseWithAmpersand(
      option?.[labelKey]
    )}`;
  } else if (idKey === "typeOfWorkId") {
    translationKey = `boq.itemTypeOfWork.${formatToCamelCaseWithAmpersand(
      option?.[labelKey]
    )}`;
  } else {
    // If no specific translation rule, return the original value
    return option[labelKey];
  }

  // Get the translated value, and check if it's the same as the key
  // (which happens when no translation is found)
  translatedValue = t(translationKey, { defaultValue: option[labelKey] });

  // Check if translation exists (if the translated value is different from the key)
  // or if it doesn't start with the namespace (which indicates missing translation)
  if (
    translatedValue === translationKey ||
    translatedValue.startsWith("myInventory.") ||
    translatedValue.startsWith("myServices.") ||
    translatedValue.startsWith("boq.")
  ) {
    // No translation found, return original value
    return option[labelKey];
  }
  return translatedValue;
};

export function SingleSelectSearchDropDown({
  data,
  label,
  onChange,
  onAddNewItem,
  idKey,
  onChangeValue,
  labelKey,
  selectedValue: initialSelectedValue,
  disableAddNew,
  freeSolo,
  onFilteredOptionsChange,
  variant,
  isDisabled,
  disablePortal = true,
  isHideAddNewItem,
  updateLatestFetchedValue,
  showDropdownIcon = false,
  preview = false,
  isPreview = false,
}: {
  data: Array<LabelType>;
  label?: string;
  onChange?: (value: any) => any;
  onChangeValue?: (value: any) => any;
  onAddNewItem?: (value: string) => any;
  labelKey: string;
  idKey: string;
  selectedValue: any;
  disableAddNew?: boolean;
  freeSolo?: boolean;
  onFilteredOptionsChange?: (filtered: any) => void;
  variant?: "standard" | "outlined" | "filled";
  isDisabled?: boolean;
  isHideAddNewItem?: boolean;
  disablePortal?: boolean; // ✅ new prop
  popperSx?: object;
  updateLatestFetchedValue?: boolean;
  showDropdownIcon?: boolean;
  preview?: boolean;
  isPreview?: boolean;
}) {
  const filterOptions = createFilterOptions({
    matchFrom: "start",
    stringify: (option: LabelType) => option[labelKey],
  });
  const { t } = useTranslation();
  const [addItemLoading, setAddItemLoading] = React.useState(false);
  const [currentTextValue, setCurrentTextValue] = React.useState<string>();
  const ADD_NEW_ITEM_OPTION = {
    [idKey]: `add-new-item-${labelKey}`,
    [labelKey]: "",
  };
  const [selectedValue, setSelectedValue] =
    React.useState(initialSelectedValue);

  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    console.log(initialSelectedValue, "intialload");
    console.log(updateLatestFetchedValue, "updateLatestFetchedValue");
    if (updateLatestFetchedValue) {
      setSelectedValue(initialSelectedValue);
    }
  }, [initialSelectedValue]);
  const AddNewItemComponent = () => {
    return (
      <Stack
        onClick={async () => {
          if (currentTextValue && onAddNewItem) {
            setAddItemLoading(true);
            await onAddNewItem?.(currentTextValue)?.finally(() => {
              setAddItemLoading(false);
            });
          }
        }}
        direction={"row"}
        justifyContent={"space-between"}
        sx={{ cursor: "pointer" }}
        p={1}
        alignItems={"center"}
      >
        <Stack
          direction={"row"}
          justifyContent={"flex-start"}
          gap={2}
          sx={{ cursor: "pointer" }}
          alignItems={"center"}
        >
          <AddCircleOutlineIcon
            sx={{ color: "rgba(0, 0, 0, 0.6) !important" }}
          />
          <Typography sx={{ color: "rgba(0, 0, 0, 0.6) !important" }}>
            {t("common.addnew", { type: currentTextValue }) ||
              `Add ${currentTextValue} as new item`}
          </Typography>
        </Stack>
        {addItemLoading && <GradientCircularProgress />}
      </Stack>
    );
  };

  return (
    <React.Fragment>
      {/* <FormLabel sx={{ my: 1 }}>{label}</FormLabel> */}
      <Autocomplete
        disablePortal={disablePortal} // now dynamic
        PopperComponent={(props) => (
          <SearchDropdownPopperComponent
            {...props}
            sx={{
              zIndex: 1300,
              "& .MuiAutocomplete-listbox": {
                maxHeight: "220px",
                overflowY: "auto",
              },
            }}
          />
        )}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        freeSolo={freeSolo}
        disabled={isDisabled}
        value={selectedValue}
        onInputChange={(event, newInputValue) => {
          setCurrentTextValue(newInputValue);
          if (initialSelectedValue?.[labelKey] !== newInputValue) {
            // console.log(
            //   "va in singleselect",
            //   newInputValue,
            //   initialSelectedValue
            // );
            onChangeValue?.({ [labelKey]: newInputValue });
          }
        }}
        onChange={(event, newValue, reason) => {
          if (
            event.type === "keydown" &&
            ((event as React.KeyboardEvent).key === "Backspace" ||
              (event as React.KeyboardEvent).key === "Delete") &&
            reason === "removeOption"
          ) {
            return;
          }
          setSelectedValue(newValue);
          onChange?.(newValue);
          setOpen(false);
        }}
        filterOptions={(options, params) => {
          const filtered = filterOptions(options, params);
          // Always include ADD_NEW_ITEM_OPTION
          // setFilteredItems(filtered)
          onFilteredOptionsChange?.(filtered);
          if (
            !filtered.find(
              (option) => option[idKey] === ADD_NEW_ITEM_OPTION[idKey]
            ) &&
            filtered.some(
              (val) =>
                val?.[labelKey].toLowerCase() !==
                params.inputValue.toLowerCase()
            ) &&
            !!currentTextValue &&
            !disableAddNew
          ) {
            filtered.push(ADD_NEW_ITEM_OPTION);
          }

          return filtered;
        }}
        disableCloseOnSelect
        // disablePortal
        // PopperComponent={SearchDropdownPopperComponent}
        renderTags={() => null}
        noOptionsText={
          !currentTextValue || disableAddNew || isHideAddNewItem ? (
            <Box p={1}>
              <FormLabel>{t("common.noOptions")}</FormLabel>
            </Box>
          ) : (
            <AddNewItemComponent />
          )
        }
        renderOption={(props, option, { selected, inputValue }) => {
          const { key, ...optionProps } = props;

          if (option[idKey] === ADD_NEW_ITEM_OPTION[idKey]) {
            return <AddNewItemComponent key={option?.[idKey]} />;
          }

          const translatedText = getTranslatedLabel(option, idKey, labelKey, t);

          return (
            <li key={option?.[idKey]} {...optionProps}>
              <Stack
                p={0}
                direction={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Box
                  sx={(t) => ({
                    flexGrow: 1,
                    "& span": {
                      color: "#8b949e",
                      ...t.applyStyles("light", {
                        color: "#586069",
                      }),
                    },
                  })}
                >
                  {UIHighLightMatchComponent(translatedText, inputValue)}
                  <br />
                </Box>
              </Stack>
            </li>
          );
        }}
        options={[
          // ...(pendingValue.length !== 0 ? [SELECT_ALL_OPTION] : []),
          ...(Array.isArray(data) ? data : []),
          // ...(currentTextValue ? [ADD_NEW_ITEM_OPTION] : []),
        ].sort((a, b) => {
          // Display the selected labels first.
          if (a[idKey] === ADD_NEW_ITEM_OPTION[idKey]) return 1;
          if (b[idKey] === ADD_NEW_ITEM_OPTION[idKey]) return -1;
          return 1;
          // let ai = pendingValue.indexOf(a);
          // ai = ai === -1 ? pendingValue.length + data.indexOf(a) : ai;
          // let bi = pendingValue.indexOf(b);
          // bi = bi === -1 ? pendingValue.length + data.indexOf(b) : bi;
          // return ai - bi;
        })}
        // This determines what shows in the input field after selection
        getOptionLabel={(option) => {
          // Use the translated version of the label for display
          return getTranslatedLabel(option, idKey, labelKey, t);
        }}
        renderInput={(params) => (
          <SearchDropDownStyledInput
            ref={params.InputProps.ref}
            inputProps={{ ...params.inputProps }}
            InputProps={{
              ...params.InputProps,
              endAdornment: showDropdownIcon && !preview && !isPreview ? (
                <InputAdornment position="end">
                  <ArrowDropDownIcon />
                </InputAdornment>
              ) : null,
            }}
            variant={variant}
            label={label}
            placeholder={label}
          />
        )}
      />
    </React.Fragment>
  );
}
interface LabelType {
  [key: string]: string;
}
