import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SharedDrawing } from "../types";

type RespondPayload =
  | { response: "ACCEPTED"; signatureUrl: string }
  | { response: "REJECTED"; rejectionReason: string };

interface RespondResponse {
  code?: string;
  body?: SharedDrawing;
}

/** Client accepts (signed) or rejects (with a reason) a shared drawing; no session, apiKey only. */
export const useRespondToSharedDrawing = (leadFileId: string) => {
  const queryClient = useQueryClient();
  const { NEXT_PUBLIC_MEETANDNOTE_ENDPOINT } = useEnv();
  const { post } = useAxios<RespondResponse>(
    `${NEXT_PUBLIC_MEETANDNOTE_ENDPOINT}/lead-file-management`,
    false,
  );

  return useMutation({
    mutationFn: async (payload: RespondPayload) => {
      const response = (await post({
        eventType: "RESPOND_TO_SHARED_DRAWING",
        leadFileId,
        ...payload,
      })) as RespondResponse;
      if (response?.code !== "DRAWING_RESPONSE_RECORDED" || !response.body) {
        throw new Error(response?.code ?? "DRAWING_RESPONSE_FAILED");
      }
      return response.body;
    },
    onSuccess: (drawing) =>
      queryClient.setQueryData(["shared-drawing", leadFileId], drawing),
  });
};
