import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useQuery } from "@tanstack/react-query";
import type { SharedDrawing } from "../types";

interface SharedDrawingResponse {
  code?: string;
  body?: SharedDrawing;
}

/** The drawing and its markups behind a client share link (MeetAndNote `FETCH_SHARED_DRAWING`). */
export const useSharedDrawing = (leadFileId?: string) => {
  const { NEXT_PUBLIC_MEETANDNOTE_ENDPOINT } = useEnv();
  const { post } = useAxios<SharedDrawingResponse>(
    `${NEXT_PUBLIC_MEETANDNOTE_ENDPOINT}/lead-file-management`,
    false,
  );

  return useQuery<SharedDrawing>({
    queryKey: ["shared-drawing", leadFileId],
    enabled: Boolean(leadFileId),
    retry: false,
    queryFn: async () => {
      const response = (await post({
        eventType: "FETCH_SHARED_DRAWING",
        leadFileId,
      })) as SharedDrawingResponse;
      if (response?.code !== "SHARED_DRAWING_RETRIEVED" || !response.body) {
        throw new Error("SHARED_DRAWING_NOT_FOUND");
      }
      return response.body;
    },
  });
};
