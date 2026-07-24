import React, { useEffect } from "react";
import {
  isSelectionExpanded,
  useEditorSelector,
  useElement,
  useRemoveNodeButton,
} from "@udecode/plate-common";
import {
  floatingMediaActions,
  FloatingMedia as FloatingMediaPrimitive,
  useFloatingMediaSelectors,
} from "@udecode/plate-media";
import { useReadOnly, useSelected } from "slate-react";

import { Icons } from "@/components/icons";

import { Button, buttonVariants } from "./button";
import { inputVariants } from "./input";
import { Popover, PopoverAnchor, PopoverContent } from "./popover";
import { Separator } from "./separator";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export interface MediaPopoverProps {
  pluginKey?: string;
  children: React.ReactNode;
}

export function MediaPopover({ pluginKey, children }: MediaPopoverProps) {
  const readOnly = useReadOnly();
  const selected = useSelected();

  const selectionCollapsed = useEditorSelector(
    (editor) => !isSelectionExpanded(editor),
    []
  );
  const isOpen = !readOnly && selected && selectionCollapsed;
  const isEditing = useFloatingMediaSelectors().isEditing();

  useEffect(() => {
    if (!isOpen && isEditing) {
      floatingMediaActions.isEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const element = useElement();
  const { props: buttonProps } = useRemoveNodeButton({ element });

  if (readOnly) return <>{children}</>;

  return (
    <Popover open={isOpen} modal={false}>
      <PopoverAnchor>{children}</PopoverAnchor>

      <PopoverContent
        className="tw-w-auto "
        style={{padding:0}}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {isEditing ? (
          <div className="tw-flex tw-flex-col">
            <div className="tw-flex tw-items-center">
              <div className="tw-flex tw-items-center tw-text-muted-foreground">
                <Icons.link className="tw-h-4 tw-w-4" />
              </div>

              <FloatingMediaPrimitive.UrlInput
                className={inputVariants({ variant: "ghost", h: "sm" })}
                placeholder="Paste the embed link..."
                options={{
                  pluginKey,
                }}
              />
            </div>
          </div>
        ) : (
          // <div className="tw-items-center">
          <IconButton size="large" {...buttonProps}>
            <DeleteIcon  color="error" />
          </IconButton>
          // </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
