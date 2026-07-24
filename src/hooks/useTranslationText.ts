import { useMutation } from "@tanstack/react-query";
import { useEnv } from "@/features/hooks/useEnv";
import axios from "axios";

type TranslationTextResponseItem = {
  status?: string;
  actual_text?: string;
  translated_text?: string;
};

export const translateTexts = async ({
  modelUri,
  texts,
  language,
}: {
  modelUri?: string;
  texts: string[];
  language: string;
}): Promise<TranslationTextResponseItem[]> => {
  const baseUrl = (modelUri ?? "").trim().replace(/\/$/, "");
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_MODEL_URI is required.");
  }

  const response = await axios.post(
    `${baseUrl}/translate`,
    {
      texts,
      sourceLanguage: "EN",
      targetLanguage: language,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (response.data.status === "success") {
    return response.data.translated_text;
  }

  throw new Error("Translation failed");
};

export const useTranslationText = () => {
  const { NEXT_PUBLIC_MODEL_URI } = useEnv();

  const mutation = useMutation({
    mutationFn: async ({
      data,
      language,
    }: {
      data: string[];
      language: string;
    }) =>
      translateTexts({
        modelUri: NEXT_PUBLIC_MODEL_URI,
        texts: data,
        language,
      }),
  });

  return {
    translateText: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
};
