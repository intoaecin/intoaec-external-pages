"use client";

import React, { useEffect } from "react";
import { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";
import {
  useColorDropdownMenu,
  useColorDropdownMenuState,
} from "@udecode/plate-font";

import { DEFAULT_COLORS, DEFAULT_CUSTOM_COLORS } from "./color-constants";
import { ColorPicker } from "./color-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { ToolbarButton } from "./toolbar";

export type TColor = {
  name: string;
  value: string;
  isBrightColor: boolean;
};

type ColorDropdownMenuProps = {
  nodeType: string;
  tooltip?: string;
  setSelectedColor?: (value?: any) => void;
} & DropdownMenuProps;

export function ColorDropdownMenu({
  nodeType,
  tooltip,
  setSelectedColor,
  children,
}: ColorDropdownMenuProps) {
  const state = useColorDropdownMenuState({
    nodeType,
    colors: DEFAULT_COLORS,
    customColors: DEFAULT_CUSTOM_COLORS,
    closeOnSelect: true,
  });

  // useEffect(() => {
  //   setSelectedColor?.(state.color);
  // }, [state, setSelectedColor]);

  // console.log("state", state);

  const { menuProps, buttonProps } = useColorDropdownMenu(state);

  return (
    <DropdownMenu modal={false} {...menuProps}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton tooltip={tooltip} {...buttonProps}>
          {children}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <ColorPicker
          style={{ zIndex: 9999 }}
          color={state.selectedColor || state.color}
          colors={state.colors}
          customColors={state.customColors}
          updateColor={(value) => {
            state.updateColorAndClose(value);
            setSelectedColor?.(value);
          }}
          updateCustomColor={state.updateColor}
          clearColor={state.clearColor}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
