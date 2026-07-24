import React from "react";

/**
 * Renders Plate/Slate editor JSON as static HTML-friendly React elements.
 * Use this when content must appear in initial HTML (e.g. PDF export) since
 * PlateEditor is client-only (ssr: false) and would show empty during fetch.
 */
const BLOCK_TAG: Record<string, keyof JSX.IntrinsicElements> = {
  p: "p",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  blockquote: "blockquote",
  li: "li",
  ul: "ul",
  ol: "ol",
};

function isTextNode(node: any): node is { text: string; bold?: boolean; italic?: boolean; underline?: boolean } {
  return node && typeof node.text === "string";
}

function renderLeaf(node: { text: string; bold?: boolean; italic?: boolean; underline?: boolean }): React.ReactNode {
  let content: React.ReactNode = node.text;
  if (node.bold) content = <strong>{content}</strong>;
  if (node.italic) content = <em>{content}</em>;
  if (node.underline) content = <u>{content}</u>;
  return content;
}

function renderChildren(children: any[]): React.ReactNode[] {
  if (!Array.isArray(children)) return [];
  return children.map((child, i) => {
    if (isTextNode(child)) {
      return <React.Fragment key={i}>{renderLeaf(child)}</React.Fragment>;
    }
    if (child?.type && child?.children) {
      const Tag = BLOCK_TAG[child.type] ?? "p";
      return (
        <Tag key={i} style={{ margin: "0 0 0.5em 0" }}>
          {renderChildren(child.children)}
        </Tag>
      );
    }
    return null;
  });
}

function renderBlock(node: any, index: number): React.ReactNode {
  if (!node) return null;
  if (isTextNode(node)) {
    return <React.Fragment key={index}>{renderLeaf(node)}</React.Fragment>;
  }
  const children = node.children;
  if (!Array.isArray(children)) return null;
  const blockType = node.type ?? "p";
  const Tag = BLOCK_TAG[blockType] ?? "p";
  return (
    <Tag key={index} style={{ margin: "0 0 0.5em 0" }}>
      {renderChildren(children)}
    </Tag>
  );
}

export function PlateContentStatic({
  value,
  className,
  style,
}: {
  value: any;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!value) return null;
  const nodes = Array.isArray(value) ? value : [value];
  if (nodes.length === 0) return null;
  return (
    <div className={className} style={{ ...style, lineHeight: 1.5 }}>
      {nodes.map((node, i) => renderBlock(node, i))}
    </div>
  );
}

export default PlateContentStatic;
