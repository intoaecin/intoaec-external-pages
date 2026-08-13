import { ReactNode, createContext, useEffect, useState } from "react";
import {
  EMPTY_ENV_CONFIG,
  createEnvConfig,
  type EnvConfig,
} from "@/config/env";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";

interface EnvProviderProps {
  env: EnvConfig;
}

export const EnvContext = createContext<EnvProviderProps>({
  env: EMPTY_ENV_CONFIG,
});

export const EnvProvider = ({ children }: { children: ReactNode }) => {
  const [env, setEnv] = useState<EnvConfig>(EMPTY_ENV_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;

    const loadRuntimeEnv = async () => {
      try {
        const response = await fetch("/runtime-env.json", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Runtime configuration returned ${response.status}.`);
        }
        const config = createEnvConfig(await response.json());
        const requiredKeys: Array<keyof EnvConfig> = [
          "NEXT_PUBLIC_LEADMANAGER_ENDPOINT",
          "NEXT_PUBLIC_USERHUB_ENDPOINT",
          "NEXT_PUBLIC_MEETANDNOTE_ENDPOINT",
          "NEXT_PUBLIC_PROPOSAL_ENDPOINT",
          "NEXT_PUBLIC_APIKEY",
          "NEXT_PUBLIC_GOOGLE_MAP_APIKEY",
          "NEXT_PUBLIC_DEFAULT_ORGANIZATION_TYPE",
        ];
        const missingKeys = requiredKeys.filter((key) => !config[key]?.trim());
        if (missingKeys.length) {
          throw new Error(`Missing runtime configuration: ${missingKeys.join(", ")}`);
        }
        if (active) setEnv(config);
      } catch (reason) {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Runtime configuration could not be loaded.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadRuntimeEnv();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress aria-label="Loading application configuration" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 3 }}>
        <Alert severity="error" sx={{ maxWidth: 720 }}>
          <Typography variant="h6">Application configuration error</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <EnvContext.Provider value={{ env }}>{children}</EnvContext.Provider>
  );
};
