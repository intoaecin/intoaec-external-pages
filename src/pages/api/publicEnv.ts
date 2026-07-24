// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Runtime public env for external lead-capture pages.
 * Maps server `APIKEY` → `NEXT_PUBLIC_APIKEY` (same as intoaec-UI) so
 * FETCH_THEME / BIND_MACRO_VALUES can authenticate without a session token.
 */
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Record<string, string | undefined>>,
) {
  const env: Record<string, string | undefined> = {};
  Object.keys(process.env).forEach((key) => {
    if (key.startsWith("NEXT_PUBLIC") || key.startsWith("NEXTAUTH_URL")) {
      env[key] = process.env[key];
    }
  });
  if (!env.NEXT_PUBLIC_APIKEY && process.env.APIKEY) {
    env.NEXT_PUBLIC_APIKEY = process.env.APIKEY;
  }
  res.status(200).json(env);
}
