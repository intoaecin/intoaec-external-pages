import { useState } from "react";
import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export const useStoreLeadResponse = () => {
  const { NEXT_PUBLIC_PROPOSAL_ENDPOINT } = useEnv();
  const { post } = useAxios(NEXT_PUBLIC_PROPOSAL_ENDPOINT + "/session");
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const storeLeadResponse = async ({
    leadId,
    leadCaptureResponse,
    showToast = false,
  }: {
    leadId?: string;
    leadCaptureResponse?: any;
    showToast?: boolean;
  }) => {
    if (!leadId) return { success: false };
    setLoading(true);
    try {
      const requestData = {
        eventType: "LEAD_CREATE_RESPONSE",
        leadId,
        ...leadCaptureResponse,
      };
      const data = await post(requestData);
      if (data?.code === "LEAD_RESPONSE_CREATED") {
        if (showToast) {
          toast.success(t("toast.responseSavedSuccessfully"));
        }
        return { success: true, data: data?.body };
      }
      return { success: false };
    } catch (error) {
      console.error(error);
      if (showToast) {
        toast.error(t("toast.somethingWentWrong"));
      }
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { storeLeadResponse, loading };
};
