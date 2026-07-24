import { useState } from "react";
import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface ProjectTypePayload {
  organizationId?: string;
  organizationType?: string;
  projectType?: string;
  projectTypeId?: string;
  projectTypeNumber?: number;
  projectTypeImageUrl?: string;
  projectImageUrl?: string;
  isDefault?: boolean;
  isActive?: boolean;
  projectTypes?: Array<{
    projectTypeId?: string;
    isDefault?: boolean;
    isActive?: boolean;
    projectTypeImageUrl?: string;
  }>;
  showToast?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

const isSuccessResponse = (data: any) => {
  if (!data) return false;
  if (data?.error) return false;
  if (typeof data?.code === "string") {
    const code = data.code.toUpperCase();
    if (code.includes("ERROR") || code.includes("FAILED")) return false;
  }
  return true;
};

export const useCreateProjectType = () => {
  const { NEXT_PUBLIC_LEADMANAGER_ENDPOINT } = useEnv();
  const { post } = useAxiosWithAuth(
    `${NEXT_PUBLIC_LEADMANAGER_ENDPOINT}/customized-project-types`,
  );
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const createProjectType = async ({
    organizationId,
    organizationType,
    projectType,
    projectTypeNumber,
    projectTypeImageUrl,
    isDefault = false,
    isActive,
    showToast = true,
    createdBy,
  }: ProjectTypePayload) => {
    if (
      !organizationId ||
      !organizationType ||
      !projectType ||
      !projectTypeNumber ||
      !createdBy
    ) {
      if (showToast) {
        toast.error(t("common.requiredField"));
      }
      return { success: false };
    }
    setLoading(true);
    try {
      const requestData = {
        eventType: "ADD_CUSTOMIZED_PROJECT_TYPE",
        organizationId,
        organizationType,
        projectTypeValue: projectType,
        projectTypeImageUrl,
        projectTypeNumber,
        isDefault,
        ...(typeof isActive === "boolean" ? { isActive } : {}),
        createdBy,
      };
      const data = await post(requestData);
      const success = isSuccessResponse(data);
      if (!success && showToast) {
        toast.error(t("toast.somethingWentWrong"));
      }
      return { success, data: data?.body };
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

  const updateProjectTypeDefault = async ({
    organizationId,
    organizationType,
    projectTypeId,
    projectTypeImageUrl,
    projectImageUrl,
    isDefault,
    isActive,
    projectTypes,
    showToast = true,
    updatedBy,
  }: ProjectTypePayload) => {
    if (
      !organizationId ||
      !organizationType ||
      (!projectTypeId && !(projectTypes && projectTypes.length)) ||
      !updatedBy
    ) {
      if (showToast) {
        toast.error(t("common.requiredField"));
      }
      return { success: false };
    }
    setLoading(true);
    try {
      const requestData: Record<string, any> = {
        eventType: "UPDATE_CUSTOMIZED_PROJECT_TYPE_DEFAULT",
        organizationId,
        organizationType,
        updatedBy,
      };
      if (projectTypeId) {
        requestData.projectTypeId = projectTypeId;
      }
      if (projectTypes && projectTypes.length) {
        requestData.projectTypes = projectTypes;
      }
      if (typeof isDefault === "boolean") {
        requestData.isDefault = isDefault;
      }
      if (typeof isActive === "boolean") {
        requestData.isActive = isActive;
      }
      if (projectTypeImageUrl) {
        requestData.projectTypeImageUrl = projectTypeImageUrl;
      }
      if (projectImageUrl) {
        requestData.projectImageUrl = projectImageUrl;
      }
      const data = await post(requestData);
      const success = isSuccessResponse(data);
      if (success && showToast) {
        toast.success(t("toast.projectTypeUpdatedSuccessfully"));
      }
      if (!success && showToast) {
        toast.error(t("toast.somethingWentWrong"));
      }
      return { success, data: data?.body };
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

  return {
    loading,
    createProjectType,
    updateProjectTypeDefault,
  };
};
