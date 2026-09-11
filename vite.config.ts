import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const publicRuntimeEnv = (mode: string) => {
  const env = loadEnv(mode, projectRoot, "");
  const runtimeEnv = Object.fromEntries(
    Object.entries(env).filter(([key]) => key.startsWith("VITE_")),
  );

  return runtimeEnv;
};

const runtimeEnvDevPlugin = (mode: string): Plugin => ({
  name: "intoaec-runtime-env",
  configureServer(server) {
    server.middlewares.use("/runtime-env.json", (_req, res) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.end(JSON.stringify(publicRuntimeEnv(mode)));
    });
  },
});

export default defineConfig(({ mode }) => ({
  plugins: [react(), runtimeEnvDevPlugin(mode)],
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "src"),
      "next/router": path.resolve(projectRoot, "src/router/nextRouterCompat.ts"),
    },
  },
  server: {
    port: 3001,
  },
  preview: {
    port: 3001,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
}));
