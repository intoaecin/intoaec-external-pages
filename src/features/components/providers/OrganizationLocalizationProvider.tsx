import { ReactNode, createContext } from "react";
import PageLoader from "../Loader/PageLoader";
import { OrganizationLocalizationType } from "@/types";
import { useEnv } from "@/features/hooks/useEnv";
import { useAxios } from "@/features/hooks/useAxios";
import { useQuery } from "@tanstack/react-query";

interface OrganizationLocalizationProviderProps {
  localizationValue?: OrganizationLocalizationType[];
  fetchLocalization?: () => Promise<void>;
  localizationLoading?: boolean;
}

export const OrganizationLocalizationContext =
  createContext<OrganizationLocalizationProviderProps>({});

export const OrganizationLocalizationProvider = ({
  children,
  organizationId,
  organizationType,
  serialNumber,
  isAuth,
  defaultLocalizationValue,
  block = true,
}: {
  children: ReactNode;
  organizationId?: string;
  organizationType?: string;
  serialNumber?: string;
  isAuth?: boolean;
  defaultLocalizationValue?: OrganizationLocalizationType[];
  block?: boolean;
}) => {
  const { VITE_USERHUB_ENDPOINT } = useEnv();
  const { post: getLocalization } = useAxios(
    VITE_USERHUB_ENDPOINT + "/userhub",
    isAuth
  );

  const fetchLocalizationQuery = async (): Promise<OrganizationLocalizationType[] | undefined> => {
    const requestData = {
      eventType: "FETCH_ORGANIZATION_LOCALIZATION",
      organizationId,
      organizationType,
    };
    const res = await getLocalization(requestData);

    if (res?.code === "ORGANIZATION_DETAILS_RETRIEVED") {
      return res?.body;
    }
    return undefined;
  };

  const {
    data: localizationValue,
    isLoading: localizationLoading,
    refetch: refetchLocalization,
  } = useQuery({
    queryKey: ["organizationLocalization", organizationId, organizationType],
    queryFn: fetchLocalizationQuery,
    enabled: !defaultLocalizationValue && !!organizationId,
  });

  const fetchLocalization = async (): Promise<void> => {
    await refetchLocalization();
  };

  return (
    <OrganizationLocalizationContext.Provider
      value={{
        localizationValue: defaultLocalizationValue ?? localizationValue,
        fetchLocalization,
        localizationLoading,
      }}
    >
      {block && localizationLoading ? <PageLoader /> : children}
    </OrganizationLocalizationContext.Provider>
  );
};
