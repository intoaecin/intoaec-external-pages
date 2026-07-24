'use client';

import './code-block-element.css';

import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { useCodeBlockElementState } from '@udecode/plate-code-block';
import { PlateElement } from '@udecode/plate-common';

import { CodeBlockCombobox } from './code-block-combobox';

export const CodeBlockElement = withRef<typeof PlateElement>(
  ({ className, children, ...props }, ref) => {
    const { element } = props;
    const state = useCodeBlockElementState({ element });

    return (
      <PlateElement
        ref={ref}
        className={cn('tw-relative tw-py-1', state.className, className)}
        {...props}
      >
        <pre className='tw-overflow-x-auto tw-rounded-md tw-bg-muted tw-px-6 tw-py-8 tw-font-mono tw-text-sm tw-leading-[normal] [tab-size:tw-2]'>
          <code>{children}</code>
        </pre>

        {state.syntax && (
          <div
            className='tw-absolute tw-right-2 tw-top-2 tw-z-10 tw-select-none'
            contentEditable={false}
          >
            <CodeBlockCombobox />
          </div>
        )}
      </PlateElement>
    );
  }
);
