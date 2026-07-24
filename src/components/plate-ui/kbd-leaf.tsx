import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { PlateLeaf } from '@udecode/plate-common';

export const KbdLeaf = withRef<typeof PlateLeaf>(
  ({ className, children, ...props }, ref) => (
    <PlateLeaf
      ref={ref}
      asChild
      className={cn(
        'tw-rounded tw-border tw-border-border tw-bg-muted tw-px-1.5 tw-py-0.5 tw-font-mono tw-text-sm tw-shadow-[rgba(255,_255,_255,_0.1)_0px_0.5px_0px_0px_inset,_rgb(248,_249,_250)_0px_1px_5px_0px_inset,_rgb(193,_200,_205)_0px_0px_0px_0.5px,_rgb(193,_200,_205)_0px_2px_1px_-1px,_rgb(193,_200,_205)_0px_1px_0px_0px] dark:tw-shadow-[rgba(255,_255,_255,_0.1)_0px_0.5px_0px_0px_inset,_rgb(26,_29,_30)_0px_1px_5px_0px_inset,_rgb(76,_81,_85)_0px_0px_0px_0.5px,_rgb(76,_81,_85)_0px_2px_1px_-1px,_rgb(76,_81,_85)_0px_1px_0px_0px]',
        className
      )}
      {...props}
    >
      <kbd>{children}</kbd>
    </PlateLeaf>
  )
);
