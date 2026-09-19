import type { NextRequest } from "next/server";

/**
 * Dashboard authentication is resolved by RequireAuth through the backend.
 * The API session cookie is intentionally host-only, so a frontend deployed
 * on a separate subdomain cannot safely use it as a server-side route hint.
 */
export function proxy(_request: NextRequest) {
  void _request;

  return undefined;
}
