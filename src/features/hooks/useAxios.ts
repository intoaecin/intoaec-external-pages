import { Res } from "@/types";
import axios from "axios";
import { useRef, useState } from "react";
import useMutableState from "./useMutableState";
import { useEnv } from "./useEnv";

/**
 * Public API client for external lead-capture pages.
 * Always uses apiKey — no session / bearer token.
 */
export const useAxios = <T>(_pathparam: string, _withAuth?: boolean) => {
  const { VITE_APIKEY } = useEnv();
  const path = _pathparam.trim();

  const loading = useRef<boolean>();
  const [data, setData] = useState<T>();
  const [error, setError] = useState<any>();
  const [response, setResponse] = useMutableState<Res<T>>();

  const getHeaders = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (VITE_APIKEY) {
      headers["apiKey"] = VITE_APIKEY;
    }
    return headers;
  };

  const post = async (body: any, options?: { timeout?: number }) => {
    try {
      loading.current = true;
      const res = await axios.post(path, body, {
        headers: getHeaders(),
        responseType: "json",
        timeout: options?.timeout,
      });

      const responseHeaders = new Headers();
      for (const [key, value] of Object.entries(res.headers)) {
        responseHeaders.append(key, value as string);
      }

      const parsedRes = new Response(JSON.stringify(res.data), {
        status: res.status,
        headers: responseHeaders,
        statusText: res.statusText,
      });

      setResponse(parsedRes);
      setData(res.data);
      loading.current = false;
      return res.data;
    } catch (err: any) {
      setError(err);
      loading.current = false;
      if (err?.response?.data) {
        setData(err.response.data);
        return err.response.data;
      }
      return err;
    }
  };

  const get = async () => {
    try {
      loading.current = true;
      const res = await axios.get(path, {
        headers: getHeaders(),
        responseType: "json",
      });
      const responseHeaders = new Headers();
      for (const [key, value] of Object.entries(res.headers)) {
        responseHeaders.append(key, value as string);
      }

      const parsedRes = new Response(JSON.stringify(res.data), {
        status: res.status,
        headers: responseHeaders,
        statusText: res.statusText,
      });
      setResponse(parsedRes);
      setData(res.data);
      loading.current = false;
      return res.data;
    } catch (err: any) {
      setError(err);
      loading.current = false;
      throw err;
    }
  };

  return {
    post,
    get,
    loading: loading.current,
    response,
    data,
    error,
  };
};

/** Alias kept for call sites; still public (apiKey only). */
export const useAxiosWithAuth = <T>(path: string) => {
  return useAxios<T>(path, false);
};
