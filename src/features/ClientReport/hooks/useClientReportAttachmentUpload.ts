import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useEnv } from "@/features/hooks/useEnv";
import axios from "axios";
import { useCallback } from "react";

/**
 * Ported from intoaec-UI `src/features/ClientReport/hooks/useClientReportAttachmentUpload.ts`.
 * The source hook reads `next-auth`'s `useSession()` for
 * `organizationId`/`organizationType` (used to build the upload `filePath`)
 * and the bearer `IdToken` (used as the `Authorization` header). This app has
 * no next-auth session, so `organizationId`/`organizationType` come from
 * `useOrganization()` instead, and the bearer token is dropped — the upload
 * request itself is genuinely unreachable in the external preview (the
 * "attach file" icon that opens the upload dialog is only rendered when
 * `!isPreview`, and this page always renders these components with
 * `isPreview` true), so this only affects dead code.
 */

export type ClientReportUploadableFile = {
  buffer?: string | ArrayBuffer | null;
  fileType?: string;
  fileExtension?: string;
  name?: string;
  file?: File;
  size?: number;
};

export type ClientReportUploadedAttachment = {
  fileName: string;
  fileExtension: string;
  fileUrl: string;
};

const getFileExtension = (fileName?: string, fallback?: string) => {
  const extension = fileName?.split(".").pop();
  return (extension || fallback || "file").toLowerCase();
};

const dataUrlToFile = (
  dataUrl: string,
  fileName: string,
  fileType?: string,
) => {
  const [metadata, base64Value] = dataUrl.split(",");
  const mimeType =
    fileType || metadata.match(/data:(.*);base64/)?.[1] || "application/octet-stream";
  const binaryValue = atob(base64Value || "");
  const bytes = new Uint8Array(binaryValue.length);

  for (let index = 0; index < binaryValue.length; index += 1) {
    bytes[index] = binaryValue.charCodeAt(index);
  }

  return new File([bytes], fileName, { type: mimeType });
};

const getUploadFile = (file: ClientReportUploadableFile) => {
  if (file.file) return file.file;

  const fileExtension = getFileExtension(file.name, file.fileExtension);
  const fileName = file.name || `attachment.${fileExtension}`;

  if (typeof file.buffer === "string") {
    return dataUrlToFile(file.buffer, fileName, file.fileType);
  }

  if (file.buffer instanceof ArrayBuffer) {
    return new File([file.buffer], fileName, {
      type: file.fileType || "application/octet-stream",
    });
  }

  return null;
};

export const useClientReportAttachmentUpload = () => {
  const { organizationId, organizationType } = useOrganization();
  const { NEXT_PUBLIC_MEETANDNOTE_ENDPOINT } = useEnv();

  const uploadClientReportAttachments = useCallback(
    async (
      files: ClientReportUploadableFile[],
      clientReportId: string,
    ): Promise<ClientReportUploadedAttachment[]> => {
      if (!files.length) return [];

      const uploadedAttachments: ClientReportUploadedAttachment[] = [];

      for (const file of files) {
        const uploadFile = getUploadFile(file);
        if (!uploadFile) continue;

        const fileExtension = getFileExtension(
          uploadFile.name,
          file.fileExtension,
        );
        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("fileExtension", fileExtension);
        formData.append(
          "filePath",
          `${organizationId}/${organizationType}/CLIENT_REPORTS/${clientReportId}/${uploadFile.name}`,
        );
        formData.append("eventType", "ADD_MEDIA");
        formData.append("eventSource", "CLIENT_REPORTS");

        const response = await axios.post(
          `${NEXT_PUBLIC_MEETANDNOTE_ENDPOINT}/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        const fileUrl = response.data?.body?.[0]?.uri;
        if (fileUrl) {
          uploadedAttachments.push({
            fileName: uploadFile.name,
            fileExtension,
            fileUrl,
          });
        }
      }

      return uploadedAttachments;
    },
    [NEXT_PUBLIC_MEETANDNOTE_ENDPOINT, organizationId, organizationType],
  );

  return { uploadClientReportAttachments };
};
