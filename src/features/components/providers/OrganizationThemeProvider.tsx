import { useAxios } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import React, { createContext, useContext, useState, useEffect } from "react";
import PageLoader from "../Loader/PageLoader";

// Define a type for your context value
interface OrganizationDetailsContextType {
  organizationId?: string;
  organizationType?: string;
  loading: boolean;
  logoUrl?: string;
  organizationName?: string;
  mainColor?: string;
  textColor?: string;
  facebook?: string;
  twitter?: string;
  linkedIn?: string;
  instagram?: string;
  mobileNumber?: string;
  emailId?: string;
  addressLine1?: string;
  addressLine2?: string;
}

// Create a context with default values
const OrganizationDetailsContext = createContext<
  OrganizationDetailsContextType | undefined
>(undefined);

// Define a provider component to wrap your app
export const OrganizationDetailsProvider = ({
  children,
  blockTheme = true,
}: {
  children: any;
  blockTheme?: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const [organization, setOrganization] = useState<{
    organizationId: string;
    organizationType: string;
    organizationName?: string;
    logoUrl?: string;
    mainColor?: string;
    textColor?: string;
    facebook?: string;
    twitter?: string;
    linkedIn?: string;
    instagram?: string;
    mobileNumber?: string;
    emailId?: string;
    addressLine1?: string;
    addressLine2?: string;
  }>();

  //   const { post: fetch } = useAxios(
  //     process.env.REACT_APP_USERHUB_ENDPOINT + "/organization-themes"
  //   );

  //   const fetchOrganizationTheme = async (organizationId: string) => {
  //     const requestData = {
  //       eventType: "FETCH_THEME",
  //       organizationId: organizationId,
  //       organizationType: "ARCHITECT",
  //     };
  //     const data = await fetch(requestData);
  //     if (data?.code === "ORGANIZATION_THEME_RETRIEVED") {
  //       setOrganization((prevOrganization: any) => ({
  //         ...prevOrganization,
  //         mainColor: data?.body?.primary?.main,
  //         textColor: data?.body?.primary?.contrastText,
  //       }));
  //     }
  //   };

  //   useEffect(() => {
  //     (async () => {
  //       setLoading(true);
  //       await fetchOrganizationInformation().finally(() => {
  //         setLoading(false);
  //       });
  //       console.log("organization Detail", organization);
  //     })();
  //   }, []);

  const {
    NEXT_PUBLIC_USERHUB_ENDPOINT,
    NEXT_PUBLIC_DEFAULT_ORGANIZATION_TYPE,
    NEXT_PUBLIC_APIKEY,
  } = useEnv();

  const fetchTheme = async (id: string, logoUrl: string) => {
    const requestData = {
      eventType: "FETCH_THEME",
      organizationId: id,
      organizationType: NEXT_PUBLIC_DEFAULT_ORGANIZATION_TYPE,
    };
    const data = await fetch(
      NEXT_PUBLIC_USERHUB_ENDPOINT + "/organization-themes",
      {
        method: "POST",
        body: JSON.stringify(requestData),
        headers: {
          "Content-Type": "application/json",
          ...(NEXT_PUBLIC_APIKEY ? { apiKey: NEXT_PUBLIC_APIKEY } : {}),
        },
      },
    ).then((data) => data.json());
    if (data?.code === "ORGANIZATION_THEME_RETRIEVED") {
      setOrganization((prevOrganization: any) => ({
        ...prevOrganization,
        logoUrl: logoUrl,
        mainColor: data?.body?.primary?.main,
        textColor: data?.body?.primary?.contrastText,
      }));
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);

      // Local/dev: always resolve marineinteriors; never redirect to marketing site.
      const domainName = "marineinteriors";

      const res = await fetch(NEXT_PUBLIC_USERHUB_ENDPOINT + "/session", {
        method: "POST",
        body: JSON.stringify({
          eventType: "GET_ORGANIZATION_WITH_DOMAIN",
          domainName: domainName,
        }),
        headers: {
          "Content-Type": "application/json",
          ...(NEXT_PUBLIC_APIKEY ? { apiKey: NEXT_PUBLIC_APIKEY } : {}),
        },
      }).then((res) => res.json());

      if (res?.body?.organizationId) {
        setOrganization((prevOrganization: any) => ({
          ...prevOrganization,
          organizationId: res?.body?.organizationId,
          organizationName: res?.body?.organizationName,
          emailId: res?.body?.emailId,
          mobileNumber: res?.body?.mobileNumber,
          addressLine1: res?.body?.addressLine1,
          addressLine2: res?.body?.addressLine2,
          facebook: res?.body?.facebook,
          twitter: res?.body?.twitter,
          linkedIn: res?.body?.linkedIn,
          instagram: res?.body?.instagram,
          organizationType:
            res?.body?.organizationType ??
            NEXT_PUBLIC_DEFAULT_ORGANIZATION_TYPE,
          website: res?.body?.websiteOrBlog,
          address: `${res?.body?.addressLine1},${res?.body?.addressLine2},${res?.body?.city},${res?.body?.state},${res?.body?.country},${res?.body?.zipCode}`,
        }));

        if (blockTheme) {
          await fetchTheme(res?.body?.organizationId, res?.body?.logoUrl);
        } else {
          fetchTheme(res?.body?.organizationId, res?.body?.logoUrl);
        }
      }
      setLoading(false);
    })();
  }, []);

  return (
    <OrganizationDetailsContext.Provider value={{ ...organization, loading }}>
      {loading || !organization ? <PageLoader /> : children}
    </OrganizationDetailsContext.Provider>
  );
};

/** Supplies org ids to useOrganization() without domain fetch (e.g. logged-in builder). */
export const OrganizationDetailsOverrideProvider = ({
  children,
  organizationId,
  organizationType,
}: {
  children: React.ReactNode;
  organizationId: string;
  organizationType: string;
}) => (
  <OrganizationDetailsContext.Provider
    value={{
      organizationId,
      organizationType,
      loading: false,
    }}
  >
    {children}
  </OrganizationDetailsContext.Provider>
);

// Create a custom hook to use the theme context
export const useOrganization = () => {
  const context = useContext(OrganizationDetailsContext);
  if (!context) {
    console.log(
      "useOrganization must be used within a Organizationdetails provider",
    );
    return {} as any;
  }
  return context;
};
