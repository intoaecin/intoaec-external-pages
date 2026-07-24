'use client';

import React, { useState } from 'react';
import { cn } from '@udecode/cn';
import {
  CODE_BLOCK_LANGUAGES,
  CODE_BLOCK_LANGUAGES_POPULAR,
  useCodeBlockCombobox,
  useCodeBlockComboboxState,
} from '@udecode/plate-code-block';

import { Icons } from '@/components/icons';

import { Button } from './button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const languages: { value: string; label: string }[] = [
  { value: 'text', label: 'Plain Text' },
  ...Object.entries({
    ...CODE_BLOCK_LANGUAGES_POPULAR,
    ...CODE_BLOCK_LANGUAGES,
  }).map(([key, val]) => ({
    value: key,
    label: val as string,
  })),
];

export function CodeBlockCombobox() {
  const state = useCodeBlockComboboxState();
  const { commandItemProps } = useCodeBlockCombobox(state);

  const [open, setOpen] = useState(false);

  if (state.readOnly) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className='tw-h-5 tw-justify-between tw-px-1 tw-text-xs'
          size="xs"
        >
          {state.value
            ? languages.find((language) => language.value === state.value)
                ?.label
            : 'Plain Text'}
          <Icons.chevronsUpDown className='tw-ml-2 tw-h-4 tw-w-4 tw-shrink-0 tw-opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='tw-w-[200px] tw-p-0'>
        <Command>
          <CommandInput placeholder="Search language..." />
          <CommandEmpty>No language found.</CommandEmpty>

          <CommandList>
            {languages.map((language) => (
              <CommandItem
                key={language.value}
                value={language.value}
                className='tw-cursor-pointer'
                onSelect={(_value) => {
                  commandItemProps.onSelect(_value);
                  setOpen(false);
                }}
              >
                <Icons.check
                  className={cn(
                    'tw-mr-2 tw-h-4 tw-w-4',
                    state.value === language.value ? 'tw-opacity-100' : 'tw-opacity-0'
                  )}
                />
                {language.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
