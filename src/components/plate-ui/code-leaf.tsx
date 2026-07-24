'use client';

import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { PlateLeaf } from '@udecode/plate-common';

export const CodeLeaf = withRef<typeof PlateLeaf>(
  ({ className, children, ...props }, ref) => {
    return (
      <PlateLeaf
        ref={ref}
        asChild
        className={cn(
          'tw-whitespace-pre-wrap tw-rounded-md tw-bg-muted tw-px-[0.3em] tw-py-[0.2em] tw-font-mono tw-text-sm',
          className
        )}
        {...props}
      >
        <code>{children}</code>
      </PlateLeaf>
    );
  }
);
