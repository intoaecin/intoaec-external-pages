'use client';

import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { useComposedRef } from '@udecode/plate-common';
import { useColorInput } from '@udecode/plate-font';

export const ColorInput = withRef<'input'>(
  ({ value = '#000000', children, className, ...props }, ref) => {
    const { inputRef, childProps } = useColorInput();

    return (
      <div className='tw-flex tw-flex-col tw-items-center'>
        {React.Children.map(children, (child) => {
          if (!child) return child;

          return React.cloneElement(child as React.ReactElement, childProps);
        })}

        <input
          ref={useComposedRef(ref, inputRef)}
          className={cn('tw-h-0 tw-w-0 tw-overflow-hidden tw-border-0 tw-p-0', className)}
          type="color"
          value={value}
          {...props}
        />
      </div>
    );
  }
);
