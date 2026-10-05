import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEnv } from "@/features/hooks/useEnv";
import type { ExcelWorkbookSpec } from "@/types/excelExport";

const saveBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/**
 * Downloads a workbook rendered by aec-botsync — the centralized place for
 * file downloads. Pass the content as an `ExcelWorkbookSpec`; botsync styles it.
 */
export const useExcelExport = () => {
  const { VITE_BOTSYNC_AI, VITE_AEC_CHATBOT_ENDPOINT } = useEnv();
  // Both point at aec-botsync; this app's env normally only sets the chatbot
  // one (also used for /download-pdf), so fall back to it.
  const botsyncEndpoint = VITE_BOTSYNC_AI || VITE_AEC_CHATBOT_ENDPOINT;

  const mutation = useMutation({
    mutationFn: async (spec: ExcelWorkbookSpec) => {
      const response = await axios.post<Blob>(
        `${botsyncEndpoint}/api/exports/excel`,
        spec,
        { responseType: "blob" },
      );
      saveBlob(response.data, spec.fileName);
    },
  });

  return { exportExcel: mutation.mutateAsync, exporting: mutation.isPending };
};
