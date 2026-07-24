import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { PlateElement } from '@udecode/plate-common';
import { useFocused, useSelected } from 'slate-react';

export const HrElement = withRef<typeof PlateElement>(
  ({ className, nodeProps, ...props }, ref) => {
    const { children } = props;

    const selected = useSelected();
    const focused = useFocused();

    return (
      <PlateElement ref={ref} {...props}>
        <div className='tw-py-6' contentEditable={false}>
          <hr
            {...nodeProps}
            className={cn(
              'tw-h-0.5 tw-cursor-pointer tw-rounded-sm tw-border-none tw-bg-muted tw-bg-clip-content',
              selected && focused && 'tw-ring-2 tw-ring-ring tw-ring-offset-2',
              className
            )}
          />
        </div>
        {children}
      </PlateElement>
    );
  }
);
