import { useAxios, useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import {
  LeadStatusesTypes,
  ModuleTypes,
  ProjectType,
  UsersTypes,
  MacrosListTypes,
} from "@/types";
import { useTheme } from "@mui/material";
import { ReactNode, createContext, useEffect, useState } from "react";
import {
  keepPreviousData,
  useQuery,
  type QueryObserverResult,
} from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useTranslationText } from "@/hooks/useTranslationText";
import { useSession } from "next-auth/react";

interface leadSourcesTypes {
  leadSourceId: string;
  leadSourceSubCategory: string;
}

interface FixtureProviderProps {
  leadStages: LeadStatusesTypes[];
  leadStatus: LeadStatusesTypes[];
  leadSources: leadSourcesTypes[];
  modules: ModuleTypes[];
  usersData: UsersTypes[];
  projectTypes: ProjectType[];
  projectTypesWithTrue: ProjectType[];
  /** Background refetch; does not clear cached list while updating (no loading flash). */
  refetchProjectTypes: () => Promise<
    QueryObserverResult<ProjectType[], Error>
  >;
}

export const FixtureContext = createContext<FixtureProviderProps>({
  leadStages: [],
  leadStatus: [],
  leadSources: [],
  modules: [],
  usersData: [],
  projectTypes: [],
  projectTypesWithTrue: [],
  refetchProjectTypes: async () =>
    ({}) as QueryObserverResult<ProjectType[], Error>,
});

export const FixtureProvider = ({ children }: { children: ReactNode }) => {
  const {
    VITE_LEADMANAGER_ENDPOINT,
    VITE_USERHUB_ENDPOINT,
    VITE_AECPOSTMAN_ENDPOINT,
  } = useEnv();
  const { post, response, error } = useAxiosWithAuth(
    VITE_LEADMANAGER_ENDPOINT + "/fetch",
  );
  const { post: projectTypesAxiosPost } = useAxiosWithAuth(
    VITE_LEADMANAGER_ENDPOINT + "/customized-project-types",
  );

  const { data: session } = useSession();
  const organizationId = session?.["custom:organization_id"];
  const organizationType = session?.["custom:organization_type"];
  const {
    post: userhubPost,
    response: userHubResponse,
    error: userHubError,
  } = useAxiosWithAuth(VITE_USERHUB_ENDPOINT + "/userhub");
  const { i18n } = useTranslation();
  const { translateText } = useTranslationText();
  const theme = useTheme();
  const statusColors: any = {
    New: "#00ADD3",
    Connected: "#FFB946",
    "Followed-Up": theme?.palette?.primary?.main,
    "Scheduled Meeting": "#885AF8",
    "Estimate Sent": "#2ECAD4",
  };

  // Optimized: Convert all fetches to React Query for parallel loading and caching
  const fetchModules = async (): Promise<ModuleTypes[]> => {
    const requestData = {
      eventType: "GET_MODULES",
    };

    try {
      await userhubPost(requestData);
      if (userHubResponse()?.ok) {
        const data = await userHubResponse()?.json();
        if (data && data.code === "MODULES_RETRIEVED") {
          return data.body || [];
        }
        return [];
      } else {
        console.error("Error fetching modules:", userHubError);
        throw new Error("Error fetching modules");
      }
    } catch (error) {
      console.error("Network error:", error);
      throw error;
    }
  };

  const fetchLeadSourceData = async (): Promise<leadSourcesTypes[]> => {
    const currentLanguage = (i18n.language || "en").split("-")[0].toUpperCase();
    const requestData = {
      eventType: "GET_LEAD_SOURCES",
    };
    try {
      await post(requestData);
      if (response()?.ok) {
        const res = await response()?.json();
        const body = Array.isArray(res?.body) ? res.body : [];

        if (currentLanguage !== "EN" && body.length > 0) {
          const namesToTranslate = body
            .map((item: any) => item.leadSourceSubCategory)
            .filter(Boolean);

          if (namesToTranslate.length > 0) {
            try {
              const translatedResponse = await translateText({
                data: namesToTranslate,
                language: currentLanguage,
              });

              const translationMap = new Map<string, string>();
              translatedResponse?.forEach((item: any) => {
                if (item?.status === "success" && item?.actual_text) {
                  translationMap.set(
                    item.actual_text,
                    item.translated_text || item.actual_text,
                  );
                }
              });

              return body.map((item: any) => ({
                ...item,
                leadSourceSubCategory:
                  translationMap.get(item.leadSourceSubCategory) ||
                  item.leadSourceSubCategory,
              }));
            } catch (error) {
              console.error("Translation error for lead sources:", error);
            }
          }
        }
        return body;
      } else {
        console.error("Error fetching lead sources:", error);
        return [];
      }
    } catch (error) {
      console.error("Network error:", error);
      return [];
    }
  };

  const fetchLeadStatusData = async (): Promise<{
    leadStatus: LeadStatusesTypes[];
    leadStages: LeadStatusesTypes[];
  }> => {
    const requestData = {
      eventType: "GET_LEAD_STATUSES",
    };

    try {
      await post(requestData);
      if (response()?.ok) {
        const data = await response()?.json();
        // Filter out "Won" and "Lost" statuses for stages
        const filteredStatuses = data?.body?.filter((val: any) => {
          if (val.leadStatusValue !== "WON" && val.leadStatusValue !== "LOST") {
            return { ...val, color: statusColors[val.leadStatusValue] };
          }
        });
        const allStatuses = data?.body.map((val: LeadStatusesTypes) => ({
          ...val,
          color: statusColors[val.leadStatusValue],
        }));
        return {
          leadStages: filteredStatuses || [],
          leadStatus: allStatuses || [],
        };
      } else {
        console.error("Error fetching lead statuses:", error);
        return { leadStatus: [], leadStages: [] };
      }
    } catch (error) {
      console.error("Network error:", error);
      return { leadStatus: [], leadStages: [] };
    }
  };

  const fetchProjectTypes = async (): Promise<ProjectType[]> => {
    const requestData = {
      eventType: "GET_CUSTOMIZED_PROJECT_TYPES",
      organizationId,
      organizationType,
      isGetAll: true,
    };

    try {
      const res = await projectTypesAxiosPost(requestData);
      if (res?.body) {
        return res?.body || [];
      } else {
        console.error("Error fetching project types:");
        return [];
      }
    } catch (error) {
      console.error("Network error:", error);
      return [];
    }
  };

  const fetchAccountUserData = async (): Promise<UsersTypes[]> => {
    const requestData = {
      eventType: "GET_USERS_OF_ORGANIZATION",
      filters: { userStatus: ["ACCEPTED"] },
    };
    try {
      const res = await userhubPost(requestData);
      if (userHubResponse()?.ok) {
        return (
          res.body?.map((value: any) => ({
            name: value.lastName
              ? `${value.firstName} ${value.lastName}`
              : value.firstName,
            role: value.designation,
            userId: value.userId,
            profileImageUrl: value.profileImageUrl,
            emailId: value.emailId,
            mobileNumber: value.mobileNumber,
            featurePermissions: value.featurePermissions,
          })) || []
        );
      } else {
        console.error("Error fetching users:", error);
        return [];
      }
    } catch (error) {
      console.error("Network error:", error);
      return [];
    }
  };

  // Parallel queries - all fetch simultaneously instead of sequentially
  const { data: modules = [], isLoading: isModulesLoading } = useQuery({
    queryKey: ["modules"],
    queryFn: fetchModules,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  const { data: leadSources = [], isLoading: isLeadSourcesLoading } = useQuery({
    queryKey: ["leadSources", i18n.language],
    queryFn: fetchLeadSourceData,
    staleTime: 10 * 60 * 1000,
  });

  const { data: leadStatusData, isLoading: isLeadStatusLoading } = useQuery({
    queryKey: ["leadStatus"],
    queryFn: fetchLeadStatusData,
    staleTime: 10 * 60 * 1000,
  });

  const {
    data: projectTypes = [],
    isLoading: isProjectTypesLoading,
    refetch: refetchProjectTypes,
  } = useQuery({
    queryKey: ["projectTypes", organizationId, organizationType],
    queryFn: fetchProjectTypes,
    enabled: !!organizationId && !!organizationType,
    staleTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const projectTypesWithTrue = projectTypes.filter((type: ProjectType) => type.isActive !== false);

  const { data: usersData = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ["organizationUsers"],
    queryFn: fetchAccountUserData,
    staleTime: 5 * 60 * 1000, // Users might change more frequently
  });

  // Extract leadStatus and leadStages from the query result
  const leadStatus = leadStatusData?.leadStatus || [];
  const leadStages = leadStatusData?.leadStages || [];
  const leadSourcesArray = Array.isArray(leadSources) ? leadSources : [];

  return (
    <FixtureContext.Provider
      value={{
        leadStages,
        leadStatus,
        leadSources: leadSourcesArray,
        modules,
        usersData,
        projectTypes,
        projectTypesWithTrue,
        refetchProjectTypes,
      }}
    >
      {children}
    </FixtureContext.Provider>
  );
};
