export type AttachmentItem =
  | { kind: "existing"; url: string; name?: string }
  | { kind: "new"; file: File };

/** Value emitted to parent state — existing URLs as strings, new picks as File objects. */
export type AttachmentUploadValue = File | string;

export type AttachmentStateSource = {
  attachment?: AttachmentUploadValue[] | string;
  attachmentUrls?: string[] | string;
};

export const DEFAULT_DOCUMENT_ATTACHMENT_ACCEPT =
  "image/*,application/pdf,.xls,.xlsx,.csv,.dwg";

const UUID_FILE_NAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]+$/i;

function decodeAttachmentPathSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function looksLikeAttachmentFileName(segment: string): boolean {
  const dotIndex = segment.lastIndexOf(".");
  if (dotIndex <= 0 || dotIndex === segment.length - 1) return false;
  const extension = segment.slice(dotIndex + 1);
  return /^[a-z0-9]+$/i.test(extension);
}

export function getAttachmentFileName(url: string): string {
  const pathParts = url
    .split("?")[0]
    .split("#")[0]
    .split("/")
    .filter(Boolean)
    .map(decodeAttachmentPathSegment);
  const fileName = pathParts[pathParts.length - 1] ?? "attachment";
  const parentFileName = pathParts[pathParts.length - 2];

  // Media vault stores `.../{originalFileName}/{uuid}.ext`. Only promote the
  // parent when it looks like a real file name, not a folder like "attachments".
  return parentFileName &&
    UUID_FILE_NAME_PATTERN.test(fileName) &&
    looksLikeAttachmentFileName(parentFileName)
    ? parentFileName
    : fileName;
}

export function attachmentItemFromUploadValue(
  value: AttachmentUploadValue,
): AttachmentItem {
  if (typeof value === "string") {
    return {
      kind: "existing",
      url: value,
      name: getAttachmentFileName(value),
    };
  }
  return { kind: "new", file: value };
}

export function attachmentItemsToUploadValues(
  items: AttachmentItem[],
): AttachmentUploadValue[] {
  return items.map((item) =>
    item.kind === "existing" ? item.url : item.file,
  );
}

export function getAttachmentName(item: AttachmentItem): string {
  if (item.kind === "existing") {
    return item.name ?? getAttachmentFileName(item.url);
  }
  return item.file.name;
}

export function getAttachmentMimeType(item: AttachmentItem): string {
  if (item.kind === "existing") {
    const ext =
      getAttachmentFileName(item.url).split(".").pop()?.toLowerCase() ?? "";
    if (ext === "pdf") return "application/pdf";
    if (["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg"].includes(ext)) {
      return `image/${ext === "jpg" ? "jpeg" : ext}`;
    }
    if (ext === "xls") return "application/vnd.ms-excel";
    if (ext === "xlsx") {
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }
    if (ext === "csv") return "text/csv";
    return "";
  }
  return item.file.type;
}

export function isAttachmentImage(item: AttachmentItem): boolean {
  const mime = getAttachmentMimeType(item);
  return mime.startsWith("image/");
}

export function isAttachmentPdf(item: AttachmentItem): boolean {
  return getAttachmentMimeType(item) === "application/pdf";
}

export function sanitizeAttachmentUrls(urls: string[]): string[] {
  return urls.filter(
    (url): url is string => typeof url === "string" && url.trim().length > 0,
  ).map((url) => url.trim());
}

/** Normalize API arrays, JSON strings, and database array strings into URLs. */
export function parseAttachmentUrls(value: unknown): string[] {
  if (Array.isArray(value)) {
    return sanitizeAttachmentUrls(
      value.filter((entry): entry is string => typeof entry === "string"),
    );
  }

  if (value && typeof value === "object") {
    return parseAttachmentUrls(Object.values(value));
  }

  if (typeof value !== "string" || !value.trim()) return [];

  const trimmedValue = value.trim();
  try {
    const parsed = JSON.parse(trimmedValue) as unknown;
    if (parsed !== trimmedValue) {
      const parsedUrls = parseAttachmentUrls(parsed);
      if (parsedUrls.length > 0) return parsedUrls;
    }
  } catch {
    // Database array strings such as {"url-1","url-2"} are handled below.
  }

  const listValue =
    trimmedValue.startsWith("{") && trimmedValue.endsWith("}")
      ? trimmedValue.slice(1, -1)
      : trimmedValue;

  return sanitizeAttachmentUrls(
    listValue
      .split(",")
      .map((url) => url.trim().replace(/^"|"$/g, "")),
  );
}

export function getAttachmentUploadValues(
  data?: AttachmentStateSource,
): AttachmentUploadValue[] {
  if (!data) return [];

  if (Array.isArray(data.attachment) && data.attachment.length > 0) {
    return data.attachment.filter((value): value is AttachmentUploadValue => {
      if (typeof value === "string") return value.trim().length > 0;
      return typeof File !== "undefined" && value instanceof File;
    });
  }

  const attachmentUrls = parseAttachmentUrls(data.attachment);
  if (attachmentUrls.length > 0) return attachmentUrls;

  return parseAttachmentUrls(data.attachmentUrls);
}

export function getStoredAttachmentUrls(
  data?: AttachmentStateSource,
): string[] {
  if (!data) return [];

  const attachmentUrls = parseAttachmentUrls(data.attachmentUrls);
  if (attachmentUrls.length > 0) return attachmentUrls;

  return parseAttachmentUrls(data.attachment);
}

export function normalizeAttachmentState<T extends AttachmentStateSource>(
  data: T,
): T & { attachment: string[]; attachmentUrls: string[] } {
  const attachmentUrls = getStoredAttachmentUrls(data);
  return {
    ...data,
    attachment: attachmentUrls,
    attachmentUrls,
  };
}

export function applyAttachmentStateUpdate<T extends AttachmentStateSource>(
  prev: T | undefined,
  files: AttachmentUploadValue[],
): T & { attachment: AttachmentUploadValue[]; attachmentUrls?: string[] } {
  return {
    ...(prev ?? ({} as T)),
    attachment: files,
    ...(files.length === 0 ? { attachmentUrls: [] } : {}),
  };
}

export async function resolveAttachmentUrls(
  attachments: AttachmentUploadValue[] | undefined,
  uploadFile: (file: File, path: string) => Promise<string>,
  uploadPath: string,
): Promise<string[]> {
  if (!attachments?.length) return [];

  const urls: string[] = [];
  for (const attachment of attachments) {
    if (typeof attachment === "string") {
      urls.push(attachment);
    } else if (attachment instanceof File) {
      const originalFileName = attachment.name?.trim() || "file";
      const uploadedUrl = await uploadFile(
        attachment,
        `${uploadPath}/${originalFileName}`,
      );
      if (!uploadedUrl?.trim()) {
        throw new Error("Upload failed");
      }
      urls.push(uploadedUrl);
    }
  }
  return urls;
}

/** Upload new files, keep existing URLs, and delete removed ones from storage. */
export async function syncResolvedAttachments({
  attachments,
  uploadFile,
  uploadPath,
  previousUrls = [],
  deleteFile,
}: {
  attachments: AttachmentUploadValue[] | undefined;
  uploadFile: (file: File, path: string) => Promise<string>;
  uploadPath: string;
  previousUrls?: string[];
  deleteFile?: (url: string) => Promise<void>;
}): Promise<string[]> {
  const attachmentUrls = sanitizeAttachmentUrls(
    await resolveAttachmentUrls(attachments, uploadFile, uploadPath),
  );

  if (deleteFile) {
    const removedUrls = previousUrls.filter(
      (url) => !attachmentUrls.includes(url),
    );
    await Promise.all(removedUrls.map((url) => deleteFile(url)));
  }

  return attachmentUrls;
}

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "webp",
  "svg",
]);

const COMPOUND_ACCEPT_EXTENSIONS = new Set([
  ...IMAGE_EXTENSIONS,
  "pdf",
  "xls",
  "xlsx",
  "csv",
  "dwg",
  "dxf",
  "rvt",
  "skp",
]);

export function isExtensionAllowed(
  extension: string,
  acceptFormat: string,
): boolean {
  const normalized = extension.toLowerCase();
  if (acceptFormat === "image/*") {
    return IMAGE_EXTENSIONS.has(normalized);
  }
  if (acceptFormat.includes(",")) {
    return COMPOUND_ACCEPT_EXTENSIONS.has(normalized);
  }
  return true;
}
