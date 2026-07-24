import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn, withRef } from '@udecode/cn';
import { cva, VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'tw-inline-flex tw-items-center tw-justify-center tw-whitespace-nowrap tw-rounded-md tw-text-sm tw-font-medium tw-ring-offset-background tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-pointer-events-none disabled:tw-opacity-50',
  {
    variants: {
      variant: {
        default: 'tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90',
        destructive:
          'tw-bg-destructive tw-text-destructive-foreground hover:tw-bg-destructive/90',
        outline:
          'tw-border tw-border-input tw-bg-background hover:tw-bg-accent hover:tw-text-accent-foreground',
        secondary:
          'tw-bg-secondary tw-text-secondary-foreground hover:tw-bg-secondary/80',
        ghost: 'hover:tw-bg-accent hover:tw-text-accent-foreground',
        link: 'tw-text-primary tw-underline-offset-4 hover:tw-underline',
        inlineLink: 'tw-text-base tw-text-primary tw-underline tw-underline-offset-4',
      },
      size: {
        default: 'tw-h-10 tw-px-4 tw-py-2',
        xs: 'tw-h-8 tw-rounded-md tw-px-3',
        sm: 'tw-h-9 tw-rounded-md tw-px-3',
        sms: 'tw-h-9 tw-w-9 tw-rounded-md tw-px-0',
        lg: 'tw-h-11 tw-rounded-md tw-px-8',
        icon: 'tw-h-10 tw-w-10',
        none: 'tw-',
      },
      isMenu: {
        true: 'tw-h-auto tw-w-full tw-cursor-pointer tw-justify-start',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export const Button = withRef<
  'button',
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }
>(({ className, isMenu, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(buttonVariants({ isMenu, variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
