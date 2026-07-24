import { withVariants } from '@udecode/cn';
import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  'tw-flex tw-w-full tw-rounded-md tw-bg-transparent tw-text-sm file:tw-border-0 file:tw-bg-background file:tw-text-sm file:tw-font-medium placeholder:tw-text-muted-foreground focus-visible:tw-outline-none disabled:tw-cursor-not-allowed disabled:tw-opacity-50',
  {
    variants: {
      variant: {
        default:
          'tw-border tw-border-input tw-ring-offset-background focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2',
        ghost: 'tw-border-none focus-visible:tw-ring-transparent',
      },
      h: {
        sm: 'tw-h-9 tw-px-3 tw-py-2',
        md: 'tw-h-10 tw-px-3 tw-py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      h: 'md',
    },
  }
);

export const Input = withVariants('input', inputVariants, ['variant', 'h']);
