import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { PlateLeaf } from '@udecode/plate-common';

export const HighlightLeaf = withRef<typeof PlateLeaf>(
  ({ className, children, ...props }, ref) => (
    <PlateLeaf
      ref={ref}
      asChild
      className={cn('tw-bg-primary/20 tw-text-inherit dark:tw-bg-primary/40', className)}
      {...props}
    >
      <mark>{children}</mark>
    </PlateLeaf>
  )
);
