import { loadEnv } from "vite";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const mode = process.env.NODE_ENV === "production" ? "production" : "development";
const env = loadEnv(mode, projectRoot, "");

const runtimeEnv = Object.fromEntries(
  Object.entries(env).filter(([key]) => key.startsWith("VITE_")),
);

writeFileSync(
  path.join(projectRoot, "dist", "runtime-env.json"),
  JSON.stringify(runtimeEnv, null, 2) + "\n",
);

console.log(`Generated dist/runtime-env.json with ${Object.keys(runtimeEnv).length} keys.`);
