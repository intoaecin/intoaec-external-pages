/* eslint-disable @next/next/no-sync-scripts */
import { Head, Html, Main, NextScript } from "next/document";
import { getProcessEnvConfig } from "@/config/env";

export default function Document() {
  const runtimeEnv = getProcessEnvConfig();
  const runtimeEnvScript = `window.__ENV=${JSON.stringify(runtimeEnv).replace(
    /</g,
    "\\u003c"
  )};`;

  return (
    <Html lang="en">
      <Head>
        <script dangerouslySetInnerHTML={{ __html: runtimeEnvScript }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
