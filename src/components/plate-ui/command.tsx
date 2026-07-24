'use client';

import * as React from 'react';
import { type DialogProps } from '@radix-ui/react-dialog';
import { cn, createPrimitiveElement, withCn, withRef } from '@udecode/cn';
import { Command as CommandPrimitive } from 'cmdk';

import { Icons } from '@/components/icons';

import { Dialog, DialogContent } from './dialog';

export const Command = withCn(
  CommandPrimitive,
  'tw-flex tw-h-full tw-w-full tw-flex-col tw-overflow-hidden tw-rounded-md tw-bg-popover tw-text-popover-foreground'
);

export function CommandDialog({ children, ...props }: DialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent className='tw-overflow-hidden tw-p-0 tw-shadow-lg'>
        <Command className='[&_[cmdk-group-heading]]:tw-px-2 [&_[cmdk-group-heading]]:tw-font-medium [&_[cmdk-group-heading]]:tw-text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:tw-pt-0 [&_[cmdk-group]]:tw-px-2 [&_[cmdk-input-wrapper]_svg]:tw-h-5 [&_[cmdk-input-wrapper]_svg]:tw-w-5 [&_[cmdk-input]]:tw-h-12 [&_[cmdk-item]]:tw-px-2 [&_[cmdk-item]]:tw-py-3 [&_[cmdk-item]_svg]:tw-h-5 [&_[cmdk-item]_svg]:tw-w-5'>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export const CommandInput = withRef<typeof CommandPrimitive.Input>(
  ({ className, ...props }, ref) => (
    <div className='tw-flex tw-items-center tw-border-b tw-px-3' cmdk-input-wrapper="">
      <Icons.search className='tw-mr-2 tw-h-4 tw-w-4 tw-shrink-0 tw-opacity-50' />
      <CommandPrimitive.Input
        ref={ref}
        className={cn(
          'tw-flex tw-h-11 tw-w-full tw-rounded-md tw-bg-transparent tw-py-3 tw-text-sm tw-outline-none placeholder:tw-text-muted-foreground disabled:tw-cursor-not-allowed disabled:tw-opacity-50',
          className
        )}
        {...props}
      />
    </div>
  )
);

export const CommandList = withCn(
  CommandPrimitive.List,
  'tw-max-h-[500px] tw-overflow-y-auto tw-overflow-x-hidden'
);

export const CommandEmpty = withCn(
  CommandPrimitive.Empty,
  'tw-py-6 tw-text-center tw-text-sm'
);

export const CommandGroup = withCn(
  CommandPrimitive.Group,
  'tw-overflow-hidden tw-p-1 tw-text-foreground [&_[cmdk-group-heading]]:tw-px-2 [&_[cmdk-group-heading]]:tw-py-1.5 [&_[cmdk-group-heading]]:tw-text-xs [&_[cmdk-group-heading]]:tw-font-medium [&_[cmdk-group-heading]]:tw-text-muted-foreground'
);

export const CommandSeparator = withCn(
  CommandPrimitive.Separator,
  '-mx-1 h-px bg-border'
);

export const CommandItem = withCn(
  CommandPrimitive.Item,
  'tw-relative tw-flex tw-cursor-default tw-select-none tw-items-center tw-rounded-sm tw-px-2 tw-py-1.5 tw-text-sm tw-outline-none aria-selected:tw-bg-accent aria-selected:tw-text-accent-foreground data-[disabled]:tw-pointer-events-none data-[disabled]:tw-opacity-50'
);

export const CommandShortcut = withCn(
  createPrimitiveElement('span'),
  'tw-ml-auto tw-text-xs tw-tracking-widest tw-text-muted-foreground'
);
