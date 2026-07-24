'use client';

import * as React from 'react';
import * as ToolbarPrimitive from '@radix-ui/react-toolbar';
import { cn, withCn, withRef, withVariants } from '@udecode/cn';
import { cva, VariantProps } from 'class-variance-authority';

import { Icons } from '@/components/icons';

import { Separator } from './separator';
import { withTooltip } from './tooltip';

export const Toolbar = withCn(
  ToolbarPrimitive.Root,
  'tw-relative tw-flex tw-select-none tw-items-center tw-gap-1 tw-bg-background tw-w-full tw-px-2 tw-py-1'
);

export const ToolbarToggleGroup = withCn(
  ToolbarPrimitive.ToolbarToggleGroup,
  'tw-flex tw-items-center'
);

export const ToolbarLink = withCn(
  ToolbarPrimitive.Link,
  'tw-font-medium tw-underline tw-underline-offset-4'
);

export const ToolbarSeparator = withCn(
  ToolbarPrimitive.Separator,
  'tw-my-1 tw-w-[1px] tw-shrink-0 tw-bg-border'
);

const toolbarButtonVariants = cva(
  cn(
    'tw-inline-flex tw-items-center tw-justify-center tw-rounded-md tw-text-sm tw-font-medium tw-ring-offset-background tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-pointer-events-none disabled:tw-opacity-50',
    '[&_svg:not([data-icon])]:tw-h-5 [&_svg:not([data-icon])]:tw-w-5'
  ),
  {
    variants: {
      variant: {
        default:
          'tw-bg-transparent hover:tw-bg-muted hover:tw-text-accent-foreground aria-checked:tw-bg-accent aria-checked:tw-text-accent-foreground border-0',
        outline:
          'tw-border tw-border-input tw-bg-transparent hover:tw-bg-accent hover:tw-text-accent-foreground',
      },
      size: {
        default: 'tw-h-9 tw-px-2',
        sm: 'tw-h-9 tw-px-2',
        lg: 'tw-h-11 tw-px-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const ToolbarButton = withTooltip(
  // eslint-disable-next-line react/display-name
  React.forwardRef<
    React.ElementRef<typeof ToolbarToggleItem>,
    Omit<
      React.ComponentPropsWithoutRef<typeof ToolbarToggleItem>,
      'asChild' | 'value'
    > &
      VariantProps<typeof toolbarButtonVariants> & {
        pressed?: boolean;
        isDropdown?: boolean;
      }
  >(
    (
      { className, variant, size, isDropdown, children, pressed, ...props },
      ref
    ) => {
      return typeof pressed === 'boolean' ? (
        <ToolbarToggleGroup
          type="single"
          value="single"
          disabled={props.disabled}
        >
          <ToolbarToggleItem
            ref={ref}
            className={cn(
              toolbarButtonVariants({
                variant,
                size,
              }),
              isDropdown && 'tw-my-1 tw-justify-between tw-pr-1',
              className
            )}
            value={pressed ? 'single' : ''}
            {...props}
          >
            {isDropdown ? (
              <>
                <div className='tw-flex tw-flex-1'>{children}</div>
                <div>
                  <Icons.arrowDown className='tw-ml-0.5 tw-h-4 tw-w-4' data-icon />
                </div>
              </>
            ) : (
              children
            )}
          </ToolbarToggleItem>
        </ToolbarToggleGroup>
      ) : (
        <ToolbarPrimitive.Button
          ref={ref}
          className={cn(
            toolbarButtonVariants({
              variant,
              size,
            }),
            isDropdown && 'tw-pr-1',
            className
          )}
          {...props}
        >
          {children}
        </ToolbarPrimitive.Button>
      );
    }
  )
);
ToolbarButton.displayName = 'ToolbarButton';
export { ToolbarButton };

export const ToolbarToggleItem = withVariants(
  ToolbarPrimitive.ToggleItem,
  toolbarButtonVariants,
  ['variant', 'size']
);

export const ToolbarGroup = withRef<
  'div',
  {
    noSeparator?: boolean;
  }
>(({ className, children, noSeparator }, ref) => {
  const childArr = React.Children.map(children, (c) => c);
  if (!childArr || childArr.length === 0) return null;

  return (
    <div ref={ref} className={cn('tw-flex', className)}>
      {!noSeparator && (
        <div className='tw-h-full tw-py-1'>
          <Separator orientation="vertical" />
        </div>
      )}

      <div className='tw-mx-1 tw-flex tw-items-center tw-gap-1'>{children}</div>
    </div>
  );
});
