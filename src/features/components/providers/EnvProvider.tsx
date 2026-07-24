import { ReactNode, createContext, useEffect, useMemo, useState } from "react";
import { envConfig, getWindowEnvConfig, type EnvConfig } from "@/config/env";

interface EnvProviderProps {
  env: EnvConfig;
}

export const EnvContext = createContext<EnvProviderProps>({
  env: envConfig,
});

/**
 * Hydrates env from `/api/publicEnv` (and optional `window.__ENV`) so server
 * `APIKEY` is available as `NEXT_PUBLIC_APIKEY` on public lead-capture pages —
 * same pattern as intoaec-UI. Children wait until runtime env is loaded so
 * FETCH_THEME / BIND_MACRO_VALUES never fire without the apiKey header.
 */
export const EnvProvider = ({ children }: { children: ReactNode }) => {
  const initialEnv = useMemo(
    () => ({ ...envConfig, ...getWindowEnvConfig() }),
    [],
  );
  const [env, setEnv] = useState<EnvConfig>(initialEnv);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadRuntimeEnv = async () => {
      try {
        const res = await fetch("/api/publicEnv", { cache: "no-store" });
        if (res.ok) {
          const runtimeEnv = await res.json();
          if (isMounted && runtimeEnv && typeof runtimeEnv === "object") {
            setEnv((prev) => ({ ...prev, ...runtimeEnv }));
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    loadRuntimeEnv();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <EnvContext.Provider value={{ env }}>
      {isReady ? children : null}
    </EnvContext.Provider>
  );
};
