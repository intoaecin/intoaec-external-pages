import { EnvContext } from "../components/providers/EnvProvider";
import { useContext } from "react";
export const useEnv = () => {
  const { env } = useContext(EnvContext);
  return env;
};

