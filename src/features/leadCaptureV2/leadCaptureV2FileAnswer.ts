import type { LeadCaptureV2PreviewAnswer } from "./components/customerPreview/leadCaptureV2CustomerPreviewTypes";

const FILE_ANSWER_PREFIX = "__lcv2_file__:";

export type LeadCaptureV2FileAnswer = {
  url: string;
  fileName: string;
};

export const serializeLeadCaptureV2FileAnswer = (
  payload: LeadCaptureV2FileAnswer,
): string => `${FILE_ANSWER_PREFIX}${JSON.stringify(payload)}`;

export const parseLeadCaptureV2FileAnswer = (
  answer: string | undefined,
): LeadCaptureV2FileAnswer | null => {
  if (!answer?.startsWith(FILE_ANSWER_PREFIX)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      answer.slice(FILE_ANSWER_PREFIX.length),
    ) as Partial<LeadCaptureV2FileAnswer>;
    const url = typeof parsed.url === "string" ? parsed.url.trim() : "";
    if (!url) {
      return null;
    }

    return {
      url,
      fileName:
        typeof parsed.fileName === "string" && parsed.fileName.trim()
          ? parsed.fileName.trim()
          : "file",
    };
  } catch {
    return null;
  }
};

export const isImageUrl = (url: unknown): boolean => {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return false;
  const path = trimmed.split("?")[0].toLowerCase();
  return (
    path.endsWith(".png") ||
    path.endsWith(".jpg") ||
    path.endsWith(".jpeg") ||
    path.endsWith(".gif") ||
    path.endsWith(".webp") ||
    path.endsWith(".svg") ||
    path.includes("signature") ||
    path.includes("esign")
  );
};

export const hasLeadCaptureV2FileAnswer = (
  answer: LeadCaptureV2PreviewAnswer | undefined,
): boolean => {
  if (typeof answer !== "string") {
    return false;
  }

  return Boolean(parseLeadCaptureV2FileAnswer(answer)?.url);
};

export const buildLeadCaptureV2UploadPath = ({
  leadCaptureV2Id,
  fieldId,
  fileName,
}: {
  leadCaptureV2Id: string;
  fieldId: string;
  fileName: string;
}) => {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]+/g, "_");
  return `LEAD_CAPTURE_V2/${leadCaptureV2Id}/${fieldId}/${Date.now()}-${sanitizedName}`;
};
