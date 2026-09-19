import { getSafeInternalPath } from "@/utils/navigation";
import { AUTH_ENTRY_PATHS, DEFAULT_POST_AUTH_REDIRECT, POST_AUTH_PREFIXES } from "@/utils/routes";

export { DEFAULT_POST_AUTH_REDIRECT };

/**
 * Canonical post-auth redirect sanitizer. Accepts dashboard/onboarding paths,
 * rejects auth entry pages (unwrapping one nested redirect_to layer), external
 * URLs, protocol-relative URLs, and anything else — always falling back to
 * /dashboard so a stale or malicious value can never loop back to /auth/login.
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

    if (nested) {
      return getSafePostAuthRedirect(nested);
    }

    return DEFAULT_POST_AUTH_REDIRECT;
  }

  return getSafeInternalPath(candidate, POST_AUTH_PREFIXES) ?? DEFAULT_POST_AUTH_REDIRECT;
};
