import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import type { GeoIPResType } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Ported from intoaec-UI `src/features/ClientReport/hooks/useClientReportWeather.ts`.
 * Next-auth-free as written in the source (uses `useAxiosWithAuth`, no
 * `useSession`). The only change here is reading the Google Maps key and
 * USERHUB endpoint via their `VITE_` names directly — this app's `useEnv()`
 * does not alias every `NEXT_PUBLIC_*` name the admin app uses (only a subset
 * used elsewhere is aliased), and `VITE_GOOGLE_MAP_APIKEY` /
 * `VITE_USERHUB_ENDPOINT` are already required runtime env vars here.
 */

export type ClientReportWeather = {
  condition: string;
  temperature: WeatherTemperature | null;
  feelsLikeTemperature: WeatherTemperature | null;
  iconUrl: string;
};

export type WeatherTemperature = {
  degrees: number;
  unit: "CELSIUS" | "FAHRENHEIT" | "TEMPERATURE_UNIT_UNSPECIFIED";
};

type GoogleWeatherResponse = {
  weatherCondition?: {
    iconBaseUri?: string;
    description?: {
      text?: string;
    };
  };
  temperature?: {
    degrees?: number;
    unit?: "CELSIUS" | "FAHRENHEIT" | "TEMPERATURE_UNIT_UNSPECIFIED";
  };
  feelsLikeTemperature?: {
    degrees?: number;
    unit?: "CELSIUS" | "FAHRENHEIT" | "TEMPERATURE_UNIT_UNSPECIFIED";
  };
};

type IPLocationResponse = {
  code?: string;
  body?: GeoIPResType;
};

type ClientReportDateRange = {
  startDate?: number;
  endDate?: number;
};

type UseClientReportWeatherOptions = {
  enabled?: boolean;
};

const getTemperatureValue = (
  temperature?: GoogleWeatherResponse["temperature"],
) => {
  if (temperature?.degrees === undefined) {
    return null;
  }

  return {
    degrees: temperature.degrees,
    unit: temperature.unit ?? "CELSIUS",
  };
};

const getWeatherIconUrl = (iconBaseUri?: string) =>
  iconBaseUri ? `${iconBaseUri}.svg` : "";

export const useClientReportWeather = (
  dateRange?: ClientReportDateRange,
  options: UseClientReportWeatherOptions = {},
) => {
  const { enabled = true } = options;
  const { i18n } = useTranslation();
  const { VITE_GOOGLE_MAP_APIKEY, VITE_USERHUB_ENDPOINT } = useEnv();
  const { post } = useAxiosWithAuth<IPLocationResponse>(
    VITE_USERHUB_ENDPOINT + "/session",
  );
  const postRef = useRef(post);
  const [weather, setWeather] = useState<ClientReportWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    postRef.current = post;
  }, [post]);

  const fetchWeather = useCallback(async () => {
    if (!enabled || !VITE_GOOGLE_MAP_APIKEY) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ipLocationResponse = await postRef.current({
        eventType: "GET_IP_LOCATION",
        filters: {
          startDate: dateRange?.startDate,
          endDate: dateRange?.endDate,
        },
      });
      const location = ipLocationResponse?.body?.location;

      if (
        typeof location?.latitude !== "number" ||
        typeof location?.longitude !== "number"
      ) {
        setWeather(null);
        return;
      }

      const weatherLanguage =
        (i18n.resolvedLanguage || i18n.language || "en").split("-")[0] || "en";
      const params = new URLSearchParams({
        key: VITE_GOOGLE_MAP_APIKEY,
        "location.latitude": String(location.latitude),
        "location.longitude": String(location.longitude),
        unitsSystem: "METRIC",
        languageCode: weatherLanguage,
      });
      const weatherResponse = await fetch(
        `https://weather.googleapis.com/v1/currentConditions:lookup?${params.toString()}`,
      );

      if (!weatherResponse.ok) {
        setWeather(null);
        return;
      }

      const currentWeather =
        (await weatherResponse.json()) as GoogleWeatherResponse;

      setWeather({
        condition: currentWeather.weatherCondition?.description?.text ?? "",
        temperature: getTemperatureValue(currentWeather.temperature),
        feelsLikeTemperature: getTemperatureValue(
          currentWeather.feelsLikeTemperature,
        ),
        iconUrl: getWeatherIconUrl(
          currentWeather.weatherCondition?.iconBaseUri,
        ),
      });
    } catch (weatherError) {
      setWeather(null);
      setError(weatherError);
    } finally {
      setLoading(false);
    }
  }, [
    VITE_GOOGLE_MAP_APIKEY,
    dateRange?.endDate,
    dateRange?.startDate,
    enabled,
    i18n.language,
    i18n.resolvedLanguage,
  ]);

  useEffect(() => {
    void fetchWeather();
  }, [fetchWeather]);

  return {
    weather,
    loading,
    error,
    refetch: fetchWeather,
  };
};
