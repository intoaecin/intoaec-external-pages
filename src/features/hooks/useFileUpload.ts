import { useAxios } from "./useAxios";
import { useEnv } from "./useEnv";
import { useOrganization } from "@/features/components/providers/OrganizationThemeProvider";
import { useState } from "react";
import { uploadOrganizationMedia } from "./api/uploadOrganizationMedia";

interface UseFileUploadOptions {
  basePath: string;
  eventSource: string;
  uploadTimeoutMs?: number;
  maxFileSizeBytes?: number;
  customEndpoint?: string;
}

export const useFileUpload = ({
  basePath,
  eventSource,
  uploadTimeoutMs,
  maxFileSizeBytes,
  customEndpoint,
}: UseFileUploadOptions) => {
  const { organizationId, organizationType } = useOrganization();
  const { NEXT_PUBLIC_MEETANDNOTE_ENDPOINT, NEXT_PUBLIC_APIKEY } = useEnv();
  const endpoint = customEndpoint || NEXT_PUBLIC_MEETANDNOTE_ENDPOINT;
  const { post: mediaHandler } = useAxios(
    endpoint === NEXT_PUBLIC_MEETANDNOTE_ENDPOINT
      ? endpoint + "/delete-media"
      : endpoint + "/delete",
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = async (file: File, path: string) => {
    if (!organizationId || !organizationType) {
      throw new Error("Organization context is required to upload files.");
    }

    setIsUploading(true);
    setError(null);

    try {
      const { url } = await uploadOrganizationMedia({
        file,
        organizationId,
        organizationType,
        relativePath: `${basePath}/${path}`,
        eventSource,
        mediaVaultEndpoint: endpoint,
        apiKey: NEXT_PUBLIC_APIKEY,
        maxBytes: maxFileSizeBytes,
        timeoutMs: uploadTimeoutMs,
      });

      return url;
    } catch (uploadError) {
      console.error("Error uploading file:", uploadError);
      const normalizedError =
        uploadError instanceof Error
          ? uploadError
          : new Error("Failed to upload file");
      setError(normalizedError);
      throw uploadError;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (path: string) => {
    setIsDeleting(true);
    setError(null);

    try {
      const requestData = {
        eventType: "DELETE_MEDIA",
        keys: [path.split("/").splice(3).join("/")],
      };
      await mediaHandler(requestData);
    } catch (deleteError) {
      console.error("Error deleting file:", deleteError);
      const normalizedError =
        deleteError instanceof Error
          ? deleteError
          : new Error("Failed to delete file");
      setError(normalizedError);
      throw deleteError;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    uploadFile,
    deleteFile,
    isUploading,
    isDeleting,
    error,
  };
};
