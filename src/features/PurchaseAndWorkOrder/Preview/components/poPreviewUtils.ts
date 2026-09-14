import { base64Decode } from "@/utils/string";

export interface OpenDialogItemState {
  open: boolean;
  item: any | null;
}

export const normalizeTermsAndConditionData = (value: any) => {
  if (!value) return undefined;
  if (Array.isArray(value) || typeof value === "object") return value;

  if (typeof value === "string") {
    try {
      return JSON.parse(base64Decode(value));
    } catch (error) {
      try {
        return JSON.parse(value);
      } catch (innerError) {
        return undefined;
      }
    }
  }

  return undefined;
};

/** Non-empty trimmed URL string */
export const isUsableAttachmentUrl = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

/**
 * When editing a PO, `attachments` is updated by the uploader but `attachmentUrls`
 * from the initial fetch can stay populated. If `attachments` is an array (including
 * empty), it is the source of truth for preview; otherwise fall back to URL fields.
 */
export const getPOPreviewAttachmentItems = (poData: {
  attachments?: unknown;
  attachmentUrls?: unknown;
  attachmentsUrl?: unknown;
}): unknown[] => {
  const filterList = (list: unknown[]): unknown[] =>
    list.filter((entry) => {
      if (entry instanceof File) return true;
      if (typeof entry === "string") return isUsableAttachmentUrl(entry);
      if (entry && typeof entry === "object" && "url" in entry) {
        return isUsableAttachmentUrl((entry as { url: unknown }).url);
      }
      return false;
    });

  if (Array.isArray(poData?.attachments)) {
    return filterList(poData?.attachments);
  }

  const urlSources = [poData?.attachmentUrls, poData?.attachmentsUrl].filter(
    Array.isArray
  ) as unknown[][];
  return filterList(urlSources.flat());
};
