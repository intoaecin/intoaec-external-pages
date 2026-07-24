import React, { useEffect, useState } from "react";
import { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";
import {
  findNode,
  isBlock,
  setMarks,
  TElement,
  useEditorRef,
  useEditorSelector,
  useEditorState,
} from "@udecode/plate-common";
import { ELEMENT_H1, ELEMENT_H2, ELEMENT_H3 } from "@udecode/plate-heading";
import { getMark } from "@udecode/slate-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from "./dropdown-menu";
import { ToolbarButton } from "./toolbar";

// Default font sizes for headings (match heading-element.tsx styles)
const HEADING_FONT_SIZES: Record<string, number> = {
  [ELEMENT_H1]: 30,
  [ELEMENT_H2]: 24,
  [ELEMENT_H3]: 20,
};

export function FontSizeDropDownMenu({
  id,
  ...props
}: DropdownMenuProps & { id?: string }) {
  const openState = useOpenState();
  const [fontSize, setFontSize] = useState(12);
  const editor = useEditorRef(id);
  const editorState = useEditorState(id);

  const blockType = useEditorSelector(
    (editor) => {
      const entry = findNode<TElement>(editor, {
        match: (n) => isBlock(editor, n),
      });
      return entry?.[0]?.type;
    },
    [editor.selection]
  );

  const start = 12;
  const end = 40;

  const state = Array.from({ length: end - start + 1 }, (v, k) => k + start);

  useEffect(() => {
    const markFontSize = getMark(editor, "fontSize");
    const headingSize = blockType ? HEADING_FONT_SIZES[blockType] : undefined;

    // Prefer explicit font size set by user; otherwise use heading default or 12
    const nextSize =
      (typeof markFontSize === "number" ? markFontSize : undefined) ??
      headingSize ??
      12;

    if (nextSize !== fontSize) {
      setFontSize(nextSize);
    }
  }, [editor, editorState?.selection, blockType, fontSize]);

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Font size" isDropdown>
          {fontSize}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        style={{ maxHeight: "200px", overflowY: "scroll" }}
        align="start"
        className="tw-min-w-0"
      >
        <DropdownMenuRadioGroup
          className="tw-flex tw-flex-col tw-gap-0.5"

          // {...radioGroupProps}
        >
          {state.map((_value) => (
            <DropdownMenuRadioItem
              key={_value}
              value={_value.toString()}
              className="tw-min-w-[180px]"
              onClick={() => {
                const nextSize = Number(_value);
                setFontSize(nextSize);
                setMarks(editor, { fontSize: nextSize });
              }}
            >
              {_value}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
