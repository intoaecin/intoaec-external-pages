import { useEffect, useState } from "react";
import { useAxios } from "./useAxios";
import { useEnv } from "./useEnv";

interface IpLocationResponse {
  code?: string;
  body?: {
    country?: {
      isoCode?: string;
    };
    city?: {
      names?: Record<string, string | undefined>;
    };
  };
}

export const useIpCountryCode = () => {
  const [countryCode, setCountryCode] = useState<string>();
  const [city, setCity] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [hasResolved, setHasResolved] = useState(false);
  const { NEXT_PUBLIC_USERHUB_ENDPOINT } = useEnv();
  const { post } = useAxios<IpLocationResponse>(
    NEXT_PUBLIC_USERHUB_ENDPOINT + "/session"
  );

  useEffect(() => {
    const fetchIpCountryCode = async () => {
      setLoading(true);
      try {
        const res = (await post({
          eventType: "GET_IP_LOCATION",
        })) as IpLocationResponse;

        if (res?.code === "IP_LOCATION_RETRIEVED") {
          setCountryCode(res.body?.country?.isoCode);
          setCity(res.body?.city?.names?.en);
        }
      } finally {
        setLoading(false);
        setHasResolved(true);
      }
    };

    fetchIpCountryCode();
  }, []);

  return { countryCode, city, loading, hasResolved };
};
