import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Public lead-capture app — all routes are unauthenticated.
 * Keep middleware as a pass-through so subdomain routing / headers can be added later.
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/leadCapture/:path*", "/leadCaptureV2/:path*"],
};
