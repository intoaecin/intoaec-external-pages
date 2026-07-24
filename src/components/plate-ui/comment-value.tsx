'use client';

import React from 'react';
import { cn } from '@udecode/cn';
import {
  CommentEditActions,
  CommentEditTextarea,
} from '@udecode/plate-comments';

import { buttonVariants } from './button';
import { inputVariants } from './input';
import { useTranslation } from 'react-i18next';

export function CommentValue() {

  const { t } = useTranslation();
  return (
    <div className='tw-my-2 tw-flex tw-flex-col tw-items-end tw-gap-2'>
      <CommentEditTextarea className={cn(inputVariants(), 'tw-min-h-[60px]')} />

      <div className='tw-flex tw-space-x-2'>
        <CommentEditActions.CancelButton
          className={buttonVariants({ variant: 'outline', size: 'xs' })}
        >
          {t('common.cancel')}
        </CommentEditActions.CancelButton>

        <CommentEditActions.SaveButton
          className={buttonVariants({ variant: 'default', size: 'xs' })}
        >
          {t('common.save')}
        </CommentEditActions.SaveButton>
      </div>
    </div>
  );
}
