import {
  Box,
  ListItemIcon,
  ListItemText,
  Menu,
  type MenuProps,
  MenuItem,
  type SxProps,
  type Theme,
  Tooltip,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

const MenuItemComponent = ({
  value,
  costRate,
  onClick,
}: {
  value: any;
  costRate: string;
  onClick: (value: any) => void;
}) => {
  const isInteractiveOnly = value?.text === "" || value?.text == null;
  const content = (
    <MenuItem
      disableRipple
      key={value.text}
      style={{ ...value?.style }}
      disabled={
        value?.disabled === true ||
        (value?.key === "convertExpense" &&
          (costRate === "0" || costRate === null))
      }
      onClick={(event) => {
        if (
          value?.disabled === true ||
          (value?.key === "convertExpense" &&
            (costRate === "0" || costRate === null)) ||
          value?.key === "expenseAlreadyConverted"
        ) {
          return;
        }
        if (typeof value?.onClick === "function") {
          value.onClick(event);
          if (event.isPropagationStopped()) {
            return;
          }
        }
        if (isInteractiveOnly) {
          return;
        }
        onClick(value);
      }}
    >
      <ListItemIcon
        sx={
          isInteractiveOnly
            ? { minWidth: "unset", width: "100%", mr: 0 }
            : undefined
        }
      >
        {value.icon}
      </ListItemIcon>
      {!isInteractiveOnly ? <ListItemText>{value.text}</ListItemText> : null}
    </MenuItem>
  );

  if (value.tooltip) {
    return (
      <Tooltip title={value.tooltip} arrow placement="left">
        <span>{content}</span>
      </Tooltip>
    );
  }

  return content;
};

export const UIDropDown = ({
  data,
  dropdownStyle,
  anchorEl,
  onClose,
  open,
  onClick,
  costRate,
  anchorOrigin,
  transformOrigin,
}: {
  dropdownStyle?: SxProps<Theme>;
  data: any[] | (() => any[]);
  anchorEl: any;
  open: boolean;
  onClose: () => void;
  onClick: (value: any) => void;
  costRate?: string;
  /** When set (e.g. Kanban card trigger), menu anchors to the icon instead of datagrid `left` hacks */
  anchorOrigin?: MenuProps["anchorOrigin"];
  transformOrigin?: MenuProps["transformOrigin"];
}) => {
  const { t } = useTranslation();
  const dataArray = typeof data === "function" ? data() : data;
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      disableScrollLock={true}
      disableAutoFocus
      disableEnforceFocus
      sx={dropdownStyle}
      {...(anchorOrigin != null && transformOrigin != null
        ? { anchorOrigin, transformOrigin }
        : {})}
    >
      {dataArray.map((value, index) => {
        if (
          value?.key === "convertExpense" &&
          (!costRate || costRate === "0")
        ) {
          return (
            <Box key={index}>
              <Tooltip title={t("tooltips.costRateRequired")} arrow>
                <span style={{ display: "block", cursor: "not-allowed" }}>
                  <MenuItemComponent
                    value={value}
                    costRate={costRate || "0"}
                    onClick={onClick}
                  />
                </span>
              </Tooltip>
            </Box>
          );
        }
        return (
          <MenuItemComponent
            key={index}
            value={value}
            costRate={costRate || "0"}
            onClick={onClick}
          />
        );
      })}
    </Menu>
  );
};
