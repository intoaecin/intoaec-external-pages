import { TextField } from "@mui/material";
import { autocompleteClasses } from "@mui/material/Autocomplete";
import Popper from "@mui/material/Popper";
import InputBase from "@mui/material/InputBase";
import { styled } from "@mui/material/styles";
export interface SearchDropDownPopperComponentProps {
  anchorEl?: any;
  disablePortal?: boolean;
  open: boolean;
  sx?: any;
}

export const StyledSearchDropdownPopper = styled(Popper)(({ theme }) => ({
  [`& .${autocompleteClasses.paper}`]: {
    boxShadow: "",
    margin: 0,
    color: "inherit",
    fontSize: 13,
    padding: 0,
    borderRadius: 10,
  },
  [`& .${autocompleteClasses.listbox}`]: {
    backgroundColor: theme.palette.mode === "light" ? "#fff" : "#1c2128",
    padding: 0,
    [`& .${autocompleteClasses.option}`]: {
      minHeight: "auto",
      alignItems: "flex-start",
      padding: 8,
      borderBottom: `1px solid  ${
        theme.palette.mode === "light" ? " #eaecef" : "#30363d"
      }`,
      '&[aria-selected="true"]': {
        backgroundColor: "transparent",
      },
      [`&.${autocompleteClasses.focused}, &.${autocompleteClasses.focused}[aria-selected="true"]`]:
        {
          backgroundColor: theme.palette.action.hover,
        },
    },
  },
  [`&.${autocompleteClasses.popperDisablePortal}`]: {
    position: "absolute",
  },
  [`& .${autocompleteClasses.noOptions}`]: {
    padding: 0,
  },
}));

export function SearchDropdownPopperComponent(
  props: SearchDropDownPopperComponentProps
) {
  const { disablePortal, anchorEl, open, ...other } = props;
  return (
    <StyledSearchDropdownPopper
      {...other}
      anchorEl={anchorEl}
      disablePortal={disablePortal}
      open={open}
      placement="bottom-start"
      modifiers={[
        {
          name: "offset",
          options: {
            offset: [0, 6],
          },
        },
      ]}
    />
  );
}

export const SearchDropDownStyledInput = styled(TextField)(({ theme }) => ({
  width: "100%",

  ".MuiOutlinedInput-root": {
    borderRadius: 8,
    backgroundColor: theme.palette.mode === "light" ? "#fff" : "#0d1117",
    padding: 6,
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    // border: `1px solid #ddd`,
    fontSize: 14,
    "&:focus": {
      // border: "0px",
      boxShadow: `0px 0px 0px 3px ${
        theme.palette.mode === "light"
          ? theme.palette.primary.light
          : "rgb(12, 45, 107)"
      }`,
      borderColor:
        theme.palette.mode === "light" ? theme.palette.primary.main : "#388bfd",
    },
    outline: "none",
  },
}));
