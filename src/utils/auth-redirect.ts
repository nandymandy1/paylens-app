import { getSafeInternalPath } from "@/utils/navigation";

export const DEFAULT_POST_AUTH_REDIRECT = "/dashboard";

/** Authentication entry pages must never be post-auth destinations. */
const AUTH_ENTRY_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/auth/callback",
]);

/** Valid post-auth destinations: the protected app plus explicit onboarding and invitation flows. */
const ALLOWED_PREFIXES = [
  "/dashboard",
  "/select-organization",
  "/onboarding/organization",
  "/invite/accept",
];

/**
 * Canonical post-auth redirect sanitizer. Accepts dashboard/onboarding paths,
 * rejects auth entry pages (unwrapping one nested redirect_to layer), external
 * URLs, protocol-relative URLs, and anything else — always falling back to
 * /dashboard so a stale or malicious value can never loop back to /login.
 */
export const getSafePostAuthRedirect = (candidate: string | null): string => {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return DEFAULT_POST_AUTH_REDIRECT;
  }

  let parsed: URL;

  try {
    parsed = new URL(candidate, "https://paylens.local");
  } catch {
    return DEFAULT_POST_AUTH_REDIRECT;
  }

  if (parsed.host !== "paylens.local") {
    return DEFAULT_POST_AUTH_REDIRECT;
  }

  const path = `${parsed.pathname}${parsed.search}`;

  if (/^(javascript|data|vbscript):/i.test(path)) {
    return DEFAULT_POST_AUTH_REDIRECT;
  }

  if (AUTH_ENTRY_PATHS.has(parsed.pathname)) {
    const nested = parsed.searchParams.get("redirect_to");

    // /login?redirect_to=/login?redirect_to=/dashboard → /dashboard, never /login.
    if (nested) {
      return getSafePostAuthRedirect(nested);
    }

    return DEFAULT_POST_AUTH_REDIRECT;
  }

  return getSafeInternalPath(candidate, ALLOWED_PREFIXES) ?? DEFAULT_POST_AUTH_REDIRECT;
};
