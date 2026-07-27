import { ReactNode, createContext } from "react";
import { envConfig, type EnvConfig } from "@/config/env";

interface EnvProviderProps {
  env: EnvConfig;
}

export const EnvContext = createContext<EnvProviderProps>({
  env: envConfig,
});

/** Supplies env from `process.env` (NEXT_PUBLIC_* inlined at build time on Vercel). */
export const EnvProvider = ({ children }: { children: ReactNode }) => {
  return (
    <EnvContext.Provider value={{ env: envConfig }}>{children}</EnvContext.Provider>
  );
};
