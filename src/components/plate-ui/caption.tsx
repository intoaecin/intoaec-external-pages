import { cn, withCn, withVariants } from '@udecode/cn';
import {
  Caption as CaptionPrimitive,
  CaptionTextarea as CaptionTextareaPrimitive,
} from '@udecode/plate-caption';
import { cva } from 'class-variance-authority';

const captionVariants = cva('tw-max-w-full', {
  variants: {
    align: {
      left: 'tw-mr-auto',
      center: 'tw-mx-auto',
      right: 'tw-ml-auto',
    },
  },
  defaultVariants: {
    align: 'center',
  },
});

export const Caption = withVariants(CaptionPrimitive, captionVariants, [
  'align',
]);

export const CaptionTextarea = withCn(
  CaptionTextareaPrimitive,
  cn(
    'tw-mt-2 tw-w-full tw-resize-none tw-border-none tw-bg-inherit tw-p-0 tw-font-[inherit] tw-text-inherit',
    'focus:tw-outline-none focus:[&::placeholder]:tw-opacity-0',
    'tw-text-center print:placeholder:tw-text-transparent'
  )
);
