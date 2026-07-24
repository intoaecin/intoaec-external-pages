'use client';

import React from 'react';
import { DropdownMenuItemProps } from '@radix-ui/react-dropdown-menu';
import { cn } from '@udecode/cn';

import { Icons } from '@/components/icons';

import { buttonVariants } from './button';
import { TColor } from './color-dropdown-menu';
import { DropdownMenuItem } from './dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

type ColorDropdownMenuItemProps = {
  value: string;
  isBrightColor: boolean;
  isSelected: boolean;
  updateColor: (color: string) => void;
  name?: string;
} & DropdownMenuItemProps;

export function ColorDropdownMenuItem({
  name,
  value,
  isBrightColor,
  isSelected,
  updateColor,
  className,
  ...props
}: ColorDropdownMenuItemProps) {
  const content = (
    <DropdownMenuItem
      // className={cn(
      //   buttonVariants({
      //     variant: 'outline',
      //     isMenu: true,
      //   }),
      //   'tw-h-6 tw-w-6 tw-border tw-border-solid tw-border-muted tw-p-0',
      //   !isBrightColor && 'tw-border-transparent tw-text-white',
      //   className
      // )}
      className='p-0'
      style={{ backgroundColor: value, width:'20px',height:'20px'}}
      onSelect={(e) => {
        e.preventDefault();
        updateColor(value);
      }}
      {...props}
    >
      {isSelected ? <Icons.check /> : null}
    </DropdownMenuItem>
  );

  return name ? (
    <Tooltip>
      <TooltipTrigger>{content}</TooltipTrigger>
      <TooltipContent>{name}</TooltipContent>
    </Tooltip>
  ) : (
    content
  );
}

type ColorDropdownMenuItemsProps = {
  color?: string;
  colors: TColor[];
  updateColor: (color: string) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export function ColorDropdownMenuItems({
  color,
  colors,
  updateColor,
  className,
  ...props
}: ColorDropdownMenuItemsProps) {
  return (
    <div
      className={cn('tw-grid tw-grid-cols-[repeat(10,1fr)] tw-gap-1', className)}
      {...props}
    >
      {colors.map(({ name, value, isBrightColor }) => (
        <ColorDropdownMenuItem
          key={name ?? value}
          name={name}
          value={value}
          isBrightColor={isBrightColor}
          isSelected={color === value}
          updateColor={updateColor}
        />
      ))}
    </div>
  );
}
