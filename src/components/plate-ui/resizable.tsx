'use client';

import React from 'react';
import { cn, withRef, withVariants } from '@udecode/cn';
import {
  Resizable as ResizablePrimitive,
  ResizeHandle as ResizeHandlePrimitive,
} from '@udecode/plate-resizable';
import { cva } from 'class-variance-authority';

export const mediaResizeHandleVariants = cva(
  cn(
    'tw-top-0 tw-flex tw-w-6 tw-select-none tw-flex-col tw-justify-center',
    "after:tw-flex after:tw-h-16 after:tw-w-[3px] after:tw-rounded-[6px] after:tw-bg-ring after:tw-opacity-0 after:tw-content-['_'] group-hover:after:tw-opacity-100"
  ),
  {
    variants: {
      direction: {
        left: 'tw--left-3 tw--ml-3 tw-pl-3',
        right: 'tw--right-3 tw--mr-3 tw-items-end tw-pr-3',
      },
    },
  }
);

const resizeHandleVariants = cva(cn('tw-absolute tw-z-40'), {
  variants: {
    direction: {
      left: 'tw-h-full tw-cursor-col-resize',
      right: 'tw-h-full tw-cursor-col-resize',
      top: 'tw-w-full tw-cursor-row-resize',
      bottom: 'tw-w-full tw-cursor-row-resize',
    },
  },
});

const ResizeHandleVariants = withVariants(
  ResizeHandlePrimitive,
  resizeHandleVariants,
  ['direction']
);

export const ResizeHandle = withRef<typeof ResizeHandlePrimitive>(
  (props, ref) => (
    <ResizeHandleVariants
      ref={ref}
      direction={props.options?.direction}
      {...props}
    />
  )
);

const resizableVariants = cva('tw-', {
  variants: {
    align: {
      left: 'tw-mr-auto',
      center: 'tw-mx-auto',
      right: 'tw-ml-auto',
    },
  },
});

export const Resizable = withVariants(ResizablePrimitive, resizableVariants, [
  'align',
]);
