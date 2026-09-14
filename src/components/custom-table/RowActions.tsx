import React, { useEffect, useRef } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import type { ActionItem, MenuState } from "./types";
import { ACTION_COLUMN_WIDTH } from "./tableStyles";

interface RowActionsProps {
  row: any;
  index: number;
  isHovered: boolean;
  isMenuActive: boolean;
  menuState: MenuState;
  actionItems: ActionItem[];
  inlineRowActions?: boolean;
  buttonStyle: React.CSSProperties;
  onOpen: (event: React.MouseEvent<HTMLElement>, rowIndex: number) => void;
  onClose: () => void;
  onRowAction?: (action: string, row: any) => void;
}

const actionContainerSx = {
  position: "absolute",
  top: "2px",
  right: 0,
  bottom: "2px",
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "stretch",
  width: ACTION_COLUMN_WIDTH,
} as const;

export const RowActions = React.memo(function RowActions({
  row,
  index,
  isHovered,
  isMenuActive,
  menuState,
  actionItems,
  inlineRowActions = false,
  buttonStyle,
  onOpen,
  onClose,
  onRowAction,
}: RowActionsProps) {
  const theme = useTheme();

  const isMenuOpen =
    Boolean(menuState.anchorEl) && menuState.rowIndex === index;
  const visibleActionItems = actionItems.filter(
    (item) => item.condition?.(row) !== false,
  );
  const isMenuBusy = visibleActionItems.some(
    (item) => item.loading?.(row) || false,
  );
  const wasMenuBusyRef = useRef(false);

  useEffect(() => {
    if (isMenuOpen && wasMenuBusyRef.current && !isMenuBusy) {
      onClose();
    }

    wasMenuBusyRef.current = isMenuBusy;
  }, [isMenuBusy, isMenuOpen, onClose]);

  if (visibleActionItems.length === 0) return null;

  if (!isHovered && !isMenuActive) return null;

  const iconButtonSx = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "common.white",
    "& .MuiSvgIcon-root": { color: "common.white" },
    "&:hover": { backgroundColor: theme.palette.primary.main },
  };

  if (inlineRowActions) {
    const item = visibleActionItems[0];
    const isLoading = item.loading?.(row) || false;
    const isDisabled = item.disabled?.(row) || false;

    return (
      <Box className="menu-button-container" sx={actionContainerSx}>
        <Tooltip title={item.label} arrow placement="left">
          <IconButton
            style={{
              ...buttonStyle,
              height: "100%",
              width: ACTION_COLUMN_WIDTH,
              minWidth: ACTION_COLUMN_WIDTH,
            }}
            sx={iconButtonSx}
            color="inherit"
            id={`row-action-button-${index}`}
            aria-label={item.label}
            disabled={isMenuBusy || isDisabled}
            onClick={(event) => {
              event.stopPropagation();
              if (!isMenuBusy && !isDisabled) {
                onRowAction?.(item.key, row);
              }
            }}
          >
            {isLoading ? <CircularProgress size={16} color="inherit" /> : item.icon}
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box className="menu-button-container" sx={actionContainerSx}>
      <IconButton
        style={{
          ...buttonStyle,
          height: "100%",
          width: ACTION_COLUMN_WIDTH,
          minWidth: ACTION_COLUMN_WIDTH,
        }}
        sx={iconButtonSx}
        color="inherit"
        id={`row-menu-button-${index}`}
        aria-haspopup="true"
        onClick={(event) => onOpen(event, index)}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        id={`row-menu-${index}`}
        anchorEl={menuState.anchorEl}
        open={isMenuOpen}
        onClose={() => {
          if (!isMenuBusy) {
            onClose();
          }
        }}
        keepMounted={false}
        disableScrollLock
      >
        {actionItems.map((item) => {
          const isLoading = item.loading?.(row) || false;
          const isVisible = item.condition?.(row) !== false;
          const isDisabled = item.disabled?.(row) || false;
          const disabledTooltip = item.disabledTooltip?.(row) || "";

          if (!isVisible) return null;

          const menuItem = (
            <MenuItem
              onClick={() => {
                if (!isMenuBusy && !isDisabled) {
                  onRowAction?.(item.key, row);
                  if (!item.keepMenuOpenOnClick) {
                    onClose();
                  }
                }
              }}
              disabled={isMenuBusy || isDisabled}
              sx={{
                opacity: (isMenuBusy || isDisabled) && !isLoading ? 0.45 : 1,
                cursor: isMenuBusy || isDisabled ? "not-allowed" : "pointer",
                gap: 1.5,
                ...(item.color && item.color !== "inherit"
                  ? { color: `${item.color}.main` }
                  : null),
              }}
            >
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "& svg": { display: "block" },
                }}
              >
                {isLoading ? <CircularProgress size={16} /> : item.icon}
              </Box>
              <Box component="span">
                {isLoading ? `${item.label}...` : item.label}
              </Box>
            </MenuItem>
          );

          return (
            <Tooltip
              key={item.key}
              title={isDisabled ? disabledTooltip : ""}
              arrow
              disableHoverListener={!isDisabled || !disabledTooltip}
              placement="left"
            >
              <Box component="span">{menuItem}</Box>
            </Tooltip>
          );
        })}
      </Menu>
    </Box>
  );
});
