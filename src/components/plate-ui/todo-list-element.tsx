import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { PlateElement } from '@udecode/plate-common';
import {
  useTodoListElement,
  useTodoListElementState,
} from '@udecode/plate-list';

import { Checkbox } from './checkbox';

export const TodoListElement = withRef<typeof PlateElement>(
  ({ className, children, ...props }, ref) => {
    const { element } = props;
    const state = useTodoListElementState({ element });
    const { checkboxProps } = useTodoListElement(state);

    return (
      <PlateElement
        ref={ref}
        className={cn('tw-flex tw-flex-row tw-py-1', className)}
        {...props}
      >
        <div
          className='tw-mr-1.5 tw-flex tw-select-none tw-items-center tw-justify-center'
          contentEditable={false}
        >
          <Checkbox {...checkboxProps} />
        </div>
        <span
          className={cn(
            'tw-flex-1 focus:tw-outline-none',
            state.checked && 'tw-text-muted-foreground tw-line-through'
          )}
          contentEditable={!state.readOnly}
          suppressContentEditableWarning
        >
          {children}
        </span>
      </PlateElement>
    );
  }
);
