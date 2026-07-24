'use client';

import React from 'react';
import { cn } from '@udecode/cn';
import {
  CommentResolveButton as CommentResolveButtonPrimitive,
  useComment,
} from '@udecode/plate-comments';

import { Icons } from '@/components/icons';

import { buttonVariants } from './button';

export function CommentResolveButton() {
  const comment = useComment()!;

  return (
    <CommentResolveButtonPrimitive
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        'tw-h-6 tw-p-1 tw-text-muted-foreground'
      )}
    >
      {comment.isResolved ? (
        <Icons.refresh className='tw-h-4 tw-w-4' />
      ) : (
        <Icons.check className='tw-h-4 tw-w-4' />
      )}
    </CommentResolveButtonPrimitive>
  );
}
