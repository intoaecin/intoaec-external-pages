'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { withCn } from '@udecode/cn';

export const Avatar = withCn(
  AvatarPrimitive.Root,
  'tw-relative tw-flex tw-h-10 tw-w-10 tw-shrink-0 tw-overflow-hidden tw-rounded-full'
);

export const AvatarImage = withCn(
  AvatarPrimitive.Image,
  'tw-aspect-square tw-h-full tw-w-full'
);

export const AvatarFallback = withCn(
  AvatarPrimitive.Fallback,
  'tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-rounded-full tw-bg-muted'
);
