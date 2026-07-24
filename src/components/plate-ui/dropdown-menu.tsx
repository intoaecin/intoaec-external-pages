'use client';

import * as React from 'react';
import { useCallback, useState } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import {
  cn,
  createPrimitiveElement,
  withCn,
  withProps,
  withRef,
  withVariants,
} from '@udecode/cn';
import { cva } from 'class-variance-authority';

import { Icons } from '@/components/icons';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export const DropdownMenuSubTrigger = withRef<
  typeof DropdownMenuPrimitive.SubTrigger,
  {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'tw-flex tw-cursor-default tw-select-none tw-items-center tw-rounded-sm tw-px-2 tw-py-1.5 tw-text-sm tw-outline-none focus:tw-bg-accent data-[state=open]:tw-bg-accent',
      'data-[disabled]:tw-pointer-events-none data-[disabled]:tw-opacity-50',
      inset && 'tw-pl-8',
      className
    )}
    {...props}
  >
    {children}
    <Icons.chevronRight className='tw-ml-auto tw-h-4 tw-w-4' />
  </DropdownMenuPrimitive.SubTrigger>
));

export const DropdownMenuSubContent = withCn(
  DropdownMenuPrimitive.SubContent,
  'tw-z-[9999] tw-z-50 tw-min-w-[8rem] tw-overflow-hidden tw-rounded-md tw-border tw-bg-popover tw-p-1 tw-text-popover-foreground tw-shadow-lg data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-fade-out-0 data-[state=open]:tw-fade-in-0 data-[state=closed]:tw-zoom-out-95 data-[state=open]:tw-zoom-in-95 data-[side=bottom]:tw-slide-in-from-top-2 data-[side=left]:tw-slide-in-from-right-2 data-[side=right]:tw-slide-in-from-left-2 data-[side=top]:tw-slide-in-from-bottom-2'
);

const DropdownMenuContentVariants = withProps(DropdownMenuPrimitive.Content, {
  sideOffset: 4,
  className: cn(
    'tw-z-[9999] tw-z-50 tw-min-w-[8rem] tw-overflow-hidden tw-rounded-md tw-border tw-bg-popover tw-p-1 tw-text-popover-foreground tw-shadow-md data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-fade-out-0 data-[state=open]:tw-fade-in-0 data-[state=closed]:tw-zoom-out-95 data-[state=open]:tw-zoom-in-95 data-[side=bottom]:tw-slide-in-from-top-2 data-[side=left]:tw-slide-in-from-right-2 data-[side=right]:tw-slide-in-from-left-2 data-[side=top]:tw-slide-in-from-bottom-2'
  ),
});

export const DropdownMenuContent = withRef<
  typeof DropdownMenuPrimitive.Content
>(({ ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuContentVariants ref={ref} {...props} />
  </DropdownMenuPrimitive.Portal>
));

const menuItemVariants = cva(
  cn(
    'tw-relative tw-flex tw-h-9 tw-cursor-pointer tw-select-none tw-items-center tw-rounded-sm tw-px-2 tw-py-1.5 tw-text-sm tw-outline-none tw-transition-colors',
    'focus:tw-bg-accent focus:tw-text-accent-foreground data-[disabled]:tw-pointer-events-none data-[disabled]:tw-opacity-50'
  ),
  {
    variants: {
      inset: {
        true: 'tw-pl-8',
      },
    },
  }
);

export const DropdownMenuItem = withVariants(
  DropdownMenuPrimitive.Item,
  menuItemVariants,
  ['inset']
);

export const DropdownMenuCheckboxItem = withRef<
  typeof DropdownMenuPrimitive.CheckboxItem
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'tw-relative tw-flex tw-select-none tw-items-center tw-rounded-sm tw-py-1.5 tw-pl-8 tw-pr-2 tw-text-sm tw-outline-none tw-transition-colors focus:tw-bg-accent focus:tw-text-accent-foreground data-[disabled]:tw-pointer-events-none data-[disabled]:tw-opacity-50',
      'tw-cursor-pointer',
      className
    )}
    {...props}
  >
    <span className='tw-absolute tw-left-2 tw-flex tw-h-3.5 tw-w-3.5 tw-items-center tw-justify-center'>
      <DropdownMenuPrimitive.ItemIndicator>
        <Icons.check className='tw-h-4 tw-w-4' />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));

export const DropdownMenuRadioItem = withRef<
  typeof DropdownMenuPrimitive.RadioItem,
  {
    hideIcon?: boolean;
  }
>(({ className, children, hideIcon, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      'tw-relative tw-flex tw-select-none tw-items-center tw-rounded-sm tw-pl-8 tw-pr-2 tw-text-sm tw-outline-none tw-transition-colors focus:tw-bg-accent focus:tw-text-accent-foreground data-[disabled]:tw-pointer-events-none data-[disabled]:tw-opacity-50',
      'tw-h-9 tw-cursor-pointer tw-px-2 data-[state=checked]:tw-bg-accent data-[state=checked]:tw-text-accent-foreground',
      className
    )}
    {...props}
  >
    {!hideIcon && (
      <span className='tw-absolute tw-right-2 tw-flex tw-h-3.5 tw-w-3.5 tw-items-center tw-justify-center'>
        <DropdownMenuPrimitive.ItemIndicator>
          <Icons.check className='tw-h-4 tw-w-4' />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
    )}
    {children}
  </DropdownMenuPrimitive.RadioItem>
));

const dropdownMenuLabelVariants = cva(
  cn('tw-select-none tw-px-2 tw-py-1.5 tw-text-sm tw-font-semibold'),
  {
    variants: {
      inset: {
        true: 'tw-pl-8',
      },
    },
  }
);

export const DropdownMenuLabel = withVariants(
  DropdownMenuPrimitive.Label,
  dropdownMenuLabelVariants,
  ['inset']
);

export const DropdownMenuSeparator = withCn(
  DropdownMenuPrimitive.Separator,
  'tw--mx-1 tw-my-1 tw-h-px tw-bg-muted'
);

export const DropdownMenuShortcut = withCn(
  createPrimitiveElement('span'),
  'tw-ml-auto tw-text-xs tw-tracking-widest tw-opacity-60'
);

export const useOpenState = () => {
  const [open, setOpen] = useState(false);

  const onOpenChange = useCallback(
    (_value = !open) => {
      setOpen(_value);
    },
    [open]
  );

  return {
    open,
    onOpenChange,
  };
};
