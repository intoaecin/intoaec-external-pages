import { uploadOrganizationMedia } from "@/features/hooks/api/uploadOrganizationMedia";
import { useEnv } from "@/features/hooks/useEnv";
import { useCallback, useState } from "react";
import { buildLeadCaptureV2UploadPath } from "../leadCaptureV2FileAnswer";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

type UseLeadCaptureV2FileUploadParams = {
  organizationId?: string;
  organizationType?: string;
  leadCaptureV2Id?: string;
};

export const useLeadCaptureV2FileUpload = ({
  organizationId,
  organizationType,
  leadCaptureV2Id,
}: UseLeadCaptureV2FileUploadParams) => {
  const { VITE_MEETANDNOTE_ENDPOINT, VITE_APIKEY } = useEnv();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFieldId, setUploadingFieldId] = useState<string | null>(null);

  const uploadFieldFile = useCallback(
    async (fieldId: string, file: File) => {
      if (!organizationId || !organizationType) {
        throw new Error("Organization context is required to upload files.");
      }

      if (!leadCaptureV2Id) {
        throw new Error("Form id is required to upload files.");
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error("FILE_TOO_LARGE");
      }

      setIsUploading(true);
      setUploadingFieldId(fieldId);

      try {
        const relativePath = buildLeadCaptureV2UploadPath({
          leadCaptureV2Id,
          fieldId,
          fileName: file.name,
        });

        const { url } = await uploadOrganizationMedia({
          file,
          organizationId,
          organizationType,
          relativePath,
          eventSource: "LEAD_CAPTURE_V2",
          mediaVaultEndpoint: VITE_MEETANDNOTE_ENDPOINT,
          apiKey: VITE_APIKEY,
        });

        return { url, fileName: file.name };
      } finally {
        setIsUploading(false);
        setUploadingFieldId(null);
      }
    },
    [
      leadCaptureV2Id,
      organizationId,
      organizationType,
      VITE_MEETANDNOTE_ENDPOINT,
      VITE_APIKEY,
    ],
  );

  return {
    uploadFieldFile,
    isUploading,
    uploadingFieldId,
    canUpload: Boolean(organizationId && organizationType && leadCaptureV2Id),
  };
};
