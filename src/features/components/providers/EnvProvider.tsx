import { ReactNode, createContext, useEffect, useMemo, useState } from "react";
import { envConfig, getWindowEnvConfig } from "@/config/env";

interface EnvProviderProps {
  env: any;
}

export const EnvContext = createContext<EnvProviderProps>({
  env: {},
});

export const EnvProvider = ({ children }: { children: ReactNode }) => {
  const initialEnv = useMemo(
    () => ({ ...envConfig, ...getWindowEnvConfig() }),
    [],
  );
  const [env, setEnv] = useState<any>(initialEnv);
  const [isReady, setIsReady] = useState(
    Boolean(
      initialEnv?.NEXT_PUBLIC_USERHUB_ENDPOINT ||
      initialEnv?.NEXT_PUBLIC_LEADMANAGER_ENDPOINT ||
      initialEnv?.NEXT_PUBLIC_PAYMASTER_ENDPOINT,
    ),
  );

  useEffect(() => {
    let isMounted = true;

    const loadRuntimeEnv = async () => {
      try {
        const res = await fetch("/api/publicEnv", { cache: "no-store" });
        if (!res.ok) return;

        const runtimeEnv = await res.json();
        if (isMounted && runtimeEnv && typeof runtimeEnv === "object") {
          setEnv((prev: any) => ({ ...prev, ...runtimeEnv }));
        }
      } catch (e) {
        console.log(e);
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    // Always refresh from runtime env for deployment-time secrets.
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
