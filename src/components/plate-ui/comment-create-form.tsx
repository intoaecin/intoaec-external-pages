'use client';

import React from 'react';
import { cn } from '@udecode/cn';
import {
  CommentNewSubmitButton,
  CommentNewTextarea,
  useCommentsSelectors,
} from '@udecode/plate-comments';

import { buttonVariants } from './button';
import { CommentAvatar } from './comment-avatar';
import { inputVariants } from './input';

export function CommentCreateForm() {
  const myUserId = useCommentsSelectors().myUserId();

  return (
    <div className='tw-flex tw-w-full tw-space-x-2'>
      <CommentAvatar userId={myUserId} />

      <div className='tw-flex tw-grow tw-flex-col tw-items-end tw-gap-2'>
        <CommentNewTextarea className={inputVariants()} />

        <CommentNewSubmitButton
          className={cn(buttonVariants({ size: 'sm' }), 'tw-w-[90px]')}
        >
          Comment
        </CommentNewSubmitButton>
      </div>
    </div>
  );
}
