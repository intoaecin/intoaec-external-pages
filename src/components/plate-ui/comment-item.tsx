'use client';

import React from 'react';
import {
  CommentProvider,
  useCommentById,
  useCommentItemContentState,
} from '@udecode/plate-comments';
import { formatDistance } from 'date-fns';

import { CommentAvatar } from './comment-avatar';
import { CommentMoreDropdown } from './comment-more-dropdown';
import { CommentResolveButton } from './comment-resolve-button';
import { CommentValue } from './comment-value';

type PlateCommentProps = {
  commentId: string;
};

function CommentItemContent() {
  const {
    comment,
    isMyComment,
    isReplyComment,
    user,
    editingValue,
    commentText,
  } = useCommentItemContentState();

  return (
    <div>
      <div className='tw-relative tw-flex tw-items-center tw-gap-2'>
        <CommentAvatar userId={comment.userId} />

        <h4 className='tw-text-sm tw-font-semibold tw-leading-none'>{user?.name}</h4>

        <div className='tw-text-xs tw-leading-none tw-text-muted-foreground'>
          {formatDistance(comment.createdAt, Date.now())} ago
        </div>

        {isMyComment && (
          <div className='tw-absolute tw--right-0.5 tw--top-0.5 tw-flex tw-space-x-1'>
            {isReplyComment ? null : <CommentResolveButton />}

            <CommentMoreDropdown />
          </div>
        )}
      </div>

      <div className='tw-mb-4 tw-pl-7 tw-pt-0.5'>
        {editingValue ? (
          <CommentValue />
        ) : (
          <div className='tw-whitespace-pre-wrap tw-text-sm'>{commentText}</div>
        )}
      </div>
    </div>
  );
}

export function CommentItem({ commentId }: PlateCommentProps) {
  const comment = useCommentById(commentId);
  if (!comment) return null;

  return (
    <CommentProvider key={commentId} id={commentId}>
      <CommentItemContent />
    </CommentProvider>
  );
}
