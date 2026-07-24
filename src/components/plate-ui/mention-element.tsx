import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { getHandler, PlateElement, useElement } from '@udecode/plate-common';
import { TMentionElement } from '@udecode/plate-mention';
import { useFocused, useSelected } from 'slate-react';

export const MentionElement = withRef<
  typeof PlateElement,
  {
    prefix?: string;
    onClick?: (mentionNode: any) => void;
    renderLabel?: (mentionable: TMentionElement) => string;
  }
>(({ children, prefix, renderLabel, className, onClick, ...props }, ref) => {
  const element = useElement<TMentionElement>();
  const selected = useSelected();
  const focused = useFocused();

  return (
    <PlateElement
      ref={ref}
      className={cn(
        'tw-inline-block tw-cursor-pointer tw-rounded-md tw-bg-muted tw-px-1.5 tw-py-0.5 tw-align-baseline tw-text-sm tw-font-medium',
        selected && focused && 'tw-ring-2 tw-ring-ring',
        element.children[0].bold === true && 'tw-font-bold',
        element.children[0].italic === true && 'tw-italic',
        element.children[0].underline === true && 'tw-underline',
        className
      )}
      data-slate-value={element.value}
      contentEditable={false}
      onClick={getHandler(onClick, element)}
      {...props}
    >
      {prefix}
      {renderLabel ? renderLabel(element) : element.value}
      {children}
    </PlateElement>
  );
});
