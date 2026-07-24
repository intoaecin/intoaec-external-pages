import React from "react";
import { cn } from "@udecode/cn";
import { PlateContent } from "@udecode/plate-common";
import { cva } from "class-variance-authority";

import type { PlateContentProps } from "@udecode/plate-common";
import type { VariantProps } from "class-variance-authority";

const editorVariants = cva(
  cn(
    "tw-relative tw-overflow-x-auto tw-whitespace-pre-wrap tw-break-words",
    "tw-min-h-[80px] tw-w-full tw-rounded-md tw-px-0 tw-py-2 tw-text-sm tw-ring-offset-background placeholder:tw-text-muted-foreground focus-visible:tw-outline-none",
    "[&_[data-slate-placeholder]]:tw-text-muted-foreground [&_[data-slate-placeholder]]:!tw-opacity-100",
    "[&_[data-slate-placeholder]]:tw-top-[auto_!important]",
    "[&_strong]:tw-font-bold"
  ),
  {
    variants: {
      variant: {
        outline: "tw-border tw-border-input",
        ghost: "tw-",
      },
      focused: {
        true: "tw-ring-2 tw-ring-ring tw-ring-offset-2",
      },
      disabled: {
        true: "tw-cursor-not-allowed tw-opacity-50",
      },
      focusRing: {
        true: "focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2",
        false: "tw-",
      },
      size: {
        sm: "tw-text-sm",
        md: "tw-text-base",
      },
    },
    defaultVariants: {
      variant: "outline",
      focusRing: true,
      size: "sm",
    },
  }
);

export type EditorProps = PlateContentProps &
  VariantProps<typeof editorVariants>;

const Editor = React.forwardRef<HTMLDivElement, EditorProps>(
  (
    {
      className,
      disabled,
      focused,
      focusRing,
      readOnly,
      size,
      variant,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className="tw-relative tw-w-full px-1">
        <PlateContent
          className={cn(
            editorVariants({
              disabled,
              focused,
              focusRing,
              size,
              variant,
            }),
            className
          )}
          disableDefaultStyles
          readOnly={disabled ?? readOnly}
          aria-disabled={disabled}
          {...props}
        />
      </div>
    );
  }
);
Editor.displayName = "Editor";

export { Editor };
