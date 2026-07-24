import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { getHandler, PlateElement } from '@udecode/plate-common';
import { useFocused, useSelected } from 'slate-react';

export const MentionInputElement = withRef<
  typeof PlateElement,
  {
    onClick?: (mentionNode: any) => void;
  }
>(({ className, onClick, ...props }, ref) => {
  const { children, element } = props;

  const selected = useSelected();
  const focused = useFocused();

  return (
    <PlateElement
      ref={ref}
      asChild
      data-slate-value={element.value}
      className={cn(
        'tw-inline-block tw-rounded-md tw-bg-muted tw-px-1.5 tw-py-0.5 tw-align-baseline tw-text-sm',
        selected && focused && 'tw-ring-2 tw-ring-ring',
        className
      )}
      onClick={getHandler(onClick, element)}
      {...props}
    >
      <span>{children}</span>
    </PlateElement>
  );
});
