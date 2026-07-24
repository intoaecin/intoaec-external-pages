import { base64Decode } from "@/utils/string";

/**
 * Converts stored terms-and-conditions payloads (S3 JSON, RFQ→PO import, templates)
 * into a Slate / Plate editor value: an array of block nodes.
 *
 * Preview components often accept a single root object (`PlateContentStatic` wraps
 * non-arrays), but the Plate editor requires `Descendant[]`. This aligns both paths.
 */
export function toPlateTermsEditorValue(raw: unknown): unknown[] | undefined {
  if (raw === undefined || raw === null || raw === "") {
    return undefined;
  }

  let v: unknown = raw;
  if (typeof v === "string") {
    const trimmed = v.trim();
    if (!trimmed) return undefined;
    try {
      v = JSON.parse(base64Decode(trimmed));
    } catch {
      try {
        v = JSON.parse(trimmed);
      } catch {
        return undefined;
      }
    }
  }

  if (Array.isArray(v)) {
    return v.length > 0 ? v : undefined;
  }

  if (typeof v === "object" && v !== null) {
    const o = v as Record<string, unknown>;
    if (Array.isArray(o.children) && o.children.length > 0) {
      const first = o.children[0] as Record<string, unknown> | undefined;
      if (first && typeof first.type === "string") {
        return o.children as unknown[];
      }
    }
    if (typeof o.type === "string" && Array.isArray(o.children)) {
      return [v];
    }
  }

  return undefined;
}
