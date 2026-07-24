import React from "react";
import { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";
import {
  collapseSelection,
  findNode,
  focusEditor,
  isBlock,
  removeMark,
  TElement,
  toggleNodeType,
  useEditorRef,
  useEditorSelector,
} from "@udecode/plate-common";
import { ELEMENT_H1, ELEMENT_H2, ELEMENT_H3 } from "@udecode/plate-heading";
import { ELEMENT_PARAGRAPH } from "@udecode/plate-paragraph";
import { Editor, Range, Transforms } from "slate";
import { TReactEditor } from "@udecode/slate-react";

import { Icons } from "@/components/icons";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from "./dropdown-menu";
import { ToolbarButton } from "./toolbar";

const items = [
  {
    value: ELEMENT_PARAGRAPH,
    label: "Paragraph",
    description: "Paragraph",
    icon: Icons.paragraph,
  },
  {
    value: ELEMENT_H1,
    label: "Heading 1",
    description: "Heading 1",
    icon: Icons.h1,
  },
  {
    value: ELEMENT_H2,
    label: "Heading 2",
    description: "Heading 2",
    icon: Icons.h2,
  },
  {
    value: ELEMENT_H3,
    label: "Heading 3",
    description: "Heading 3",
    icon: Icons.h3,
  },
  // const items = [
  // {
  //   value: ELEMENT_PARAGRAPH,
  //   label: t("common.paragraph"),
  //   description: "Paragraph",
  //   icon: Icons.paragraph,
  // },
  // {
  //   value: ELEMENT_H1,
  //   label: t("common.heading1"),
  //   description: "Heading 1",
  //   icon: Icons.h1,
  // },
  // {
  //   value: ELEMENT_H2,
  //   label: t("common.heading2"),
  //   description: "Heading 2",
  //   icon: Icons.h2,
  // },
  // {
  //   value: ELEMENT_H3,
  //   label: t("common.heading3"),
  //   description: "Heading 3",
  //   icon: Icons.h3,
  // },
  // {
  //   value: ELEMENT_BLOCKQUOTE,
  //   label: 'Quote',
  //   description: 'Quote (⌘+⇧+.)',
  //   icon: Icons.blockquote,
  // },
  // {
  //   value: 'ul',
  //   label: 'Bulleted list',
  //   description: 'Bulleted list',
  //   icon: Icons.ul,
  // },
  // {
  //   value: 'ol',
  //   label: 'Numbered list',
  //   description: 'Numbered list',
  //   icon: Icons.ol,
  // },
];
// {
//   value: ELEMENT_BLOCKQUOTE,
//   label: 'Quote',
//   description: 'Quote (⌘+⇧+.)',
//   icon: Icons.blockquote,
// },
// {
//   value: 'ul',
//   label: 'Bulleted list',
//   description: 'Bulleted list',
//   icon: Icons.ul,
// },
// {
//   value: 'ol',
//   label: 'Numbered list',
//   description: 'Numbered list',
//   icon: Icons.ol,
// },
// ];

const defaultItem = items.find((item) => item.value === ELEMENT_PARAGRAPH)!;

export function TurnIntoDropdownMenu(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const selectionRef = React.useRef<Range | null>(null);
  
  const value: string = useEditorSelector((editor) => {
    // Check if there's a selection
    if (editor.selection) {
      const entry = findNode<TElement>(editor, {
        match: (n) => isBlock(editor, n),
      });

      if (entry) {
        return (
          items.find((item) => item.value === entry[0].type)?.value ??
          ELEMENT_PARAGRAPH
        );
      }
    }

    return ELEMENT_PARAGRAPH;
  }, [editor.selection]);

  const openState = useOpenState();
  React.useEffect(() => {
    if (openState.open) {
      selectionRef.current = editor.selection ?? null;
    }
  }, [openState.open, editor]);
  const reactEditor = editor as unknown as TReactEditor;
  const slateEditor = editor as unknown as Editor;

  const selectedItem =
    items.find((item) => item.value === value) ?? defaultItem;
  const { icon: SelectedItemIcon, label: selectedItemLabel } = selectedItem;

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          pressed={openState.open}
          tooltip="Turn into"
          isDropdown
          className="lg:tw-min-w-[130px]"
          onMouseDown={(e) => {
            if (editor.selection) {
              selectionRef.current = editor.selection;
            }
            // Keep focus/selection in editor so the first click applies.
            e.preventDefault();
          }}
        >
          <SelectedItemIcon className="tw-h-5 tw-w-5 lg:tw-hidden" />
          <span className="max-lg:tw-hidden">{selectedItemLabel}</span>
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="tw-min-w-0">
        <DropdownMenuLabel>Turn into</DropdownMenuLabel>

        <DropdownMenuRadioGroup
          className="tw-flex tw-flex-col tw-gap-0.5"
          value={value}
          onValueChange={(type) => {
            if (!editor.selection && selectionRef.current) {
              Transforms.select(slateEditor, selectionRef.current);
            } else if (!editor.selection) {
              // Fallback for newly inserted editors with no selection yet
              Transforms.select(slateEditor, Editor.end(slateEditor, []));
            }
            focusEditor(reactEditor);
            // if (type === 'ul' || type === 'ol') {
            //   if (settingsStore.get.checkedId(KEY_LIST_STYLE_TYPE)) {
            //     toggleIndentList(editor, {
            //       listStyleType: type === 'ul' ? 'disc' : 'decimal',
            //     });
            //   } else if (settingsStore.get.checkedId('list')) {
            //     toggleList(editor, { type });
            //   }
            // } else {
            //   unwrapList(editor);
            toggleNodeType(editor, { activeType: type });
            if (
              type === ELEMENT_H1 ||
              type === ELEMENT_H2 ||
              type === ELEMENT_H3
            ) {
              // Use default heading sizes unless user explicitly sets font size
              removeMark(editor, { key: "fontSize" });
            }
            // }

            collapseSelection(editor);
            focusEditor(reactEditor);
          }}
        >
          {items.map(({ value: itemValue, label, icon: Icon }) => (
            <DropdownMenuRadioItem
              key={itemValue}
              value={itemValue}
              className="tw-min-w-[180px]"
            >
              <Icon className="tw-mr-2 tw-h-5 tw-w-5" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
