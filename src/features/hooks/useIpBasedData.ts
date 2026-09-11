import { useState, useEffect } from "react";
import { useAxios, useAxiosWithAuth } from "./useAxios";
import { useEnv } from "./useEnv";

export const useIpBasedData = () => {
  const [geoIpValue, setGeoIpValue] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const { VITE_USERHUB_ENDPOINT } = useEnv();
  const { post } = useAxios(VITE_USERHUB_ENDPOINT + "/session");
  const { post: postUserhub } = useAxiosWithAuth(
      VITE_USERHUB_ENDPOINT + "/signup"
    );

  const fetchIpLocation = async () => {
    setLoading(true);
    try {
      const res = await post({ eventType: "GET_IP_LOCATION" });
      if (res?.code == "IP_LOCATION_RETRIEVED") {
        const countryRes = await postUserhub({ eventType: "COUNTRY_MAPPING", country: res?.body?.country?.isoCode });
        if (countryRes?.code == "COUNTRY_MAPPING") {
          setGeoIpValue(countryRes?.body);
        }
      }
    } catch (error) {
      console.error("Error fetching IP location:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIpLocation();
  }, []);

  return { geoIpValue, loading, fetchIpLocation };
};