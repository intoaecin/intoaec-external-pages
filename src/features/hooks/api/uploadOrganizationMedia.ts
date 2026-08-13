import axios, { type AxiosProgressEvent } from "axios";

export type UploadOrganizationMediaParams = {
  file: File;
  organizationId: string;
  organizationType: string;
  /** Path segment after `{organizationId}/{organizationType}/`. */
  relativePath: string;
  eventSource: string;
  mediaVaultEndpoint: string;
  /** @deprecated Ignored on public lead-capture pages — apiKey only. */
  idToken?: string | null;
  /** Max file size in bytes; throws if exceeded. */
  maxBytes?: number;
  /** Axios request timeout in ms; 0 means no timeout. */
  timeoutMs?: number;
  onUploadProgress?: (event: AxiosProgressEvent) => void;
  apiKey?: string | null;
};

export type UploadOrganizationMediaResult = {
  url: string;
};

export class FileTooLargeError extends Error {
  constructor(
    public readonly fileName: string,
    public readonly maxBytes: number,
  ) {
    super("FILE_TOO_LARGE");
    this.name = "FileTooLargeError";
  }
}

export async function uploadOrganizationMedia({
  file,
  organizationId,
  organizationType,
  relativePath,
  eventSource,
  mediaVaultEndpoint,
  maxBytes,
  timeoutMs = 0,
  onUploadProgress,
  apiKey,
}: UploadOrganizationMediaParams): Promise<UploadOrganizationMediaResult> {
  if (maxBytes !== undefined && file.size > maxBytes) {
    throw new FileTooLargeError(file.name, maxBytes);
  }

  const resolvedApiKey = apiKey ?? null;
  const filePath = `${organizationId}/${organizationType}/${relativePath}`;
  const formData = new FormData();
  const filename = file.name || "file";
  const extension = filename.includes(".")
    ? filename.split(".").pop() ?? ""
    : "";

  formData.append("file", file, filename);
  formData.append("fileExtension", extension);
  formData.append("filePath", filePath);
  formData.append("eventType", "ADD_MEDIA");
  formData.append("eventSource", eventSource);

  const { data } = await axios.post(`${mediaVaultEndpoint}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(resolvedApiKey ? { apikey: resolvedApiKey } : {}),
    },
    timeout: timeoutMs,
    onUploadProgress,
  });

  const url =
    typeof data?.body?.[0]?.uri === "string" ? data.body[0].uri.trim() : "";

  if (!url) {
    throw new Error("Upload failed");
  }

  return { url };
}
