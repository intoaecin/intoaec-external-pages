import { ListType, ListsSchema, ListsEditor } from "@prezly/slate-lists";
import { EditorCommands } from "@prezly/slate-commons";
import { Node, Path, Text } from "slate";
import { BaseEditor, Editor, Element, Transforms } from "slate";

import { ReactEditor } from "slate-react";

const isCursorAtBeginning = (editor: any) => {
  const { selection } = editor;
  if (selection) {
    const start = {
      path: [0, 0],
      offset: 0,
    };
    return (
      Path.equals(selection.anchor.path, start.path) &&
      selection.anchor.offset === 0
    );
  }
  return false;
};

export const EditorFunctions = {
  makeBold: (editor: BaseEditor & ReactEditor) => {
    const { bold } = Editor.marks(editor) as any;
    Editor.addMark(editor, "bold", !bold);
  },
  makeItalic: (editor: BaseEditor & ReactEditor) => {
    const { italic } = Editor.marks(editor) as any;
    Editor.addMark(editor, "italic", !italic);
  },
  makeUnderline: (editor: BaseEditor & ReactEditor) => {
    const { underline } = Editor.marks(editor) as any;
    Editor.addMark(editor, "underline", !underline);
  },
  makeStrikeThrough: (editor: BaseEditor & ReactEditor) => {
    const { strike } = Editor.marks(editor) as any;
    Editor.addMark(editor, "strike", !strike);
  },
  alignCenter: (editor: BaseEditor & ReactEditor, e?: any) => {
    e?.preventDefault();
    Transforms.setNodes(
      editor,
      {
        marks: {
          textAlign: "center",
        },
      },
      { match: (n) => Element.isElement(n) && Editor.isBlock(editor, n) }
    );
  },
  alignLeft: (editor: BaseEditor & ReactEditor, e?: any) => {
    e?.preventDefault();
    Transforms.setNodes(
      editor,
      {
        marks: {
          textAlign: "left",
        },
      },
      { match: (n) => Element.isElement(n) && Editor.isBlock(editor, n) }
    );
  },
  alignRight: (editor: BaseEditor & ReactEditor, e?: any) => {
    e?.preventDefault();
    Transforms.setNodes(
      editor,
      {
        marks: {
          textAlign: "right",
        },
      },
      { match: (n) => Element.isElement(n) && Editor.isBlock(editor, n) }
    );
  },
  alignJustify: (editor: BaseEditor & ReactEditor, e?: any) => {
    e?.preventDefault();
    Transforms.setNodes(
      editor,
      {
        marks: {
          textAlign: "justify",
        },
      },
      { match: (n) => Element.isElement(n) && Editor.isBlock(editor, n) }
    );
  },
  changeFontColor: (editor: BaseEditor & ReactEditor, color: any) => {
    Editor.addMark(editor, "color", color);
  },
  changeFontSize: () => {},
  insertUnorderedList: (editor: BaseEditor & ReactEditor) => {
    const [currentNode] = EditorCommands.getCurrentNodeEntry(editor) || [];

    if (!currentNode) {
      return;
    }

    ListsEditor.wrapInList(editor, ListType.UNORDERED);
    ListsEditor.setListType(editor, ListType.UNORDERED);

    // else {
    //     ListsEditor.unwrapList(editor);
    //     Transforms.setNodes(editor, { type });
    // }

    // if (isCursorAtBeginning(editor)) {

    //   Transforms.insertNodes(editor, {
    //     type: "paragraph",
    //     children: [
    //       {
    //         text: "",
    //       },
    //     ],
    //   });
    // }
  },
  insertOrderedList: (editor: BaseEditor & ReactEditor) => {
    const [currentNode] = EditorCommands.getCurrentNodeEntry(editor) || [];

    if (!currentNode) {
      return;
    }

    ListsEditor.wrapInList(editor, ListType.ORDERED);
    ListsEditor.setListType(editor, ListType.ORDERED);
    // if (isCursorAtBeginning(editor)) {
    //   Transforms.insertNodes(editor, {
    //     type: "paragraph",
    //     children: [
    //       {
    //         text: "",
    //       },
    //     ],
    //   });
    // }
    // Transforms.wrapNodes(
    //   editor,
    //   {
    //     type: "ordered-list",
    //     children: [
    //       {
    //         text: "",
    //         type: "list-item",
    //       },
    //     ],
    //   },
    //   { match: (n) => Element.isElement(n) && Editor.isBlock(editor, n) }
    // );
  },
  changeFontFamily: (editor: BaseEditor & ReactEditor, fontFamily: string) => {
    Editor.addMark(editor, "fontFamily", fontFamily);
  },
  changeFontType: (editor: BaseEditor & ReactEditor, type: string) => {
    Transforms.setNodes(
      editor,
      {
        type,
      },
      { match: (n) => Element.isElement(n) && Editor.isBlock(editor, n) }
    );
  },
  changeBackgroundColor: (editor: BaseEditor & ReactEditor, color: any) => {
    Editor.addMark(editor, "backgroundColor", color);
  },
  insertLink: (editor: BaseEditor & ReactEditor, link: string) => {
    Transforms.insertNodes(editor, {
      type: "link",
      link,
      children: [
        {
          text: link,
        },
      ],
    });
    Transforms.insertNodes(editor, {
      type: "paragraph",
      children: [{ text: " " }],
    });
  },
};

export const withCopyPaste = (editor: Editor) => {
  const { isInline, isVoid } = editor;

  editor.isInline = (element) => {
    return element?.type === "link" ? true : isInline(element);
  };

  editor.isVoid = (element) => {
    return element?.type === "image" ? true : isVoid(element);
  };

  return editor;
};

export enum Type {
  PARAGRAPH = "paragraph",
  ORDERED_LIST = "ordered-list",
  UNORDERED_LIST = "unordered-list",
  LIST_ITEM = "list-item",
  LIST_ITEM_TEXT = "list-item-text",
}
export const slateSchema: ListsSchema = {
  isConvertibleToListTextNode(node: Node) {
    return Element.isElementType(node, Type.PARAGRAPH);
  },
  isDefaultTextNode(node: Node) {
    return Element.isElementType(node, Type.PARAGRAPH);
  },
  isListNode(node: Node, type: ListType) {
    if (type) {
      return Element.isElementType(node, type);
    }
    return (
      Element.isElementType(node, Type.ORDERED_LIST) ||
      Element.isElementType(node, Type.UNORDERED_LIST)
    );
  },
  isListItemNode(node: Node) {
    return Element.isElementType(node, Type.LIST_ITEM);
  },
  isListItemTextNode(node: Node) {
    return Element.isElementType(node, Type.LIST_ITEM_TEXT);
  },
  createDefaultTextNode(props = {}) {
    return { children: [{ text: "" }], ...props, type: Type.PARAGRAPH };
  },
  createListNode(type: ListType = ListType.UNORDERED, props = {}) {
    const nodeType =
      type === ListType.ORDERED ? Type.ORDERED_LIST : Type.UNORDERED_LIST;
    return { children: [{ text: "" }], ...props, type: nodeType };
  },
  createListItemNode(props = {}) {
    return { children: [{ text: "" }], ...props, type: Type.LIST_ITEM };
  },
  createListItemTextNode(props = {}) {
    return { children: [{ text: "" }], ...props, type: Type.LIST_ITEM_TEXT };
  },
};
