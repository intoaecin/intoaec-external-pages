"use client";

import { CommentsProvider } from "@udecode/plate-comments";
import { Plate, useEditorRef } from "@udecode/plate-common";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { usePlateEditorCustom } from "@/features/hooks/usePlateEditorCustom";
import { CommentsPopover } from "@/components/plate-ui/comments-popover";
import { CursorOverlay } from "@/components/plate-ui/cursor-overlay";
import { Editor } from "@/components/plate-ui/editor";
import { MentionCombobox } from "@/components/plate-ui/mention-combobox";
import { commentsUsers, myUserId } from "@/lib/plate/comments";
import { MENTIONABLES } from "@/lib/plate/mentionables";
import { plugins } from "@/lib/plate/plate-plugins";
import "@/styles/tailwind.css";
import { TooltipProvider } from "./plate-ui/tooltip";
import { useTranslation } from "react-i18next";

const EMPTY_SLATE_VALUE = [{ type: "p", children: [{ text: "" }] }];

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeSlateNodeArray = (raw: unknown): any[] => {
  if (raw === undefined || raw === null || raw === "") {
    return EMPTY_SLATE_VALUE;
  }

  let value: unknown = raw;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return EMPTY_SLATE_VALUE;
    }

    try {
      value = JSON.parse(trimmed);
    } catch {
      return [
        {
          type: "p",
          children: [{ text: trimmed }],
        },
      ];
    }
  }

  const normalizeChildNode = (node: unknown): any[] => {
    if (node === undefined || node === null) {
      return [];
    }

    if (typeof node === "string") {
      return [
        {
          text: node,
        },
      ];
    }

    if (!isPlainObject(node)) {
      return [];
    }

    const { children, text, type, ...rest } = node;

    if (typeof text === "string" && typeof type !== "string") {
      return [
        {
          ...rest,
          text,
        },
      ];
    }

    if (typeof type === "string") {
      const normalizedChildren = Array.isArray(children)
        ? children.flatMap((child) => normalizeChildNode(child))
        : [];

      return [
        {
          ...node,
          children:
            normalizedChildren.length > 0
              ? normalizedChildren
              : [{ text: "" }],
        },
      ];
    }

    if (Array.isArray(children)) {
      return children.flatMap((child) => normalizeChildNode(child));
    }

    return [];
  };

  const normalizeTopLevelNode = (node: unknown): any[] => {
    if (node === undefined || node === null) {
      return [];
    }

    if (typeof node === "string") {
      return [
        {
          type: "p",
          children: [{ text: node }],
        },
      ];
    }

    if (!isPlainObject(node)) {
      return [];
    }

    const { children, text, type, ...rest } = node;

    if (typeof type === "string") {
      const normalizedChildren = Array.isArray(children)
        ? children.flatMap((child) => normalizeChildNode(child))
        : [];

      return [
        {
          ...node,
          children:
            normalizedChildren.length > 0
                ? normalizedChildren
                : [{ text: "" }],
        },
      ];
    }

    if (typeof text === "string") {
      return [
        {
          type: "p",
          children: [{ ...rest, text }],
        },
      ];
    }

    if (Array.isArray(children)) {
      const normalizedChildren = children.flatMap((child) =>
        normalizeTopLevelNode(child),
      );
      return normalizedChildren.length > 0
        ? normalizedChildren
        : EMPTY_SLATE_VALUE;
    }

    return EMPTY_SLATE_VALUE;
  };

  if (Array.isArray(value)) {
    const normalized = value.flatMap((node) => normalizeTopLevelNode(node));
    return normalized.length > 0 ? normalized : EMPTY_SLATE_VALUE;
  }

  if (isPlainObject(value)) {
    return normalizeTopLevelNode(value);
  }

  return EMPTY_SLATE_VALUE;
};

const PlateEditorInner = ({
  id,
  readOnly,
  value,
  onChange,
  onChangeBlur,
  intialValue,
  editorRef,
  editorHeight,
  placeHolder,
}: {
  id: string;
  value?: any;
  intialValue?: any;
  readOnly?: boolean;
  onChange?: (value: any) => void;
  onChangeBlur?: (value: any) => void;
  editorRef?: any;
  editorHeight?: string;
  placeHolder?: string;
}) => {
  const containerRef = useRef(null);
  const { t } = useTranslation();
  const editor = useEditorRef(id);
  const initialSlateValue = useMemo(
    () => normalizeSlateNodeArray(value ?? intialValue),
    [value, intialValue],
  );
  const [currentValue, setCurrentValue] = useState<any>(initialSlateValue);
  const { setExternalToolBar } = usePlateEditorCustom();
  // const formatSlateValue = (val: any) => {
  //   if (Array.isArray(val)) return val;
  //   if (typeof val === "string") {
  //     try {
  //       const parsed = JSON.parse(val);
  //       if (Array.isArray(parsed)) return parsed;
  //       return [{ type: "p", children: [{ text: String(parsed) }] }];
  //     } catch (e) {
  //       return [{ type: "p", children: [{ text: val }] }];
  //     }
  //   }
  //   return [{ type: "p", children: [{ text: "" }] }];
  // };

  // const [currentValue, setCurrentValue] = useState<any>(
  //   formatSlateValue(value),
  // );
  // Keep controlled value in sync when props change (e.g. template apply in edit PO/WO).
  // useLayoutEffect avoids a frame where the editor still shows stale content after `editor` mounts.
  useLayoutEffect(() => {
    if (value === undefined || value === null) {
      return;
    }
    const normalizedValue = normalizeSlateNodeArray(value);
    setCurrentValue(normalizedValue);
    if (editor) {
      editor.children = normalizedValue as any;
    }
  }, [value, editor]);

  return (
    <div
      id="plate-intoaec-root"
      className="no-global-styles"
      style={{ width: "100%", height: "100%" }}
    >
      <TooltipProvider>
        <CommentsProvider users={commentsUsers} myUserId={myUserId}>
          <Plate
            plugins={plugins}
            id={id}
            editorRef={editorRef}
            readOnly={readOnly}
            value={currentValue}
            initialValue={initialSlateValue}
            onChange={(val) => {
              onChange?.(val);
              setCurrentValue(val);
            }}
          >
            <div ref={containerRef}>
              <Editor
                className=" "
                autoFocus={false}
                placeholder={
                  placeHolder !== undefined
                    ? placeHolder
                    : readOnly
                      ? ""
                      : t("modal.typeAParagraph")
                }
                style={{ width: "100%", minHeight: editorHeight ?? "inherit" }}
                focusRing={false}
                variant="ghost"
                size="md"
                onBlur={() => {
                  if (currentValue) {
                    onChangeBlur?.(currentValue);
                  }
                }}
                onFocus={() => {
                  setExternalToolBar?.(true);
                }}
              />
              <MentionCombobox items={MENTIONABLES} />
              <CommentsPopover />
              <CursorOverlay containerRef={containerRef} />
            </div>
          </Plate>
        </CommentsProvider>
      </TooltipProvider>
    </div>
  );
};

export default PlateEditorInner;
